import { NextResponse } from "next/server";
import { getAuthUserId, sanitizeInput } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const body = await req.json().catch(() => null);
        if (!body) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });

        const storeName = sanitizeInput(body.storeName, 200);
        const bio = sanitizeInput(body.bio, 1000);
        const theme = body.theme || "minimal";

        // Upsert config
        const { error } = await supabase
            .from("store_config")
            .upsert({
                user_id: authResult.userId,
                store_name: storeName,
                bio,
                theme,
                social_links: body.socialLinks || [],
            }, { onConflict: "user_id" });

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to save." }, { status: 500 });
    }
}
