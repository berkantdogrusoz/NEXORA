import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js";

export async function POST(req: NextRequest) {
    try {
        const auth = await getAuthUserId();
        if ("error" in auth) return NextResponse.json(auth.error, { status: 401 });
        const { userId } = auth;

        const body = await req.json();
        const { variantId } = body;

        if (!variantId) {
            return NextResponse.json({ error: "Missing variantId" }, { status: 400 });
        }

        if (!process.env.LEMONSQUEEZY_API_KEY || !process.env.LEMONSQUEEZY_STORE_ID) {
            return NextResponse.json({ error: "Server misconfiguration (Lemon Squeezy)" }, { status: 500 });
        }

        lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY });

        const storeId = process.env.LEMONSQUEEZY_STORE_ID;

        // Create Checkout
        const checkout = await createCheckout(storeId, variantId, {
            checkoutOptions: {
                embed: true, // Use overlay checkout
                media: false,
                buttonColor: "#7047EB"
            },
            checkoutData: {
                custom: {
                    user_id: userId
                }
            },
            productOptions: {
                redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
                receiptButtonText: "Go to Dashboard",
                receiptThankYouNote: "Welcome to Nexora Pro!"
            }
        });

        return NextResponse.json({ url: checkout.data?.data.attributes.url });

    } catch (error) {
        console.error("Checkout creation failed:", error);
        return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }
}
