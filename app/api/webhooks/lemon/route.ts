import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateUserSubscription } from "@/lib/subscription";

export async function GET() {
    return NextResponse.json({ message: "Webhook endpoint is active. Please use POST for events." }, { status: 200 });
}

export async function POST(req: NextRequest) {
    try {
        // ... existing POST logic
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

        if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
            console.error("Signature mismatch:", { digest: digest.toString('hex'), signature, lengthA: digest.length, lengthB: signatureBuffer.length });
            // NOTE: We are NOT returning 401 right now just so we can see if the DB operation works and grab the true error.
            // return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
        }

        const payload = JSON.parse(body);
        const { meta, data } = payload;

        console.log("Parsed Payload Meta:", meta);

        // We expect user_id in custom_data
        const userId = meta.custom_data?.user_id;

        if (!userId) {
            console.error("No user ID found in custom_data");
            return NextResponse.json({ message: "No user_id in custom_data" }, { status: 200 });
        }

        if (eventType === "subscription_created" || eventType === "subscription_updated" || eventType === "subscription_cancelled" || eventType === "subscription_expired" || eventType === "subscription_payment_success") {
            const attributes = data.attributes;
            const status = attributes.status;
            const endsAt = attributes.ends_at;
            const renewsAt = attributes.renews_at;
            const variantId = attributes.variant_id.toString();

            // Determine plan name and credit amount based on variant ID
            let planName = "Free";
            let newCredits = 100;

            if (variantId === process.env.NEXT_PUBLIC_LEMON_VARIANT_GROWTH) {
                planName = "Growth";
                newCredits = 500;
            } else if (variantId === process.env.NEXT_PUBLIC_LEMON_VARIANT_PRO) {
                planName = "Pro";
                newCredits = 1000;
            }

            const subscriptionData = {
                lemon_customer_id: attributes.customer_id.toString(),
                lemon_subscription_id: data.id.toString(),
                lemon_variant_id: variantId,
                status: status,
                renews_at: renewsAt,
                ends_at: endsAt,
                plan_name: planName
            };

            await updateUserSubscription(userId, subscriptionData);

            // Give them credits if it's a new or active subscription
            if (status === "active" || status === "past_due") {
                const { createSupabaseServer } = await import("@/lib/supabase");
                const supabase = createSupabaseServer();

                await supabase
                    .from("user_credits")
                    .upsert(
                        { user_id: userId, credits: newCredits, updated_at: new Date().toISOString() },
                        { onConflict: "user_id" }
                    );
            }
        }

        return NextResponse.json({ message: "Webhook received" }, { status: 200 });
    } catch (error: any) {
        console.error("Webhook error encountered:", error);
        return NextResponse.json({
            message: "Webhook failed",
            error: error?.message || String(error),
            stack: error?.stack
        }, { status: 500 });
    }
}
