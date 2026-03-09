import { NextResponse } from "next/server";
import { getAuthUserId, checkRateLimit } from "@/lib/auth";
import OpenAI from "openai";
import * as fal from "@fal-ai/serverless-client";
import { createSupabaseServer } from "@/lib/supabase";
import { hasProModelAccess, STANDARD_DAILY_GENERATION_LIMIT } from "@/lib/plans";

export const maxDuration = 60;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "placeholder" });

export async function POST(req: Request) {
    let creditDeducted = false;
    let deductedCost = 0;
    let userId = "";

    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;
        userId = authResult.userId;

        // Rate Limiting
        const rateError = checkRateLimit(userId, "image-generate");
        if (rateError) return rateError;

        const body = await req.json();
        const { prompt, size = "1024x1024", model: modelId = "flux-2-dev" } = body;

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        // Validate size
        const validSizes = ["1024x1024", "1792x1024", "1024x1792"];
        const finalSize = validSizes.includes(size) ? size : "1024x1024";

        // Validate Model & Cost
        const validModels = ["dall-e-3", "flux-schnell", "flux-pro", "flux-2-dev", "recraft-v3", "nano-banana-2"];
        const finalModel = validModels.includes(modelId) ? modelId : "flux-2-dev";
        const cost = finalModel === "flux-pro" ? 45 : finalModel === "dall-e-3" ? 35 : finalModel === "recraft-v3" ? 30 : finalModel === "nano-banana-2" ? 20 : finalModel === "flux-schnell" ? 15 : 15;

        // Check user plan and credits
        const supabase = createSupabaseServer();
        const { data: subData } = await supabase
            .from("user_subscriptions")
            .select("plan_name, status, ends_at")
            .eq("user_id", userId)
            .single();

        let planName = "Free";
        if (subData) {
            const isActive = subData.status === "active" || subData.status === "past_due" || subData.status === "on_trial";
            const isCancelledButValid = subData.status === "cancelled" && subData.ends_at && new Date(subData.ends_at) > new Date();
            if (isActive || isCancelledButValid) {
                planName = subData.plan_name;
            }
        }
        if (process.env.NODE_ENV === "development") planName = "Pro";
        const isDev = process.env.NODE_ENV === "development";

        if ((finalModel === "dall-e-3" || finalModel === "flux-pro" || finalModel === "recraft-v3") && !hasProModelAccess(planName)) {
            return NextResponse.json({ error: "You need a Premium plan to use Pro image models." }, { status: 403 });
        }

        // Daily generation cap for Standard plan
        if (!isDev && planName === "Standard") {
            const now = new Date();
            const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
            const dayEnd = new Date(dayStart);
            dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

            const { count: todayGenerationCount } = await supabase
                .from("generations")
                .select("id", { count: "exact", head: true })
                .eq("user_id", userId)
                .in("type", ["video", "image", "director"])
                .gte("created_at", dayStart.toISOString())
                .lt("created_at", dayEnd.toISOString());

            if ((todayGenerationCount || 0) >= STANDARD_DAILY_GENERATION_LIMIT) {
                return NextResponse.json(
                    { error: `Standard plan daily limit reached (${STANDARD_DAILY_GENERATION_LIMIT} generations/day). Upgrade to continue.` },
                    { status: 429 }
                );
            }
        }

        // Check balance
        const { data: creditData } = await supabase
            .from("user_credits")
            .select("credits")
            .eq("user_id", userId)
            .single();

        const currentCredits = Number(creditData?.credits || 0);

        if (!isDev && (!creditData || currentCredits < cost)) {
            return NextResponse.json({ error: "Insufficient credits. Please upgrade your plan." }, { status: 402 });
        }

        // Deduct
        let deductError = null;
        if (!isDev) {
            const { error } = await supabase
                .from("user_credits")
                .update({ credits: currentCredits - cost })
                .eq("user_id", userId);
            deductError = error;
        }

        if (deductError) {
            return NextResponse.json({ error: "Failed to process credits" }, { status: 500 });
        }

        creditDeducted = !isDev;
        deductedCost = cost;

        let imageUrl = "";

        if (finalModel.startsWith("dall-e")) {
            // OpenAI Generation
            let openaiSize = finalSize;
            if (finalModel === "dall-e-2") {
                // DALL-E 2 only supports 1024x1024, 512x512, 256x256
                openaiSize = "1024x1024";
            }

            const response = await client.images.generate({
                model: finalModel, // "dall-e-2" | "dall-e-3"
                prompt,
                n: 1,
                size: openaiSize as "1024x1024" | "1792x1024" | "1024x1792",
                ...(finalModel === "dall-e-3" ? { quality: "hd" } : {}),
            });
            imageUrl = response.data[0]?.url || "";
        } else if (finalModel === "flux-2-dev" || finalModel === "recraft-v3" || finalModel === "nano-banana-2") {
            // Fal.ai models
            let aspect_ratio = "1:1";
            if (finalSize === "1024x1792") aspect_ratio = "9:16";
            if (finalSize === "1792x1024") aspect_ratio = "16:9";

            const falModel = finalModel === "flux-2-dev" ? "fal-ai/flux/dev" : finalModel === "nano-banana-2" ? "fal-ai/nano-banana-2" : "fal-ai/recraft-v3";

            const result: any = await fal.subscribe(falModel, {
                input: {
                    prompt,
                    image_size: finalModel === "recraft-v3" ? { width: parseInt(finalSize.split("x")[0]), height: parseInt(finalSize.split("x")[1]) } : undefined,
                    aspect_ratio: finalModel === "flux-2-dev" ? aspect_ratio : undefined,
                },
                logs: true,
            });

            if (result?.images?.[0]?.url) {
                imageUrl = result.images[0].url;
            } else if (result?.image?.url) {
                imageUrl = result.image.url;
            } else {
                throw new Error("No image in fal.ai response");
            }
        } else {
            // Replicate FLUX Generation
            const { replicate } = await import("@/lib/replicate");

            let aspect_ratio = "1:1";
            if (finalSize === "1024x1792") aspect_ratio = "9:16";
            if (finalSize === "1792x1024") aspect_ratio = "16:9";

            const modelString = finalModel === "flux-pro"
                ? "black-forest-labs/flux-1.1-pro"
                : "black-forest-labs/flux-schnell";

            const output = await replicate.run(modelString as any, {
                input: {
                    prompt,
                    aspect_ratio,
                    output_format: "webp",
                    output_quality: 90
                }
            });

            let finalUrl = Array.isArray(output) ? output[0] : output;
            if (typeof finalUrl === "object" && finalUrl !== null) {
                if (typeof finalUrl.url === "function") finalUrl = finalUrl.url().toString();
                else if (typeof finalUrl.url === "string") finalUrl = finalUrl.url;
            }
            imageUrl = typeof finalUrl === "string" ? finalUrl : "";
        }

        if (!imageUrl) {
            throw new Error("No image generated or URL missing from response");
        }

        // Upload to Supabase for permanent storage
        try {
            const { uploadImageFromUrl } = await import("@/lib/storage");
            const permanentUrl = await uploadImageFromUrl(imageUrl);
            const returnUrl = permanentUrl || imageUrl;
            const { error: saveError } = await supabase.from("generations").insert({
                user_id: userId,
                type: "image",
                prompt,
                model: finalModel,
                output_url: returnUrl,
            });
            if (saveError) {
                console.error("Failed to save image generation history:", saveError);
            }
            return NextResponse.json({ imageUrl: returnUrl });
        } catch {
            // Fallback to direct URL if storage fails
            const { error: saveError } = await supabase.from("generations").insert({
                user_id: userId,
                type: "image",
                prompt,
                model: finalModel,
                output_url: imageUrl,
            });
            if (saveError) {
                console.error("Failed to save image generation history:", saveError);
            }
            return NextResponse.json({ imageUrl });
        }
    } catch (error: any) {
        console.error("Image generation error:", error);

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

        if (error?.code === "billing_hard_limit_reached") {
            return NextResponse.json(
                { error: "API billing limit reached. Please check your OpenAI account." },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: error?.message || "Failed to generate image. Please try again." },
            { status: 500 }
        );
    }
}
