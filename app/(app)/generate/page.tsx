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
  landingPageCopy: { heroHeadline: string; heroSubheadline: string; primaryCta: string; featureBullets: string[]; };
  marketingMessaging: { hooks: string[]; emailSubjectLines: string[]; adAngles: string[]; };
};

const modes: { value: GenerationMode; label: string; icon: string }[] = [
  { value: "full", label: "Full", icon: "📦" },
  { value: "brand", label: "Brand", icon: "🎨" },
  { value: "positioning", label: "Position", icon: "🎯" },
  { value: "landing", label: "Landing", icon: "📄" },
  { value: "marketing", label: "Marketing", icon: "📢" },
];

export default function GeneratePage() {
  const [idea, setIdea] = useState("");
  const [mode, setMode] = useState<GenerationMode>("full");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(3);
  const [language, setLanguage] = useState("English");

  const LANGUAGES = [
    { code: "English", flag: "🇬🇧" }, { code: "Türkçe", flag: "🇹🇷" }, { code: "Español", flag: "🇪🇸" },
    { code: "Français", flag: "🇫🇷" }, { code: "Deutsch", flag: "🇩🇪" }, { code: "العربية", flag: "🇸🇦" },
    { code: "中文", flag: "🇨🇳" }, { code: "日本語", flag: "🇯🇵" }, { code: "Português", flag: "🇧🇷" },
  ];

  useEffect(() => { const s = localStorage.getItem("nexora_uses"); setRemaining(Math.max(0, 3 - (s ? parseInt(s, 10) : 0))); }, []);

  const canGenerate = useMemo(() => !loading && remaining > 0 && idea.trim().length >= 10, [loading, remaining, idea]);

  const handleGenerate = async () => {
    setErrorMsg(null); setResult(null);
    const trimmed = idea.trim();
    if (trimmed.length < 10) { setErrorMsg("Min 10 characters."); return; }
    if (remaining <= 0) { setErrorMsg("Free limit reached."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idea: trimmed, mode, language }) });
      if (!res.ok) { const err = await res.json().catch(() => null); throw new Error(err?.error || `Failed (${res.status})`); }
      setResult(await res.json() as GenerateResult);
      const used = (localStorage.getItem("nexora_uses") ? parseInt(localStorage.getItem("nexora_uses")!, 10) : 0) + 1;
      localStorage.setItem("nexora_uses", String(used));
      setRemaining(Math.max(0, 3 - used));
    } catch (e: unknown) { setErrorMsg(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="orb-bg" aria-hidden="true"><div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" /></div>
      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <div className="animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-1">Generate</h2>
          <p className="text-sm text-slate-500 mb-6">AI-powered startup package in seconds.</p>
        </div>

        <div className="animate-fade-in-up stagger-1 mb-5">
          <div className="flex flex-wrap gap-1.5">
            {modes.map(m => (
              <button key={m.value} onClick={() => setMode(m.value)} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${mode === m.value ? "border-violet-300 bg-violet-50 text-violet-700" : "border-black/[0.06] bg-white text-slate-500 hover:border-black/[0.12]"}`}>
                {m.icon} {m.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <select value={language} onChange={e => setLanguage(e.target.value)} className="form-input text-xs py-1.5 px-2 w-auto pr-7">
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.code}</option>)}
              </select>
              <div className="text-xs text-slate-400">
                Remaining: <span className={`font-bold text-sm ${remaining > 0 ? "gradient-text" : "text-red-400"}`}>{remaining}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-fade-in-up stagger-2 mb-5">
          <textarea value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Describe your startup idea..." className="form-input min-h-[120px]" rows={4} />
        </div>

        <div className="animate-fade-in-up stagger-3">
          <button onClick={handleGenerate} disabled={!canGenerate} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Generating...</span> : "Generate"}
          </button>
        </div>

        {errorMsg && <div className="mt-4 p-3 glass-card border-red-200 text-red-500 text-sm">{errorMsg}</div>}

        {result && (
          <div className="mt-8 space-y-4 animate-fade-in-up">
            <section className="glass-card p-5">
              <h3 className="font-semibold text-sm flex items-center gap-1.5 mb-3">🎨 Brand</h3>
              <div className="flex flex-wrap gap-1.5 mb-3">{result.brandNames.map((n, i) => <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-50 border border-black/[0.06] text-xs">{n}</span>)}</div>
              <p className="text-xs text-slate-500"><b>Tagline:</b> {result.tagline}</p>
              <p className="text-xs text-slate-500 mt-1">{result.description}</p>
            </section>

            <section className="glass-card p-5">
              <h3 className="font-semibold text-sm flex items-center gap-1.5 mb-3">🎯 Positioning</h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div><span className="text-slate-400">Audience:</span> {result.targetAudience}</div>
                <div><span className="text-slate-400">Position:</span> {result.positioning}</div>
                <div><span className="text-slate-400">Value:</span> {result.valueProposition}</div>
              </div>
            </section>

            <section className="glass-card p-5">
              <h3 className="font-semibold text-sm flex items-center gap-1.5 mb-3">📄 Landing Copy</h3>
              <p className="font-medium text-sm mb-1">{result.landingPageCopy.heroHeadline}</p>
              <p className="text-xs text-slate-500 mb-2">{result.landingPageCopy.heroSubheadline}</p>
              <span className="inline-flex btn-primary text-xs py-1.5 px-3 mb-3">{result.landingPageCopy.primaryCta}</span>
              <ul className="space-y-1">{result.landingPageCopy.featureBullets.map((b, i) => <li key={i} className="text-xs text-slate-500 flex items-center gap-1.5"><svg className="w-3 h-3 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{b}</li>)}</ul>
            </section>

            <section className="glass-card p-5">
              <h3 className="font-semibold text-sm flex items-center gap-1.5 mb-3">📢 Marketing</h3>
              {[{ label: "Hooks", items: result.marketingMessaging.hooks }, { label: "Email Subjects", items: result.marketingMessaging.emailSubjectLines }, { label: "Ad Angles", items: result.marketingMessaging.adAngles }].map(sec => (
                <div key={sec.label} className="mb-3 last:mb-0">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">{sec.label}</p>
                  <div className="space-y-1">{sec.items.map((item, i) => <div key={i} className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-black/[0.06] text-xs text-slate-600">{item}</div>)}</div>
                </div>
              ))}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
