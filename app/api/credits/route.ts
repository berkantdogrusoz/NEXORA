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

        const { data, error } = await supabase
            .from("user_credits")
            .select("credits")
            .eq("user_id", authResult.userId)
            .single();

        if (error && error.code === "PGRST116") {
            // User not found, initialize with 50 credits
            const { data: newData, error: initError } = await supabase
                .from("user_credits")
                .insert([{ user_id: authResult.userId, credits: 50 }])
                .select("credits")
                .single();

            if (initError) throw initError;
            return NextResponse.json({ credits: newData.credits });
        }

        if (error) throw error;
        return NextResponse.json({ credits: data.credits });

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

        if (data.credits < amount) {
            return NextResponse.json({ error: "Insufficient credits", code: "INSUFFICIENT_CREDITS" }, { status: 402 });
        }

        // Update balance
        const { error: updateError } = await supabase
            .from("user_credits")
            .update({ credits: data.credits - amount, updated_at: new Date().toISOString() })
            .eq("user_id", authResult.userId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, remaining: data.credits - amount });

    } catch (error: any) {
        console.error("Credits POST error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
