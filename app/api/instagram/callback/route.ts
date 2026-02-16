import { NextRequest, NextResponse } from "next/server";
import {
    exchangeCodeForToken,
    getLongLivedToken,
    getFacebookPages,
    getInstagramAccount,
} from "@/lib/instagram";
import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://getnexorai.com";

/**
 * GET /api/instagram/callback
 * Handles Facebook OAuth callback:
 * 1. Exchange code for token
 * 2. Get long-lived token
 * 3. Find Instagram Business Account
 * 4. Save connection to Supabase
 */
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.redirect(`${APP_URL}/sign-in`);
        }

        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
            console.error("Instagram OAuth error:", error);
            return NextResponse.redirect(
                `${APP_URL}/connect-instagram?error=oauth_denied`
            );
        }

        if (!code) {
            return NextResponse.redirect(
                `${APP_URL}/connect-instagram?error=no_code`
            );
        }

        // Step 1: Exchange code for short-lived token
        const shortToken = await exchangeCodeForToken(code);

        // Step 2: Get long-lived token (60 days)
        const longToken = await getLongLivedToken(shortToken.access_token);
        const expiresAt = new Date(
            Date.now() + longToken.expires_in * 1000
        ).toISOString();

        // Step 3: Get Facebook Pages
        const pages = await getFacebookPages(longToken.access_token);
        if (pages.length === 0) {
            return NextResponse.redirect(
                `${APP_URL}/connect-instagram?error=no_pages`
            );
        }

        // Step 4: Find Instagram Business Account on first page
        let igAccount = null;
        let connectedPageId = "";
        let pageAccessToken = "";

        for (const page of pages) {
            const ig = await getInstagramAccount(page.id, page.access_token);
            if (ig) {
                igAccount = ig;
                connectedPageId = page.id;
                pageAccessToken = page.access_token;
                break;
            }
        }

        if (!igAccount) {
            return NextResponse.redirect(
                `${APP_URL}/connect-instagram?error=no_instagram`
            );
        }

        // Step 5: Save to Supabase (upsert)
        const { error: dbError } = await supabase
            .from("instagram_connections")
            .upsert(
                {
                    user_id: userId,
                    ig_user_id: igAccount.ig_user_id,
                    ig_username: igAccount.username,
                    ig_profile_picture: igAccount.profile_picture_url,
                    access_token: pageAccessToken,
                    token_expires_at: expiresAt,
                    fb_page_id: connectedPageId,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
            );

        if (dbError) {
            console.error("Failed to save Instagram connection:", dbError);
            return NextResponse.redirect(
                `${APP_URL}/connect-instagram?error=db_error`
            );
        }

        // Success!
        return NextResponse.redirect(
            `${APP_URL}/connect-instagram?success=true&username=${igAccount.username}`
        );
    } catch (err) {
        console.error("Instagram callback error:", err);
        return NextResponse.redirect(
            `${APP_URL}/connect-instagram?error=unknown`
        );
    }
}
