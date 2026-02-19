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
        const { prompt } = body;

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        if (!process.env.REPLICATE_API_TOKEN) {
            return NextResponse.json({ error: "Replicate API Token missing" }, { status: 500 });
        }

        // Using Stable Video Diffusion (SVD) XT
        // A reliable open model for text-to-video (or image-to-video, but here we'll use a text-to-video wrapper if available, 
        // or Zeroscope which is pure text-to-video).
        // Let's use Zeroscope v2 XL which is popular for Text-to-Video.
        const model = "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351";

        const output = await replicate.run(
            model,
            {
                input: {
                    prompt: prompt,
                    num_frames: 24,
                    width: 1024,
                    height: 576,
                    fps: 24
                }
            }
        );

        // Replicate returns an array of output URLs (usually one video)
        return NextResponse.json({ success: true, videoUrl: output[0] });

    } catch (error: any) {
        console.error("Video generation error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate video" }, { status: 500 });
    }
}
