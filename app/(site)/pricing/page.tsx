"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CHECK = (
  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CROSS = (
  <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    subtitle: "For exploring",
    highlight: false,
    badge: null,
    features: [
      { text: "50 AI credits (One-time)", has: true },
      { text: "GPT-4o Mini (Chat)", has: true },
      { text: "Wan-2.1 + Kling 3.0 (Video)", has: true },
      { text: "DALL-E 3 (Image Generation)", has: true },
      { text: "AI Assistant", has: true },
      { text: "GPT-4o / Gemini (Pro Models)", has: false },
      { text: "Cinematic HD Video", has: false },
      { text: "Priority Queue", has: false },
    ],
    cta: "Get Started Free",
    ctaStyle: "border",
    checkoutPlan: null,
    planKey: "Free",
  },
  {
    name: "Standard",
    price: "$9",
    period: "/mo",
    subtitle: "For regular creators",
    highlight: false,
    badge: null,
    features: [
      { text: "200 AI credits / month", has: true },
      { text: "Daily generation cap (6/day)", has: true },
      { text: "Kling 3.0 + Wan 2.1 (Video)", has: true },
      { text: "FLUX 2 Dev + Nano Banana 2 (Image)", has: true },
      { text: "AI Assistant (GPT-4o Mini)", has: true },
      { text: "Pro Video Models (Runway, Seedance, Sora)", has: false },
      { text: "Director Studio (Higgsfield)", has: false },
      { text: "Priority Queue", has: false },
    ],
    cta: "Start Standard",
    ctaStyle: "border",
    checkoutPlan: "Standard" as const,
    planKey: "Standard",
  },
  {
    name: "Nexora",
    price: "$29",
    period: "/mo",
    subtitle: "For content creators",
    highlight: true,
    badge: "Most Popular",
    features: [
      { text: "500 AI credits / month", has: true },
      { text: "GPT-4o + Gemini 1.5 Pro", has: true },
      { text: "All Standard + Pro Video Models", has: true },
      { text: "DALL-E 3 + FLUX 2 (Images)", has: true },
      { text: "Image-to-Video Generation", has: true },
      { text: "All Aspect Ratios & Durations", has: true },
      { text: "Priority AI Queue", has: true },
      { text: "Email Support", has: true },
    ],
    cta: "Subscribe to Nexora",
    ctaStyle: "gradient",
    checkoutPlan: "Growth" as const,
    planKey: "Growth",
  },
  {
    name: "Pro",
    price: "$59",
    period: "/mo",
    subtitle: "For agencies & brands",
    highlight: false,
    badge: null,
    features: [
      { text: "1,000 AI credits / month", has: true },
      { text: "All AI Models (Runway Gen-4.5, Seedance, Kling 3.0, Higgsfield Director)", has: true },
      { text: "Cinematic Video (Highest quality)", has: true },
      { text: "Premium Image Generation (DALL-E 3, FLUX 2, Recraft)", has: true },
      { text: "Image-to-Video + All Pro Features", has: true },
      { text: "Multi-Brand Management", has: true },
      { text: "API Access", has: true },
      { text: "Priority Support (24/7)", has: true },
    ],
    cta: "Upgrade to Pro",
    ctaStyle: "border",
    checkoutPlan: "Pro" as const,
    planKey: "Pro",
  },
];

// Plan hierarchy for comparison
const PLAN_RANK: Record<string, number> = { Free: 0, Standard: 1, Growth: 2, Pro: 3 };

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [buyingCredits, setBuyingCredits] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>("Free");
  const router = useRouter();

  const CREDIT_PACKS = [
    { id: "300", name: "Starter Pack", credits: 300, price: "$10", priceNote: "one-time", variantId: process.env.NEXT_PUBLIC_LEMON_CREDIT_300 || "1364332", badge: null },
    { id: "750", name: "Mega Pack", credits: 750, price: "$20", priceNote: "one-time", variantId: process.env.NEXT_PUBLIC_LEMON_CREDIT_750 || "1364335", badge: "25% Bonus" },
  ];

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.json())
      .then((d) => { if (d.planName) setUserPlan(d.planName); })
      .catch(() => { });
  }, []);

  const handleCheckout = async (plan: "Standard" | "Growth" | "Pro") => {
    setLoading(plan);
    try {
      const variantId = plan === "Standard"
        ? process.env.NEXT_PUBLIC_LEMON_VARIANT_STANDARD
        : plan === "Growth"
          ? process.env.NEXT_PUBLIC_LEMON_VARIANT_GROWTH
          : process.env.NEXT_PUBLIC_LEMON_VARIANT_PRO;

      if (!variantId) {
        alert("Pricing configuration missing. Please contact support.");
        setLoading(null);
        return;
      }

      const res = await fetch("/api/lemon/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        if (res.status === 401) {
          router.push("/sign-up");
        } else {
          alert("Checkout failed: " + (data.error || "Unknown error"));
        }
      }
    } catch {
      alert("Something went wrong.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="relative min-h-screen text-slate-100 bg-black pb-20">

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative pt-36 px-6 max-w-7xl mx-auto text-center">
        <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-4">
          Pricing
        </p>
        <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 mb-5">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
          Start for free. Upgrade when you&apos;re ready to scale. No hidden fees.
        </p>

        {/* Promo Banner */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <span className="text-sm text-cyan-300">Use code <span className="font-bold text-white bg-cyan-500/20 px-2 py-0.5 rounded ml-1">NEXORA20</span> for 20% off</span>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 flex flex-col text-left transition-all duration-300 ${plan.highlight
                ? "bg-white/[0.04] border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/10 scale-[1.02]"
                : "bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15]"
                }`}
            >
              {/* Most Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[11px] uppercase font-bold px-4 py-1.5 rounded-full tracking-wider shadow-lg shadow-cyan-500/30 whitespace-nowrap">
                    ⭐ {plan.badge}
                  </span>
                </div>
              )}

              {plan.highlight && (
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 rounded-t-2xl" />
              )}

              {/* Plan header */}
              <div className="mb-6 pt-2">
                <h3 className={`text-lg font-semibold ${plan.highlight ? "text-cyan-300" : "text-slate-300"}`}>
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">{plan.subtitle}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3.5 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    {f.has ? CHECK : CROSS}
                    <span className={f.has ? "text-slate-300" : "text-slate-600 line-through"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {(() => {
                const isCurrentPlan = userPlan === plan.planKey || (userPlan === "Growth" && plan.planKey === "Growth") || (userPlan === "Pro" && plan.planKey === "Pro");
                const userRank = PLAN_RANK[userPlan] ?? 0;
                const planRank = PLAN_RANK[plan.planKey] ?? 0;
                const isLowerPlan = planRank < userRank;

                if (isCurrentPlan) {
                  return (
                    <div className="mt-auto w-full py-3.5 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold text-sm text-center">
                      ✓ Current Plan
                    </div>
                  );
                }

                if (isLowerPlan) {
                  return (
                    <div className="mt-auto w-full py-3.5 rounded-xl border border-white/5 bg-white/[0.02] text-slate-600 font-semibold text-sm text-center cursor-not-allowed">
                      Included in your plan
                    </div>
                  );
                }

                if (plan.checkoutPlan) {
                  return (
                    <button
                      onClick={() => handleCheckout(plan.checkoutPlan!)}
                      disabled={loading === plan.checkoutPlan}
                      className={`mt-auto w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${plan.ctaStyle === "gradient"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:opacity-90 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02]"
                        : "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-white/20"
                        }`}
                    >
                      {loading === plan.checkoutPlan ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </span>
                      ) : plan.cta}
                    </button>
                  );
                }

                return (
                  <Link href="/dashboard" className="mt-auto block w-full">
                    <button className="w-full py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white font-semibold text-sm hover:bg-white/[0.08] hover:border-white/20 transition-all">
                      {plan.cta}
                    </button>
                  </Link>
                );
              })()}
            </div>
          ))}
        </div>

        {/* Credit Packs Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">Need More Credits?</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Buy Credit Packs</h2>
            <p className="text-sm text-slate-400">One-time purchase. Credits never expire. Works with any plan.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.id}
                className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-left hover:border-amber-500/30 transition-all group"
              >
                {pack.badge && (
                  <span className="absolute -top-3 right-6 text-[11px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-black px-3 py-1 rounded-full uppercase shadow-lg shadow-amber-500/20">
                    {pack.badge}
                  </span>
                )}
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-3">{pack.name}</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-black text-white">{pack.credits}</span>
                  <span className="text-sm text-slate-400">credits</span>
                </div>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-2xl font-bold text-amber-400">{pack.price}</span>
                  <span className="text-xs text-slate-500">{pack.priceNote}</span>
                </div>
                <button
                  onClick={async () => {
                    setBuyingCredits(pack.id);
                    try {
                      const res = await fetch("/api/lemon/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ variantId: pack.variantId }),
                      });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                      else if (res.status === 401) router.push("/sign-up");
                      else alert(data.error || "Failed to start checkout.");
                    } catch {
                      alert("Something went wrong.");
                    } finally {
                      setBuyingCredits(null);
                    }
                  }}
                  disabled={buyingCredits === pack.id}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-sm transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-500/20"
                >
                  {buyingCredits === pack.id ? "Opening Checkout..." : `Buy ${pack.credits} Credits`}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4 text-left">
            {[
              {
                q: "What are credits?",
                a: "Each AI generation uses credits. For example: 1 image costs 15-45 credits depending on model, 1 video costs 50-150 credits, 1 chat message costs 2-5 credits."
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel your subscription at any time. Your access continues until the end of the billing period."
              },
              {
                q: "Which AI models are used?",
                a: "GPT-4o, GPT-4o Mini, Gemini 1.5 Pro (chat), DALL-E 3, FLUX 2, Recraft V3 (images), Wan-2.1, Kling 3.0, Luma Ray 2, Seedance 2.0, Runway Gen-4.5, Higgsfield Director Studio (video)."
              },
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="font-semibold text-white text-sm mb-2">{faq.q}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
