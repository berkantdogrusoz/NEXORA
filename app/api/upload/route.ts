import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const body = await req.json();
        const { base64, contentType } = body;

        if (!base64) {
            return NextResponse.json({ error: "No image data provided" }, { status: 400 });
        }

        const buffer = Buffer.from(base64, "base64");

        if (buffer.length > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
        }

        const ext = contentType?.includes("png") ? "png" : "jpg";
        const filename = `reference/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        const supabase = createSupabaseServer();
        const { error: uploadError } = await supabase.storage
            .from("generations")
            .upload(filename, buffer, {
                contentType: contentType || "image/jpeg",
                upsert: false,
            });

        if (uploadError) {
            console.error("Supabase upload error:", uploadError);
            return NextResponse.json({ error: `Storage error: ${uploadError.message}` }, { status: 500 });
        }

        const { data } = supabase.storage.from("generations").getPublicUrl(filename);

        return NextResponse.json({ url: data.publicUrl });
    } catch (error: any) {
        console.error("Upload route error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
