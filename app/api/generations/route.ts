import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase";

// GET — fetch user's last 10 generations
export async function GET(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type") || "video"; // "video" or "image"

        const supabase = createSupabaseServer();
        const { data, error } = await supabase
            .from("generations")
            .select("id, type, prompt, model, output_url, created_at")
            .eq("user_id", authResult.userId)
            .eq("type", type)
            .order("created_at", { ascending: false })
            .limit(10);

        if (error) {
            console.error("Error fetching generations:", error);
            return NextResponse.json({ generations: [] });
        }

        return NextResponse.json({ generations: data || [] });
    } catch {
        return NextResponse.json({ generations: [] });
    }
}

// POST — save a new generation
export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const { type, prompt, model, outputUrl } = await req.json();

        if (!outputUrl) {
            return NextResponse.json({ error: "Missing output URL" }, { status: 400 });
        }

        const supabase = createSupabaseServer();
        const { error } = await supabase
            .from("generations")
            .insert({
                user_id: authResult.userId,
                type: type || "video",
                prompt: prompt || "",
                model: model || "",
                output_url: outputUrl,
            });

        if (error) {
            console.error("Error saving generation:", error);
            return NextResponse.json({ error: "Failed to save" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
