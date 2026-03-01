import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        // Fetch User Credits
        const { data: creditData } = await supabase
            .from("user_credits")
            .select("credits")
            .eq("user_id", authResult.userId)
            .single();

        const currentCredits = creditData?.credits || 0;

        // Fetch User Subscription
        const { data: subData } = await supabase
            .from("user_subscriptions")
            .select("plan_name, status, ends_at")
            .eq("user_id", authResult.userId)
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

        let maxCredits = 100;
        if (planName === "Growth") maxCredits = 500;
        else if (planName === "Pro") maxCredits = 1000;

        // Fetch total assistant messages
        const { count: totalMessages } = await supabase
            .from("assistant_messages")
            .select("*", { count: "exact", head: true })
            .eq("user_id", authResult.userId)
            .eq("role", "user");

        const isDev = process.env.NODE_ENV === "development";
        return NextResponse.json({
            stats: {
                credits: isDev ? 999999 : currentCredits,
                maxCredits: isDev ? 999999 : maxCredits,
                planName,
                totalMessages: totalMessages || 0,
            }
        });
    } catch {
        return NextResponse.json({
            stats: { credits: 0, maxCredits: 100, planName: "Free", totalMessages: 0 }
        });
    }
}
