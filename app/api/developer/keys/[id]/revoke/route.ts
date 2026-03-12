import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
    try {
        const auth = await getAuthUserId();
        if ("error" in auth) return auth.error;

        const supabase = createSupabaseServer();
        const { error } = await supabase
            .from("api_keys")
            .update({ is_active: false })
            .eq("id", params.id)
            .eq("user_id", auth.userId);

        if (error) {
            return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 });
    }
}
