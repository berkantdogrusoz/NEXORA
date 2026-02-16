import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuthUserId, checkRateLimit } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const rateError = checkRateLimit(authResult.userId, "generate-image");
        if (rateError) return rateError;

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "OPENAI_API_KEY missing." }, { status: 500 });
        }

        const body = await req.json().catch(() => null);
        if (!body?.prompt) {
            return NextResponse.json({ error: "Image prompt required." }, { status: 400 });
        }

        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // Generate image with DALL-E 3
        const response = await client.images.generate({
            model: "dall-e-3",
            prompt: `Instagram-optimized social media image: ${body.prompt}. Style: modern, clean, visually striking, high quality, professional social media post. Square format 1080x1080.`,
            n: 1,
            size: "1024x1024",
            quality: "standard",
        });

        const imageUrl = response.data?.[0]?.url;
        if (!imageUrl) {
            return NextResponse.json({ error: "Image generation failed." }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            imageUrl,
            revisedPrompt: response.data?.[0]?.revised_prompt || "",
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Image generation failed.";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
