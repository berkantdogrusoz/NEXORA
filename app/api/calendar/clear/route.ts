import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const body = await req.json().catch(() => null);
        if (!body?.startDate || !body?.endDate) {
            return NextResponse.json({ error: "Start and end dates required." }, { status: 400 });
        }

        const { error } = await supabase
            .from("autopilot_logs")
            .delete()
            .eq("user_id", authResult.userId)
            .eq("status", "draft") // Only delete drafts, keep approved/posted
            .gte("scheduled_at", body.startDate)
            .lte("scheduled_at", body.endDate);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to clear calendar." }, { status: 500 });
    }
}
