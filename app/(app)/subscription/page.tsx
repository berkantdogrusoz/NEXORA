"use client";

import { useEffect, useState } from "react";
import { useCredits } from "@/app/providers/credit-provider";
import Link from "next/link";
import { createCheckoutAction } from "@/app/actions/checkout";


interface SubscriptionData {
    plan_name: string;
    status: string;
    credits: number;
    renews_at: string | null;
    ends_at: string | null;
    customer_portal_url: string | null;
    created_at: string | null;
}

export default function SubscriptionPage() {
    const { credits, maxCredits, planName, refreshCredits } = useCredits();
    const [sub, setSub] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
    const [buyingCredits, setBuyingCredits] = useState<string | null>(null);

    const CREDIT_PACKS = [
        { id: "300", name: "Starter Pack", credits: 500, price: "$15", priceNote: "one-time", variantId: process.env.NEXT_PUBLIC_LEMON_CREDIT_300 || "1364332", badge: null },
        { id: "750", name: "Mega Pack", credits: 1500, price: "$30", priceNote: "one-time", variantId: process.env.NEXT_PUBLIC_LEMON_CREDIT_750 || "1364335", badge: "Best Value" },
    ];

    useEffect(() => {
        fetch("/api/subscription")
            .then((res) => res.json())
            .then((data) => {
                if (data.error) setError(data.error);
                else setSub(data);
            })
            .catch(() => setError("Failed to load subscription"))
            .finally(() => setLoading(false));
    }, []);

    const isCancelledButValid = sub?.status === "cancelled" && sub?.ends_at && new Date(sub.ends_at) > new Date();
    const isPaid = sub && sub.plan_name !== "Free" && (sub.status === "active" || sub.status === "on_trial" || isCancelledButValid);

    return (
        <div className="p-6 md:p-10 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Subscription</h1>
            <p className="text-slate-400 mb-8">Manage your plan and billing</p>

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {sub && !loading && (
                <div className="space-y-6">
                    {/* Current Plan Card */}
                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden">
                        {isPaid && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-600/20 to-transparent rounded-bl-full" />
                        )}
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                                    Current Plan
                                </p>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    {sub.plan_name}
                                    {isPaid && sub.status === "active" && (
                                        <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-black px-2.5 py-1 rounded-full uppercase">
                                            Active
                                        </span>
                                    )}
                                    {isPaid && sub.status === "on_trial" && (
                                        <span className="text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-2.5 py-1 rounded-full uppercase">
                                            Trial
                                        </span>
                                    )}
                                    {sub.status === "cancelled" && (
                                        <span className="text-xs font-bold bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full uppercase">
                                            Cancelled
                                        </span>
                                    )}
                                </h2>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Credits</p>
                                <p className="text-2xl font-bold text-white">
                                    {credits ?? sub.credits}
                                    <span className="text-sm text-slate-500 font-normal">/{maxCredits}</span>
                                </p>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
                                <p className="text-xs text-slate-500 mb-1">Status</p>
                                <p className="text-sm font-medium text-white capitalize">{sub.status || "Free"}</p>
                            </div>
                            {sub.renews_at && (
                                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
                                    <p className="text-xs text-slate-500 mb-1">Renews On</p>
                                    <p className="text-sm font-medium text-white">
                                        {new Date(sub.renews_at).toLocaleDateString("tr-TR", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            )}
                            {sub.ends_at && (
                                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
                                    <p className="text-xs text-slate-500 mb-1">Ends On</p>
                                    <p className="text-sm font-medium text-red-400">
                                        {new Date(sub.ends_at).toLocaleDateString("tr-TR", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            )}
                            {sub.created_at && (
                                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
                                    <p className="text-xs text-slate-500 mb-1">Subscribed Since</p>
                                    <p className="text-sm font-medium text-white">
                                        {new Date(sub.created_at).toLocaleDateString("tr-TR", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {isPaid && sub.customer_portal_url && (
                            <a
                                href={sub.customer_portal_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-sm font-semibold transition-all hover:scale-[1.01] active:scale-95"
                            >
                                ⚙️ Manage Subscription
                            </a>
                        )}
                        {isPaid && (
                            <button
                                onClick={async () => {
                                    if (!confirm("Are you sure you want to cancel your subscription? You will keep access until the end of your billing period.")) return;
                                    setCancelling(true);
                                    try {
                                        const res = await fetch("/api/subscription/cancel", { method: "POST" });
                                        const data = await res.json();
                                        if (data.success) {
                                            const endDate = data.ends_at
                                                ? new Date(data.ends_at).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })
                                                : "the end of your billing period";
                                            setCancelSuccess(`Your subscription has been cancelled. You will keep access until ${endDate}.`);
                                            // Refresh data
                                            const refreshRes = await fetch("/api/subscription");
                                            if (refreshRes.ok) setSub(await refreshRes.json());
                                            refreshCredits();
                                        } else {
                                            alert(data.error || "Failed to cancel.");
                                        }
                                    } catch {
                                        alert("Something went wrong.");
                                    } finally {
                                        setCancelling(false);
                                    }
                                }}
                                disabled={cancelling}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-semibold transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                            >
                                {cancelling ? "Cancelling..." : "✕ Cancel Subscription"}
                            </button>
                        )}
                        {(!isPaid || (sub.plan_name !== "Pro" && isPaid)) && (
                            <Link
                                href="/pricing"
                                className="flex-1 flex items-center justify-center py-3 px-6 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-sm font-semibold transition-all hover:scale-[1.01] active:scale-95"
                            >
                                Upgrade Plan
                            </Link>
                        )}
                    </div>

                    {cancelSuccess && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-300 text-sm">
                            ⚠️ {cancelSuccess}
                        </div>
                    )}

                    {/* Buy Credits Section */}
                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-sm font-semibold text-white">Buy Credits</h3>
                                <p className="text-xs text-slate-500 mt-0.5">One-time purchase, credits never expire</p>
                            </div>
                            <span className="text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full font-medium">
                                ⚡ Instant Delivery
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {CREDIT_PACKS.map((pack) => (
                                <div
                                    key={pack.id}
                                    className="relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] rounded-xl p-5 hover:border-cyan-500/30 transition-all group"
                                >
                                    {pack.badge && (
                                        <span className="absolute -top-2.5 right-4 text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-black px-2.5 py-0.5 rounded-full uppercase">
                                            {pack.badge}
                                        </span>
                                    )}
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{pack.name}</p>
                                    <div className="flex items-baseline gap-2 mt-2 mb-1">
                                        <span className="text-3xl font-bold text-white">{pack.credits}</span>
                                        <span className="text-sm text-slate-400">credits</span>
                                    </div>
                                    <p className="text-lg font-semibold text-cyan-400 mb-4">{pack.price}</p>
                                    <button
                                        onClick={async () => {
                                            setBuyingCredits(pack.id);
                                            try {
                                                const result = await createCheckoutAction({
                                                    variantId: pack.variantId,
                                                    redirectPath: "/subscription",
                                                    name: `${pack.name} (${pack.credits} credits)`,
                                                    description: "Credits are delivered automatically after successful payment.",
                                                    kind: "one-time",
                                                });
                                                if (result.url) {
                                                    window.location.href = result.url;
                                                } else {
                                                    alert(result.error || "Checkout failed.");
                                                }
                                            } catch {
                                                alert("Something went wrong.");
                                            } finally {
                                                setBuyingCredits(null);
                                            }
                                        }}
                                        disabled={buyingCredits === pack.id}
                                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-semibold transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/10"
                                    >
                                        {buyingCredits === pack.id ? "Opening..." : `Buy ${pack.credits} Credits`}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Plan Features */}
                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-white mb-4">Plan Includes</h3>
                        <div className="space-y-3">
                            {sub.plan_name === "Pro" && (
                                <>
                                    <Feature text="5,000 credits per month" />
                                    <Feature text="All Pro AI models (Seedance 2.0, Sora 2, Kling 3.0)" />
                                    <Feature text="HD & 10s video generation" />
                                    <Feature text="Priority processing" />
                                    <Feature text="Commercial usage rights" />
                                </>
                            )}
                            {sub.plan_name === "Growth" && (
                                <>
                                    <Feature text="1,500 credits per month" />
                                    <Feature text="Standard AI models" />
                                    <Feature text="HD video generation" />
                                    <Feature text="Commercial usage rights" />
                                </>
                            )}
                            {sub.plan_name === "Standard" && (
                                <>
                                    <Feature text="500 credits per month" />
                                    <Feature text="Daily generation cap (6/day)" />
                                    <Feature text="Core image and video models" />
                                    <Feature text="No Pro/Director model access" />
                                </>
                            )}
                            {sub.plan_name === "Free" && (
                                <>
                                    <Feature text="100 credits (one-time)" />
                                    <Feature text="Standard AI models only" />
                                    <Feature text="Standard quality" />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Feature({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <span className="text-sm text-slate-300">{text}</span>
        </div>
    );
}
