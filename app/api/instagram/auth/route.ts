import { NextResponse } from "next/server";
import { getInstagramAuthUrl } from "@/lib/instagram";
import { getAuthUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/instagram/auth
 * Redirects user to Facebook OAuth for Instagram permissions
 */
export async function GET() {
    const authResult = await getAuthUserId();
    if ("error" in authResult) return authResult.error;

    const authUrl = getInstagramAuthUrl(authResult.userId);
    return NextResponse.redirect(authUrl);
}
