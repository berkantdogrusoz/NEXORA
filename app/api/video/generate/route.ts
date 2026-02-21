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
        const { prompt, model: modelId = "zeroscope" } = body;

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        if (!process.env.REPLICATE_API_TOKEN) {
            return NextResponse.json({ error: "Replicate API Token missing" }, { status: 500 });
        }

        // Model Mapping
        // Zeroscope (Standard/Free) vs Stable Video Diffusion (Cinematic/Pro)
        let model = "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351";
        let input: any = {
            prompt: prompt,
            num_frames: 24,
            width: 1024,
            height: 576,
            fps: 24
        };

        if (modelId === "luma") {
            // High-end cinematic model on Replicate
            model = "stability-ai/stable-video-diffusion:3f045761ed782710301a30247c92f2ea521f2066fc343604b60944645e2a5d94";
            input = {
                video_length: "25_frames_with_svd_xt",
                sizing_strategy: "maintain_aspect_ratio"
            };
            // Note: SVD-XT usually needs an image input, but some wrappers on Replicate take text.
            // For a pure text-to-video Pro experience, we'd use something like:
            // model = "lucataco/luma-dream-machine"; // if supported. 
            // Let's stick to a robust Pro alternative or stick with Zeroscope with higher settings for now if unsure.
            // Actually, let's use a better text-to-video model for "Pro":
            model = "nateraw/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351";
            input = { prompt, num_frames: 48, width: 1024, height: 576, fps: 24 }; // Double frames for Pro
        }

        const output = await replicate.run(model as any, { input });

        // Replicate returns an array of output URLs (usually one video)
        return NextResponse.json({ success: true, videoUrl: output[0] });

    } catch (error: any) {
        console.error("Video generation error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate video" }, { status: 500 });
    }
}
