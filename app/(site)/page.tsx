"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ─── Animated Typing Words ─── */
const WORDS = ["Videos", "Images", "Content", "Brands", "Ads"];

function AnimatedWord() {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setIndex((p) => (p + 1) % WORDS.length);
        setShow(true);
      }, 350);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-block transition-all duration-300 ease-out ${show ? "opacity-100 translate-y-0 blur-0" : "opacity-0 -translate-y-3 blur-sm"}`}
      style={{ minWidth: "220px" }}
    >
      {WORDS[index]}
    </span>
  );
}

/* ─── Feature Card Component ─── */
function FeatureCard({
  gradient,
  tag,
  title,
  desc,
  href,
  models,
}: {
  gradient: string;
  tag: string;
  title: string;
  desc: string;
  href: string;
  models: string;
}) {
  return (
    <Link href={href} className="group relative block">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080808] transition-all duration-500 hover:border-white/[0.15] hover:shadow-2xl">
        {/* Visual Preview Area */}
        <div className={`relative h-52 bg-gradient-to-br ${gradient} overflow-hidden`}>
          {/* Animated grid pattern */}
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
          {/* Floating shapes */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute bottom-4 right-4 text-white/20 text-7xl font-black select-none group-hover:text-white/30 transition-colors duration-500">
            {title === "AI Video Studio" ? "▶" : title === "Image Generation" ? "◆" : "◎"}
          </div>
          {/* Tag */}
          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {tag}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-medium">
            {models}
          </p>
          <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-violet-200 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
        </div>

        {/* Bottom action bar */}
        <div className="px-5 pb-4 flex items-center justify-between">
          <span className="text-xs text-violet-400 font-medium">Try it now →</span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-slate-500">Live</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── AI Model Badge Component ─── */
function ModelBadge({
  name,
  category,
  badge,
  gradient,
}: {
  name: string;
  category: string;
  badge: string;
  gradient: string;
}) {
  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-black shadow-lg`}>
        {name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{name}</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{category}</p>
      </div>
      <span
        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${badge === "PRO"
          ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
          : badge === "FREE"
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
            : "bg-violet-500/15 text-violet-400 border border-violet-500/20"
          }`}
      >
        {badge}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */
/*                    MAIN PAGE                       */
/* ═══════════════════════════════════════════════════ */

export default function Home() {
  return (
    <div className="relative min-h-screen text-white bg-black overflow-hidden">

      {/* ── Background Grain ── */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Ambient Glows ── */}
      <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] bg-violet-700/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[400px] right-[-200px] w-[500px] h-[500px] bg-fuchsia-700/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ═══════ HERO ═══════ */}
      <section className="relative pt-36 pb-20 px-6">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs mb-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-300">6 AI Models Active</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">GPT-4o · Gemini · DALL-E 3</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-[-0.03em] leading-[1.05] mb-7">
            <span className="text-white">Create </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
              <AnimatedWord />
            </span>
            <br />
            <span className="text-white/50 text-4xl md:text-5xl lg:text-6xl font-bold">
              with AI — Instantly
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
            Generate videos, images, and marketing content in seconds.
            The all-in-one AI creative platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/studio"
              className="group px-8 py-3.5 rounded-full bg-white text-black font-bold text-sm hover:scale-[1.03] transition-all duration-200 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] flex items-center gap-2"
            >
              Start Creating
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3.5 rounded-full text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ PRODUCT CARDS (Prototipal-style) ═══════ */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard
              gradient="from-violet-900/80 via-violet-800/40 to-black"
              tag="Most Popular"
              title="AI Video Studio"
              desc="Turn text into stunning videos. Standard or Cinematic HD quality."
              href="/studio"
              models="Zeroscope · Cinematic HD"
            />
            <FeatureCard
              gradient="from-pink-900/80 via-rose-800/40 to-black"
              tag="Powered by DALL-E 3"
              title="Image Generation"
              desc="Create professional images, illustrations, and social visuals."
              href="/generate"
              models="DALL-E 3 · OpenAI"
            />
            <FeatureCard
              gradient="from-emerald-900/80 via-teal-800/40 to-black"
              tag="Multi-Model"
              title="AI Assistant"
              desc="Chat with AI for strategy, copy, and content plans."
              href="/assistant"
              models="GPT-4o · Gemini 1.5 Pro"
            />
          </div>
        </div>
      </section>

      {/* ═══════ AI MODELS SECTION ═══════ */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em] mb-3">
              AI Powerhouse
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              6 Models. One Platform.
            </h2>
            <p className="text-slate-500 text-sm max-w-md">
              Choose the right AI for your task. From text to video to images.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <ModelBadge name="GPT-4o" category="Text & Chat" badge="PRO" gradient="from-emerald-500 to-teal-600" />
            <ModelBadge name="GPT-4o Mini" category="Text & Chat" badge="FREE" gradient="from-blue-500 to-cyan-600" />
            <ModelBadge name="Gemini 1.5 Pro" category="Text & Chat" badge="PRO" gradient="from-violet-500 to-purple-600" />
            <ModelBadge name="DALL-E 3" category="Image Generation" badge="INCLUDED" gradient="from-pink-500 to-rose-600" />
            <ModelBadge name="Zeroscope v2" category="Video Generation" badge="FREE" gradient="from-amber-500 to-orange-600" />
            <ModelBadge name="Cinematic HD" category="Video Generation" badge="PRO" gradient="from-fuchsia-500 to-pink-600" />
          </div>
        </div>
      </section>

      {/* ═══════ STATS BAR ═══════ */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.06]">
            {[
              { value: "6", label: "AI Models" },
              { value: "10K+", label: "Creations" },
              { value: "99.9%", label: "Uptime" },
              { value: "4.9★", label: "Rating" },
            ].map((stat, i) => (
              <div key={i} className="bg-[#060606] p-8 text-center">
                <div className="text-2xl md:text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-5 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
            Ready to create?
          </h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Join creators worldwide. Start free — no credit card required.
          </p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold text-sm hover:scale-[1.03] transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            Open Studio — It&apos;s Free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-md flex items-center justify-center text-xs font-black text-white">
              N
            </div>
            <span className="font-bold text-sm text-white">Nexora</span>
            <span className="text-slate-600 text-xs">© 2026</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
