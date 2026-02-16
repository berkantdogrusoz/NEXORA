import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const { data: products } = await supabase
            .from("store_products")
            .select("*")
            .eq("user_id", authResult.userId)
            .order("created_at", { ascending: false });

        const { data: configData } = await supabase
            .from("store_config")
            .select("*")
            .eq("user_id", authResult.userId)
            .single();

        const formattedProducts = (products || []).map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            type: p.type,
            imageUrl: p.image_url,
            downloadUrl: p.download_url,
            createdAt: new Date(p.created_at).getTime(),
        }));

        const config = configData ? {
            storeName: configData.store_name || "",
            bio: configData.bio || "",
            theme: configData.theme || "minimal",
            socialLinks: configData.social_links || [],
        } : { storeName: "", bio: "", theme: "minimal", socialLinks: [] };

        return NextResponse.json({ products: formattedProducts, config });
    } catch {
        return NextResponse.json({ products: [], config: { storeName: "", bio: "", theme: "minimal", socialLinks: [] } });
    }
}
