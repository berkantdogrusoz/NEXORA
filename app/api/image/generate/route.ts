import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import OpenAI from "openai";
import { createSupabaseServer } from "@/lib/supabase";

export const maxDuration = 60;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    let creditDeducted = false;
    let deductedCost = 0;
    let userId = "";

    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;
        userId = authResult.userId;

        const body = await req.json();
        const { prompt, size = "1024x1024", model: modelId = "dall-e-2" } = body;

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
        const validModels = ["dall-e-2", "dall-e-3"];
        const finalModel = validModels.includes(modelId) ? modelId : "dall-e-2";
        const cost = finalModel === "dall-e-3" ? 15 : 5;

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

        // Block Pro models for Free users
        if (finalModel === "dall-e-3" && planName === "Free") {
            return NextResponse.json({ error: "You need a Premium plan to use DALL-E 3 high-quality generation." }, { status: 403 });
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

        // Call OpenAI
        const response = await client.images.generate({
            model: finalModel, // "dall-e-2" | "dall-e-3"
            prompt,
            n: 1,
            size: finalSize as "1024x1024" | "1792x1024" | "1024x1792",
            quality: finalModel === "dall-e-3" ? "hd" : "standard", // dal-e-2 doesn't support "hd"
        });

        const imageUrl = response.data[0]?.url;

        if (!imageUrl) {
            throw new Error("No image generated");
        }

        // Upload to Supabase for permanent storage
        try {
            const { uploadImageFromUrl } = await import("@/lib/storage");
            const permanentUrl = await uploadImageFromUrl(imageUrl);
            return NextResponse.json({ imageUrl: permanentUrl });
        } catch {
            // Fallback to OpenAI URL if storage fails
            return NextResponse.json({ imageUrl });
        }
    } catch (error: any) {
        console.error("Image generation error:", error);

        // Refund credits if generation failed but deduction succeeded
        if (creditDeducted && userId) {
            try {
                const supabase = createSupabaseServer();

                // Fetch latest credits just to be perfectly safe before refunding
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
            { error: error?.message || "Failed to generate image" },
            { status: 500 }
        );
    }
}
