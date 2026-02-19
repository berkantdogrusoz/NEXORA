/**
 * Instagram Graph API helpers (via Facebook Login)
 * We must use Facebook Login to get access to Instagram Business Accounts
 */

const FACEBOOK_APP_ID = process.env.INSTAGRAM_APP_ID!; // Using the same App ID
const FACEBOOK_APP_SECRET = process.env.INSTAGRAM_APP_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://getnexorai.com";

const GRAPH_API_URL = "https://graph.facebook.com/v21.0";

// ─── OAuth ───────────────────────────────────────────────

/**
 * Generate Facebook OAuth URL (for Instagram access)
 */
export function getInstagramAuthUrl(state?: string): string {
    const params = new URLSearchParams({
        client_id: FACEBOOK_APP_ID,
        redirect_uri: `${APP_URL}/api/instagram/callback`,
        scope: "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,business_management",
        state: state || "nexora_ig_connect",
        response_type: "code",
    });
    return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
}

/**
 * Exchange authorization code for user access token
 */
export async function exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    expires_in: number;
}> {
    const params = new URLSearchParams({
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        redirect_uri: `${APP_URL}/api/instagram/callback`,
        code,
    });

    const res = await fetch(`${GRAPH_API_URL}/oauth/access_token?${params.toString()}`);
    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Token exchange failed: ${JSON.stringify(err)}`);
    }
    return res.json();
}

/**
 * Exchange short-lived token for long-lived token (60 days)
 */
export async function getLongLivedToken(shortLivedToken: string): Promise<{
    access_token: string;
    expires_in: number;
}> {
    const params = new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        fb_exchange_token: shortLivedToken,
    });

    const res = await fetch(`${GRAPH_API_URL}/oauth/access_token?${params.toString()}`);
    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Long-lived token exchange failed: ${JSON.stringify(err)}`);
    }
    return res.json();
}

// ─── Account Info ────────────────────────────────────────

/**
 * Find the connected Instagram Business Account
 * We iterate through the user's Facebook Pages to find one with an IG Business Account connected
 */
export async function getInstagramBusinessAccount(accessToken: string): Promise<{
    id: string; // IG Business User ID
    username: string;
    profile_picture_url?: string;
    name?: string;
    page_id: string; // Linked FB Page ID
    page_access_token?: string; // Optional: if we need page-specific token
}> {
    // 1. Get User's Pages with instagram_business_account field
    const res = await fetch(
        `${GRAPH_API_URL}/me/accounts?fields=id,name,picture,access_token,instagram_business_account{id,username,profile_picture_url,name}&access_token=${accessToken}`
    );

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Failed to fetch pages: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    const pages = data.data || [];

    // 2. Find the first page that has an instagram_business_account
    const connectedPage = pages.find((p: any) => p.instagram_business_account);

    if (!connectedPage) {
        const pageNames = pages.map((p: any) => p.name).join(", ");
        throw new Error(
            `Found ${pages.length} Facebook Pages (${pageNames || "none"}). None of them are linked to an Instagram Business Account. Please go to your Facebook Page Settings > Linked Accounts and connect your Instagram.`
        );
    }

    const igAccount = connectedPage.instagram_business_account;

    return {
        id: igAccount.id,
        username: igAccount.username,
        profile_picture_url: igAccount.profile_picture_url,
        name: igAccount.name,
        page_id: connectedPage.id,
        // For some operations, we might prefer the Page Access Token, usually User Token is fine for IG Graph
        // But let's return it just in case logic needs it later.
        page_access_token: connectedPage.access_token,
    };
}

// ─── Content Publishing ─────────────────────────────────

/**
 * Step 1: Create a media container
 * Image must be hosted on a publicly accessible URL
 */
export async function createMediaContainer(
    igUserId: string,
    accessToken: string,
    options: {
        image_url: string;
        caption?: string;
    }
): Promise<string> {
    const params = new URLSearchParams({
        image_url: options.image_url,
        caption: options.caption || "",
        access_token: accessToken,
    });

    const res = await fetch(`${GRAPH_API_URL}/${igUserId}/media`, {
        method: "POST",
        body: params,
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Failed to create media container: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    return data.id;
}

/**
 * Step 2: Publish the media container
 */
export async function publishMedia(
    igUserId: string,
    containerId: string,
    accessToken: string
): Promise<string> {
    const params = new URLSearchParams({
        creation_id: containerId,
        access_token: accessToken,
    });

    const res = await fetch(`${GRAPH_API_URL}/${igUserId}/media_publish`, {
        method: "POST",
        body: params,
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Failed to publish media: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    return data.id;
}

/**
 * Check media container status
 */
export async function checkContainerStatus(
    containerId: string,
    accessToken: string
): Promise<{ status_code: string }> {
    const res = await fetch(
        `${GRAPH_API_URL}/${containerId}?fields=status_code&access_token=${accessToken}`
    );
    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Failed to check container status: ${JSON.stringify(err)}`);
    }
    return res.json();
}

/**
 * Full publish flow: create container → wait → publish
 */
export async function publishToInstagram(
    igUserId: string,
    accessToken: string,
    imageUrl: string,
    caption: string
): Promise<{ mediaId: string; success: boolean }> {
    const containerId = await createMediaContainer(igUserId, accessToken, {
        image_url: imageUrl,
        caption,
    });

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Poll for status (max 5 retries)
    let attempts = 0;
    while (attempts < 5) {
        const status = await checkContainerStatus(containerId, accessToken);
        if (status.status_code === "FINISHED") break;
        if (status.status_code === "ERROR") throw new Error("Media container failed processing");

        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
    }

    const mediaId = await publishMedia(igUserId, containerId, accessToken);
    return { mediaId, success: true };
}
