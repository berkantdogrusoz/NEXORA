import { NextResponse } from "next/server";
import { replicate } from "@/lib/replicate";
import * as fal from "@fal-ai/serverless-client";
import { getAuthUserId, checkRateLimit } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase";
import { hasProModelAccess, STANDARD_DAILY_GENERATION_LIMIT } from "@/lib/plans";

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
        const { prompt, model: modelId = "kling-3", aspectRatio = "16:9", duration = "5", quality = "hd", imageUrl } = body;

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
            "luma": 60,
            "runway-gen4": 75,
            "runway-gwm": 85,
            "seedance-2": 100,
            "sora-2": 120,
        };
        const cost = costMap[modelId] || 25;

        // Block Pro models for non-premium users
        const proModels = ["luma", "seedance-2", "runway-gen4", "runway-gwm", "sora-2"];
        if (proModels.includes(modelId) && !hasProModelAccess(planName)) {
            return NextResponse.json({ error: "You need a Premium plan to use Pro models." }, { status: 403 });
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
            console.log(`Generating video using fal.ai Kling 3.0 (image-to-video: ${!!resolvedImageUrl})`);
            const falModel = resolvedImageUrl
                ? "fal-ai/kling-video/v2/master/image-to-video"
                : "fal-ai/kling-video/v2/master/text-to-video";

            const falInput: any = {
                prompt: englishPrompt,
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

        } else if (modelId === "seedance-2") {
            console.log(`Generating video using fal.ai Seedance 2.0 Pro (image-to-video: ${!!resolvedImageUrl})`);
            const falModel = resolvedImageUrl
                ? "fal-ai/bytedance/seedance/v1/pro/fast/image-to-video"
                : "fal-ai/bytedance/seedance/v1/pro/fast/text-to-video";

            const falInput: any = {
                prompt: englishPrompt,
                duration: duration === "10s" || duration === "10" ? 10 : 5,
                aspect_ratio: aspectRatio,
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
                throw new Error("Invalid output from fal.ai Seedance");
            }

            // ═══════════════════════════════════════════
            //   REPLICATE MODELS (Luma, Runway)
            // ═══════════════════════════════════════════

        } else if (modelId === "luma") {
            const input: any = {
                prompt: englishPrompt,
                aspect_ratio: aspectRatio,
                duration: duration === "10" ? "10s" : "5s",
            };
            if (resolvedImageUrl) input.start_image_url = resolvedImageUrl;

            console.log(`Generating video using Replicate Luma Ray 2 (image-to-video: ${!!resolvedImageUrl}, duration: ${duration}s)`);
            const output = await replicate.run("luma/ray-2-720p" as any, { input });
            finalUrl = Array.isArray(output) ? output[0] : output;

        } else if (modelId === "runway-gen4") {
            // Runway ratio format: "1280:720", "720:1280", "1080:1080"
            const ratioMap: Record<string, string> = {
                "16:9": "1280:720",
                "9:16": "720:1280",
                "1:1": "1080:1080",
            };
            const input: any = {
                prompt_text: englishPrompt,
                ratio: ratioMap[aspectRatio] || "1280:720",
                duration: duration === "10" ? 10 : 5,
            };
            if (resolvedImageUrl) input.prompt_image = resolvedImageUrl;

            console.log(`Generating video using Replicate Runway Gen-4 Turbo (image-to-video: ${!!resolvedImageUrl}, duration: ${duration}s)`);
            const output = await replicate.run("runwayml/gen4-turbo" as any, { input });
            finalUrl = Array.isArray(output) ? output[0] : output;

        } else if (modelId === "runway-gwm") {
            console.log(`Generating video using Replicate (GWM-1 equivalent, image-to-video: ${!!resolvedImageUrl}, duration: ${duration}s)`);
            const input: any = {
                prompt: `(Extremely high fidelity, real-world physics, complex world simulation) ${englishPrompt}`,
                prompt_optimizer: true,
            };
            if (resolvedImageUrl) input.first_frame_image = resolvedImageUrl;

            const output = await replicate.run("minimax/video-01" as any, { input });
            finalUrl = Array.isArray(output) ? output[0] : output;

        } else if (modelId === "sora-2") {
            // ═══════════════════════════════════════════
            //   OPENAI SORA 2 (async polling)
            // ═══════════════════════════════════════════
            console.log(`Generating video using OpenAI Sora 2 Pro (image-to-video: ${!!resolvedImageUrl}, duration: ${duration}s)`);

            // Map aspect ratio to size format (strictly allowed values by OpenAI)
            // Allowed: '720x1280', '1280x720', '1024x1792', '1792x1024'
            const sizeMap: Record<string, string> = {
                "16:9": "1792x1024", // Max landscape
                "9:16": "1024x1792", // Max portrait
                "1:1": "1280x720",   // No native 1:1, fallback to landscape
            };
            const videoSize = sizeMap[aspectRatio] || "1792x1024";

            // Map duration to seconds. The OpenAI Sora API strictly supports "4", "8", or "12".
            // Since NEXORA UI sends "5" or "10", we map them to the closest supported Sora duration.
            const soraSeconds = duration === "10" ? "8" : "4";

            // Enforce cinematic quality in prompt implicitly to ensure good results
            const enhancedPrompt = englishPrompt.toLowerCase().includes("cinematic")
                ? englishPrompt
                : englishPrompt + " - ultra cinematic, 8k resolution, highly detailed, photorealistic, premium quality";

            const soraBody: any = {
                model: "sora-2-pro",
                prompt: enhancedPrompt,
                seconds: soraSeconds,
                size: videoSize,
            };

            // Step 1: Create video generation job
            const createRes = await fetch("https://api.openai.com/v1/videos", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(soraBody),
            });

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
