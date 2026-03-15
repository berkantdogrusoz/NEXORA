import { NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";
import { getAuthUserId } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase";
import { uploadVideoFromUrl } from "@/lib/storage";

export const maxDuration = 120;

export async function GET(req: NextRequest) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;
        const userId = authResult.userId;

        const requestId = req.nextUrl.searchParams.get("requestId");
        const endpointId = req.nextUrl.searchParams.get("endpointId");
        const modelId = req.nextUrl.searchParams.get("modelId");
        const cost = Number(req.nextUrl.searchParams.get("cost") || "0");
        const prompt = req.nextUrl.searchParams.get("prompt") || "";

        if (!requestId || !endpointId) {
            return NextResponse.json({ error: "Missing requestId or endpointId" }, { status: 400 });
        }

        const status = await fal.queue.status(endpointId, {
            requestId,
            logs: true,
        });

        if (status.status === "IN_QUEUE") {
            return NextResponse.json({
                status: "queued",
                position: (status as any).queue_position ?? null,
            });
        }

        if (status.status === "IN_PROGRESS") {
            return NextResponse.json({ status: "processing" });
        }

        if (status.status === "COMPLETED") {
            const result: any = await fal.queue.result(endpointId, { requestId });

            const videoUrl = result?.video?.url || result?.data?.video?.url;
            if (!videoUrl) {
                await refundCredits(userId, cost);
                return NextResponse.json({ status: "failed", error: "No video URL in result" }, { status: 500 });
            }

            let finalUrl = videoUrl;
            try {
                const permanentUrl = await uploadVideoFromUrl(videoUrl);
                finalUrl = permanentUrl;
            } catch (uploadErr) {
                console.error("Failed to upload video to storage:", uploadErr);
            }

            try {
                const supabase = createSupabaseServer();
                await supabase.from("generations").insert({
                    user_id: userId,
                    type: "video",
                    model: modelId || "unknown",
                    prompt: prompt.slice(0, 500),
                    result_url: finalUrl,
                    cost,
                });
            } catch (saveErr) {
                console.error("Failed to save generation record:", saveErr);
            }

            return NextResponse.json({ status: "completed", videoUrl: finalUrl });
        }

        return NextResponse.json({ status: "unknown" });
    } catch (error: any) {
        console.error("Video status check error:", error);
        return NextResponse.json(
            { status: "failed", error: error.message || "Status check failed" },
            { status: 500 }
        );
    }
}

async function refundCredits(userId: string, cost: number) {
    if (!cost || cost <= 0) return;
    try {
        const supabase = createSupabaseServer();
        const { data } = await supabase
            .from("user_credits")
            .select("credits")
            .eq("user_id", userId)
            .single();

        if (data) {
            await supabase
                .from("user_credits")
                .update({ credits: Number(data.credits) + cost })
                .eq("user_id", userId);
            console.log(`Refunded ${cost} credits to user ${userId}`);
        }
    } catch (e) {
        console.error("Failed to refund credits:", e);
    }
}
