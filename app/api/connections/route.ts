import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const { data: socialData } = await supabase
            .from("social_connections")
            .select("*")
            .eq("user_id", authResult.userId)
            .order("created_at", { ascending: false });

        const { data: storeData } = await supabase
            .from("store_integrations")
            .select("*")
            .eq("user_id", authResult.userId)
            .order("created_at", { ascending: false });

        const socialConnections = (socialData || []).map(c => ({
            id: c.id,
            platform: c.platform,
            accountName: c.account_name,
            accountUrl: c.account_url || "",
            status: c.status || "connected",
            connectedAt: new Date(c.created_at).getTime(),
            metrics: c.metrics || null,
        }));

        const storeIntegrations = (storeData || []).map(s => ({
            id: s.id,
            platform: s.platform,
            storeName: s.store_name,
            storeUrl: s.store_url || "",
            status: s.status || "connected",
            connectedAt: new Date(s.created_at).getTime(),
            products: s.products || 0,
        }));

        return NextResponse.json({ socialConnections, storeIntegrations });
    } catch {
        return NextResponse.json({ socialConnections: [], storeIntegrations: [] });
    }
}
