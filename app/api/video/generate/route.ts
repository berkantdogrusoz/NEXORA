import { NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";
import { getAuthUserId, checkRateLimit } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase";
import { hasProModelAccess, STANDARD_DAILY_GENERATION_LIMIT } from "@/lib/plans";
import { buildEnhancedPrompt } from "@/lib/prompt-engine";
import { getDefaultStylePresetId } from "@/lib/style-presets";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 300; // 5 minutes for video generation

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
            const rateError = checkRateLimit(userId, "video-generate");
            if (rateError) return rateError;
        }

        const body = await req.json();
        const {
            prompt,
            model: modelId = "kling-3",
            aspectRatio = "16:9",
            duration = "5",
            quality = "hd",
            imageUrl,
            stylePreset,
            intensity,
            customDirection,
            enhancePrompt = true,
            cameraMovement,
            motionIntensity,
        } = body;

        const finalQuality: "hd" | "sd" = quality === "sd" ? "sd" : "hd";

        if (!prompt && !imageUrl) {
            return NextResponse.json({ error: "Prompt or reference image is required" }, { status: 400 });
        }

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

        // Cost mapping
        const costMap: Record<string, number> = {
            "kling-3": 50,
            "google-veo-3": 180,
            "seedance-2": 100,
            "sora-2": 120,
        };
        const cost = costMap[modelId] || 25;

        // Block Pro models for non-premium users
        const proModels = ["seedance-2", "sora-2"];
        if (!skipWebBilling && proModels.includes(modelId) && !hasProModelAccess(planName)) {
            return NextResponse.json({ error: "You need a Premium plan to use Pro models." }, { status: 403 });
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

        // If imageUrl is base64, upload to Supabase first so providers get a real URL
        let resolvedImageUrl = imageUrl;
        if (imageUrl && imageUrl.startsWith("data:")) {
            try {
                const { createSupabaseServer: createSB } = await import("@/lib/supabase");
                const sb = createSB();
                const base64Data = imageUrl.split(",")[1];
                const buffer = Buffer.from(base64Data, "base64");
                const ext = imageUrl.includes("png") ? "png" : "jpg";
                const filename = `reference/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
                await sb.storage.from("instagram-images").upload(filename, buffer, {
                    contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
                    upsert: false,
                });
                const { data: pubData } = sb.storage.from("instagram-images").getPublicUrl(filename);
                resolvedImageUrl = pubData.publicUrl;
                console.log("Reference image uploaded:", resolvedImageUrl);
            } catch (uploadErr) {
                console.error("Failed to upload reference image:", uploadErr);
                return NextResponse.json({ error: "Failed to process reference image. Please try again." }, { status: 500 });
            }
        }

        // Verify image URL is publicly accessible before sending to providers
        if (resolvedImageUrl && resolvedImageUrl.startsWith("http")) {
            try {
                const checkRes = await fetch(resolvedImageUrl, { method: "HEAD" });
                if (!checkRes.ok) {
                    console.error(`Image URL not accessible: ${checkRes.status} - ${resolvedImageUrl}`);
                    return NextResponse.json({
                        error: `Reference image is not publicly accessible (${checkRes.status}). Please ensure the 'instagram-images' bucket in Supabase Storage is set to PUBLIC.`,
                    }, { status: 400 });
                }
                console.log(`Image URL verified accessible: ${resolvedImageUrl}`);
            } catch (checkErr) {
                console.error("Image URL check failed:", checkErr);
                return NextResponse.json({
                    error: "Could not verify reference image URL. Please try again.",
                }, { status: 400 });
            }
        }

        const enhanced = await buildEnhancedPrompt({
            mode: "video",
            userPrompt: prompt || "Animate this image with smooth cinematic motion",
            stylePresetId: stylePreset || getDefaultStylePresetId("video"),
            modelId,
            intensity: typeof intensity === "number" ? intensity : Number(intensity),
            customDirection,
            enhancePrompt,
            cameraMovement,
            motionIntensity: typeof motionIntensity === "number" ? motionIntensity : undefined,
        });
        const providerPrompt = enhanced.enhancedPrompt;

        let finalUrl: any = "";

        // ═══════════════════════════════════════════
        //   FAL.AI MODELS (Kling, Seedance, Wan-2.1)
        // ═══════════════════════════════════════════

        if (modelId === "kling-3") {
            console.log(`Generating video using fal.ai Kling 3.0 (image-to-video: ${!!resolvedImageUrl})`);
            const falModel = resolvedImageUrl
                ? "fal-ai/kling-video/v2/master/image-to-video"
                : "fal-ai/kling-video/v2/master/text-to-video";

            const falInput: any = {
                prompt: providerPrompt,
                aspect_ratio: aspectRatio,
                duration: duration === "10" ? "10" : "5",
            };
            if (resolvedImageUrl) falInput.image_url = resolvedImageUrl;

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

        } else if (modelId === "google-veo-3") {
            if (resolvedImageUrl) {
                throw new Error("Google Veo 3 currently supports text-to-video only in Nexora.");
            }

            if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
                throw new Error("GOOGLE_GENERATIVE_AI_API_KEY missing.");
            }

            const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
            const veoModel = process.env.GOOGLE_VEO_VIDEO_MODEL || "veo-3.0-generate-preview";

            const configCandidates: Array<Record<string, any>> = [
                {
                    numberOfVideos: 1,
                    durationSeconds: duration === "10" ? 10 : 5,
                    aspectRatio: aspectRatio === "9:16" ? "9:16" : "16:9",
                    resolution: finalQuality === "sd" ? "medium" : "high",
                    personGeneration: "allow_adult",
                    enhancePrompt: true,
                },
                {
                    numberOfVideos: 1,
                    durationSeconds: duration === "10" ? 10 : 5,
                    aspectRatio: aspectRatio === "9:16" ? "9:16" : "16:9",
                    personGeneration: "allow_adult",
                    enhancePrompt: true,
                },
                {
                    numberOfVideos: 1,
                    durationSeconds: duration === "10" ? 10 : 5,
                    aspectRatio: aspectRatio === "9:16" ? "9:16" : "16:9",
                },
            ];

            let operation: any = null;
            let lastCreateError: unknown = null;

            for (const config of configCandidates) {
                try {
                    operation = await ai.models.generateVideos({
                        model: veoModel,
                        source: { prompt: providerPrompt },
                        config,
                    });
                    break;
                } catch (createError) {
                    lastCreateError = createError;
                }
            }

            if (!operation) {
                throw lastCreateError instanceof Error
                    ? lastCreateError
                    : new Error("Google Veo request failed before operation creation.");
            }

            let currentOp = operation;
            for (let i = 0; i < 120 && !currentOp.done; i++) {
                await new Promise((r) => setTimeout(r, 3000));
                currentOp = await ai.operations.getVideosOperation({ operation: currentOp });
            }

            if (!currentOp.done) {
                throw new Error("Google Veo generation timed out after 6 minutes.");
            }

            const responseAny: any = currentOp.response || {};
            const generatedContainer =
                responseAny?.generatedVideos?.[0]
                || responseAny?.generated_videos?.[0]
                || responseAny?.videos?.[0]
                || null;
            const generatedVideo =
                generatedContainer?.video
                || generatedContainer?.output?.video
                || generatedContainer
                || null;

            if (!generatedVideo) {
                const filteredCount = Number(responseAny?.raiMediaFilteredCount ?? responseAny?.rai_media_filtered_count ?? 0);
                const filteredReasons = responseAny?.raiMediaFilteredReasons || responseAny?.rai_media_filtered_reasons;
                if (filteredCount > 0) {
                    throw new Error(`Google Veo output blocked by safety filters (${filteredCount}). ${Array.isArray(filteredReasons) ? filteredReasons.join(", ") : ""}`.trim());
                }
                throw new Error("Google Veo returned no video. Try a safer/shorter prompt or switch model to veo-2.0-generate-001.");
            }

            const candidateUrl =
                (generatedVideo as any)?.uri
                || (generatedVideo as any)?.url
                || (generatedVideo as any)?.downloadUri
                || (generatedVideo as any)?.download_url
                || (generatedVideo as any)?.fileUri
                || (generatedContainer as any)?.uri
                || (generatedContainer as any)?.url;

            if (typeof candidateUrl === "string" && candidateUrl.startsWith("http")) {
                finalUrl = candidateUrl;
            } else {
                const tmpPath = `/tmp/nexora-veo-${Date.now()}.mp4`;
                await ai.files.download({ file: generatedVideo as any, downloadPath: tmpPath });
                const videoBuffer = Buffer.from(await (await import("fs/promises")).readFile(tmpPath));
                const filename = `videos/${Date.now()}-veo-${Math.random().toString(36).slice(2)}.mp4`;
                const sb = createSupabaseServer();
                const { error: uploadError } = await sb.storage
                    .from("instagram-images")
                    .upload(filename, videoBuffer, { contentType: "video/mp4", upsert: false });

                if (uploadError) throw new Error("Failed to save Google Veo output.");
                const { data: pub } = sb.storage.from("instagram-images").getPublicUrl(filename);
                finalUrl = pub.publicUrl;
            }

        } else if (modelId === "seedance-2") {
            console.log(`Generating video using fal.ai Seedance 1.5 Pro (image-to-video: ${!!resolvedImageUrl})`);
            const falModel = resolvedImageUrl
                ? "fal-ai/bytedance/seedance/v1.5/pro/image-to-video"
                : "fal-ai/bytedance/seedance/v1.5/pro/text-to-video";

            const falInput: any = {
                prompt: providerPrompt,
                duration: duration === "10s" || duration === "10" ? 10 : 5,
                aspect_ratio: aspectRatio,
                resolution: "720p",
                generate_audio: true,
            };
            if (cameraMovement === "fixed") falInput.camera_fixed = true;
            if (resolvedImageUrl) falInput.image_url = resolvedImageUrl;

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
                throw new Error("Invalid output from fal.ai Seedance");
            }

        } else if (modelId === "sora-2") {
            // ═══════════════════════════════════════════
            //   OPENAI SORA 2 (async polling)
            // ═══════════════════════════════════════════
            console.log(`Generating video using OpenAI Sora 2 Pro (image-to-video: ${!!resolvedImageUrl}, duration: ${duration}s)`);

            // Map aspect ratio to size format (strictly allowed values by OpenAI)
            // Allowed: '720x1280', '1280x720', '1024x1792', '1792x1024'
            const sizeMapHd: Record<string, string> = {
                "16:9": "1792x1024", // Max landscape
                "9:16": "1024x1792", // Max portrait
                "1:1": "1280x720",   // No native 1:1, fallback to landscape
            };
            const sizeMapSd: Record<string, string> = {
                "16:9": "1280x720",
                "9:16": "720x1280",
                "1:1": "1280x720",
            };
            const sizeMap = finalQuality === "sd" ? sizeMapSd : sizeMapHd;
            const videoSize = sizeMap[aspectRatio] || "1792x1024";

            // Map duration to seconds. The OpenAI Sora API strictly supports "4", "8", or "12".
            // Since NEXORA UI sends "5" or "10", we map them to the closest supported Sora duration.
            const soraSeconds = duration === "10" ? "8" : "4";

            // Enforce cinematic quality in prompt implicitly to ensure good results
            const soraPrompt = providerPrompt.toLowerCase().includes("cinematic")
                ? providerPrompt
                : providerPrompt + " - ultra cinematic, 8k resolution, highly detailed, photorealistic, premium quality";

            const soraBody: any = {
                model: "sora-2-pro",
                prompt: soraPrompt,
                seconds: soraSeconds,
                size: videoSize,
            };

            if (resolvedImageUrl) {
                soraBody.image_url = resolvedImageUrl;
            }

            // Step 1: Create video generation job
            let createRes = await fetch("https://api.openai.com/v1/videos", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(soraBody),
            });

            if (!createRes.ok && resolvedImageUrl) {
                const fallbackBody = { ...soraBody };
                delete fallbackBody.image_url;

                console.warn("Sora create with image_url failed, retrying without image_url");
                createRes = await fetch("https://api.openai.com/v1/videos", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(fallbackBody),
                });
            }

            if (!createRes.ok) {
                const errBody = await createRes.text();
                console.error("Sora 2 create error:", createRes.status, errBody);
                throw new Error(`Sora 2 API error: ${createRes.status} — ${errBody}`);
            }

            const createData = await createRes.json();
            const videoId = createData.id;
            console.log(`Sora 2 video job created: ${videoId}`);

            // Step 2: Poll for completion via GET /v1/videos/{id}
            const maxPolls = 120; // 120 * 3s = 6 minutes max
            const pollInterval = 3000;
            let soraCompleted = false;

            for (let i = 0; i < maxPolls; i++) {
                await new Promise((r) => setTimeout(r, pollInterval));

                const pollRes = await fetch(`https://api.openai.com/v1/videos/${videoId}`, {
                    headers: {
                        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    },
                });

                if (!pollRes.ok) {
                    console.error(`Sora 2 poll error: ${pollRes.status}`);
                    continue;
                }

                const pollData = await pollRes.json();
                console.log(`Sora 2 poll ${i + 1}: status=${pollData.status}`);

                if (pollData.status === "completed" || pollData.status === "succeeded") {
                    soraCompleted = true;
                    // Check if video URL is directly in the response
                    if (pollData.video?.url) {
                        finalUrl = pollData.video.url;
                    } else if (pollData.output?.url) {
                        finalUrl = pollData.output.url;
                    } else if (pollData.url) {
                        finalUrl = pollData.url;
                    }
                    break;
                } else if (pollData.status === "failed" || pollData.status === "cancelled") {
                    throw new Error(`Sora 2 generation failed: ${pollData.error?.message || pollData.failure_reason || pollData.status}`);
                }
                // else still processing, continue polling
            }

            if (!soraCompleted) {
                throw new Error("Sora 2 generation timed out after 6 minutes");
            }

            // Step 3: Download video content and upload to Supabase
            // Sora videos require auth headers, so we must download server-side
            let soraVideoBuffer: Buffer | null = null;

            // Try to download from the URL we got in polling
            if (finalUrl && !finalUrl.includes("api.openai.com")) {
                // Public URL from polling response — try direct download
                try {
                    const dlRes = await fetch(finalUrl);
                    if (dlRes.ok) {
                        soraVideoBuffer = Buffer.from(await dlRes.arrayBuffer());
                    }
                } catch (e) {
                    console.error("Failed to download from polling URL:", e);
                }
            }

            // If no buffer yet, fetch via authenticated content endpoint
            if (!soraVideoBuffer) {
                const contentRes = await fetch(`https://api.openai.com/v1/videos/${videoId}/content`, {
                    headers: {
                        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    },
                });

                if (!contentRes.ok) {
                    throw new Error(`Failed to download Sora 2 video: ${contentRes.status}`);
                }

                const contentType = contentRes.headers.get("content-type") || "";
                if (contentType.includes("application/json")) {
                    // JSON response with a download URL
                    const contentData = await contentRes.json();
                    const downloadUrl = contentData.url || contentData.video?.url || contentData.download_url;
                    if (downloadUrl) {
                        const dlRes = await fetch(downloadUrl);
                        if (dlRes.ok) {
                            soraVideoBuffer = Buffer.from(await dlRes.arrayBuffer());
                        }
                    }
                } else {
                    // Direct binary video content
                    soraVideoBuffer = Buffer.from(await contentRes.arrayBuffer());
                }
            }

            if (!soraVideoBuffer || soraVideoBuffer.length < 1000) {
                throw new Error("Failed to download Sora 2 video content");
            }

            // Upload directly to Supabase with proper content type
            const soraFilename = `videos/${Date.now()}-sora2-${Math.random().toString(36).substring(7)}.mp4`;
            const soraSupabase = createSupabaseServer();
            const { error: soraUploadError } = await soraSupabase.storage
                .from("instagram-images")
                .upload(soraFilename, soraVideoBuffer, {
                    contentType: "video/mp4",
                    upsert: false,
                });

            if (soraUploadError) {
                console.error("Sora 2 Supabase upload failed:", soraUploadError);
                throw new Error("Failed to save Sora 2 video");
            }

            const { data: soraPublicData } = soraSupabase.storage
                .from("instagram-images")
                .getPublicUrl(soraFilename);

            finalUrl = soraPublicData.publicUrl;
            console.log(`Sora 2 video uploaded to Supabase: ${finalUrl}`);
        }

        // Handle Replicate FileOutput objects
        if (typeof finalUrl === "object" && finalUrl !== null) {
            if (typeof finalUrl.url === "function") {
                finalUrl = finalUrl.url().toString();
            } else if (typeof finalUrl.url === "string") {
                finalUrl = finalUrl.url;
            } else if (finalUrl.toString && typeof finalUrl.toString === "function") {
                finalUrl = finalUrl.toString();
            }
        }

        if (!finalUrl || typeof finalUrl !== "string") {
            throw new Error(`Invalid output from provider`);
        }

        // Upload to Supabase Storage for permanent URL
        const { uploadVideoFromUrl } = await import("@/lib/storage");
        const permanentUrl = await uploadVideoFromUrl(finalUrl);
        const returnUrl = permanentUrl || finalUrl;

        const { error: saveError } = await supabase.from("generations").insert({
            user_id: userId,
            type: "video",
            prompt: prompt || "",
            model: modelId,
            output_url: returnUrl,
        });
        if (saveError) {
            console.error("Failed to save video generation history:", saveError);
        }

        return NextResponse.json({ success: true, videoUrl: returnUrl });

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
