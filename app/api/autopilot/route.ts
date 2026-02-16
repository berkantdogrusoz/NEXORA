import { NextResponse } from "next/server";
import { getAuthUserId, sanitizeInput } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const { data: brands } = await supabase
            .from("autopilot_brands")
            .select("*")
            .eq("user_id", authResult.userId)
            .order("created_at", { ascending: false });

        const { data: logs } = await supabase
            .from("autopilot_logs")
            .select("*")
            .eq("user_id", authResult.userId)
            .order("created_at", { ascending: false })
            .limit(50);

        const formattedBrands = (brands || []).map(b => ({
            id: b.id,
            name: b.name,
            niche: b.niche,
            audience: b.audience,
            tone: b.tone,
            platforms: b.platforms || [],
            schedule: b.schedule || { postsPerWeek: 5, preferredTimes: [] },
            status: b.status || "setup",
            createdAt: new Date(b.created_at).getTime(),
        }));

        const formattedLogs = (logs || []).map(l => ({
            id: l.id,
            brandId: l.brand_id,
            type: l.type,
            platform: l.platform,
            content: l.content,
            status: l.status,
            createdAt: new Date(l.created_at).getTime(),
        }));

        return NextResponse.json({ brands: formattedBrands, logs: formattedLogs });
    } catch {
        return NextResponse.json({ brands: [], logs: [] });
    }
}

export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const body = await req.json().catch(() => null);
        if (!body) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });

        const name = sanitizeInput(body.name, 200);
        const niche = sanitizeInput(body.niche, 100);
        const audience = sanitizeInput(body.audience, 500);
        const tone = sanitizeInput(body.tone, 50) || "professional";

        if (name.length < 2) return NextResponse.json({ error: "Brand name required." }, { status: 400 });
        if (!niche) return NextResponse.json({ error: "Niche required." }, { status: 400 });
        if (audience.length < 5) return NextResponse.json({ error: "Audience required." }, { status: 400 });

        const { data, error } = await supabase
            .from("autopilot_brands")
            .insert({
                user_id: authResult.userId,
                name,
                niche,
                audience,
                tone,
                platforms: body.platforms || ["instagram"],
                schedule: body.schedule || { postsPerWeek: 5, preferredTimes: ["09:00", "12:00", "18:00"] },
                status: "active",
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create brand." }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const body = await req.json().catch(() => null);
        if (!body?.brandId) return NextResponse.json({ error: "brandId required." }, { status: 400 });

        const updates: Record<string, unknown> = {};
        if (body.status) updates.status = body.status;
        if (body.schedule) updates.schedule = body.schedule;

        const { error } = await supabase
            .from("autopilot_brands")
            .update(updates)
            .eq("id", body.brandId)
            .eq("user_id", authResult.userId);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to update." }, { status: 500 });
    }
}
