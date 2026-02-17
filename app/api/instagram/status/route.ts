import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/instagram/status
 * Returns the user's Instagram connection status
 */
export async function GET() {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;
        const { userId } = authResult;

        const { data: connection } = await supabase
            .from("instagram_connections")
            .select("ig_username, ig_profile_picture, ig_user_id, token_expires_at, created_at")
            .eq("user_id", userId)
            .single();

        if (!connection) {
            return NextResponse.json({ connected: false });
        }

        const isExpired = connection.token_expires_at
            ? new Date(connection.token_expires_at) < new Date()
            : false;

        return NextResponse.json({
            connected: !isExpired,
            expired: isExpired,
            username: connection.ig_username,
            profilePicture: connection.ig_profile_picture,
            connectedAt: connection.created_at,
            expiresAt: connection.token_expires_at,
        });
    } catch (err) {
        console.error("Instagram status error:", err);
        return NextResponse.json({ connected: false, error: "Failed to check status" });
    }
}

/**
 * DELETE /api/instagram/status
 * Disconnects Instagram account
 */
export async function DELETE() {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;
        const { userId } = authResult;

        await supabase
            .from("instagram_connections")
            .delete()
            .eq("user_id", userId);

        return NextResponse.json({ success: true, message: "Instagram disconnected." });
    } catch (err) {
        console.error("Instagram disconnect error:", err);
        return NextResponse.json(
            { error: "Failed to disconnect Instagram" },
            { status: 500 }
        );
    }
}
