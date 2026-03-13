"use server";

import { auth } from "@clerk/nextjs/server";
import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js";

function safeText(value: unknown, fallback: string, maxLength = 140) {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    return trimmed.slice(0, maxLength);
}

export async function createCheckoutAction(params: {
    variantId: string;
    redirectPath: string;
    name: string;
    description: string;
    kind: string;
}): Promise<{ url?: string; error?: string }> {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { error: "Please sign in to continue." };
        }

        const { variantId, redirectPath, name, description, kind } = params;

        if (!variantId) {
            return { error: "Missing variant ID." };
        }

        if (!process.env.LEMONSQUEEZY_API_KEY || !process.env.LEMONSQUEEZY_STORE_ID) {
            return { error: "Payment system is not configured." };
        }

        lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY });

        const storeId = parseInt(process.env.LEMONSQUEEZY_STORE_ID, 10);
        const variantIdNum = parseInt(variantId, 10);

        if (Number.isNaN(storeId) || Number.isNaN(variantIdNum)) {
            return { error: "Invalid checkout configuration." };
        }

        const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://getnexorai.com").replace(/\/$/, "");
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
                    user_id: userId,
                },
            },
            productOptions: {
                name: checkoutName,
                description: `${checkoutDescription}\n\nNeed to cancel? Close this tab and return to Nexora from the previous page.`,
                media: [checkoutMedia],
                redirectUrl,
                receiptButtonText: "Return to Nexora",
                receiptThankYouNote: "Welcome to Nexora Pro!",
            },
        });

        if (checkout.error) {
            console.error("Lemon Squeezy API Error:", checkout.error);
            return { error: checkout.error.message || "Payment provider error." };
        }

        const checkoutUrl = checkout.data?.data?.attributes?.url;
        if (!checkoutUrl) {
            return { error: "Failed to generate checkout link." };
        }

        return { url: checkoutUrl };
    } catch (error: any) {
        console.error("Checkout action failed:", error?.message || error);
        return { error: "Failed to create checkout. Please try again." };
    }
}
