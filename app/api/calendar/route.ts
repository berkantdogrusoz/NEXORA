import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const { data } = await supabase
            .from("autopilot_logs")
            .select("*")
            .eq("user_id", authResult.userId)
            .not("scheduled_at", "is", null)
            .order("scheduled_at", { ascending: true });

        const posts = (data || []).map(p => ({
            id: p.id,
            brandId: p.brand_id,
            type: p.type,
            platform: p.platform,
            content: p.content,
            status: p.status,
            scheduledAt: p.scheduled_at,
            postedAt: p.posted_at,
            output: p.output || {},
            createdAt: p.created_at,
        }));

        return NextResponse.json({ posts });
    } catch {
        return NextResponse.json({ posts: [] });
    }
}

export async function PATCH(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const body = await req.json().catch(() => null);
        if (!body?.postId || !body?.status) {
            return NextResponse.json({ error: "postId and status required." }, { status: 400 });
        }

        const validStatuses = ["draft", "approved", "posted", "failed"];
        if (!validStatuses.includes(body.status)) {
            return NextResponse.json({ error: "Invalid status." }, { status: 400 });
        }

        const { error } = await supabase
            .from("autopilot_logs")
            .update({ status: body.status })
            .eq("id", body.postId)
            .eq("user_id", authResult.userId);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed." }, { status: 500 });
    }
}
