import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js";

function safeText(value: unknown, fallback: string, maxLength = 140) {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    return trimmed.slice(0, maxLength);
}

export async function POST(req: NextRequest) {
    try {
        const auth = await getAuthUserId();
        if ("error" in auth) return auth.error;
        const { userId } = auth;

        const body = await req.json();
        const { variantId, redirectPath, name, description, kind } = body;

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

        const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).replace(/\/$/, "");
        const safeRedirectPath = typeof redirectPath === "string" && redirectPath.startsWith("/")
            ? redirectPath
            : "/dashboard";
        const redirectUrl = `${appBaseUrl}${safeRedirectPath}`;

        const checkoutKind = kind === "subscription" ? "subscription" : "one-time";
        const checkoutName = safeText(
            name,
            checkoutKind === "subscription" ? "Nexora Subscription" : "Nexora Credits"
        );
        const checkoutDescription = safeText(
            description,
            checkoutKind === "subscription"
                ? "Premium Nexora plan with recurring billing. You can cancel anytime from your account."
                : "One-time credit purchase. Balance is added automatically after payment.",
            260
        );
        const checkoutMedia = `${appBaseUrl}${
            checkoutKind === "subscription" ? "/arts/styles/cinema-studio.jpg" : "/arts/hero-bg.png"
        }`;

        console.log("Creating checkout for:", { storeId, variantIdNum });

        // Create Checkout
        const checkout = await createCheckout(storeId, variantIdNum, {
            checkoutOptions: {
                embed: false,
                media: true,
                logo: true,
                desc: true,
                backgroundColor: "#06090f",
                headingsColor: "#f8fafc",
                primaryTextColor: "#dbe7f5",
                secondaryTextColor: "#94a3b8",
                linksColor: "#22d3ee",
                bordersColor: "#1f2937",
                checkboxColor: "#22d3ee",
                activeStateColor: "#22d3ee",
                buttonColor: "#06b6d4",
                buttonTextColor: "#041016",
            },
            checkoutData: {
                custom: {
                    user_id: userId
                }
            },
            productOptions: {
                name: checkoutName,
                description: `${checkoutDescription}\n\nNeed to cancel? Close this tab and return to Nexora from the previous page.`,
                media: [checkoutMedia],
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
