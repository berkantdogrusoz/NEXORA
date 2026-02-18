"use client";

import Link from "next/link";
import Navbar from "@/app/components/navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GradientButton from "@/app/components/ui/gradient-button";

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
    } catch (e) {
      console.error(e);
      alert("Something went wrong.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="relative min-h-screen text-slate-100 font-sans pb-20">
      <Navbar />

      <div className="pt-32 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-16">
          Start for free. Upgrade when you're ready to scale your Instagram empire.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter */}
          <div className="glass-card p-8 flex flex-col text-left relative overflow-hidden group">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-slate-300">Starter</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-sm text-slate-500">/mo</span>
              </div>
              <p className="text-sm text-slate-400 mt-2">Forever free</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                { text: "3 posts per week (text only)", has: true },
                { text: "10 AI assistant messages/day", has: true },
                { text: "1 brand", has: true },
                { text: "Content calendar (view only)", has: true },
                { text: "AI image generation", has: false },
                { text: "Instagram auto-post", has: false },
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  {f.has ? CHECK : CROSS}
                  <span className={!f.has ? "text-slate-500" : ""}>{f.text}</span>
                </li>
              ))}
            </ul>

            <Link href="/dashboard" className="mt-auto block w-full">
              <button className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-all">
                Get Started
              </button>
            </Link>
          </div>

          {/* Growth */}
          <div className="glass-card p-8 flex flex-col text-left relative overflow-hidden ring-1 ring-violet-500/50 shadow-2xl shadow-violet-500/10">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-blue-500" />
            <div className="absolute -top-3 right-8">
              <span className="bg-gradient-to-r from-violet-600 to-blue-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider shadow-lg">Most Popular</span>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-violet-300">Growth</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$19</span>
                <span className="text-sm text-slate-500">/mo</span>
              </div>
              <p className="text-sm text-emerald-400 mt-2">Save $48/yr with annual</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                { text: "7 posts per week + AI images", has: true },
                { text: "50 AI assistant messages/day", has: true },
                { text: "3 brands", has: true },
                { text: "Full content calendar", has: true },
                { text: "DALL-E image generation", has: true },
                { text: "Instagram auto-post", has: true },
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  {f.has ? CHECK : CROSS}
                  <span className={!f.has ? "text-slate-500" : ""}>{f.text}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout("Growth")}
              disabled={loading === "Growth"}
              className="mt-auto w-full group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
              <div className="relative w-full py-3 bg-slate-900 rounded-xl items-center justify-center flex text-white font-medium group-hover:bg-slate-800 transition">
                {loading === "Growth" ? "Processing..." : "Subscribe Now"}
              </div>
            </button>
          </div>

          {/* Pro */}
          <div className="glass-card p-8 flex flex-col text-left relative overflow-hidden">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-slate-300">Pro</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$49</span>
                <span className="text-sm text-slate-500">/mo</span>
              </div>
              <p className="text-sm text-violet-400 mt-2">Best value for agencies</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                { text: "Unlimited posts + AI images", has: true },
                { text: "Unlimited AI messages", has: true },
                { text: "10 brands", has: true },
                { text: "Full content calendar", has: true },
                { text: "Premium DALL-E images", has: true },
                { text: "Priority AI (GPT-4.1)", has: true },
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  {f.has ? CHECK : CROSS}
                  <span className={!f.has ? "text-slate-500" : ""}>{f.text}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout("Pro")}
              disabled={loading === "Pro"}
              className="mt-auto w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
            >
              {loading === "Pro" ? "Processing..." : "Subscribe Now"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
