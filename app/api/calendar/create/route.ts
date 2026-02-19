import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const body = await req.json();
        const { content, imageUrl, videoUrl, scheduledAt } = body;

        if (!imageUrl && !videoUrl) {
            return NextResponse.json({ error: "Image or Video URL required." }, { status: 400 });
        }

        // Default to tomorrow if no date provided
        const date = scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 86400000);

        const { data, error } = await supabase
            .from("autopilot_logs")
            .insert({
                user_id: authResult.userId,
                content: content || "Generated Content",
                scheduled_at: date.toISOString(),
                status: "draft",
                platform: "instagram",
                output: {
                    caption: content || "",
                    imageUrl: imageUrl,
                    videoUrl: videoUrl,
                    hashtags: ["#AI", "#Creative", "#Nexora"]
                }
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, post: data });

    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Failed to create post." }, { status: 500 });
    }
}
