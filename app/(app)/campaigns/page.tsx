"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/app/components/navbar";

type CampaignPlatform = "instagram" | "google-ads";
type CampaignContent = { id: string; generatedAt: number; platform: CampaignPlatform; output: Record<string, unknown>; };
type Campaign = { id: string; productName: string; productDescription: string; targetAudience: string; platform: CampaignPlatform; tone: string; createdAt: number; contents: CampaignContent[]; };
type FormData = { productName: string; productDescription: string; targetAudience: string; platform: CampaignPlatform; tone: string; };

const emptyForm: FormData = { productName: "", productDescription: "", targetAudience: "", platform: "instagram", tone: "professional" };

const TEMPLATES = [
    { name: "🛍️ E-Commerce", productName: "Online Store", productDescription: "Modern e-commerce platform with curated products, fast delivery, and exceptional customer experience", targetAudience: "Online shoppers, 18-45, value-conscious consumers", platform: "instagram" as CampaignPlatform, tone: "friendly" },
    { name: "💻 SaaS Product", productName: "SaaS App", productDescription: "Cloud-based software solution that automates workflows and increases team productivity", targetAudience: "Business owners, startup founders, tech-savvy professionals 25-50", platform: "google-ads" as CampaignPlatform, tone: "professional" },
    { name: "🍕 Restaurant", productName: "Local Restaurant", productDescription: "Authentic cuisine with fresh ingredients, cozy ambiance, and memorable dining experience", targetAudience: "Foodies, families, local residents 20-55", platform: "instagram" as CampaignPlatform, tone: "casual" },
    { name: "💪 Fitness", productName: "Fitness Program", productDescription: "Personalized fitness coaching and workout plans for transformation and healthy lifestyle", targetAudience: "Health-conscious adults, gym-goers, fitness beginners 18-40", platform: "instagram" as CampaignPlatform, tone: "bold" },
    { name: "📚 Online Course", productName: "Online Academy", productDescription: "Expert-led online courses with certificates, hands-on projects, and career advancement", targetAudience: "Students, career changers, lifelong learners 20-45", platform: "google-ads" as CampaignPlatform, tone: "professional" },
    { name: "🏠 Real Estate", productName: "Real Estate Agency", productDescription: "Premium property listings with virtual tours, expert agents, and seamless buying experience", targetAudience: "Home buyers, investors, relocating professionals 28-55", platform: "google-ads" as CampaignPlatform, tone: "luxury" },
];

const LANGUAGES = [
    { code: "English", flag: "🇬🇧" }, { code: "Türkçe", flag: "🇹🇷" }, { code: "Español", flag: "🇪🇸" },
    { code: "Français", flag: "🇫🇷" }, { code: "Deutsch", flag: "🇩🇪" }, { code: "العربية", flag: "🇸🇦" },
    { code: "中文", flag: "🇨🇳" }, { code: "日本語", flag: "🇯🇵" }, { code: "Português", flag: "🇧🇷" },
    { code: "한국어", flag: "🇰🇷" }, { code: "Italiano", flag: "🇮🇹" }, { code: "हिन्दी", flag: "🇮🇳" },
];

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState<FormData>({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [generating, setGenerating] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [language, setLanguage] = useState("English");
    const [tab, setTab] = useState<"campaigns" | "calendar">("campaigns");

    const fetchCampaigns = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await fetch("/api/campaigns");
            if (!res.ok) throw new Error("Failed to fetch campaigns.");
            setCampaigns(await res.json());
        } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

    const applyTemplate = (t: typeof TEMPLATES[0]) => {
        setForm({ productName: t.productName, productDescription: t.productDescription, targetAudience: t.targetAudience, platform: t.platform, tone: t.tone });
    };

    const handleCreate = async () => {
        setFormError(null);
        if (form.productName.trim().length < 2) { setFormError("Product name min 2 chars."); return; }
        if (form.productDescription.trim().length < 10) { setFormError("Description min 10 chars."); return; }
        if (form.targetAudience.trim().length < 5) { setFormError("Define target audience."); return; }
        setSaving(true);
        try {
            const res = await fetch("/api/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            if (!res.ok) { const err = await res.json().catch(() => null); throw new Error(err?.error || "Failed."); }
            setShowCreate(false); setForm({ ...emptyForm }); await fetchCampaigns();
        } catch (e: unknown) { setFormError(e instanceof Error ? e.message : "Failed."); }
        finally { setSaving(false); }
    };

    const handleGenerate = async (campaignId: string) => {
        setGenerating(campaignId); setError(null);
        try {
            const res = await fetch("/api/campaigns/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ campaignId, language }) });
            if (!res.ok) { const err = await res.json().catch(() => null); throw new Error(err?.error || "Failed."); }
            await fetchCampaigns(); setExpandedId(campaignId);
        } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setGenerating(null); }
    };

    const handleDelete = async (id: string) => { try { await fetch(`/api/campaigns/${id}`, { method: "DELETE" }); await fetchCampaigns(); } catch { } };
    const copyText = async (text: string, key: string) => { try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); } catch { } };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderInstagramContent = (output: any, contentId: string) => (
        <div className="space-y-4">
            {output.bioSuggestion && (
                <div className="p-3 rounded-xl bg-violet-50 border border-violet-200">
                    <div className="text-[10px] uppercase tracking-widest text-violet-400 mb-1">Bio Suggestion</div>
                    <p className="text-xs text-violet-700">{output.bioSuggestion}</p>
                </div>
            )}
            {output.posts?.map((post: { caption: string; hashtags: string[]; imagePrompt: string; bestTime: string }, idx: number) => (
                <div key={idx} className="glass-card p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400">Post {idx + 1}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">🕐 {post.bestTime}</span>
                            <button onClick={() => copyText(post.caption + "\n\n" + post.hashtags.map((h: string) => "#" + h).join(" "), `${contentId}-${idx}`)} className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400">
                                {copied === `${contentId}-${idx}` ? "✓ Copied" : "Copy"}
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-line mb-2">{post.caption}</p>
                    <div className="flex flex-wrap gap-1">{post.hashtags.map((h: string, i: number) => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500">#{h}</span>)}</div>
                    {post.imagePrompt && <p className="mt-2 text-[10px] text-slate-400 italic">📷 {post.imagePrompt}</p>}
                </div>
            ))}
            {output.storyIdeas?.length > 0 && (
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Story Ideas</div>
                    <div className="space-y-1">{output.storyIdeas.map((s: string, i: number) => <div key={i} className="px-3 py-2 rounded-xl bg-slate-50 border border-black/[0.04] text-xs text-slate-600">{s}</div>)}</div>
                </div>
            )}
        </div>
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderGoogleAdsContent = (output: any, contentId: string) => (
        <div className="space-y-4">
            {[
                { label: "Headlines", items: output.headlines, color: "violet" },
                { label: "Descriptions", items: output.descriptions, color: "blue" },
                { label: "Keywords", items: output.keywords, color: "emerald" },
                { label: "Call to Actions", items: output.callToActions, color: "amber" },
                { label: "Ad Extensions", items: output.adExtensions, color: "slate" },
            ].map((section) => (
                section.items?.length > 0 && (
                    <div key={section.label}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400">{section.label}</span>
                            <button onClick={() => copyText(section.items.join("\n"), `${contentId}-${section.label}`)} className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400">
                                {copied === `${contentId}-${section.label}` ? "✓" : "Copy"}
                            </button>
                        </div>
                        <div className="space-y-1">
                            {section.items.map((item: string, i: number) => (
                                <div key={i} className={`px-3 py-2 rounded-xl border text-xs ${section.color === "violet" ? "bg-violet-50 border-violet-200 text-violet-700" :
                                    section.color === "blue" ? "bg-blue-50 border-blue-200 text-blue-700" :
                                        section.color === "emerald" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                                            section.color === "amber" ? "bg-amber-50 border-amber-200 text-amber-700" :
                                                "bg-slate-50 border-slate-200 text-slate-600"
                                    }`}>{item}</div>
                            ))}
                        </div>
                    </div>
                )
            ))}
        </div>
    );

    // Calendar view
    const getCalendarData = () => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const allPosts: { day: string; time: string; caption: string; campaign: string; platform: CampaignPlatform }[] = [];

        campaigns.forEach(c => {
            c.contents.forEach(content => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const output = content.output as any;
                if (content.platform === "instagram" && output.posts) {
                    output.posts.forEach((post: { bestTime: string; caption: string }, idx: number) => {
                        allPosts.push({
                            day: days[idx % 7],
                            time: post.bestTime || "12:00 PM",
                            caption: post.caption?.slice(0, 80) + "...",
                            campaign: c.productName,
                            platform: c.platform,
                        });
                    });
                }
            });
        });
        return { days, allPosts };
    };

    return (
        <main className="relative min-h-screen overflow-hidden">
            <div className="orb-bg" aria-hidden="true"><div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" /></div>
            <Navbar />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 animate-fade-in-up">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
                        <p className="text-sm text-slate-500">AI marketing for Instagram & Google Ads.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Language selector */}
                        <select value={language} onChange={e => setLanguage(e.target.value)} className="form-input text-xs py-2 px-3 w-auto pr-8">
                            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.code}</option>)}
                        </select>
                        <button onClick={() => { setShowCreate(true); setFormError(null); setForm({ ...emptyForm }); }} className="btn-primary text-sm py-2 px-4">+ New Campaign</button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-slate-100 w-fit mb-6 animate-fade-in-up stagger-1">
                    {[{ v: "campaigns" as const, l: "📋 Campaigns" }, { v: "calendar" as const, l: "📅 Calendar" }].map(t => (
                        <button key={t.v} onClick={() => setTab(t.v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.v ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
                            {t.l}
                        </button>
                    ))}
                </div>

                {error && <div className="mb-6 p-3 glass-card border-red-200 text-red-500 text-sm">{error}</div>}

                {/* ═══ CAMPAIGNS TAB ═══ */}
                {tab === "campaigns" && (
                    loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2].map(i => <div key={i} className="glass-card p-5"><div className="h-4 skeleton w-1/3 mb-2" /><div className="h-3 skeleton w-2/3" /></div>)}</div>
                    ) : campaigns.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-4xl mb-3">📣</div>
                            <p className="text-slate-400 text-sm mb-4">No campaigns yet.</p>
                            <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">Create Campaign</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {campaigns.map((c, i) => (
                                <div key={c.id} className={`glass-card animate-fade-in-up stagger-${Math.min(i + 1, 4)}`}>
                                    <div className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-sm truncate">{c.productName}</h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.platform === "instagram" ? "bg-pink-50 text-pink-500 border border-pink-200" : "bg-blue-50 text-blue-500 border border-blue-200"}`}>
                                                        {c.platform === "instagram" ? "📸 Instagram" : "🔍 Google Ads"}
                                                    </span>
                                                    <span className="text-[10px] text-slate-300">{c.contents.length} gen{c.contents.length !== 1 ? "s" : ""}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">{c.productDescription}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">Audience: {c.targetAudience} · Tone: {c.tone}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 ml-3 shrink-0">
                                                <button onClick={() => handleGenerate(c.id)} disabled={generating === c.id} className="btn-primary text-xs py-1.5 px-3 disabled:opacity-40">
                                                    {generating === c.id ? <span className="flex items-center gap-1.5"><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Generating...</span> : "⚡ Generate"}
                                                </button>
                                                {c.contents.length > 0 && (
                                                    <button onClick={() => setExpandedId(expandedId === c.id ? null : c.id)} className="btn-secondary text-xs py-1.5 px-3">
                                                        {expandedId === c.id ? "Hide" : "View"} ({c.contents.length})
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors" title="Delete">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {expandedId === c.id && c.contents.length > 0 && (
                                        <div className="px-5 pb-5 border-t border-black/[0.04]">
                                            {c.contents.slice().reverse().map((content, cIdx) => (
                                                <div key={content.id} className={`mt-4 ${cIdx > 0 ? "pt-4 border-t border-black/[0.04]" : ""}`}>
                                                    <span className="text-[10px] text-slate-400 mb-3 block">Generated {new Date(content.generatedAt).toLocaleString()}</span>
                                                    {content.platform === "instagram" ? renderInstagramContent(content.output, content.id) : renderGoogleAdsContent(content.output, content.id)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* ═══ CALENDAR TAB ═══ */}
                {tab === "calendar" && (() => {
                    const { days, allPosts } = getCalendarData();
                    return (
                        <div className="animate-fade-in-up">
                            {allPosts.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="text-4xl mb-3">📅</div>
                                    <p className="text-slate-400 text-sm mb-2">No content to schedule yet.</p>
                                    <p className="text-[10px] text-slate-300">Generate content for your campaigns to see the calendar.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-7 gap-2">
                                    {days.map(d => (
                                        <div key={d} className="text-center">
                                            <div className="text-xs font-semibold text-slate-500 mb-2 py-2">{d}</div>
                                            <div className="space-y-2">
                                                {allPosts.filter(p => p.day === d).map((post, idx) => (
                                                    <div key={idx} className={`p-2.5 rounded-xl border text-left ${post.platform === "instagram" ? "bg-pink-50/50 border-pink-200" : "bg-blue-50/50 border-blue-200"}`}>
                                                        <div className="flex items-center gap-1 mb-1">
                                                            <span className="text-[9px] font-medium text-slate-500">{post.time}</span>
                                                            <span className="text-[9px]">{post.platform === "instagram" ? "📸" : "🔍"}</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-600 leading-relaxed">{post.caption}</p>
                                                        <p className="text-[9px] text-slate-400 mt-1">{post.campaign}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>

            {/* ═══ CREATE MODAL ═══ */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-black/[0.06] w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b border-black/[0.06]">
                            <h2 className="text-lg font-semibold">New Campaign</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Choose a template or fill in manually.</p>
                        </div>

                        {/* Templates */}
                        <div className="px-5 pt-4">
                            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Quick Templates</label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {TEMPLATES.map(t => (
                                    <button key={t.name} onClick={() => applyTemplate(t)} className="p-2 rounded-xl border border-black/[0.06] bg-slate-50/50 hover:bg-violet-50 hover:border-violet-200 text-[11px] text-slate-600 hover:text-violet-700 transition-all text-left">
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label><input value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} placeholder="e.g. Nexora AI" className="form-input" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea value={form.productDescription} onChange={e => setForm({ ...form, productDescription: e.target.value })} placeholder="What does your product do?" rows={3} className="form-input" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label><input value={form.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value })} placeholder="e.g. SaaS founders, 25-45" className="form-input" /></div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {([{ v: "instagram" as const, l: "📸 Instagram" }, { v: "google-ads" as const, l: "🔍 Google Ads" }]).map(p => (
                                        <button key={p.v} onClick={() => setForm({ ...form, platform: p.v })} className={`p-3 rounded-xl border text-sm font-medium transition-all ${form.platform === p.v ? "border-violet-300 bg-violet-50 text-violet-700" : "border-black/[0.06] bg-white text-slate-500"}`}>{p.l}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tone</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {["professional", "casual", "bold", "friendly", "luxury"].map(t => (
                                        <button key={t} onClick={() => setForm({ ...form, tone: t })} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${form.tone === t ? "border-violet-300 bg-violet-50 text-violet-700" : "border-black/[0.06] bg-white text-slate-500"}`}>{t}</button>
                                    ))}
                                </div>
                            </div>
                            {formError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-500 text-sm">{formError}</div>}
                        </div>
                        <div className="p-5 border-t border-black/[0.06] flex justify-end gap-2">
                            <button onClick={() => setShowCreate(false)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                            <button onClick={handleCreate} disabled={saving} className="btn-primary text-sm py-2 px-4 disabled:opacity-40">{saving ? "Creating..." : "Create Campaign"}</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
