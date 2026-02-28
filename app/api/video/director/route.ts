import { NextResponse } from "next/server";
import { getAuthUserId, checkRateLimit } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase";

export const maxDuration = 300; // 5 minutes

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
        const { prompt, imageUrl, cameraMode, soulMode } = body;

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

        // Director Studio is Premium ONLY
        if (planName === "Free") {
            return NextResponse.json({ error: "Director Studio is exclusively for Premium members." }, { status: 403 });
        }

        const cost = 120; // 120 credits for Higgsfield Director Studio

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

        // Higgsfield API Call
        const higgsfieldApiKey = process.env.HIGGSFIELD_API_KEY;

        let finalUrl = "";

        if (!higgsfieldApiKey) {
            // MOCK MODE FOR TESTING (If user hasn't provided API key yet)
            console.log("HIGGSFIELD_API_KEY missing. Returning mock video for testing.");
            await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate delay
            finalUrl = "https://videos.pexels.com/video-files/3163534/3163534-uhd_2560_1440_30fps.mp4"; // Mock cinematic video
        } else {
            // Real Higgsfield API implementation
            let payload: any = {
                prompt: prompt || "Cinematic shot",
            };

            if (soulMode && imageUrl) {
                // Soul Mode requires reference_image_urls array
                payload.reference_image_urls = [imageUrl];
            } else if (imageUrl) {
                // Standard Image to video
                payload.image_url = imageUrl;
            }

            if (cameraMode && cameraMode !== "auto") {
                if (cameraMode === "fixed") {
                    payload.camera_fixed = true;
                }
                // Higgsfield has specific motion params, would add mapping here if the SDK requires specifics
            }

            const response = await fetch("https://api.higgsfield.ai/v1/generations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${higgsfieldApiKey}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Higgsfield API Error");
            }

            const data = await response.json();
            // Assuming the API returns the final video URL synchronously or we need to poll
            // The actual payload depends on Higgsfield's specific async/sync response format
            // Most generation APIs return `{ id }` and require polling GET /v1/generations/{id}

            if (data.url) {
                finalUrl = data.url;
            } else {
                throw new Error("Video URL not found in Higgsfield response. Polling may be required.");
            }
        }

        // Save generation to history
        await supabase.from("generations").insert({
            user_id: userId,
            model_id: "higgsfield-director",
            prompt: prompt || "Soul Mode Gen",
            type: "director",
            output_url: finalUrl,
            cost: cost,
        });

        // Add history record for profile tracking
        await supabase.from("history").insert({
            user_id: userId,
            type: "video",
            prompt: prompt || "Soul Mode Gen",
            output_url: finalUrl,
            model: "higgsfield-director",
            created_at: new Date().toISOString()
        });

        return NextResponse.json({ url: finalUrl, success: true });

    } catch (error: any) {
        console.error("Director Studio Error:", error);

        // Refund if deducted
        if (creditDeducted && userId) {
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
            }
        }

        return NextResponse.json({ error: error.message || "Failed to generate video" }, { status: 500 });
    }
}
