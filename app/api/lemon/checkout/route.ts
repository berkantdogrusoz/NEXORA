import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js";

export async function POST(req: NextRequest) {
    try {
        const auth = await getAuthUserId();
        if ("error" in auth) return NextResponse.json(auth.error, { status: 401 });
        const { userId } = auth;

        const body = await req.json();
        const { variantId, redirectPath } = body;

        if (!variantId) {
            return NextResponse.json({ error: "Missing variantId" }, { status: 400 });
        }

        if (!process.env.LEMONSQUEEZY_API_KEY || !process.env.LEMONSQUEEZY_STORE_ID) {
            return NextResponse.json({ error: "Server misconfiguration (Lemon Squeezy)" }, { status: 500 });
        }

        lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY });

        const storeId = parseInt(process.env.LEMONSQUEEZY_STORE_ID, 10);
        const variantIdNum = parseInt(variantId, 10);

        if (Number.isNaN(storeId) || Number.isNaN(variantIdNum)) {
            return NextResponse.json({ error: "Invalid checkout configuration" }, { status: 400 });
        }

        const safeRedirectPath = typeof redirectPath === "string" && redirectPath.startsWith("/")
            ? redirectPath
            : "/dashboard";
        const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${safeRedirectPath}`;

        console.log("Creating checkout for:", { storeId, variantIdNum });

        // Create Checkout
        const checkout = await createCheckout(storeId, variantIdNum, {
            checkoutOptions: {
                embed: false,
                media: false,
                buttonColor: "#06b6d4"
            },
            checkoutData: {
                custom: {
                    user_id: userId
                }
            },
            productOptions: {
                redirectUrl,
                receiptButtonText: "Return to Nexora",
                receiptThankYouNote: "Welcome to Nexora Pro!"
            }
        });

        console.log("Checkout response:", JSON.stringify(checkout, null, 2));

        if (checkout.error) {
            console.error("Lemon Squeezy API Error:", checkout.error);
            return NextResponse.json({ error: checkout.error.message }, { status: 500 });
        }

        const checkoutUrl = checkout.data?.data?.attributes?.url;

        if (!checkoutUrl) {
            console.error("No checkout URL found in response");
            return NextResponse.json({ error: "Failed to generate checkout link" }, { status: 500 });
        }

        return NextResponse.json({ url: checkoutUrl });

    } catch (error) {
        console.error("Checkout creation failed:", error);
        return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }
}
