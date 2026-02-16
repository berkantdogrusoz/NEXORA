"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/app/components/navbar";

type Brand = {
    id: string;
    name: string;
    niche: string;
    audience: string;
    tone: string;
    platforms: string[];
    schedule: { postsPerWeek: number; preferredTimes: string[] };
    status: "active" | "paused" | "setup";
    createdAt: number;
};

type AutopilotLog = {
    id: string;
    brandId: string;
    type: "post" | "image" | "story" | "ad";
    platform: string;
    content: string;
    status: "generated" | "posted" | "scheduled" | "failed";
    createdAt: number;
};

const PLATFORMS = [
    { id: "instagram", label: "📸 Instagram", color: "pink" },
    { id: "tiktok", label: "🎵 TikTok", color: "slate" },
    { id: "twitter", label: "𝕏 Twitter/X", color: "blue" },
    { id: "linkedin", label: "💼 LinkedIn", color: "sky" },
];

const TONES = ["professional", "casual", "bold", "friendly", "luxury", "humorous"];
const NICHES = [
    "E-Commerce", "SaaS", "Restaurant", "Fitness", "Education", "Real Estate",
    "Fashion", "Tech", "Healthcare", "Finance", "Travel", "Entertainment",
];

export default function AutopilotPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [logs, setLogs] = useState<AutopilotLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSetup, setShowSetup] = useState(false);
    const [tab, setTab] = useState<"dashboard" | "activity" | "settings">("dashboard");

    // Setup form
    const [setupStep, setSetupStep] = useState(1);
    const [brandName, setBrandName] = useState("");
    const [brandNiche, setBrandNiche] = useState("");
    const [brandAudience, setBrandAudience] = useState("");
    const [brandTone, setBrandTone] = useState("professional");
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"]);
    const [postsPerWeek, setPostsPerWeek] = useState(5);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/autopilot");
            if (res.ok) {
                const data = await res.json();
                setBrands(data.brands || []);
                setLogs(data.logs || []);
            }
        } catch { /* empty */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const togglePlatform = (id: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSaveBrand = async () => {
        if (!brandName.trim() || !brandNiche || !brandAudience.trim()) {
            setError("Please fill all fields."); return;
        }
        setSaving(true); setError(null);
        try {
            const res = await fetch("/api/autopilot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: brandName.trim(),
                    niche: brandNiche,
                    audience: brandAudience.trim(),
                    tone: brandTone,
                    platforms: selectedPlatforms,
                    schedule: { postsPerWeek, preferredTimes: ["09:00", "12:00", "18:00"] },
                }),
            });
            if (!res.ok) throw new Error("Failed to create brand.");
            setShowSetup(false);
            setSetupStep(1);
            setBrandName(""); setBrandNiche(""); setBrandAudience(""); setBrandTone("professional");
            setSelectedPlatforms(["instagram"]); setPostsPerWeek(5);
            await fetchData();
        } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setSaving(false); }
    };

    const toggleBrandStatus = async (brandId: string, newStatus: "active" | "paused") => {
        try {
            await fetch("/api/autopilot", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brandId, status: newStatus }),
            });
            await fetchData();
        } catch { /* empty */ }
    };

    const runNow = async (brandId: string) => {
        setError(null);
        try {
            const res = await fetch("/api/autopilot/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brandId }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.error || "Execution failed.");
            }
            await fetchData();
        } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed."); }
    };

    return (
        <main className="relative min-h-screen overflow-hidden">
            <div className="orb-bg" aria-hidden="true"><div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" /></div>
            <Navbar />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 animate-fade-in-up">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            🚀 Autopilot
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-medium">
                                {brands.filter(b => b.status === "active").length} active
                            </span>
                        </h1>
                        <p className="text-sm text-slate-500">Your autonomous marketing engine. Set up once, run forever.</p>
                    </div>
                    <button onClick={() => { setShowSetup(true); setSetupStep(1); setError(null); }} className="btn-primary text-sm py-2 px-4">
                        + New Brand
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-slate-100 w-fit mb-6 animate-fade-in-up stagger-1">
                    {[
                        { v: "dashboard" as const, l: "📊 Dashboard" },
                        { v: "activity" as const, l: "📋 Activity Log" },
                        { v: "settings" as const, l: "⚙️ Settings" },
                    ].map(t => (
                        <button key={t.v} onClick={() => setTab(t.v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.v ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
                            {t.l}
                        </button>
                    ))}
                </div>

                {error && <div className="mb-6 p-3 glass-card border-red-200 text-red-500 text-sm">{error}</div>}

                {/* ═══ DASHBOARD ═══ */}
                {tab === "dashboard" && (
                    loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2].map(i => <div key={i} className="glass-card p-6"><div className="h-4 skeleton w-1/3 mb-3" /><div className="h-3 skeleton w-2/3" /></div>)}
                        </div>
                    ) : brands.length === 0 ? (
                        <div className="text-center py-20 animate-fade-in-up">
                            <div className="text-5xl mb-4">🚀</div>
                            <h3 className="text-lg font-semibold mb-2">Launch Your Autopilot</h3>
                            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
                                Connect your brand and let AI handle everything — content creation, posting, and optimization.
                            </p>
                            <button onClick={() => { setShowSetup(true); setSetupStep(1); }} className="btn-primary">
                                Set Up Your First Brand
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                                {[
                                    { label: "Active Brands", value: brands.filter(b => b.status === "active").length, icon: "🏷️", color: "text-violet-600" },
                                    { label: "Total Posts", value: logs.length, icon: "📝", color: "text-blue-600" },
                                    { label: "This Week", value: logs.filter(l => l.createdAt > Date.now() - 604800000).length, icon: "📅", color: "text-emerald-600" },
                                    { label: "Success Rate", value: logs.length > 0 ? Math.round((logs.filter(l => l.status === "posted" || l.status === "generated").length / logs.length) * 100) + "%" : "—", icon: "✅", color: "text-amber-500" },
                                ].map((s, i) => (
                                    <div key={s.label} className={`glass-card p-4 animate-fade-in-up stagger-${i + 1}`}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-sm">{s.icon}</span>
                                            <span className="text-[10px] uppercase tracking-widest text-slate-400">{s.label}</span>
                                        </div>
                                        <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Brand Cards */}
                            {brands.map((brand, i) => (
                                <div key={brand.id} className={`glass-card p-5 animate-fade-in-up stagger-${Math.min(i + 1, 4)}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-sm">{brand.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${brand.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                                                    brand.status === "paused" ? "bg-amber-50 text-amber-500 border border-amber-200" :
                                                        "bg-slate-50 text-slate-400 border border-slate-200"
                                                    }`}>
                                                    {brand.status === "active" ? "● Running" : brand.status === "paused" ? "⏸ Paused" : "⚙️ Setup"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500">{brand.niche} · {brand.audience}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                {brand.platforms.map(p => {
                                                    const platform = PLATFORMS.find(pl => pl.id === p);
                                                    return platform ? (
                                                        <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-500">
                                                            {platform.label}
                                                        </span>
                                                    ) : null;
                                                })}
                                                <span className="text-[10px] text-slate-400">
                                                    {brand.schedule.postsPerWeek}x/week · {brand.tone}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 ml-3 shrink-0">
                                            <button onClick={() => runNow(brand.id)} className="btn-primary text-xs py-1.5 px-3">
                                                ⚡ Run Now
                                            </button>
                                            <button
                                                onClick={() => toggleBrandStatus(brand.id, brand.status === "active" ? "paused" : "active")}
                                                className={`btn-secondary text-xs py-1.5 px-3 ${brand.status === "active" ? "hover:bg-amber-50" : "hover:bg-emerald-50"}`}
                                            >
                                                {brand.status === "active" ? "⏸ Pause" : "▶ Resume"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* ═══ ACTIVITY LOG ═══ */}
                {tab === "activity" && (
                    <div className="animate-fade-in-up">
                        {logs.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-4xl mb-3">📋</div>
                                <p className="text-slate-400 text-sm">No activity yet. Set up a brand and run autopilot.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {logs.slice().reverse().map(log => (
                                    <div key={log.id} className="glass-card p-4 flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${log.status === "posted" ? "bg-emerald-50 text-emerald-500" :
                                            log.status === "generated" ? "bg-blue-50 text-blue-500" :
                                                log.status === "scheduled" ? "bg-amber-50 text-amber-500" :
                                                    "bg-red-50 text-red-400"
                                            }`}>
                                            {log.type === "post" ? "📝" : log.type === "image" ? "🖼️" : log.type === "story" ? "📱" : "📣"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-700 truncate">{log.content}</p>
                                            <p className="text-[10px] text-slate-400">{log.platform} · {new Date(log.createdAt).toLocaleString()}</p>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${log.status === "posted" ? "bg-emerald-50 text-emerald-500" :
                                            log.status === "generated" ? "bg-blue-50 text-blue-500" :
                                                log.status === "scheduled" ? "bg-amber-50 text-amber-500" :
                                                    "bg-red-50 text-red-400"
                                            }`}>{log.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ SETTINGS ═══ */}
                {tab === "settings" && (
                    <div className="space-y-4 animate-fade-in-up">
                        {/* Connected Accounts - links to Integrations */}
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-sm">🔗 Connected Accounts</h3>
                                <a href="/store" className="text-xs px-3 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-all font-medium">
                                    Manage in Integrations →
                                </a>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">
                                Connect your social media accounts and online stores from the Integrations Hub. Autopilot will use these connections to generate targeted content.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {PLATFORMS.map(p => (
                                    <div key={p.id} className="p-3 rounded-xl bg-slate-50 text-center">
                                        <div className="text-lg mb-1">{p.label.split(" ")[0]}</div>
                                        <span className="text-[10px] text-slate-400">{p.label.split(" ").slice(1).join(" ")}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Autopilot Preferences */}
                        <div className="glass-card p-6">
                            <h3 className="font-semibold text-sm mb-3">⚙️ Autopilot Preferences</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                                    <div>
                                        <p className="text-sm font-medium">Auto-approve content</p>
                                        <p className="text-[10px] text-slate-400">AI-generated content posts automatically without review</p>
                                    </div>
                                    <div className="w-10 h-5 rounded-full bg-slate-300 relative cursor-pointer">
                                        <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                                    <div>
                                        <p className="text-sm font-medium">Email notifications</p>
                                        <p className="text-[10px] text-slate-400">Get notified when content is generated or posted</p>
                                    </div>
                                    <div className="w-10 h-5 rounded-full bg-violet-500 relative cursor-pointer">
                                        <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                                    <div>
                                        <p className="text-sm font-medium">AI image generation</p>
                                        <p className="text-[10px] text-slate-400">Generate AI images alongside text content</p>
                                    </div>
                                    <div className="w-10 h-5 rounded-full bg-violet-500 relative cursor-pointer">
                                        <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="glass-card p-6 border-red-100">
                            <h3 className="font-semibold text-sm text-red-500 mb-3">🗑️ Danger Zone</h3>
                            <p className="text-xs text-slate-500 mb-3">Pause all autopilot brands or delete all generated content.</p>
                            <div className="flex gap-2">
                                <button className="text-xs px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all">
                                    ⏸ Pause All Brands
                                </button>
                                <button className="text-xs px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                                    Clear Activity Log
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ SETUP WIZARD ═══ */}
            {showSetup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowSetup(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-black/[0.06] w-full max-w-lg">
                        <div className="p-5 border-b border-black/[0.06]">
                            <div className="flex items-center gap-3 mb-2">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className={`flex-1 h-1 rounded-full ${s <= setupStep ? "bg-violet-500" : "bg-slate-200"}`} />
                                ))}
                            </div>
                            <h2 className="text-lg font-semibold">
                                {setupStep === 1 ? "🏷️ Brand Details" : setupStep === 2 ? "📱 Platforms" : "📅 Schedule"}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {setupStep === 1 ? "Tell us about your business." : setupStep === 2 ? "Where should we post?" : "How often should AI post?"}
                            </p>
                        </div>

                        <div className="p-5 space-y-4">
                            {setupStep === 1 && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name</label>
                                        <input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="e.g. Nexora" className="form-input" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Industry / Niche</label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {NICHES.map(n => (
                                                <button key={n} onClick={() => setBrandNiche(n)} className={`p-2 rounded-xl border text-xs font-medium transition-all ${brandNiche === n ? "border-violet-300 bg-violet-50 text-violet-700" : "border-black/[0.06] bg-white text-slate-500"}`}>
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
                                        <input value={brandAudience} onChange={e => setBrandAudience(e.target.value)} placeholder="e.g. Startup founders, 25-40, tech-savvy" className="form-input" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Content Tone</label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {TONES.map(t => (
                                                <button key={t} onClick={() => setBrandTone(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${brandTone === t ? "border-violet-300 bg-violet-50 text-violet-700" : "border-black/[0.06] bg-white text-slate-500"}`}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {setupStep === 2 && (
                                <div className="space-y-2">
                                    {PLATFORMS.map(p => (
                                        <button key={p.id} onClick={() => togglePlatform(p.id)} className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${selectedPlatforms.includes(p.id) ? "border-violet-300 bg-violet-50 text-violet-700" : "border-black/[0.06] bg-white text-slate-500"
                                            }`}>
                                            <span>{p.label}</span>
                                            {selectedPlatforms.includes(p.id) && <span className="text-violet-500">✓</span>}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {setupStep === 3 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Posts per week</label>
                                        <div className="flex items-center gap-3">
                                            <input type="range" min={1} max={14} value={postsPerWeek} onChange={e => setPostsPerWeek(Number(e.target.value))} className="flex-1 accent-violet-500" />
                                            <span className="text-lg font-bold gradient-text w-8 text-center">{postsPerWeek}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">{postsPerWeek <= 3 ? "Good for starting out." : postsPerWeek <= 7 ? "Optimal for growth." : "Aggressive growth mode!"}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
                                        <h4 className="text-xs font-semibold text-violet-700 mb-2">🤖 What happens next</h4>
                                        <ul className="space-y-1.5 text-xs text-violet-600">
                                            <li>• AI will generate {postsPerWeek} posts per week for {brandName || "your brand"}</li>
                                            <li>• Content includes text + AI-generated images</li>
                                            <li>• Posts are optimized for {selectedPlatforms.map(p => PLATFORMS.find(pl => pl.id === p)?.label).filter(Boolean).join(", ") || "your platforms"}</li>
                                            <li>• You can review, edit, or let autopilot handle everything</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-500 text-sm">{error}</div>}
                        </div>

                        <div className="p-5 border-t border-black/[0.06] flex justify-between">
                            {setupStep > 1 ? (
                                <button onClick={() => setSetupStep(s => s - 1)} className="btn-secondary text-sm py-2 px-4">← Back</button>
                            ) : (
                                <button onClick={() => setShowSetup(false)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                            )}
                            {setupStep < 3 ? (
                                <button onClick={() => setSetupStep(s => s + 1)} className="btn-primary text-sm py-2 px-4">Next →</button>
                            ) : (
                                <button onClick={handleSaveBrand} disabled={saving} className="btn-primary text-sm py-2 px-4 disabled:opacity-40">
                                    {saving ? "Launching..." : "🚀 Launch Autopilot"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
