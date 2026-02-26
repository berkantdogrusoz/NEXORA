import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase";

export async function GET() {
    const results: Record<string, any> = {};

    // 1. Check environment variables (partial reveal for security)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    results.env = {
        NEXT_PUBLIC_SUPABASE_URL: url ? `${url.substring(0, 30)}...` : "NOT SET",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey ? `${anonKey.substring(0, 20)}...` : "NOT SET",
        SUPABASE_SERVICE_ROLE_KEY: serviceKey ? `${serviceKey.substring(0, 15)}...` : "NOT SET",
        LEMONSQUEEZY_WEBHOOK_SECRET: process.env.LEMONSQUEEZY_WEBHOOK_SECRET ? "SET" : "NOT SET",
        NEXT_PUBLIC_LEMON_VARIANT_PRO: process.env.NEXT_PUBLIC_LEMON_VARIANT_PRO || "NOT SET",
        NEXT_PUBLIC_LEMON_VARIANT_GROWTH: process.env.NEXT_PUBLIC_LEMON_VARIANT_GROWTH || "NOT SET",
    };

    // 2. Try connecting to Supabase
    try {
        const supabase = createSupabaseServer();

        // 3. Try reading user_subscriptions table
        const { data: subData, error: subError } = await supabase
            .from("user_subscriptions")
            .select("*")
            .limit(5);

        results.user_subscriptions = {
            success: !subError,
            error: subError?.message || null,
            rowCount: subData?.length ?? 0,
            rows: subData || [],
        };

        // 4. Try reading user_credits table
        const { data: creditData, error: creditError } = await supabase
            .from("user_credits")
            .select("*")
            .limit(5);

        results.user_credits = {
            success: !creditError,
            error: creditError?.message || null,
            rowCount: creditData?.length ?? 0,
            rows: creditData || [],
        };

    } catch (error: any) {
        results.connection_error = error?.message || String(error);
    }

    return NextResponse.json(results, { status: 200 });
}
