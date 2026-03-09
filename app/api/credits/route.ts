import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase";
import { getAuthUserId } from "@/lib/auth";
import { getPlanMaxCredits } from "@/lib/plans";

/**
 * GET: Fetch current credit balance
 */
export async function GET() {
    try {
        const supabase = createSupabaseServer();
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
            .select("plan_name, status, ends_at")
            .eq("user_id", authResult.userId)
            .single();

        let planName = "Free";
        // Ensure the subscription is active (or cancelled but still within billing period)
        if (subData) {
            const isActive = subData.status === "active" || subData.status === "past_due" || subData.status === "on_trial";
            const isCancelledButValid = subData.status === "cancelled" && subData.ends_at && new Date(subData.ends_at) > new Date();
            if (isActive || isCancelledButValid) {
                planName = subData.plan_name;
            }
        }

        if (process.env.NODE_ENV === "development") planName = "Pro";

        const maxCredits = getPlanMaxCredits(planName);

        if (error && error.code === "PGRST116") {
            // User not found, initialize with 50 credits (Free tier)
            const { data: newData, error: initError } = await supabase
                .from("user_credits")
                .insert([{ user_id: authResult.userId, credits: 50 }])
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

        const isDev = process.env.NODE_ENV === "development";
        return NextResponse.json({
            credits: isDev ? 999999 : Number(data.credits),
            maxCredits: isDev ? 999999 : maxCredits,
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
        const supabase = createSupabaseServer();
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

        const isDev = process.env.NODE_ENV === "development";
        const currentCredits = isDev ? 999999 : Number(data.credits);

        if (!isDev && currentCredits < amount) {
            return NextResponse.json({ error: "Insufficient credits", code: "INSUFFICIENT_CREDITS" }, { status: 402 });
        }

        // Update balance
        const remaining = currentCredits - amount;
        if (!isDev) {
            const { error: updateError } = await supabase
                .from("user_credits")
                .update({ credits: remaining, updated_at: new Date().toISOString() })
                .eq("user_id", authResult.userId);

            if (updateError) throw updateError;
        }

        return NextResponse.json({ success: true, remaining: isDev ? 999999 : remaining });

    } catch (error: any) {
        console.error("Credits POST error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
