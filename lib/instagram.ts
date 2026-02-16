/**
 * Instagram Graph API helper functions
 * Handles OAuth, token management, and content publishing
 */

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://getnexorai.com";

const GRAPH_API_URL = "https://graph.facebook.com/v21.0";

// ─── OAuth ───────────────────────────────────────────────

/**
 * Generate Facebook OAuth URL for Instagram permissions
 */
export function getInstagramAuthUrl(state?: string): string {
    const params = new URLSearchParams({
        client_id: FACEBOOK_APP_ID,
        redirect_uri: `${APP_URL}/api/instagram/callback`,
        scope: "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement",
        response_type: "code",
        state: state || "nexora_ig_connect",
    });
    return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
}

/**
 * Exchange authorization code for short-lived access token
 */
export async function exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    token_type: string;
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
    token_type: string;
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

// ─── Account Discovery ──────────────────────────────────

/**
 * Get Facebook Pages the user manages
 */
export async function getFacebookPages(accessToken: string): Promise<Array<{
    id: string;
    name: string;
    access_token: string;
}>> {
    const res = await fetch(`${GRAPH_API_URL}/me/accounts?access_token=${accessToken}`);
    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Failed to get pages: ${JSON.stringify(err)}`);
    }
    const data = await res.json();
    return data.data || [];
}

/**
 * Get Instagram Business Account linked to a Facebook Page
 */
export async function getInstagramAccount(pageId: string, pageAccessToken: string): Promise<{
    ig_user_id: string;
    username: string;
    profile_picture_url: string;
} | null> {
    const res = await fetch(
        `${GRAPH_API_URL}/${pageId}?fields=instagram_business_account{id,username,profile_picture_url}&access_token=${pageAccessToken}`
    );
    if (!res.ok) return null;

    const data = await res.json();
    const igAccount = data.instagram_business_account;
    if (!igAccount) return null;

    return {
        ig_user_id: igAccount.id,
        username: igAccount.username || "",
        profile_picture_url: igAccount.profile_picture_url || "",
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
    return data.id; // container ID
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
    return data.id; // published media ID
}

/**
 * Check media container status (for async publishing)
 */
export async function checkContainerStatus(
    containerId: string,
    accessToken: string
): Promise<{ status: string; status_code?: string }> {
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
    // Step 1: Create container
    const containerId = await createMediaContainer(igUserId, accessToken, {
        image_url: imageUrl,
        caption,
    });

    // Step 2: Wait a moment for processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Step 3: Check status
    const status = await checkContainerStatus(containerId, accessToken);
    if (status.status_code && status.status_code !== "FINISHED") {
        // Wait more if not ready
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    // Step 4: Publish
    const mediaId = await publishMedia(igUserId, containerId, accessToken);

    return { mediaId, success: true };
}
