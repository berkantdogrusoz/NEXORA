"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatedShaderBackground } from "@/components/ui/animated-shader-background";

type GenerationMode = "full" | "brand" | "positioning" | "landing" | "marketing";

type GenerateResult = {
  brandNames: string[];
  tagline: string;
  description: string;
  targetAudience: string;
  positioning: string;
  valueProposition: string;
  landingPageCopy: {
    heroHeadline: string;
    heroSubheadline: string;
    primaryCta: string;
    featureBullets: string[];
  };
  marketingMessaging: {
    hooks: string[];
    emailSubjectLines: string[];
    adAngles: string[];
  };
};

const modeOptions: { value: GenerationMode; label: string; icon: string }[] = [
  {
    value: "full",
    label: "Full Product Package",
    icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  },
  {
    value: "brand",
    label: "Brand Focus",
    icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z",
  },
  {
    value: "positioning",
    label: "Positioning Focus",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    value: "landing",
    label: "Landing Copy Focus",
    icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
  },
  {
    value: "marketing",
    label: "Marketing Messaging",
    icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
  },
];

export default function GeneratePage() {
  const [idea, setIdea] = useState("");
  const [mode, setMode] = useState<GenerationMode>("full");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [remaining, setRemaining] = useState(3);

  useEffect(() => {
    const stored = localStorage.getItem("nexora_uses");
    const used = stored ? parseInt(stored, 10) : 0;
    setRemaining(Math.max(0, 3 - used));
  }, []);

  const canGenerate = useMemo(() => {
    return !loading && remaining > 0 && idea.trim().length >= 10;
  }, [loading, remaining, idea]);

  const handleGenerate = async () => {
    setErrorMsg(null);
    setResult(null);

    const trimmed = idea.trim();
    if (trimmed.length < 10) {
      setErrorMsg("Please describe your idea with at least 10 characters.");
      return;
    }

    if (remaining <= 0) {
      setErrorMsg("You have reached your free generation limit.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: trimmed, mode }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || `Request failed (${res.status})`);
      }

      const data = (await res.json()) as GenerateResult;
      setResult(data);

      const stored = localStorage.getItem("nexora_uses");
      const used = stored ? parseInt(stored, 10) : 0;
      const newUsed = used + 1;

      localStorage.setItem("nexora_uses", String(newUsed));
      setRemaining(Math.max(0, 3 - newUsed));
    } catch (e: any) {
      setErrorMsg(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Shader Background */}
      <div className="fixed inset-0 z-0">
        <AnimatedShaderBackground />
        <div className="absolute inset-0 bg-black/50" />
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
            href="/"
            className="text-white/60 hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/pricing"
            className="text-white/60 hover:text-white transition-colors"
          >
            Pricing
          </Link>
        </nav>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Create with <span className="gradient-text">Nexora AI</span>
          </h2>
          <p className="mt-3 text-white/50">
            Generate a full startup-ready package: brand, positioning, landing
            page copy, and marketing messaging.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/60 mb-3">
            Generation Mode
          </label>
          <div className="flex flex-wrap gap-2">
            {modeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setMode(option.value)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  mode === option.value
                    ? "shimmer-btn text-white glow-purple"
                    : "glass text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={option.icon}
                  />
                </svg>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Remaining counter */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-3 glass rounded-xl px-5 py-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i < remaining
                      ? "bg-purple-400 animate-glow"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-white/50">
              <span className="font-semibold text-white">{remaining}</span> free
              generations remaining
            </span>
          </div>
        </div>

        {/* Textarea */}
        <div className="glass-strong rounded-2xl p-1 mb-6">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Example: Build an AI tool that helps solo founders create landing pages, offers, and ad copy in one workflow."
            className="w-full p-5 bg-transparent text-white placeholder-white/30 rounded-xl outline-none resize-none"
            rows={6}
          />
        </div>

        {/* Generate Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="group inline-flex items-center gap-2 px-8 py-4 shimmer-btn text-white rounded-xl font-medium text-lg disabled:opacity-30 disabled:cursor-not-allowed glow-purple hover:glow-purple-strong transition-all"
          >
            {loading ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              <>
                Generate Package
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mt-6 p-4 glass rounded-xl border border-red-500/20 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-12 space-y-6">
            {/* Brand Kit */}
            <section className="glass-strong rounded-2xl p-8 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Brand Kit</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-purple-400 font-medium mb-2">
                    Brand Names
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.brandNames.map((name, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 glass rounded-lg text-sm text-white/80"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-purple-400 font-medium mb-1">
                    Tagline
                  </p>
                  <p className="text-white/80 text-lg font-medium">
                    {result.tagline}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-purple-400 font-medium mb-1">
                    Product Description
                  </p>
                  <p className="text-white/60 leading-relaxed">
                    {result.description}
                  </p>
                </div>
              </div>
            </section>

            {/* Positioning */}
            <section className="glass-strong rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Positioning</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass rounded-xl p-4">
                  <p className="text-xs uppercase tracking-widest text-indigo-400 font-medium mb-2">
                    Target Audience
                  </p>
                  <p className="text-white/70 text-sm">
                    {result.targetAudience}
                  </p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs uppercase tracking-widest text-indigo-400 font-medium mb-2">
                    Positioning Statement
                  </p>
                  <p className="text-white/70 text-sm">{result.positioning}</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs uppercase tracking-widest text-indigo-400 font-medium mb-2">
                    Value Proposition
                  </p>
                  <p className="text-white/70 text-sm">
                    {result.valueProposition}
                  </p>
                </div>
              </div>
            </section>

            {/* Landing Page Copy */}
            <section className="glass-strong rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Landing Page Copy
                </h3>
              </div>

              <div className="space-y-5">
                <div className="glass rounded-xl p-5">
                  <p className="text-xs uppercase tracking-widest text-cyan-400 font-medium mb-2">
                    Hero Headline
                  </p>
                  <p className="text-white text-xl font-bold">
                    {result.landingPageCopy.heroHeadline}
                  </p>
                </div>

                <div className="glass rounded-xl p-5">
                  <p className="text-xs uppercase tracking-widest text-cyan-400 font-medium mb-2">
                    Hero Subheadline
                  </p>
                  <p className="text-white/70">
                    {result.landingPageCopy.heroSubheadline}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs uppercase tracking-widest text-cyan-400 font-medium mb-2">
                      Primary CTA
                    </p>
                    <span className="inline-flex px-4 py-2 shimmer-btn rounded-lg text-white text-sm font-medium">
                      {result.landingPageCopy.primaryCta}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-cyan-400 font-medium mb-3">
                    Feature Bullets
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {result.landingPageCopy.featureBullets.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 glass rounded-lg p-3 text-sm text-white/70"
                      >
                        <svg
                          className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Marketing Messaging */}
            <section className="glass-strong rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-pink-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Marketing Messaging
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-pink-400 font-medium mb-3">
                    Hooks
                  </p>
                  <div className="space-y-2">
                    {result.marketingMessaging.hooks.map((item, i) => (
                      <div
                        key={i}
                        className="glass rounded-lg p-3 text-sm text-white/70"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-pink-400 font-medium mb-3">
                    Email Subject Lines
                  </p>
                  <div className="space-y-2">
                    {result.marketingMessaging.emailSubjectLines.map(
                      (item, i) => (
                        <div
                          key={i}
                          className="glass rounded-lg p-3 text-sm text-white/70"
                        >
                          {item}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-pink-400 font-medium mb-3">
                    Ad Angles
                  </p>
                  <div className="space-y-2">
                    {result.marketingMessaging.adAngles.map((item, i) => (
                      <div
                        key={i}
                        className="glass rounded-lg p-3 text-sm text-white/70"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
