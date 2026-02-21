"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const AI_MODELS = [
  {
    name: "GPT-4o",
    category: "Text & Chat",
    description: "Most advanced language model for marketing copy, strategy & content",
    badge: "PRO",
    icon: "🧠",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    name: "GPT-4o Mini",
    category: "Text & Chat",
    description: "Fast, capable model for everyday tasks and quick drafts",
    badge: "FREE",
    icon: "⚡",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    name: "Gemini 1.5 Pro",
    category: "Text & Chat",
    description: "Google's most capable model with 1M token context window",
    badge: "PRO",
    icon: "✨",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    name: "DALL-E 3",
    category: "Image Generation",
    description: "Best-in-class text-to-image with perfect prompt understanding",
    badge: "INCLUDED",
    icon: "🎨",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    name: "Zeroscope v2",
    category: "Video Generation",
    description: "Fast text-to-video generation for social content",
    badge: "FREE",
    icon: "🎬",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    name: "Cinematic HD",
    category: "Video Generation",
    description: "High-quality cinematic video with extended frames & HD output",
    badge: "PRO",
    icon: "🎥",
    gradient: "from-fuchsia-500 to-pink-600",
  },
];

const HERO_WORDS = ["Videos", "Images", "Content", "Brands", "Ads"];

function AnimatedWord() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % HERO_WORDS.length);
        setFade(true);
      }, 400);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-block transition-all duration-400 ${fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
    >
      {HERO_WORDS[index]}
    </span>
  );
}

function GlowOrb({ className }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-20 animate-pulse pointer-events-none ${className}`}
    />
  );
}

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-black">
      {/* Ambient Glow Effects */}
      <GlowOrb className="w-96 h-96 bg-violet-600 top-[-10%] left-[-10%]" />
      <GlowOrb className="w-80 h-80 bg-fuchsia-600 top-[20%] right-[-5%]" />
      <GlowOrb className="w-64 h-64 bg-blue-600 bottom-[10%] left-[30%]" />

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background Video */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-[0.07]"
            poster=""
          >
            {/* Using a free abstract video as BG ambiance */}
            <source
              src="https://cdn.pixabay.com/video/2020/08/09/46648-449684663_large.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-medium text-violet-300 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
            </span>
            Powered by 6 AI Models — GPT-4o · Gemini · DALL-E 3
          </div>

          {/* Animated Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[1.05]">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
              Create{" "}
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
              <AnimatedWord />
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white/90 via-white/60 to-white/20 text-4xl md:text-6xl lg:text-7xl">
              with AI — Instantly
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one AI creative studio. Generate videos, images, and
            marketing content in seconds. Schedule and auto-post to Instagram.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/studio"
              className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_60px_rgba(139,92,246,0.3)] flex items-center gap-3"
            >
              <span className="text-xl">✨</span>
              Start Creating — Free
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white font-medium hover:bg-white/[0.08] transition-all hover:border-white/20"
            >
              View Pricing
            </Link>
          </div>

          {/* Trusted by */}
          <div className="mt-14 flex items-center justify-center gap-6 text-sm text-slate-600">
            <span>Trusted by</span>
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 border-2 border-black flex items-center justify-center text-[10px] font-bold text-white"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span>2,000+ creators</span>
          </div>
        </div>
      </section>

      {/* ==================== AI MODELS SHOWCASE ==================== */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">
              AI Powerhouse
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              6 Models. One Platform.
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              From text to video to images — choose the right AI for your task
              and create at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_MODELS.map((model, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-6 hover:border-white/[0.15] transition-all duration-300 hover:bg-white/[0.02]"
              >
                {/* Glow on hover */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${model.gradient} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500`}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{model.icon}</div>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${model.badge === "PRO"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : model.badge === "FREE"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                        }`}
                    >
                      {model.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                    {model.category}
                  </p>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {model.name}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {model.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRODUCT CARDS ==================== */}
      <section className="py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-fuchsia-400 uppercase tracking-widest mb-3">
              Creative Suite
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Everything you need
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Video */}
            <Link
              href="/studio"
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0a] aspect-[4/3] flex flex-col justify-end p-6 hover:border-white/[0.12] transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-[10px] font-semibold text-violet-300 uppercase tracking-wider">
                Popular
              </div>
              <div className="relative z-10">
                <div className="text-5xl mb-4">🎬</div>
                <p className="text-xs text-slate-500 mb-1">
                  Zeroscope · Cinematic HD
                </p>
                <h3 className="text-xl font-bold text-white mb-1">
                  AI Video Studio
                </h3>
                <p className="text-sm text-slate-400">
                  Turn text prompts into stunning HD videos with AI. Choose
                  Standard or Cinematic quality.
                </p>
              </div>
            </Link>

            {/* Card 2: Image */}
            <Link
              href="/generate"
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0a] aspect-[4/3] flex flex-col justify-end p-6 hover:border-white/[0.12] transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-5xl mb-4">🖼️</div>
                <p className="text-xs text-slate-500 mb-1">
                  DALL-E 3 powered
                </p>
                <h3 className="text-xl font-bold text-white mb-1">
                  Image Generation
                </h3>
                <p className="text-sm text-slate-400">
                  Create professional photos, illustrations, and social media
                  visuals from text.
                </p>
              </div>
            </Link>

            {/* Card 3: Assistant */}
            <Link
              href="/assistant"
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0a] aspect-[4/3] flex flex-col justify-end p-6 hover:border-white/[0.12] transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-5xl mb-4">🤖</div>
                <p className="text-xs text-slate-500 mb-1">
                  GPT-4o · Gemini 1.5 Pro
                </p>
                <h3 className="text-xl font-bold text-white mb-1">
                  AI Marketing Assistant
                </h3>
                <p className="text-sm text-slate-400">
                  Chat with AI to create strategy, copy, captions & content
                  plans. Choose your model.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== STATS ==================== */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "6", label: "AI Models" },
              { value: "10K+", label: "Creations" },
              { value: "99.9%", label: "Uptime" },
              { value: "4.9★", label: "Rating" },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center"
              >
                <div className="text-3xl font-black text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-violet-600/5 to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
            Ready to create?
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto">
            Join thousands of creators using AI to build their brand. Start free
            — no credit card required.
          </p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg hover:scale-105 transition-transform shadow-2xl shadow-violet-500/25"
          >
            ✨ Open Studio — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center text-sm font-black text-white">
              N
            </div>
            <span className="font-bold text-white">Nexora</span>
            <span className="text-slate-500 text-sm">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/pricing"
              className="hover:text-white transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
