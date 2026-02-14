import Link from "next/link";
import { AnimatedShaderBackground } from "@/components/ui/animated-shader-background";

const builderFeatures = [
  {
    title: "Prompt to Architecture",
    desc: "App architecture + page map from a single prompt",
    icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
  },
  {
    title: "Landing & Copy",
    desc: "Landing page + pricing + onboarding copy",
    icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
  },
  {
    title: "Component System",
    desc: "Starter component suggestions for Next.js",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  },
  {
    title: "Monetization Plan",
    desc: "Offer & monetization plan for fast validation",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

const monetizationGrid = [
  { title: "Offer Angles", desc: "Pricing hooks that convert" },
  { title: "Ad Creatives", desc: "Ready-to-use ad message sets" },
  { title: "Email Funnels", desc: "Subject lines + funnel intros" },
  { title: "CTA Optimization", desc: "Landing hero + CTA copy" },
];

const roadmap = [
  {
    phase: "Phase 1",
    label: "Product Studio",
    status: "Live",
    items: ["Brand + positioning", "Landing page copy", "Marketing messaging"],
  },
  {
    phase: "Phase 2",
    label: "Website Generator",
    status: "Next",
    items: [
      "Section-based page generator",
      "Editable block library",
      "One-click export",
    ],
  },
  {
    phase: "Phase 3",
    label: "App Builder",
    status: "Future",
    items: [
      "Prompt-to-app scaffolding",
      "Built-in AI coding assistant",
      "Deploy in one click",
    ],
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Shader Background */}
      <div className="fixed inset-0 z-0">
        <AnimatedShaderBackground />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Nexora AI
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/generate"
            className="px-4 py-2 rounded-lg glass text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            Studio
          </Link>
          <Link
            href="/pricing"
            className="px-4 py-2 rounded-lg shimmer-btn text-white font-medium hover:opacity-90 transition-all"
          >
            Pricing
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 text-sm rounded-full glass text-purple-300 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-glow" />
          Nexora AI &middot; Product Studio + Builder Vision
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight max-w-5xl mx-auto">
          <span className="text-white">Idea&apos;dan Gelire:</span>
          <br />
          <span className="gradient-text">
            Urunu, Siteyi ve Icerigi
          </span>
          <br />
          <span className="text-white">Tek Akista Uret.</span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
          Nexora; marka, konumlandirma, landing copy ve pazarlama mesajlarini
          uretir. Hedefimiz bunu Replit benzeri &ldquo;prompt ile web app
          olusturma&rdquo; deneyimine cevirmek.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/generate"
            className="group inline-flex items-center justify-center px-8 py-4 shimmer-btn text-white rounded-xl font-medium text-lg glow-purple hover:glow-purple-strong transition-all"
          >
            Generate Full Package
            <svg
              className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>

          <a
            href="#builder"
            className="inline-flex items-center justify-center px-8 py-4 glass text-white/90 rounded-xl hover:bg-white/10 transition-all font-medium"
          >
            Builder Vision
          </a>

          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-8 py-4 glass text-white/90 rounded-xl hover:bg-white/10 transition-all font-medium"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Builder Features */}
      <section
        id="builder"
        className="relative z-10 max-w-6xl mx-auto px-6 pb-20"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Nexora Builder{" "}
            <span className="text-purple-400">(Next Target)</span>
          </h2>
          <p className="mt-4 text-white/50 max-w-2xl mx-auto">
            Kullanicinin fikrinden sadece icerik degil, dogrudan calisir web
            uygulamasi iskeleti uretmek icin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {builderFeatures.map((feature) => (
            <div
              key={feature.title}
              className="glass-card rounded-2xl p-6 group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={feature.icon}
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-white/50">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Monetization Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="glass-strong rounded-3xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Para Kazandiran Icerik Sistemi
              </h2>
              <p className="mt-3 text-white/50">
                Her jenerasyonda conversion odakli hazir ciktilar
              </p>
            </div>
            <Link
              href="/generate"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl shimmer-btn text-white font-medium text-sm"
            >
              Try Now
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {monetizationGrid.map((item) => (
              <div
                key={item.title}
                className="glass-card rounded-xl p-5 text-center"
              >
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-white/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Roadmap
          </h2>
          <p className="mt-4 text-white/50 max-w-2xl mx-auto">
            Calisan sistemi bozmadan, adim adim Product Studio &rarr; Website
            Generator &rarr; App Builder.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roadmap.map((step, index) => (
            <div
              key={step.phase}
              className="glass-card rounded-2xl p-8 relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Status badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-5 ${
                  step.status === "Live"
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : step.status === "Next"
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    : "bg-white/5 text-white/40 border border-white/10"
                }`}
              >
                {step.status === "Live" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-glow" />
                )}
                {step.status}
              </div>

              <div className="text-xs text-white/30 uppercase tracking-widest font-medium mb-2">
                {step.phase}
              </div>
              <h3 className="text-xl font-bold text-white mb-5">
                {step.label}
              </h3>

              <ul className="space-y-3">
                {step.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-white/60"
                  >
                    <svg
                      className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-white/30 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">N</span>
            </div>
            &copy; {new Date().getFullYear()} Nexora AI
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/generate"
              className="hover:text-white/60 transition-colors"
            >
              Generate
            </Link>
            <Link
              href="/pricing"
              className="hover:text-white/60 transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
