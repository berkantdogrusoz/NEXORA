import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        await supabase
            .from("store_integrations")
            .delete()
            .eq("id", params.id)
            .eq("user_id", authResult.userId);

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed." }, { status: 500 });
    }
}
