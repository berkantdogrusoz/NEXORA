import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";
import { uploadImageFromUrl } from "@/lib/storage";

export const maxDuration = 60; // Allow longer timeout for image generation

export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const body = await req.json().catch(() => null);
        if (!body?.postId) {
            return NextResponse.json({ error: "Post ID required." }, { status: 400 });
        }

        // 1. Fetch the post to get the Prompt
        const { data: post } = await supabase
            .from("autopilot_logs")
            .select("*")
            .eq("id", body.postId)
            .eq("user_id", authResult.userId)
            .single();

        if (!post) {
            return NextResponse.json({ error: "Post not found." }, { status: 404 });
        }

        const currentPrompt = post.output?.imagePrompt || "Lifestyle shot";

        // 2. Generate new image with DALL-E 3 (High Quality)
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const imgResponse = await client.images.generate({
            model: "dall-e-3",
            prompt: `Professional high-end advertising photography, award-winning shot. ${currentPrompt}. 
Style: Commercial fashion photography, cinematic lighting, ultra-realistic, 8k resolution, shot on Hasselblad, sharp focus, depth of field. 
NO TEXT, NO LOGOS, NO ICONS, NO CARTOON. Clean, modern, premium aesthetic.`,
            n: 1,
            size: "1024x1024",
            quality: "hd",
        });

        const tempUrl = imgResponse.data?.[0]?.url;
        if (!tempUrl) throw new Error("Failed to generate image.");

        // 3. Upload to Supabase
        const permanentUrl = await uploadImageFromUrl(tempUrl, "autopilot");
        if (!permanentUrl) throw new Error("Failed to upload image.");

        // 4. Update the post
        const newOutput = { ...post.output, imageUrl: permanentUrl };

        await supabase
            .from("autopilot_logs")
            .update({ output: newOutput })
            .eq("id", post.id);

        return NextResponse.json({ success: true, imageUrl: permanentUrl });

    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Regeneration failed." }, { status: 500 });
    }
}
