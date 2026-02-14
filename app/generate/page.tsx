"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/app/components/navbar";

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

const modeOptions: { value: GenerationMode; label: string }[] = [
  { value: "full", label: "Full Product Package" },
  { value: "brand", label: "Brand Focus" },
  { value: "positioning", label: "Positioning Focus" },
  { value: "landing", label: "Landing Copy Focus" },
  { value: "marketing", label: "Marketing Messaging Focus" },
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
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-semibold mb-2">Create with Nexora AI</h2>
        <p className="text-gray-600 mb-6">
          Generate a full startup-ready package: brand, positioning, landing page copy, and marketing messaging.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Generation Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as GenerationMode)}
              className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              {modeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
              Free generations remaining: <span className="font-semibold text-gray-900">{remaining}</span>
            </div>
          </div>
        </div>

        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Example: Build an AI tool that helps solo founders create landing pages, offers, and ad copy in one workflow."
          className="w-full p-4 border rounded-xl mb-4 outline-none focus:ring-2 focus:ring-gray-900/10"
          rows={6}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="px-6 py-3 bg-black text-white rounded-xl disabled:opacity-40"
          >
            {loading ? "Generating..." : "Generate Package"}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-4 bg-white border border-red-200 rounded-xl text-red-600">
            {errorMsg}
          </div>
        )}

        {result && (
          <div className="mt-10 space-y-6">
            <section className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Brand Kit</h3>
              <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">Brand Names</p>
              <ul className="list-disc pl-5">
                {result.brandNames.map((name, i) => (
                  <li key={i}>{name}</li>
                ))}
              </ul>

              <p className="text-sm uppercase tracking-wide text-gray-500 mt-5 mb-1">Tagline</p>
              <p className="text-gray-800">{result.tagline}</p>

              <p className="text-sm uppercase tracking-wide text-gray-500 mt-5 mb-1">Product Description</p>
              <p className="text-gray-800 leading-relaxed">{result.description}</p>
            </section>

            <section className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Positioning</h3>
              <p className="text-sm uppercase tracking-wide text-gray-500 mb-1">Target Audience</p>
              <p className="text-gray-800">{result.targetAudience}</p>

              <p className="text-sm uppercase tracking-wide text-gray-500 mt-5 mb-1">Positioning Statement</p>
              <p className="text-gray-800">{result.positioning}</p>

              <p className="text-sm uppercase tracking-wide text-gray-500 mt-5 mb-1">Value Proposition</p>
              <p className="text-gray-800">{result.valueProposition}</p>
            </section>

            <section className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Landing Page Copy</h3>
              <p className="text-sm uppercase tracking-wide text-gray-500 mb-1">Hero Headline</p>
              <p className="text-gray-800 font-medium">{result.landingPageCopy.heroHeadline}</p>

              <p className="text-sm uppercase tracking-wide text-gray-500 mt-5 mb-1">Hero Subheadline</p>
              <p className="text-gray-800">{result.landingPageCopy.heroSubheadline}</p>

              <p className="text-sm uppercase tracking-wide text-gray-500 mt-5 mb-1">Primary CTA</p>
              <p className="inline-flex mt-1 rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium">
                {result.landingPageCopy.primaryCta}
              </p>

              <p className="text-sm uppercase tracking-wide text-gray-500 mt-5 mb-2">Feature Bullets</p>
              <ul className="list-disc pl-5">
                {result.landingPageCopy.featureBullets.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Marketing Messaging</h3>

              <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">Hooks</p>
              <ul className="list-disc pl-5">
                {result.marketingMessaging.hooks.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <p className="text-sm uppercase tracking-wide text-gray-500 mt-5 mb-2">Email Subject Lines</p>
              <ul className="list-disc pl-5">
                {result.marketingMessaging.emailSubjectLines.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <p className="text-sm uppercase tracking-wide text-gray-500 mt-5 mb-2">Ad Angles</p>
              <ul className="list-disc pl-5">
                {result.marketingMessaging.adAngles.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
