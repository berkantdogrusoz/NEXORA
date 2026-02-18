import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const body = await req.json().catch(() => null);
        if (!body?.postId || !body?.updates) {
            return NextResponse.json({ error: "Post ID and updates required." }, { status: 400 });
        }

        const { postId, updates } = body;

        // Verify ownership
        const { data: post } = await supabase
            .from("autopilot_logs")
            .select("id, output")
            .eq("id", postId)
            .eq("user_id", authResult.userId)
            .single();

        if (!post) {
            return NextResponse.json({ error: "Post not found." }, { status: 404 });
        }

        // Merge updates into the 'output' JSONb column
        // We only want to update specific fields in 'output' (caption, imageUrl, etc.)
        const currentOutput = post.output || {};
        const newOutput = { ...currentOutput, ...updates.output };

        // Prepare DB update object
        const dbUpdates: any = {
            output: newOutput,
        };

        // If caption changed, update the top-level 'content' column for easier search/display
        if (updates.output?.caption) {
            dbUpdates.content = updates.output.caption;
        }

        // If scheduled_at changed (though not implemented in UI yet)
        if (updates.scheduledAt) {
            dbUpdates.scheduled_at = updates.scheduledAt;
        }

        if (updates.status) {
            dbUpdates.status = updates.status;
        }

        const { error } = await supabase
            .from("autopilot_logs")
            .update(dbUpdates)
            .eq("id", postId);

        if (error) throw error;

        return NextResponse.json({ success: true, newOutput });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Update failed." }, { status: 500 });
    }
}
