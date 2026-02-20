"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

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

// Only Instagram Platform
const INSTAGRAM_PLATFORM = { id: "instagram", label: "📸 Instagram Business", color: "pink" };

const TONES = ["Professional", "Casual", "Bold", "Friendly", "Luxury", "Humorous"];
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
    const [isInstagramConnected, setIsInstagramConnected] = useState(false);

    // Setup form
    const [setupStep, setSetupStep] = useState(1);
    const [brandName, setBrandName] = useState("");
    const [brandNiche, setBrandNiche] = useState("");
    const [brandAudience, setBrandAudience] = useState("");
    const [brandTone, setBrandTone] = useState("Professional");
    const [postsPerWeek, setPostsPerWeek] = useState(5);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [autopilotRes, statusRes] = await Promise.all([
                fetch("/api/autopilot"),
                fetch("/api/instagram/status")
            ]);

            if (autopilotRes.ok) {
                const data = await autopilotRes.json();
                setBrands(data.brands || []);
                setLogs(data.logs || []);
            }
            if (statusRes.ok) {
                const data = await statusRes.json();
                setIsInstagramConnected(data.connected);
            }
        } catch { /* empty */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

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
                    tone: brandTone.toLowerCase(),
                    platforms: ["instagram"], // Force Instagram only
                    schedule: { postsPerWeek, preferredTimes: ["09:00", "12:00", "18:00"] },
                }),
            });
            if (!res.ok) throw new Error("Failed to create brand.");
            setShowSetup(false);
            setSetupStep(1);
            setBrandName(""); setBrandNiche(""); setBrandAudience(""); setBrandTone("Professional");
            setPostsPerWeek(5);
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
        <main className="relative min-h-screen text-slate-100 font-sans pb-20">
            <div className="pt-10 px-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in-up">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                            🚀 Autopilot
                            {brands.some(b => b.status === "active") && (
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                                    Active
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-400 text-sm max-w-xl">
                            Your autonomous Instagram marketing engine. Set up your brand once, and let AI handle content creation and scheduling forever.
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowSetup(true); setSetupStep(1); setError(null); }}
                        className="btn-primary flex items-center gap-2 shadow-lg shadow-violet-500/20"
                    >
                        <span>+</span> New Brand
                    </button>
                </div>

                {/* Connection Alert */}
                {!loading && !isInstagramConnected && (
                    <div className="mb-8 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between animate-fade-in-up">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-xl">⚠️</div>
                            <div>
                                <h3 className="text-sm font-bold text-orange-200">Instagram Not Connected</h3>
                                <p className="text-xs text-orange-200/70">Autopilot needs access to your Instagram Business account to post.</p>
                            </div>
                        </div>
                        <Link href="/store" className="px-4 py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 text-xs font-bold transition-colors">
                            Connect Now →
                        </Link>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit mb-8 animate-fade-in-up stagger-1">
                    {[
                        { v: "dashboard" as const, l: "📊 Dashboard" },
                        { v: "activity" as const, l: "📋 Activity Log" },
                        { v: "settings" as const, l: "⚙️ Settings" },
                    ].map(t => (
                        <button key={t.v} onClick={() => setTab(t.v)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.v ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}>
                            {t.l}
                        </button>
                    ))}
                </div>

                {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm animate-fade-in-up">{error}</div>}

                {/* ═══ DASHBOARD ═══ */}
                {tab === "dashboard" && (
                    loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2].map(i => <div key={i} className="glass-card p-6 h-40 animate-pulse bg-white/5" />)}
                        </div>
                    ) : brands.length === 0 ? (
                        <div className="text-center py-20 animate-fade-in-up glass-card border-dashed border-white/10 bg-transparent">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-600/30 to-indigo-600/30 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-xl shadow-violet-500/10">
                                🚀
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Launch Your Autopilot</h3>
                            <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm">
                                Connect your brand and let AI handle everything — content creation, posting, and growth optimization for Instagram.
                            </p>
                            <button onClick={() => { setShowSetup(true); setSetupStep(1); }} className="btn-primary shadow-xl shadow-violet-500/20">
                                Set Up Your First Brand
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Active Brands", value: brands.filter(b => b.status === "active").length, icon: "🏷️", color: "text-violet-400" },
                                    { label: "Total Posts", value: logs.length, icon: "📝", color: "text-blue-400" },
                                    { label: "This Week", value: logs.filter(l => l.createdAt > Date.now() - 604800000).length, icon: "📅", color: "text-emerald-400" },
                                    { label: "Success Rate", value: logs.length > 0 ? Math.round((logs.filter(l => l.status === "posted" || l.status === "generated").length / logs.length) * 100) + "%" : "—", icon: "✅", color: "text-amber-400" },
                                ].map((s, i) => (
                                    <div key={s.label} className={`glass-card p-5 animate-fade-in-up stagger-${i + 1}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{s.icon}</span>
                                            <span className="text-[10px] uppercase tracking-widest text-slate-500">{s.label}</span>
                                        </div>
                                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Brand Cards */}
                            {brands.map((brand, i) => (
                                <div key={brand.id} className={`glass-card p-6 animate-fade-in-up stagger-${Math.min(i + 1, 4)} group hover:border-violet-500/30 transition-colors`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-lg text-white">{brand.name}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${brand.status === "active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                                    brand.status === "paused" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                                                        "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                                                    }`}>
                                                    {brand.status === "active" ? "Running" : brand.status === "paused" ? "Paused" : "Setup"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mb-3">{brand.niche} · Target: {brand.audience}</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                                                    <span className="text-lg">📸</span>
                                                    <span className="text-xs text-slate-300">Instagram</span>
                                                </div>
                                                <span className="text-xs text-slate-500">
                                                    {brand.schedule.postsPerWeek} posts/week · {brand.tone} tone
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <button
                                                onClick={() => runNow(brand.id)}
                                                className="px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-bold hover:bg-violet-600/30 transition-colors flex items-center gap-2"
                                            >
                                                ⚡ Run Now
                                            </button>
                                            <button
                                                onClick={() => toggleBrandStatus(brand.id, brand.status === "active" ? "paused" : "active")}
                                                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-colors ${brand.status === "active"
                                                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                                    }`}
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
                            <div className="text-center py-20 text-slate-500">
                                <div className="text-4xl mb-3 grayscale opacity-50">📋</div>
                                <p className="text-sm">No activity yet. Set up a brand and run autopilot.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {logs.slice().reverse().map(log => (
                                    <div key={log.id} className="glass-card p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner ${log.status === "posted" ? "bg-emerald-500/20 text-emerald-400" :
                                            log.status === "generated" ? "bg-blue-500/20 text-blue-400" :
                                                log.status === "scheduled" ? "bg-amber-500/20 text-amber-400" :
                                                    "bg-red-500/20 text-red-400"
                                            }`}>
                                            {log.type === "post" ? "📝" : log.type === "image" ? "🖼️" : log.type === "story" ? "📱" : "📣"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-200 truncate font-medium">{log.content}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Instagram · {new Date(log.createdAt).toLocaleString()}</p>
                                        </div>
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${log.status === "posted" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                            log.status === "generated" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                                log.status === "scheduled" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                    "bg-red-500/10 text-red-400 border border-red-500/20"
                                            }`}>{log.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ SETTINGS ═══ */}
                {tab === "settings" && (
                    <div className="space-y-6 animate-fade-in-up">
                        {/* Connected Accounts */}
                        <div className="glass-card p-8 bg-gradient-to-br from-white/5 to-transparent">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg">🔗 Connected Accounts</h3>
                                    <p className="text-xs text-slate-400 mt-1">Manage your Instagram connection.</p>
                                </div>
                                <Link href="/store" className="text-xs px-4 py-2 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-all font-bold">
                                    Manage Connection →
                                </Link>
                            </div>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                                <div className="p-3 bg-pink-500/20 rounded-xl text-2xl">📸</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Instagram Business</h4>
                                    <p className="text-xs text-slate-400">
                                        {isInstagramConnected ? "✅ Connected & Ready" : "⚠️ Not Connected"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Autopilot Preferences */}
                        <div className="glass-card p-8">
                            <h3 className="font-bold text-white text-lg mb-6">⚙️ Autopilot Preferences</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">Auto-approve content</p>
                                        <p className="text-xs text-slate-500 mt-0.5">AI-generated posts go live without review</p>
                                    </div>
                                    <div className="w-11 h-6 rounded-full bg-slate-700 relative cursor-pointer border border-white/10">
                                        <div className="w-4 h-4 bg-slate-400 rounded-full absolute left-1 top-1 shadow-sm" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">Email notifications</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Get notified when content is generated</p>
                                    </div>
                                    <div className="w-11 h-6 rounded-full bg-violet-600 relative cursor-pointer border border-violet-500">
                                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">AI image generation</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Create custom visuals for every post</p>
                                    </div>
                                    <div className="w-11 h-6 rounded-full bg-violet-600 relative cursor-pointer border border-violet-500">
                                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="glass-card p-6 border-red-500/20 bg-red-500/5">
                            <h3 className="font-bold text-red-400 text-sm mb-3">🗑️ Danger Zone</h3>
                            <div className="flex gap-3">
                                <button className="text-xs px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all font-medium">
                                    ⏸ Pause All Brands
                                </button>
                                <button className="text-xs px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-medium">
                                    Clear Activity Log
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ SETUP WIZARD ═══ */}
            {showSetup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="glass-card w-full max-w-lg border border-white/20 shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-2 mb-4">
                                {[1, 2].map(s => (
                                    <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${s <= setupStep ? "bg-violet-500" : "bg-white/10"}`} />
                                ))}
                            </div>
                            <h2 className="text-xl font-bold text-white">
                                {setupStep === 1 ? "🏷️ Brand Details" : "📅 Content Schedule"}
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                {setupStep === 1 ? "Tell AI about your business." : "How often should we post to Instagram?"}
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {setupStep === 1 && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brand Name</label>
                                        <input
                                            value={brandName}
                                            onChange={e => setBrandName(e.target.value)}
                                            placeholder="e.g. Nexora"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Industry / Niche</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {NICHES.slice(0, 9).map(n => (
                                                <button key={n} onClick={() => setBrandNiche(n)} className={`p-2 rounded-lg border text-[10px] font-medium transition-all ${brandNiche === n ? "border-violet-500/50 bg-violet-500/20 text-violet-200" : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Audience</label>
                                        <input
                                            value={brandAudience}
                                            onChange={e => setBrandAudience(e.target.value)}
                                            placeholder="e.g. Startup founders, 25-40"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tone</label>
                                        <div className="flex flex-wrap gap-2">
                                            {TONES.map(t => (
                                                <button key={t} onClick={() => setBrandTone(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${brandTone === t ? "border-violet-500/50 bg-violet-500/20 text-violet-200" : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {setupStep === 2 && (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform</label>
                                        <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/10 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl">📸</div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">Instagram Business</div>
                                                    <div className="text-[10px] text-violet-300">Auto-posting & Analytics included</div>
                                                </div>
                                            </div>
                                            <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center text-[10px] text-white">✓</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Posts per week: <span className="text-white">{postsPerWeek}</span></label>
                                        <input type="range" min={1} max={14} value={postsPerWeek} onChange={e => setPostsPerWeek(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500" />
                                        <div className="flex justify-between text-[10px] text-slate-500">
                                            <span>Light (1)</span>
                                            <span>Growth (7)</span>
                                            <span>Turbo (14)</span>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <h4 className="text-xs font-bold text-emerald-400 mb-2">🚀 Ready for liftoff</h4>
                                        <ul className="space-y-1.5 text-xs text-emerald-300/80">
                                            <li>• AI will generate <b>{postsPerWeek} Instagram posts</b> weekly</li>
                                            <li>• Content includes captions + AI visuals</li>
                                            <li>• You can review before posting or use auto-approve</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {error && <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-medium text-center">{error}</div>}
                        </div>

                        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-between">
                            {setupStep > 1 ? (
                                <button onClick={() => setSetupStep(s => s - 1)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-colors">← Back</button>
                            ) : (
                                <button onClick={() => setShowSetup(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-colors">Cancel</button>
                            )}
                            {setupStep < 2 ? (
                                <button onClick={() => setSetupStep(s => s + 1)} className="btn-primary px-6 py-2 rounded-xl text-xs">Next →</button>
                            ) : (
                                <button onClick={handleSaveBrand} disabled={saving} className="btn-primary px-6 py-2 rounded-xl text-xs disabled:opacity-50">
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
