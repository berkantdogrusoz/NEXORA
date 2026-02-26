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
        const { prompt, model: modelId = "minimax", aspectRatio = "16:9", duration = "4s" } = body;

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        if (!process.env.REPLICATE_API_TOKEN) {
            return NextResponse.json({ error: "Replicate API Token missing" }, { status: 500 });
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

        const cost = modelId === "runway-gwm" ? 45 : modelId === "runway-gen4" ? 35 : modelId === "seedance-2" ? 50 : modelId === "luma" ? 25 : modelId === "minimax" ? 12.5 : modelId === "zeroscope" ? 8 : 5;

        // Block Pro models for Free users
        if ((modelId === "luma" || modelId === "seedance-2" || modelId.startsWith("runway")) && planName === "Free") {
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

        if (modelId === "runway-gwm") {
            // PRO MODEL: Runway GWM-1 Equivalent
            modelString = "minimax/video-01";
            input = {
                prompt: `(Extremely high fidelity, real-world physics, complex world simulation interaction) ${englishPrompt} (Length: ${duration} seconds, Ratio: ${aspectRatio})`,
                prompt_optimizer: true
            };
        } else if (modelId === "runway-gen4") {
            // PRO MODEL: Runway Gen-4.5 Equivalent
            modelString = "luma/ray-2-720p";
            input = {
                prompt: `(Top-tier cinematic motion quality, Gen-4.5 visual fidelity, perfect adherence) ${englishPrompt}`,
                aspect_ratio: aspectRatio,
            };
        } else if (modelId === "luma") {
            // PRO MODEL: Luma Ray (Cinematic 5s)
            modelString = "luma/ray-2-720p";
            input = {
                prompt: englishPrompt,
                aspect_ratio: aspectRatio,
            };
        } else if (modelId === "zeroscope") {
            // STANDARD: Zeroscope V2
            modelString = "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351";
            input = { prompt: englishPrompt };
        } else if (modelId === "damo") {
            // STANDARD: DAMO (Fast/Cheap)
            modelString = "cjwbw/damo-text-to-video:1e205ea73084bd17a0a3b43396e49ba0d6bc2e754e9283b2df49fad2dcf95755";
            input = { prompt: englishPrompt };
        } else {
            // STANDARD MODEL: Minimax Video-01
            modelString = "minimax/video-01";
            input = {
                prompt: englishPrompt,
                prompt_optimizer: true
            };
        }

        let finalUrl: any = "";

        if (modelId === "seedance-2") {
            console.log(`Generating video using fal.ai Seedance with prompt: ${englishPrompt}`);
            const result: any = await fal.subscribe("fal-ai/seedance", {
                input: {
                    prompt: englishPrompt,
                },
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                        update.logs.map((log: any) => log.message).forEach(console.log);
                    }
                },
            });

            if (result && result.video && result.video.url && typeof result.video.url === "string") {
                finalUrl = result.video.url;
            } else {
                throw new Error("Invalid output from fal.ai");
            }
        } else {
            console.log(`Generating video using ${modelString} with prompt: ${englishPrompt}`);
            const output = await replicate.run(modelString as any, { input });

            // IMPORTANT FIX: Replicate sometimes returns an array of streams, sometimes a direct stream, sometimes strings.
            finalUrl = Array.isArray(output) ? output[0] : output;

            // If Replicate SDK gives us a FileOutput stream, extract the URL
            if (typeof finalUrl === "object" && finalUrl !== null) {
                if (typeof finalUrl.url === "function") {
                    // Ensure we convert the URL object to a string!
                    finalUrl = finalUrl.url().toString();
                } else if (typeof finalUrl.url === "string") {
                    finalUrl = finalUrl.url;
                }
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

                // Need to fetch latest credits again just to be perfectly safe before refunding
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
