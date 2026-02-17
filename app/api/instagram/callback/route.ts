import { NextRequest, NextResponse } from "next/server";
import {
    exchangeCodeForToken,
    getLongLivedToken,
    getInstagramBusinessAccount,
} from "@/lib/instagram";
import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://getnexorai.com";

export const dynamic = "force-dynamic";

/**
 * GET /api/instagram/callback
 * Handles Instagram OAuth callback:
 * 1. Exchange code for short-lived token
 * 2. Get long-lived token
 * 3. Get Instagram profile info
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

        // Step 1: Exchange code for short-lived user access token
        const tokenResult = await exchangeCodeForToken(code);

        // Step 2: Get long-lived token (60 days)
        const longToken = await getLongLivedToken(tokenResult.access_token);
        const expiresAt = new Date(
            Date.now() + longToken.expires_in * 1000
        ).toISOString();

        // Step 3: Find connected Instagram Business Account
        let igAccount;
        try {
            igAccount = await getInstagramBusinessAccount(longToken.access_token);
        } catch (e: any) {
            console.error("Could not find Instagram Business Account:", e);
            return NextResponse.redirect(
                `${APP_URL}/connect-instagram?error=no_business_account`
            );
        }

        // Step 4: Save to Supabase (upsert)
        // We store the User Access Token (long-lived) which has permissions for the Page/IG Account
        const { error: dbError } = await supabase
            .from("instagram_connections")
            .upsert(
                {
                    user_id: userId,
                    ig_user_id: igAccount.id,
                    ig_username: igAccount.username,
                    ig_profile_picture: igAccount.profile_picture_url || "",
                    access_token: longToken.access_token,
                    token_expires_at: expiresAt,
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
            `${APP_URL}/connect-instagram?success=true&username=${encodeURIComponent(igAccount.username)}`
        );
    } catch (err) {
        console.error("Instagram callback error:", err);
        return NextResponse.redirect(
            `${APP_URL}/connect-instagram?error=unknown`
        );
    }
}
