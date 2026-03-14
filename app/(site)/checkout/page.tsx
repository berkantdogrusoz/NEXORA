"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CreditCard, Lock, ShieldCheck, Sparkles } from "lucide-react";

function safeReturnPath(value: string | null) {
    if (!value || !value.startsWith("/")) return "/dashboard";
    return value;
}

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [opening, setOpening] = useState(false);

    const details = useMemo(() => {
        const variantId = searchParams.get("variantId") || "";
        const name = searchParams.get("name") || "Nexora purchase";
        const price = searchParams.get("price") || "";
        const kind = searchParams.get("kind") || "one-time";
        const returnTo = safeReturnPath(searchParams.get("returnTo"));

        let description = searchParams.get("description") || "";
        if (!description) {
            description =
                kind === "subscription"
                    ? "Recurring plan billed by Lemon Squeezy. You can cancel anytime from your account panel."
                    : "One-time payment. Credits are delivered automatically after successful payment.";
        }

        return { variantId, name, price, kind, returnTo, description };
    }, [searchParams]);

    const openSecureCheckout = async () => {
        if (!details.variantId) {
            window.alert("Checkout configuration is missing.");
            return;
        }

        setOpening(true);

        try {
            const response = await fetch("/api/lemon/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    variantId: details.variantId,
                    redirectPath: details.returnTo,
                    name: details.name,
                    description: details.description,
                    kind: details.kind,
                }),
            });

            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
                if (response.status === 401 || response.status === 403) {
                    const redirectBack = `/checkout?${searchParams.toString()}`;
                    router.push(`/sign-in?redirect_url=${encodeURIComponent(redirectBack)}`);
                    return;
                }
                window.alert("Checkout could not be started. Please sign in and try again.");
                return;
            }

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
                return;
            }

            if (response.status === 401) {
                const redirectBack = `/checkout?${searchParams.toString()}`;
                router.push(`/sign-in?redirect_url=${encodeURIComponent(redirectBack)}`);
                return;
            }

            window.alert(data.error || "Checkout could not be started.");
        } catch {
            window.alert("Checkout could not be started.");
        } finally {
            setOpening(false);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#06090f] px-4 py-10 text-white md:px-8 md:py-14">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-[-120px] h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-cyan-500/12 blur-3xl" />
                <div className="absolute bottom-[-120px] right-[-80px] h-[320px] w-[360px] rounded-full bg-blue-500/12 blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-[1.12fr,1fr]">
                <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0c1421] to-[#070b14] p-6 md:p-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                        <Sparkles className="h-3.5 w-3.5" /> Nexora Checkout
                    </div>

                    <h1 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
                        Pay securely,
                        <br />
                        stay in the Nexora flow.
                    </h1>

                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300">{details.description}</p>

                    <div className="mt-8 space-y-3">
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Selected item</p>
                            <p className="mt-1 text-lg font-bold text-white">{details.name}</p>
                            {details.price ? <p className="mt-1 text-cyan-300">{details.price}</p> : null}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-300">
                            <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> PCI-compliant card processing</p>
                            <p className="mt-2 flex items-center gap-2"><Lock className="h-4 w-4 text-cyan-300" /> Secure payment hosted by Lemon Squeezy</p>
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur-xl md:p-8">
                    <h2 className="text-xl font-bold text-white">Complete payment</h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Card and billing fields open in Lemon Squeezy secure checkout to keep payments compliant and safe.
                    </p>

                    <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                        Subscription is managed in your account and can be cancelled anytime. Close this tab and return to Nexora from the previous page.
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-[#070b13] p-4">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Type</p>
                        <p className="mt-1 text-sm font-semibold text-slate-100 capitalize">{details.kind.replace(/-/g, " ")}</p>
                    </div>

                    <button
                        onClick={openSecureCheckout}
                        disabled={opening}
                        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <CreditCard className="h-4 w-4" />
                        {opening ? "Opening secure checkout..." : "Continue to secure payment"}
                        {!opening ? <ArrowRight className="h-4 w-4" /> : null}
                    </button>

                    <Link
                        href={details.returnTo}
                        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
                    >
                        Cancel and return
                    </Link>

                    <div className="mt-4 text-center text-xs text-slate-500">
                        Need to change plan? <Link href="/pricing" className="text-cyan-300 hover:text-cyan-200">Back to pricing</Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
