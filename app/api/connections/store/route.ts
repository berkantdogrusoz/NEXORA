import { NextResponse } from "next/server";
import { getAuthUserId, sanitizeInput } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const body = await req.json().catch(() => null);
        if (!body) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });

        const platform = sanitizeInput(body.platform, 50);
        const storeName = sanitizeInput(body.accountName, 200);
        const storeUrl = sanitizeInput(body.accountUrl, 500);

        if (!storeName) return NextResponse.json({ error: "Store name required." }, { status: 400 });
        if (!platform) return NextResponse.json({ error: "Platform required." }, { status: 400 });

        const { data: existing } = await supabase
            .from("store_integrations")
            .select("id")
            .eq("user_id", authResult.userId)
            .eq("platform", platform)
            .single();

        if (existing) {
            return NextResponse.json({ error: `${platform} already connected.` }, { status: 409 });
        }

        const { data, error } = await supabase
            .from("store_integrations")
            .insert({
                user_id: authResult.userId,
                platform,
                store_name: storeName,
                store_url: storeUrl,
                status: "connected",
                products: 0,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed.";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
