/**
 * Instagram Business Login API helpers
 * Uses the new Instagram Business Login flow (not Facebook OAuth)
 */

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID!;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://getnexorai.com";

const GRAPH_API_URL = "https://graph.instagram.com/v21.0";

// ─── OAuth ───────────────────────────────────────────────

/**
 * Generate Instagram OAuth URL
 */
export function getInstagramAuthUrl(state?: string): string {
    const params = new URLSearchParams({
        enable_fb_login: "0",
        force_authentication: "1",
        client_id: INSTAGRAM_APP_ID,
        redirect_uri: `${APP_URL}/api/instagram/callback`,
        response_type: "code",
        scope: "instagram_business_basic,instagram_business_content_publish",
        state: state || "nexora_ig_connect",
    });
    return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for short-lived access token
 */
export async function exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    user_id: string;
}> {
    const body = new URLSearchParams({
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri: `${APP_URL}/api/instagram/callback`,
        code,
    });

    const res = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        body,
    });

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
        grant_type: "ig_exchange_token",
        client_secret: INSTAGRAM_APP_SECRET,
        access_token: shortLivedToken,
    });

    const res = await fetch(`${GRAPH_API_URL}/access_token?${params.toString()}`);
    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Long-lived token exchange failed: ${JSON.stringify(err)}`);
    }
    return res.json();
}

// ─── Account Info ────────────────────────────────────────

/**
 * Get Instagram user profile info
 */
export async function getInstagramProfile(accessToken: string): Promise<{
    id: string;
    username: string;
    profile_picture_url?: string;
    name?: string;
}> {
    const res = await fetch(
        `${GRAPH_API_URL}/me?fields=user_id,username,profile_picture_url,name&access_token=${accessToken}`
    );
    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Failed to get profile: ${JSON.stringify(err)}`);
    }
    return res.json();
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

    const status = await checkContainerStatus(containerId, accessToken);
    if (status.status_code && status.status_code !== "FINISHED") {
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    const mediaId = await publishMedia(igUserId, containerId, accessToken);
    return { mediaId, success: true };
}
