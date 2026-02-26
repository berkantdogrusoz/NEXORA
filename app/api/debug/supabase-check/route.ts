import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase";

const TEST_USER_ID = "user_3A5NPLbxusyukp1lCBTecyLkq9N";

export async function GET() {
    const results: Record<string, any> = {};
    const supabase = createSupabaseServer();

    // 1. Check which key is being used
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const pubKey = process.env.SUPABASE_PUBLISHABLE_KEY || "";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    results.key_being_used = serviceKey ? "SUPABASE_SERVICE_ROLE_KEY" : pubKey ? "SUPABASE_PUBLISHABLE_KEY" : anonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : "NONE";

    // 2. Check LEMON variant env vars (needed for plan matching)
    results.lemon_variants = {
        NEXT_PUBLIC_LEMON_VARIANT_PRO: process.env.NEXT_PUBLIC_LEMON_VARIANT_PRO || "NOT SET",
        NEXT_PUBLIC_LEMON_VARIANT_GROWTH: process.env.NEXT_PUBLIC_LEMON_VARIANT_GROWTH || "NOT SET",
    };

    // 3. Check user's subscription data
    const { data: subData, error: subError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", TEST_USER_ID)
        .single();

    results.user_subscription = {
        found: !!subData,
        error: subError?.message || null,
        data: subData,
    };

    // 4. Check user's credits
    const { data: creditData, error: creditError } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", TEST_USER_ID)
        .single();

    results.user_credits = {
        found: !!creditData,
        error: creditError?.message || null,
        data: creditData,
    };

    // 5. TEST WRITE: Try to upsert a subscription row for this user
    const { data: writeSubData, error: writeSubError } = await supabase
        .from("user_subscriptions")
        .upsert(
            {
                user_id: TEST_USER_ID,
                lemon_customer_id: "7875214",
                lemon_subscription_id: "1904989",
                lemon_variant_id: "1319827",
                status: "active",
                renews_at: "2026-03-23T23:28:19.000000Z",
                ends_at: null,
                plan_name: "Pro",
                updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
        )
        .select();

    results.write_subscription_test = {
        success: !writeSubError,
        error: writeSubError?.message || null,
        data: writeSubData,
    };

    // 6. TEST WRITE: Try to upsert credits
    const { data: writeCreditData, error: writeCreditError } = await supabase
        .from("user_credits")
        .upsert(
            {
                user_id: TEST_USER_ID,
                credits: 1000,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
        )
        .select();

    results.write_credits_test = {
        success: !writeCreditError,
        error: writeCreditError?.message || null,
        data: writeCreditData,
    };

    // 7. Re-read to confirm writes
    const { data: finalSub } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", TEST_USER_ID)
        .single();

    const { data: finalCredits } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", TEST_USER_ID)
        .single();

    results.after_write = {
        subscription: finalSub,
        credits: finalCredits,
    };

    return NextResponse.json(results, { status: 200 });
}
