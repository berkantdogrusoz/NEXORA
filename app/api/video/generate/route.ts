import { NextResponse } from "next/server";
import { replicate } from "@/lib/replicate";
import * as fal from "@fal-ai/serverless-client";
import { getAuthUserId, checkRateLimit } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase";

export const maxDuration = 300; // 5 minutes for video generation

export async function POST(req: Request) {
    let creditDeducted = false;
    let deductedCost = 0;
    let userId = "";

    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;
        userId = authResult.userId;

        // Rate Limiting
        const rateError = checkRateLimit(userId, "video-generate");
        if (rateError) return rateError;

        const body = await req.json();
        const { prompt, model: modelId = "wan-2.1", aspectRatio = "16:9", duration = "5", quality = "hd", imageUrl } = body;

        if (!prompt && !imageUrl) {
            return NextResponse.json({ error: "Prompt or reference image is required" }, { status: 400 });
        }

        // Check user plan and credits
        const supabase = createSupabaseServer();
        const { data: subData } = await supabase
            .from("user_subscriptions")
            .select("plan_name, status")
            .eq("user_id", userId)
            .single();

        let planName = "Free";
        if (subData && (subData.status === "active" || subData.status === "past_due" || subData.status === "trialing")) {
            planName = subData.plan_name;
        }

        // Cost mapping
        const costMap: Record<string, number> = {
            "wan-2.1": 8,
            "kling-3": 15,
            "luma": 25,
            "runway-gen4": 35,
            "runway-gwm": 45,
            "seedance-2": 50,
        };
        const cost = costMap[modelId] || 8;

        // Block Pro models for Free users
        const proModels = ["luma", "seedance-2", "runway-gen4", "runway-gwm"];
        if (proModels.includes(modelId) && planName === "Free") {
            return NextResponse.json({ error: "You need a Premium plan to use Pro models." }, { status: 403 });
        }

        // Check balance
        const { data: creditData } = await supabase
            .from("user_credits")
            .select("credits")
            .eq("user_id", userId)
            .single();

        const currentCredits = Number(creditData?.credits || 0);

        if (!creditData || currentCredits < cost) {
            return NextResponse.json({ error: "Insufficient credits. Please upgrade your plan." }, { status: 402 });
        }

        // Deduct
        const { error: deductError } = await supabase
            .from("user_credits")
            .update({ credits: currentCredits - cost })
            .eq("user_id", userId);

        if (deductError) {
            return NextResponse.json({ error: "Failed to process credits" }, { status: 500 });
        }

        creditDeducted = true;
        deductedCost = cost;

        // Translate prompt to English for better model adherence
        let englishPrompt = prompt || "Animate this image with smooth cinematic motion";
        try {
            const { default: OpenAI } = await import("openai");
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const translation = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a prompt translator. Translate the following video generation prompt to English. Only return the english translation, nothing else. Enhance it slightly for cinematic quality if it's very brief." },
                    { role: "user", content: prompt || "Animate this image" }
                ]
            });
            englishPrompt = translation.choices[0].message.content || englishPrompt;
        } catch (e) {
            console.error("Translation skipped, using original prompt:", e);
        }

        let finalUrl: any = "";

        // ═══════════════════════════════════════════
        //   FAL.AI MODELS (Kling, Seedance, Wan-2.1)
        // ═══════════════════════════════════════════

        if (modelId === "kling-3") {
            console.log(`Generating video using fal.ai Kling 3.0 (image-to-video: ${!!imageUrl})`);
            const falModel = imageUrl
                ? "fal-ai/kling-video/v2/master/image-to-video"
                : "fal-ai/kling-video/v2/master/text-to-video";

            const falInput: any = {
                prompt: englishPrompt,
                aspect_ratio: aspectRatio,
                duration: duration === "10" ? "10" : "5",
            };
            if (imageUrl) falInput.image_url = imageUrl;

            const result: any = await fal.subscribe(falModel, {
                input: falInput,
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                        update.logs.map((log: any) => log.message).forEach(console.log);
                    }
                },
            });

            if (result?.video?.url) {
                finalUrl = result.video.url;
            } else {
                throw new Error("Invalid output from fal.ai Kling");
            }

        } else if (modelId === "seedance-2") {
            console.log(`Generating video using fal.ai Seedance (image-to-video: ${!!imageUrl})`);
            const falInput: any = { prompt: englishPrompt };
            if (imageUrl) falInput.image_url = imageUrl;

            const result: any = await fal.subscribe("fal-ai/seedance", {
                input: falInput,
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                        update.logs.map((log: any) => log.message).forEach(console.log);
                    }
                },
            });

            if (result?.video?.url) {
                finalUrl = result.video.url;
            } else {
                throw new Error("Invalid output from fal.ai Seedance");
            }

        } else if (modelId === "wan-2.1") {
            console.log(`Generating video using fal.ai Wan-2.1 (image-to-video: ${!!imageUrl})`);
            const falModel = imageUrl
                ? "fal-ai/wan/v2.1/turbo/image-to-video"
                : "fal-ai/wan/v2.1/turbo/text-to-video";

            const falInput: any = {
                prompt: englishPrompt,
                num_frames: duration === "10" ? 81 : 41,
                resolution: quality === "hd" ? "720p" : "480p",
                aspect_ratio: aspectRatio,
            };
            if (imageUrl) falInput.image_url = imageUrl;

            const result: any = await fal.subscribe(falModel, {
                input: falInput,
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                        update.logs.map((log: any) => log.message).forEach(console.log);
                    }
                },
            });

            if (result?.video?.url) {
                finalUrl = result.video.url;
            } else {
                throw new Error("Invalid output from fal.ai Wan-2.1");
            }

            // ═══════════════════════════════════════════
            //   REPLICATE MODELS (Luma, Runway)
            // ═══════════════════════════════════════════

        } else if (modelId === "luma") {
            const input: any = {
                prompt: englishPrompt,
                aspect_ratio: aspectRatio,
            };
            if (imageUrl) input.start_image_url = imageUrl;

            console.log(`Generating video using Replicate Luma Ray 2 (image-to-video: ${!!imageUrl})`);
            const output = await replicate.run("luma/ray-2-720p" as any, { input });
            finalUrl = Array.isArray(output) ? output[0] : output;

        } else if (modelId === "runway-gen4") {
            const input: any = {
                prompt: `(Top-tier cinematic motion quality, Gen-4.5 visual fidelity) ${englishPrompt}`,
                aspect_ratio: aspectRatio,
            };
            if (imageUrl) input.start_image_url = imageUrl;

            console.log(`Generating video using Replicate (Runway Gen-4.5 equivalent)`);
            const output = await replicate.run("luma/ray-2-720p" as any, { input });
            finalUrl = Array.isArray(output) ? output[0] : output;

        } else if (modelId === "runway-gwm") {
            console.log(`Generating video using Replicate (GWM-1 equivalent)`);
            const output = await replicate.run("minimax/video-01" as any, {
                input: {
                    prompt: `(Extremely high fidelity, real-world physics, complex world simulation) ${englishPrompt} (Length: ${duration} seconds, Ratio: ${aspectRatio})`,
                    prompt_optimizer: true
                }
            });
            finalUrl = Array.isArray(output) ? output[0] : output;
        }

        // Handle Replicate FileOutput objects
        if (typeof finalUrl === "object" && finalUrl !== null) {
            if (typeof finalUrl.url === "function") {
                finalUrl = finalUrl.url().toString();
            } else if (typeof finalUrl.url === "string") {
                finalUrl = finalUrl.url;
            }
        }

        if (!finalUrl || typeof finalUrl !== "string") {
            throw new Error(`Invalid output from provider`);
        }

        return NextResponse.json({ success: true, videoUrl: finalUrl });

    } catch (error: any) {
        console.error("Video generation error:", error);

        // Refund credits if generation failed but deduction succeeded
        if (creditDeducted && userId) {
            try {
                const supabase = createSupabaseServer();
                const { data: currentCreditData } = await supabase
                    .from("user_credits")
                    .select("credits")
                    .eq("user_id", userId)
                    .single();

                if (currentCreditData) {
                    await supabase
                        .from("user_credits")
                        .update({ credits: Number(currentCreditData.credits) + deductedCost })
                        .eq("user_id", userId);
                    console.log(`Refunded ${deductedCost} credits to user ${userId} due to generation failure.`);
                }
            } catch (refundError) {
                console.error("Failed to refund credits after generator error:", refundError);
            }
        }

        return NextResponse.json({ error: error.message || "Failed to generate video" }, { status: 500 });
    }
}
