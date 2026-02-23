import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUserId } from "@/lib/auth";

/**
 * GET: Fetch current credit balance
 */
export async function GET() {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        // Fetch current credits
        const { data, error } = await supabase
            .from("user_credits")
            .select("credits")
            .eq("user_id", authResult.userId)
            .single();

        // Also fetch active subscription to determine max limits
        const { data: subData } = await supabase
            .from("user_subscriptions")
            .select("plan_name, status")
            .eq("user_id", authResult.userId)
            .single();

        let planName = "Free";
        // Ensure the subscription is active before applying higher limits
        if (subData && (subData.status === "active" || subData.status === "past_due" || subData.status === "trialing")) {
            planName = subData.plan_name;
        }

        let maxCredits = 100;
        if (planName === "Growth") maxCredits = 200;
        else if (planName === "Pro") maxCredits = 1000;
        else if (planName === "Elite") maxCredits = 5000;

        if (error && error.code === "PGRST116") {
            // User not found, initialize with 100 credits (Tiered system: Free starts small)
            const { data: newData, error: initError } = await supabase
                .from("user_credits")
                .insert([{ user_id: authResult.userId, credits: 100 }])
                .select("credits")
                .single();

            if (initError) throw initError;
            return NextResponse.json({
                credits: Number(newData.credits),
                maxCredits,
                planName
            });
        }

        if (error) throw error;

        return NextResponse.json({
            credits: Number(data.credits),
            maxCredits,
            planName
        });

    } catch (error: any) {
        console.error("Credits GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST: Deduct credits (body: { amount: number })
 */
export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const { amount } = await req.json();
        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Fetch current credits
        const { data, error } = await supabase
            .from("user_credits")
            .select("credits")
            .eq("user_id", authResult.userId)
            .single();

        if (error) throw error;

        if (Number(data.credits) < amount) {
            return NextResponse.json({ error: "Insufficient credits", code: "INSUFFICIENT_CREDITS" }, { status: 402 });
        }

        // Update balance
        const remaining = Number(data.credits) - amount;
        const { error: updateError } = await supabase
            .from("user_credits")
            .update({ credits: remaining, updated_at: new Date().toISOString() })
            .eq("user_id", authResult.userId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, remaining });

    } catch (error: any) {
        console.error("Credits POST error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
