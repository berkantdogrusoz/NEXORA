import { createSupabaseServer } from "./supabase";

export async function updateUserSubscription(
    userId: string,
    subscriptionData: {
        lemon_customer_id: string;
        lemon_subscription_id: string;
        lemon_variant_id: string;
        status: string;
        renews_at: string;
        ends_at?: string;
        plan_name: string;
    }
) {
    const supabase = createSupabaseServer();

    // Upsert subscription
    const { error } = await supabase
        .from("user_subscriptions")
        .upsert(
            {
                user_id: userId,
                ...subscriptionData,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
        );

    if (error) {
        console.error("Error updating subscription:", error);
        throw error;
    }
}

export async function getUserSubscription(userId: string) {
    const supabase = createSupabaseServer();
    const { data } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

    return data;
}
