import { NextRequest, NextResponse } from "next/server";
import { publishToInstagram } from "@/lib/instagram";
import { supabase } from "@/lib/supabase";
import { getAuthUserId, checkRateLimit } from "@/lib/auth";

/**
 * POST /api/instagram/publish
 * Publishes a post to Instagram
 * Body: { image_url: string, caption: string }
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;
        const { userId } = authResult;

        // Rate limit
        const rateLimited = checkRateLimit(userId, "instagram-publish");
        if (rateLimited) return rateLimited;

        const body = await request.json();
        const { image_url, caption } = body;

        if (!image_url) {
            return NextResponse.json(
                { error: "image_url is required. Image must be publicly accessible." },
                { status: 400 }
            );
        }

        // Get user's Instagram connection
        const { data: connection, error: dbError } = await supabase
            .from("instagram_connections")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (dbError || !connection) {
            return NextResponse.json(
                { error: "Instagram not connected. Please connect your Instagram account first." },
                { status: 400 }
            );
        }

        // Check if token is expired
        if (connection.token_expires_at && new Date(connection.token_expires_at) < new Date()) {
            return NextResponse.json(
                { error: "Instagram token expired. Please reconnect your Instagram account." },
                { status: 401 }
            );
        }

        // Publish to Instagram
        const result = await publishToInstagram(
            connection.ig_user_id,
            connection.access_token,
            image_url,
            caption || ""
        );

        // Log the publish
        await supabase.from("instagram_posts").insert({
            user_id: userId,
            ig_media_id: result.mediaId,
            image_url,
            caption: caption || "",
            status: "published",
            published_at: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            mediaId: result.mediaId,
            message: "Post published to Instagram successfully!",
        });
    } catch (err) {
        console.error("Instagram publish error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to publish to Instagram" },
            { status: 500 }
        );
    }
}
