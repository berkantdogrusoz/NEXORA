"use client";

import Link from "next/link";
import { useState } from "react";
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
      { text: "15 AI credits / month", has: true },
      { text: "GPT-4o Mini (Chat)", has: true },
      { text: "Zeroscope (Standard Video)", has: true },
      { text: "DALL-E 3 (Image Generation)", has: true },
      { text: "Basic Content Calendar", has: true },
      { text: "GPT-4o / Gemini (Pro Models)", has: false },
      { text: "Cinematic HD Video", has: false },
      { text: "Priority Queue", has: false },
    ],
    cta: "Get Started Free",
    ctaStyle: "border",
    checkoutPlan: null,
  },
  {
    name: "Nexora",
    price: "$29",
    period: "/mo",
    subtitle: "For content creators",
    highlight: true,
    badge: "Most Popular",
    features: [
      { text: "200 AI credits / month", has: true },
      { text: "GPT-4o + Gemini 1.5 Pro", has: true },
      { text: "All Video Models (HD included)", has: true },
      { text: "DALL-E 3 (Unlimited styles)", has: true },
      { text: "Full Content Calendar", has: true },
      { text: "Instagram Auto-Post", has: true },
      { text: "Priority AI Queue", has: true },
      { text: "Email Support", has: true },
    ],
    cta: "Subscribe to Nexora",
    ctaStyle: "gradient",
    checkoutPlan: "Growth" as const,
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
      { text: "All AI Models (Unlimited)", has: true },
      { text: "Cinematic Video (Highest quality)", has: true },
      { text: "Premium DALL-E generations", has: true },
      { text: "Advanced Analytics", has: true },
      { text: "Multi-Brand Management", has: true },
      { text: "API Access", has: true },
      { text: "Priority Support (24/7)", has: true },
    ],
    cta: "Upgrade to Pro",
    ctaStyle: "border",
    checkoutPlan: "Pro" as const,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (plan: "Growth" | "Pro") => {
    setLoading(plan);
    try {
      const variantId = plan === "Growth"
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative pt-36 px-6 max-w-7xl mx-auto text-center">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4">
          Pricing
        </p>
        <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 mb-5">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-16">
          Start for free. Upgrade when you&apos;re ready to scale. No hidden fees.
        </p>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 flex flex-col text-left transition-all duration-300 ${plan.highlight
                ? "bg-white/[0.04] border-2 border-violet-500/50 shadow-2xl shadow-violet-500/10 scale-[1.02]"
                : "bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15]"
                }`}
            >
              {/* Most Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[11px] uppercase font-bold px-4 py-1.5 rounded-full tracking-wider shadow-lg shadow-violet-500/30 whitespace-nowrap">
                    ⭐ {plan.badge}
                  </span>
                </div>
              )}

              {plan.highlight && (
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-t-2xl" />
              )}

              {/* Plan header */}
              <div className="mb-6 pt-2">
                <h3 className={`text-lg font-semibold ${plan.highlight ? "text-violet-300" : "text-slate-300"}`}>
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
              {plan.checkoutPlan ? (
                <button
                  onClick={() => handleCheckout(plan.checkoutPlan!)}
                  disabled={loading === plan.checkoutPlan}
                  className={`mt-auto w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${plan.ctaStyle === "gradient"
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02]"
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
              ) : (
                <Link href="/dashboard" className="mt-auto block w-full">
                  <button className="w-full py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white font-semibold text-sm hover:bg-white/[0.08] hover:border-white/20 transition-all">
                    {plan.cta}
                  </button>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4 text-left">
            {[
              {
                q: "What are credits?",
                a: "Each AI generation uses credits. For example: 1 image = 5 credits, 1 video = 12.5 credits, 1 chat message = 0.5 credits."
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel your subscription at any time. Your access continues until the end of the billing period."
              },
              {
                q: "Which AI models are used?",
                a: "GPT-4o, GPT-4o Mini, Gemini 1.5 Pro (chat), DALL-E 3 (images), Zeroscope & Cinematic HD (video)."
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
