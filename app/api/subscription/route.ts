import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase";
import { getAuthUserId } from "@/lib/auth";

/**
 * GET: Fetch current user's subscription details
 */
export async function GET() {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const supabase = createSupabaseServer();

        const { data, error } = await supabase
            .from("user_subscriptions")
            .select("*")
            .eq("user_id", authResult.userId)
            .single();

        if (error && error.code === "PGRST116") {
            // No subscription found
            return NextResponse.json({
                plan_name: "Free",
                status: "none",
                credits: 0,
                renews_at: null,
                ends_at: null,
                customer_portal_url: null,
            });
        }

        if (error) throw error;

        // Build customer portal URL from LemonSqueezy
        let customerPortalUrl = null;
        if (data?.lemon_subscription_id) {
            try {
                const lsRes = await fetch(
                    `https://api.lemonsqueezy.com/v1/subscriptions/${data.lemon_subscription_id}`,
                    {
                        headers: {
                            Accept: "application/vnd.api+json",
                            "Content-Type": "application/vnd.api+json",
                            Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
                        },
                    }
                );
                if (lsRes.ok) {
                    const lsData = await lsRes.json();
                    customerPortalUrl = lsData?.data?.attributes?.urls?.customer_portal || null;
                }
            } catch (e) {
                console.error("Failed to fetch LemonSqueezy portal URL:", e);
            }
        }

        // Also get credits
        const { data: creditData } = await supabase
            .from("user_credits")
            .select("credits")
            .eq("user_id", authResult.userId)
            .single();

        return NextResponse.json({
            plan_name: data?.plan_name || "Free",
            status: data?.status || "none",
            credits: creditData?.credits ?? 0,
            renews_at: data?.renews_at || null,
            ends_at: data?.ends_at || null,
            lemon_subscription_id: data?.lemon_subscription_id || null,
            customer_portal_url: customerPortalUrl,
            created_at: data?.created_at || null,
        });
    } catch (error: any) {
        console.error("Subscription GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
