import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST() {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        // Get the user's subscription to find the LemonSqueezy subscription ID
        const { data: sub, error: subError } = await supabase
            .from("user_subscriptions")
            .select("subscription_id, status")
            .eq("user_id", authResult.userId)
            .single();

        if (subError || !sub) {
            return NextResponse.json({ error: "No active subscription found." }, { status: 404 });
        }

        if (sub.status === "cancelled" || sub.status === "expired") {
            return NextResponse.json({ error: "Subscription is already cancelled." }, { status: 400 });
        }

        // Cancel subscription via LemonSqueezy API
        const response = await fetch(
            `https://api.lemonsqueezy.com/v1/subscriptions/${sub.subscription_id}`,
            {
                method: "DELETE",
                headers: {
                    Accept: "application/vnd.api+json",
                    "Content-Type": "application/vnd.api+json",
                    Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error("LemonSqueezy cancel error:", errorData);
            return NextResponse.json({ error: "Failed to cancel subscription." }, { status: 500 });
        }

        const result = await response.json();
        const endsAt = result.data?.attributes?.ends_at;

        // Update local subscription status
        await supabase
            .from("user_subscriptions")
            .update({ status: "cancelled", ends_at: endsAt })
            .eq("user_id", authResult.userId);

        return NextResponse.json({
            success: true,
            message: "Subscription cancelled successfully.",
            ends_at: endsAt,
        });
    } catch (error: any) {
        console.error("Cancel subscription error:", error);
        return NextResponse.json({ error: "Server error." }, { status: 500 });
    }
}
