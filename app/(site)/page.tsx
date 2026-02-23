"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";



/* ─── Showcase Images (Unsplash) ─── */
const SHOWCASE = [
  {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
    alt: "AI Generated Cyberpunk Portrait",
    tag: "Video",
  },
  {
    src: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=600&q=80",
    alt: "AI Art Abstract",
    tag: "Image",
  },
  {
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
    alt: "Digital Art Gradient",
    tag: "Design",
  },
  {
    src: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80",
    alt: "AI Robot Face",
    tag: "AI Art",
  },
  {
    src: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80",
    alt: "Neon City Night",
    tag: "Video",
  },
  {
    src: "https://images.unsplash.com/photo-1614729939124-032d1e6c9945?w=600&q=80",
    alt: "Fashion Editorial",
    tag: "Image",
  },
];

/* ─── Category Tags ─── */
const CATEGORIES = [
  "CINEMATIC", "PORTRAIT", "ABSTRACT", "NEON", "SURREAL", "MINIMAL",
  "CYBERPUNK", "FASHION", "PRODUCT", "LANDSCAPE", "MACRO", "EDITORIAL",
  "DOUBLE EXPOSURE", "GLITCH", "VINTAGE", "ANIME", "3D RENDER", "WATERCOLOR",
];

/* ─── Feature Cards ─── */
const FEATURES = [
  {
    title: "AI Video Studio",
    subtitle: "Zeroscope · Cinematic HD",
    desc: "Transform text into stunning HD videos. Choose Standard for speed or Cinematic for quality.",
    img: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=700&q=80",
    badge: "Popular",
    href: "/studio",
  },
  {
    title: "Image Generation",
    subtitle: "DALL-E 3 · OpenAI",
    desc: "Create professional photos, illustrations, and social media visuals from text prompts.",
    img: "https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?w=700&q=80",
    badge: "DALL-E 3",
    href: "/generate",
  },
  {
    title: "AI Assistant",
    subtitle: "GPT-4o · Gemini 1.5 Pro",
    desc: "Chat with the most advanced AI models. Strategy, copy, captions — all in one place.",
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=700&q=80",
    badge: "Multi-Model",
    href: "/assistant",
  },
];

/* ═══════════════════════════════════════════ */
/*                 MAIN PAGE                  */
/* ═══════════════════════════════════════════ */

export default function Home() {
  return (
    <div className="relative min-h-screen text-white bg-black overflow-hidden">

      {/* ── Background Grain Texture ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Ambient Glows ── */}
      <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] bg-violet-700/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[600px] right-[-200px] w-[500px] h-[500px] bg-fuchsia-700/8 rounded-full blur-[120px] pointer-events-none" />

      {/* ═══════ HERO ═══════ */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden min-h-[85vh] flex flex-col items-center justify-center">
        {/* Background Video Banner */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30 mix-blend-screen"
          >
            {/* High quality cyberpunk/neon aesthetic video from a royalty free source as placeholder to represent Seedance capabilities */}
            <source src="https://videos.pexels.com/video-files/3129595/3129595-uhd_3840_2160_30fps.mp4" type="video/mp4" />
          </video>
          {/* Gradients to fade video out into the dark theme smoothly */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center mt-[-50px]">
          {/* Status */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs mb-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-300">6 AI Models Active</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">GPT-4o · Gemini · DALL-E 3</span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tighter leading-none mb-7">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              Nexora
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
            The all-in-one AI creative platform. Generate stunning videos,
            images, and content in seconds.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link
              href="/studio"
              className="group px-8 py-3.5 rounded-full bg-white text-black font-bold text-sm hover:scale-[1.03] transition-all duration-200 shadow-[0_0_40px_rgba(255,255,255,0.12)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] flex items-center gap-2"
            >
              Start Creating — Free
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

      {/* ═══════ IMAGE SHOWCASE GRID (Prototipal-style) ═══════ */}
      <section className="px-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {SHOWCASE.map((img, i) => (
              <div
                key={i}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 16vw"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Tag */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-black/50 backdrop-blur px-2 py-1 rounded-full">
                    {img.tag}
                  </span>
                </div>
                {/* Play indicator for video tags */}
                {img.tag === "Video" && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CATEGORY TAGS (Prototipal-style) ═══════ */}
      <section className="px-6 pb-16 pt-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            AI EFFECTS
          </h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-md text-[11px] font-medium text-slate-400 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white cursor-pointer transition-all"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURE CARDS WITH IMAGES ═══════ */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em] mb-3">
              Creative Suite
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-white">
              Everything you need
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {FEATURES.map((f, i) => (
              <Link key={i} href={f.href} className="group block">
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080808] hover:border-white/[0.15] transition-all duration-500">
                  {/* Image Preview */}
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={f.img}
                      alt={f.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        {f.badge}
                      </span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-5 -mt-4 relative z-10">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-medium">
                      {f.subtitle}
                    </p>
                    <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-violet-200 transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                  {/* Action */}
                  <div className="px-5 pb-4 flex items-center justify-between">
                    <span className="text-xs text-violet-400 font-medium group-hover:text-violet-300 transition-colors">
                      Try it now →
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-slate-600">Live</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ AI MODELS ═══════ */}
      <section className="px-6 py-20 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
            <div>
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em] mb-3">
                AI Powerhouse
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-white">
                6 Models. One Platform.
              </h2>
            </div>
            <p className="text-sm text-slate-500 max-w-sm">
              From text to video to images — the right AI for every creative task.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: "GPT-4o", cat: "Text & Chat", badge: "PRO", grad: "from-emerald-500 to-teal-600", desc: "Most advanced language model" },
              { name: "GPT-4o Mini", cat: "Text & Chat", badge: "FREE", grad: "from-blue-500 to-cyan-600", desc: "Fast, everyday tasks" },
              { name: "Gemini 1.5 Pro", cat: "Text & Chat", badge: "PRO", grad: "from-violet-500 to-purple-600", desc: "1M token context" },
              { name: "DALL-E 3", cat: "Image", badge: "INCLUDED", grad: "from-pink-500 to-rose-600", desc: "Best text-to-image" },
              { name: "Zeroscope v2", cat: "Video", badge: "FREE", grad: "from-amber-500 to-orange-600", desc: "Fast video generation" },
              { name: "Cinematic HD", cat: "Video", badge: "PRO", grad: "from-fuchsia-500 to-pink-600", desc: "HD cinematic quality" },
            ].map((m, i) => (
              <div key={i} className="group flex items-center gap-3.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.grad} flex items-center justify-center text-white text-sm font-black shadow-lg shrink-0`}>
                  {m.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-white truncate">{m.name}</p>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${m.badge === "PRO" ? "bg-amber-500/15 text-amber-400" : m.badge === "FREE" ? "bg-emerald-500/15 text-emerald-400" : "bg-violet-500/15 text-violet-400"}`}>
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.06]">
            {[
              { value: "6", label: "AI Models" },
              { value: "10K+", label: "Creations" },
              { value: "99.9%", label: "Uptime" },
              { value: "4.9★", label: "Rating" },
            ].map((s, i) => (
              <div key={i} className="bg-[#060606] p-8 text-center">
                <div className="text-2xl md:text-3xl font-black text-white mb-1">{s.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</div>
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
