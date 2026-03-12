import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase";
import { DEFAULT_API_SCOPES, generateApiKey } from "@/lib/developer-api";

export async function GET() {
    try {
        const auth = await getAuthUserId();
        if ("error" in auth) return auth.error;

        const supabase = createSupabaseServer();
        const { data, error } = await supabase
            .from("api_keys")
            .select("id, name, key_prefix, scopes, monthly_quota, is_active, last_used_at, created_at")
            .eq("user_id", auth.userId)
            .eq("is_active", true)
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
        }

        return NextResponse.json({ keys: data || [] });
    } catch {
        return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const auth = await getAuthUserId();
        if ("error" in auth) return auth.error;

        const body = await req.json().catch(() => ({}));
        const name = String(body?.name || "Primary Key").trim().slice(0, 80);
        const monthlyQuota = typeof body?.monthlyQuota === "number" ? body.monthlyQuota : null;
        const scopes = Array.isArray(body?.scopes) && body.scopes.length
            ? body.scopes.filter((s: unknown) => typeof s === "string")
            : DEFAULT_API_SCOPES;

        const { token, keyPrefix, keyHash } = generateApiKey();
        const supabase = createSupabaseServer();

        const { data, error } = await supabase
            .from("api_keys")
            .insert({
                user_id: auth.userId,
                name,
                key_prefix: keyPrefix,
                key_hash: keyHash,
                scopes,
                monthly_quota: monthlyQuota,
                is_active: true,
            })
            .select("id, name, key_prefix, scopes, monthly_quota, is_active, created_at, last_used_at")
            .single();

        if (error) {
            return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
        }

        return NextResponse.json({
            key: data,
            token,
            note: "Store this token now. It will not be shown again.",
        });
    } catch {
        return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
    }
}
