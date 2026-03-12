import { NextResponse } from "next/server";
import { getAuthUserId, checkRateLimit } from "@/lib/auth";
import OpenAI from "openai";
import * as fal from "@fal-ai/serverless-client";
import { createSupabaseServer } from "@/lib/supabase";
import { hasProModelAccess, STANDARD_DAILY_GENERATION_LIMIT } from "@/lib/plans";
import { buildEnhancedPrompt } from "@/lib/prompt-engine";
import { getDefaultStylePresetId } from "@/lib/style-presets";

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

        const internalSecret = req.headers.get("x-internal-api-secret");
        const skipWebBilling =
            internalSecret &&
            process.env.INTERNAL_API_SECRET &&
            internalSecret === process.env.INTERNAL_API_SECRET &&
            req.headers.get("x-api-billing-mode") === "usd";

        // Rate Limiting
        if (!skipWebBilling) {
            const rateError = checkRateLimit(userId, "image-generate");
            if (rateError) return rateError;
        }

        const body = await req.json();
        const {
            prompt,
            size = "1024x1024",
            model: modelId = "flux-2-dev",
            stylePreset,
            intensity,
            customDirection,
            enhancePrompt = true,
        } = body;

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

        if (!skipWebBilling && (finalModel === "dall-e-3" || finalModel === "flux-pro" || finalModel === "recraft-v3") && !hasProModelAccess(planName)) {
            return NextResponse.json({ error: "You need a Premium plan to use Pro image models." }, { status: 403 });
        }

        // Daily generation cap for Standard plan
        if (!skipWebBilling && !isDev && planName === "Standard") {
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

        const shouldUseCreditBilling = !skipWebBilling && !isDev;
        if (shouldUseCreditBilling) {
            const { data: creditData } = await supabase
                .from("user_credits")
                .select("credits")
                .eq("user_id", userId)
                .single();

            const currentCredits = Number(creditData?.credits || 0);

            if (!creditData || currentCredits < cost) {
                return NextResponse.json({ error: "Insufficient credits. Please upgrade your plan." }, { status: 402 });
            }

            const { error: deductError } = await supabase
                .from("user_credits")
                .update({ credits: currentCredits - cost })
                .eq("user_id", userId);

            if (deductError) {
                return NextResponse.json({ error: "Failed to process credits" }, { status: 500 });
            }

            creditDeducted = true;
            deductedCost = cost;
        }

        const enhanced = await buildEnhancedPrompt({
            mode: "image",
            userPrompt: prompt,
            stylePresetId: stylePreset || getDefaultStylePresetId("image"),
            modelId: finalModel,
            intensity: typeof intensity === "number" ? intensity : Number(intensity),
            customDirection,
            enhancePrompt,
        });
        const providerPrompt = enhanced.enhancedPrompt;

        let imageUrl = "";

        if (finalModel.startsWith("dall-e")) {
            // OpenAI Generation
            let openaiSize = finalSize;
            if (finalModel === "dall-e-2") {
                openaiSize = "1024x1024";
            }

            const response = await client.images.generate({
                model: finalModel,
                prompt: providerPrompt,
                n: 1,
                size: openaiSize as "1024x1024" | "1792x1024" | "1024x1792",
                ...(finalModel === "dall-e-3" ? { quality: "hd" } : {}),
            });
            imageUrl = response.data[0]?.url || "";

        } else if (finalModel === "flux-2-dev") {
            // fal.ai FLUX 2 Dev — uses image_size string
            let aspect_ratio = "1:1";
            if (finalSize === "1024x1792") aspect_ratio = "9:16";
            if (finalSize === "1792x1024") aspect_ratio = "16:9";

            const falImageSize = aspect_ratio === "1:1" ? "square_hd" : aspect_ratio === "16:9" ? "landscape_16_9" : "portrait_16_9";

            const result: any = await fal.subscribe("fal-ai/flux/dev", {
                input: {
                    prompt: providerPrompt,
                    image_size: falImageSize,
                },
                logs: true,
            });

            if (result?.images?.[0]?.url) {
                imageUrl = result.images[0].url;
            } else if (result?.image?.url) {
                imageUrl = result.image.url;
            } else {
                throw new Error("No image in fal.ai FLUX response");
            }

        } else if (finalModel === "recraft-v3") {
            // fal.ai Recraft V3 — uses image_size { width, height }
            const result: any = await fal.subscribe("fal-ai/recraft-v3", {
                input: {
                    prompt: providerPrompt,
                    image_size: {
                        width: parseInt(finalSize.split("x")[0]),
                        height: parseInt(finalSize.split("x")[1]),
                    },
                },
                logs: true,
            });

            if (result?.images?.[0]?.url) {
                imageUrl = result.images[0].url;
            } else if (result?.image?.url) {
                imageUrl = result.image.url;
            } else {
                throw new Error("No image in fal.ai Recraft response");
            }

        } else if (finalModel === "nano-banana-2") {
            // fal.ai Nano Banana 2 — uses aspect_ratio string
            let aspect_ratio = "1:1";
            if (finalSize === "1024x1792") aspect_ratio = "9:16";
            if (finalSize === "1792x1024") aspect_ratio = "16:9";

            console.log(`[Nano Banana 2] Generating with aspect_ratio=${aspect_ratio}, prompt length=${providerPrompt.length}`);

            const result: any = await fal.subscribe("fal-ai/nano-banana-2", {
                input: {
                    prompt: providerPrompt,
                    aspect_ratio: aspect_ratio,
                },
                logs: true,
            });

            console.log(`[Nano Banana 2] Result keys:`, Object.keys(result || {}));

            if (result?.images?.[0]?.url) {
                imageUrl = result.images[0].url;
            } else if (result?.image?.url) {
                imageUrl = result.image.url;
            } else {
                throw new Error("No image in fal.ai Nano Banana response");
            }

        } else {
            // Replicate FLUX Generation (flux-schnell, flux-pro)
            const { replicate } = await import("@/lib/replicate");

            let aspect_ratio = "1:1";
            if (finalSize === "1024x1792") aspect_ratio = "9:16";
            if (finalSize === "1792x1024") aspect_ratio = "16:9";

            const modelString = finalModel === "flux-pro"
                ? "black-forest-labs/flux-1.1-pro"
                : "black-forest-labs/flux-schnell";

            const output = await replicate.run(modelString as any, {
                input: {
                    prompt: providerPrompt,
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
