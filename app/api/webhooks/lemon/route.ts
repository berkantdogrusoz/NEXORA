import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateUserSubscription } from "@/lib/subscription";

export async function POST(req: NextRequest) {
    try {
        const clone = req.clone();
        const eventType = req.headers.get("X-Event-Name");
        const signature = req.headers.get("X-Signature");
        const body = await clone.text();

        if (!signature || !process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
            return NextResponse.json({ message: "Missing signature or secret" }, { status: 400 });
        }

        // Verify signature
        const hmac = crypto.createHmac("sha256", process.env.LEMONSQUEEZY_WEBHOOK_SECRET);
        const digest = Buffer.from(hmac.update(body).digest("hex"), "utf8");
        const signatureBuffer = Buffer.from(signature, "utf8");

        if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
            return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
        }

        const payload = JSON.parse(body);
        const { meta, data } = payload;

        // We expect user_id in custom_data
        const userId = meta.custom_data?.user_id;

        if (!userId) {
            // Maybe it's an update where we don't have custom_data in meta? 
            // Lemon Squeezy sends custom_data in all events if it was passed during checkout.
            // However, if it's missing, we might need to lookup by subscription_id if we already have it.
            // For MVP, valid checkout MUST have user_id.
            return NextResponse.json({ message: "No user_id in custom_data" }, { status: 200 }); // Return 200 to acknowledge
        }

        if (eventType === "subscription_created" || eventType === "subscription_updated" || eventType === "subscription_cancelled" || eventType === "subscription_expired") {
            const attributes = data.attributes;
            const status = attributes.status;
            const endsAt = attributes.ends_at;
            const renewsAt = attributes.renews_at;
            const variantId = attributes.variant_id;

            // Determine plan name based on variant ID (Need to map this in environment or code)
            // For now, valid plans are stored in DB. We can map IDs later.

            // Map Status
            // Lemon statuses: on_trial, active, paused, past_due, unpaid, cancelled, expired

            const subscriptionData = {
                lemon_customer_id: attributes.customer_id.toString(),
                lemon_subscription_id: data.id.toString(),
                lemon_variant_id: variantId.toString(),
                status: status,
                renews_at: renewsAt,
                ends_at: endsAt,
                plan_name: "Pro" // Placeholder, we should fetch variant name or map ID
            };

            // We might want to fetch the variant name from Lemon API if we want accuracy, or hardcode map.
            // For simple MVP let's assume Pro.

            await updateUserSubscription(userId, subscriptionData);
        }

        return NextResponse.json({ message: "Webhook received" }, { status: 200 });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ message: "Webhook failed" }, { status: 500 });
    }
}
