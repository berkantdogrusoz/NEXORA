import { NextResponse } from "next/server";
import { getAuthUserId, checkRateLimit } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase";
import { hasDirectorAccess } from "@/lib/plans";

export const maxDuration = 300; // 5 minutes

// ═══════════════════════════════════════════════════
//   HIGGSFIELD CINEMA STUDIO — FULL INTEGRATION
// ═══════════════════════════════════════════════════

const HIGGSFIELD_API = "https://api.higgsfield.ai/v1";

// Poll interval and limits
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 90; // 90 × 3s = 270s max

// Cost per DOP model
const MODEL_COSTS: Record<string, number> = {
    "dop-lite": 100,
    "dop-preview": 150,
    "dop-turbo": 200,
};

/**
 * Poll Higgsfield for generation result
 */
async function pollGeneration(generationId: string, apiKey: string): Promise<string> {
    for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

        const res = await fetch(`${HIGGSFIELD_API}/generations/${generationId}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `Higgsfield poll error: ${res.status}`);
        }

        const data = await res.json();
        const status = data.status || data.state;

        if (status === "completed" || status === "succeeded") {
            // Try multiple response formats
            const url =
                data.output?.url ||
                data.output?.video_url ||
                data.video?.url ||
                data.url ||
                data.result?.url;
            if (url) return url;
            throw new Error("Generation completed but no video URL in response.");
        }

        if (status === "failed" || status === "error") {
            throw new Error(data.error?.message || data.message || "Video generation failed on Higgsfield.");
        }

        // Still processing — continue polling
        console.log(`[Higgsfield] Poll ${i + 1}/${MAX_POLL_ATTEMPTS} — status: ${status}`);
    }

    throw new Error("Generation timed out after 4.5 minutes.");
}

export async function POST(req: Request) {
    let creditDeducted = false;
    let deductedCost = 0;
    let userId = "";

    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;
        userId = authResult.userId;

        // Rate Limiting
        const rateError = checkRateLimit(userId, "director-generate");
        if (rateError) return rateError;

        const body = await req.json();
        const {
            prompt,
            imageUrl,
            model = "dop-preview",
            cameraMovement = "auto",
            motionIntensity = 0.5,
            genre = "cinematic",
            quality = "720p",
            enhancePrompt = true,
            seed,
            soulMode = false,
        } = body;

        if (!prompt && !imageUrl) {
            return NextResponse.json({ error: "Prompt or reference image is required" }, { status: 400 });
        }

        // Validate model
        const validModels = ["dop-lite", "dop-preview", "dop-turbo"];
        const finalModel = validModels.includes(model) ? model : "dop-preview";
        const cost = MODEL_COSTS[finalModel] || 150;

        // ── Auth & Credits ──
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

        // Director Studio is Premium ONLY
        if (!hasDirectorAccess(planName)) {
            return NextResponse.json({ error: "Director Studio is exclusively for Premium members." }, { status: 403 });
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

        // Deduct credits
        if (!isDev) {
            const { error } = await supabase
                .from("user_credits")
                .update({ credits: currentCredits - cost })
                .eq("user_id", userId);
            if (error) {
                return NextResponse.json({ error: "Failed to process credits" }, { status: 500 });
            }
        }

        creditDeducted = !isDev;
        deductedCost = cost;

        // ── Higgsfield API Key ──
        const apiKey = process.env.HIGGSFIELD_API_KEY;
        if (!apiKey) {
            throw new Error("HIGGSFIELD_API_KEY is not configured. Please add it to your environment variables.");
        }

        // ── Upload reference image if base64 ──
        let resolvedImageUrl = imageUrl;
        if (imageUrl && imageUrl.startsWith("data:")) {
            try {
                const base64Data = imageUrl.split(",")[1];
                const buffer = Buffer.from(base64Data, "base64");
                const ext = imageUrl.includes("png") ? "png" : "jpg";
                const filename = `reference/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
                await supabase.storage.from("instagram-images").upload(filename, buffer, {
                    contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
                    upsert: false,
                });
                const { data: pubData } = supabase.storage.from("instagram-images").getPublicUrl(filename);
                resolvedImageUrl = pubData.publicUrl;
            } catch (uploadErr) {
                console.error("Failed to upload reference image:", uploadErr);
                throw new Error("Failed to process reference image.");
            }
        }

        // ── Translate prompt to English ──
        let englishPrompt = prompt || "Cinematic shot with smooth camera motion";
        try {
            const { default: OpenAI } = await import("openai");
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const translation = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a cinematic video prompt translator. Translate the following to English. Enhance it for cinematic quality — add camera direction, lighting cues, and atmosphere. Only return the enhanced prompt, nothing else.",
                    },
                    { role: "user", content: prompt || "Cinematic shot" },
                ],
            });
            englishPrompt = translation.choices[0].message.content || englishPrompt;
        } catch {
            console.error("Translation skipped, using original prompt.");
        }

        // ── Build Higgsfield Payload ──
        const payload: Record<string, any> = {
            prompt: englishPrompt,
            model: finalModel,
            quality,
            enhance_prompt: enhancePrompt,
        };

        // Camera movement
        if (cameraMovement && cameraMovement !== "auto") {
            payload.camera_movement = cameraMovement;
        }

        // Motion intensity (0.0 - 1.0)
        if (typeof motionIntensity === "number") {
            payload.motion_intensity = Math.min(1, Math.max(0, motionIntensity));
        }

        // Genre-based motion logic
        if (genre && genre !== "cinematic") {
            payload.genre = genre;
        }

        // Seed for reproducibility
        if (seed !== undefined && seed !== null && seed !== "") {
            payload.seed = Number(seed);
        }

        // Soul Mode (character consistency)
        if (soulMode && resolvedImageUrl) {
            payload.task = "image-to-video";
            payload.reference_image_urls = [resolvedImageUrl];
            payload.soul_mode = true;
        } else if (resolvedImageUrl) {
            payload.task = "image-to-video";
            payload.image_url = resolvedImageUrl;
        } else {
            payload.task = "text-to-video";
        }

        console.log(`[Higgsfield] Generating with model=${finalModel}, task=${payload.task}, camera=${cameraMovement}, genre=${genre}`);

        // ── Submit Generation ──
        const submitRes = await fetch(`${HIGGSFIELD_API}/generations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
        });

        if (!submitRes.ok) {
            const errData = await submitRes.json().catch(() => ({}));
            throw new Error(errData.message || errData.error || `Higgsfield API error: ${submitRes.status}`);
        }

        const submitData = await submitRes.json();
        const generationId = submitData.id || submitData.generation_id;

        if (!generationId) {
            // Maybe it returned the result directly (synchronous)
            const directUrl = submitData.url || submitData.output?.url || submitData.video?.url;
            if (directUrl) {
                // Save and return
                const { uploadVideoFromUrl } = await import("@/lib/storage");
                const permanentUrl = await uploadVideoFromUrl(directUrl, "director");
                const returnUrl = permanentUrl || directUrl;

                await supabase.from("generations").insert({
                    user_id: userId,
                    model: `higgsfield-${finalModel}`,
                    prompt: prompt || "Cinema Studio",
                    type: "director",
                    output_url: returnUrl,
                });

                return NextResponse.json({ url: returnUrl, success: true, model: finalModel });
            }
            throw new Error("No generation ID or direct result from Higgsfield.");
        }

        // ── Poll for Result ──
        console.log(`[Higgsfield] Generation submitted: ${generationId}. Polling...`);
        const videoUrl = await pollGeneration(generationId, apiKey);

        // ── Upload to Supabase ──
        const { uploadVideoFromUrl } = await import("@/lib/storage");
        const permanentUrl = await uploadVideoFromUrl(videoUrl, "director");
        const returnUrl = permanentUrl || videoUrl;

        // ── Save to History ──
        await supabase.from("generations").insert({
            user_id: userId,
            model: `higgsfield-${finalModel}`,
            prompt: prompt || "Cinema Studio",
            type: "director",
            output_url: returnUrl,
        });

        return NextResponse.json({ url: returnUrl, success: true, model: finalModel });

    } catch (error: any) {
        console.error("Director Studio Error:", error);

        // Refund credits on failure
        if (creditDeducted && userId) {
            try {
                const supabase = createSupabaseServer();
                const { data: currentData } = await supabase
                    .from("user_credits")
                    .select("credits")
                    .eq("user_id", userId)
                    .single();

                if (currentData) {
                    await supabase
                        .from("user_credits")
                        .update({ credits: Number(currentData.credits) + deductedCost })
                        .eq("user_id", userId);
                    console.log(`Refunded ${deductedCost} credits to user ${userId}`);
                }
            } catch (refundError) {
                console.error("Failed to refund credits:", refundError);
            }
        }

        return NextResponse.json({ error: error.message || "Failed to generate video" }, { status: 500 });
    }
}
