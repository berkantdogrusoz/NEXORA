import { NextResponse } from "next/server";
import { replicate } from "@/lib/replicate";
import { getAuthUserId, checkRateLimit } from "@/lib/auth";

export const maxDuration = 300; // 5 minutes for video generation

export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        // Rate Limiting
        const rateError = checkRateLimit(authResult.userId, "video-generate");
        if (rateError) return rateError;

        const body = await req.json();
        const { prompt, model: modelId = "zeroscope", aspectRatio = "16:9", duration = "4s" } = body;

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        if (!process.env.REPLICATE_API_TOKEN) {
            return NextResponse.json({ error: "Replicate API Token missing" }, { status: 500 });
        }

        // 1. Translate prompt to English for better model adherence
        let englishPrompt = prompt;
        try {
            const { default: OpenAI } = await import("openai");
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const translation = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a prompt translator. Translate the following video generation prompt to English. Only return the english translation, nothing else. Enhance it slightly for cinematic quality if it's very brief." },
                    { role: "user", content: prompt }
                ]
            });
            englishPrompt = translation.choices[0].message.content || prompt;
        } catch (e) {
            console.error("Translation skipped, using original prompt:", e);
        }

        // 2. Model Mapping
        let modelString = "";
        let input: any = {};

        if (modelId === "luma") {
            // PRO MODEL: minimax/video-01 (Very high cinematic quality, 5-6s default)
            modelString = "minimax/video-01";
            input = {
                prompt: englishPrompt,
                prompt_optimizer: true
            };
        } else {
            // STANDARD MODEL: Zeroscope with extended duration
            modelString = "nateraw/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351";

            // Map duration "4s" / "8s" to 48 or 72 frames (Zeroscope v2 xl works best up to 3s)
            const numFrames = duration === "8s" ? 72 : 48; // 2 or 3 seconds

            input = {
                prompt: englishPrompt,
                num_frames: numFrames,
                width: 1024,
                height: 576,
                fps: 24
            };
        }

        const output = await replicate.run(modelString as any, { input });

        // IMPORTANT FIX: Replicate sometimes returns an array of streams, sometimes a direct stream, sometimes strings.
        let finalUrl = Array.isArray(output) ? output[0] : output;

        // If Replicate SDK gives us a FileOutput stream, extract the URL
        if (typeof finalUrl === "object" && finalUrl !== null) {
            if (typeof finalUrl.url === "function") {
                // Ensure we convert the URL object to a string!
                finalUrl = finalUrl.url().toString();
            } else if (typeof finalUrl.url === "string") {
                finalUrl = finalUrl.url;
            }
        }

        if (!finalUrl || typeof finalUrl !== "string") {
            throw new Error(`Invalid output from Replicate: ${JSON.stringify(output)}`);
        }

        return NextResponse.json({ success: true, videoUrl: finalUrl });

    } catch (error: any) {
        console.error("Video generation error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate video" }, { status: 500 });
    }
}
