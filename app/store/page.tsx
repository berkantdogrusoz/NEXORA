"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/app/components/navbar";

type Connection = {
    id: string;
    platform: string;
    accountName: string;
    accountUrl: string;
    status: "connected" | "disconnected" | "pending";
    connectedAt: number;
    metrics?: {
        followers?: number;
        posts?: number;
        engagement?: number;
        views?: number;
    };
};

type StoreIntegration = {
    id: string;
    platform: string;
    storeName: string;
    storeUrl: string;
    status: "connected" | "disconnected";
    connectedAt: number;
    products?: number;
};

const SOCIAL_PLATFORMS = [
    { id: "instagram", label: "Instagram", icon: "📸", color: "from-pink-500 to-purple-500", desc: "Auto-post photos, reels, stories & carousels" },
    { id: "tiktok", label: "TikTok", icon: "🎵", color: "from-slate-800 to-slate-600", desc: "Post videos, slideshows & manage your page" },
    { id: "twitter", label: "X (Twitter)", icon: "𝕏", color: "from-blue-500 to-blue-400", desc: "Auto-tweet, threads & engagement" },
    { id: "linkedin", label: "LinkedIn", icon: "💼", color: "from-blue-700 to-blue-500", desc: "Professional posts & company page management" },
    { id: "youtube", label: "YouTube", icon: "▶️", color: "from-red-600 to-red-400", desc: "Upload shorts & manage your channel" },
    { id: "pinterest", label: "Pinterest", icon: "📌", color: "from-red-500 to-red-300", desc: "Auto-pin & board management" },
];

const STORE_PLATFORMS = [
    { id: "shopify", label: "Shopify", icon: "🛍️", color: "from-green-500 to-green-400", desc: "Sync products, create ads & social posts from your Shopify store" },
    { id: "etsy", label: "Etsy", icon: "🧶", color: "from-orange-500 to-orange-400", desc: "Promote your Etsy listings automatically across social media" },
    { id: "gumroad", label: "Gumroad", icon: "💰", color: "from-pink-500 to-pink-400", desc: "Market your digital products & courses automatically" },
    { id: "wordpress", label: "WordPress", icon: "📝", color: "from-blue-600 to-blue-400", desc: "Connect your blog, auto-share new posts to social" },
    { id: "woocommerce", label: "WooCommerce", icon: "🛒", color: "from-purple-600 to-purple-400", desc: "Sync products & run automated marketing campaigns" },
    { id: "custom", label: "Custom Website", icon: "🌐", color: "from-violet-500 to-blue-400", desc: "Connect any website via URL for SEO & content marketing" },
];

export default function StorePage() {
    const [tab, setTab] = useState<"social" | "stores" | "overview">("overview");
    const [connections, setConnections] = useState<Connection[]>([]);
    const [storeIntegrations, setStoreIntegrations] = useState<StoreIntegration[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConnect, setShowConnect] = useState<{ type: "social" | "store"; platform: typeof SOCIAL_PLATFORMS[0] | typeof STORE_PLATFORMS[0] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Connection form
    const [accountName, setAccountName] = useState("");
    const [accountUrl, setAccountUrl] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchConnections = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/connections");
            if (res.ok) {
                const data = await res.json();
                setConnections(data.socialConnections || []);
                setStoreIntegrations(data.storeIntegrations || []);
            }
        } catch { /* empty */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchConnections(); }, [fetchConnections]);

    const handleConnect = async () => {
        if (!showConnect) return;
        if (!accountName.trim()) { setError("Account name required."); return; }

        setSaving(true); setError(null);
        try {
            const endpoint = showConnect.type === "social" ? "/api/connections/social" : "/api/connections/store";
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    platform: showConnect.platform.id,
                    accountName: accountName.trim(),
                    accountUrl: accountUrl.trim(),
                }),
            });
            if (!res.ok) throw new Error("Failed to connect.");
            setShowConnect(null);
            setAccountName(""); setAccountUrl("");
            setSuccess(`${showConnect.platform.label} connected successfully! 🎉`);
            setTimeout(() => setSuccess(null), 3000);
            await fetchConnections();
        } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setSaving(false); }
    };

    const handleDisconnect = async (id: string, type: "social" | "store") => {
        try {
            await fetch(`/api/connections/${type}/${id}`, { method: "DELETE" });
            await fetchConnections();
        } catch { /* empty */ }
    };

    const totalConnections = connections.length + storeIntegrations.length;
    const totalFollowers = connections.reduce((sum, c) => sum + (c.metrics?.followers || 0), 0);
    const totalProducts = storeIntegrations.reduce((sum, s) => sum + (s.products || 0), 0);

    return (
        <main className="relative min-h-screen overflow-hidden">
            <div className="orb-bg" aria-hidden="true"><div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" /></div>
            <Navbar />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-6 animate-fade-in-up">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">🔗 Integrations Hub</h1>
                        <p className="text-sm text-slate-500">Connect your social media & online stores. Nexora manages everything.</p>
                    </div>
                </div>

                {success && <div className="mb-6 p-3 glass-card border-emerald-200 text-emerald-600 text-sm animate-fade-in-up">{success}</div>}
                {error && !showConnect && <div className="mb-6 p-3 glass-card border-red-200 text-red-500 text-sm">{error}</div>}

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-slate-100 w-fit mb-6 animate-fade-in-up stagger-1">
                    {[
                        { v: "overview" as const, l: "📊 Overview" },
                        { v: "social" as const, l: "📱 Social Media" },
                        { v: "stores" as const, l: "🛒 Online Stores" },
                    ].map(t => (
                        <button key={t.v} onClick={() => setTab(t.v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.v ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
                            {t.l}
                        </button>
                    ))}
                </div>

                {/* ═══ OVERVIEW ═══ */}
                {tab === "overview" && (
                    <div className="space-y-6 animate-fade-in-up">
                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: "Connected", value: totalConnections, icon: "🔗", color: "text-violet-600" },
                                { label: "Social Accounts", value: connections.length, icon: "📱", color: "text-pink-500" },
                                { label: "Followers", value: totalFollowers > 0 ? totalFollowers.toLocaleString() : "—", icon: "👤", color: "text-blue-600" },
                                { label: "Products", value: totalProducts > 0 ? totalProducts : "—", icon: "📦", color: "text-emerald-500" },
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

                        {/* Connected Items */}
                        {totalConnections === 0 ? (
                            <div className="text-center py-16 glass-card">
                                <div className="text-5xl mb-4">🔗</div>
                                <h3 className="text-lg font-semibold mb-2">No Connections Yet</h3>
                                <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
                                    Connect your social media accounts and online stores so Nexora can manage your entire digital presence.
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <button onClick={() => setTab("social")} className="btn-primary text-sm py-2 px-4">Connect Social Media</button>
                                    <button onClick={() => setTab("stores")} className="btn-secondary text-sm py-2 px-4">Connect Store</button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-slate-700">Active Connections</h3>
                                {connections.map(c => {
                                    const plat = SOCIAL_PLATFORMS.find(p => p.id === c.platform);
                                    return (
                                        <div key={c.id} className="glass-card p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plat?.color || "from-slate-500 to-slate-400"} flex items-center justify-center text-white text-lg`}>
                                                    {plat?.icon || "📱"}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">{c.accountName}</span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200">Connected</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400">{plat?.label || c.platform} · {c.accountUrl || "No URL"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {c.metrics && (
                                                    <div className="hidden md:flex gap-3 text-[10px] text-slate-400">
                                                        {c.metrics.followers != null && <span>{c.metrics.followers.toLocaleString()} followers</span>}
                                                        {c.metrics.engagement != null && <span>{c.metrics.engagement}% engagement</span>}
                                                    </div>
                                                )}
                                                <button onClick={() => handleDisconnect(c.id, "social")} className="text-[10px] text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-all">
                                                    Disconnect
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {storeIntegrations.map(s => {
                                    const plat = STORE_PLATFORMS.find(p => p.id === s.platform);
                                    return (
                                        <div key={s.id} className="glass-card p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plat?.color || "from-slate-500 to-slate-400"} flex items-center justify-center text-white text-lg`}>
                                                    {plat?.icon || "🛒"}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">{s.storeName}</span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200">Connected</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400">{plat?.label || s.platform} · {s.storeUrl || "No URL"} {s.products ? `· ${s.products} products` : ""}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDisconnect(s.id, "store")} className="text-[10px] text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-all">
                                                Disconnect
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ SOCIAL MEDIA ═══ */}
                {tab === "social" && (
                    <div className="space-y-4 animate-fade-in-up">
                        <p className="text-sm text-slate-500 mb-2">Connect your social media accounts. Nexora will auto-generate and post content for you.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {SOCIAL_PLATFORMS.map((platform, i) => {
                                const connected = connections.find(c => c.platform === platform.id);
                                return (
                                    <div key={platform.id} className={`glass-card p-5 animate-fade-in-up stagger-${Math.min(i + 1, 4)}`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white text-xl shrink-0`}>
                                                    {platform.icon}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-sm">{platform.label}</h3>
                                                        {connected && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200">
                                                                ● Connected
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-0.5">{platform.desc}</p>
                                                    {connected && (
                                                        <p className="text-[10px] text-slate-500 mt-1.5">
                                                            @{connected.accountName}
                                                            {connected.metrics?.followers ? ` · ${connected.metrics.followers.toLocaleString()} followers` : ""}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="shrink-0 ml-2">
                                                {connected ? (
                                                    <button onClick={() => handleDisconnect(connected.id, "social")} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                                                        Disconnect
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => { setShowConnect({ type: "social", platform }); setError(null); setAccountName(""); setAccountUrl(""); }}
                                                        className="text-xs px-3 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-all font-medium"
                                                    >
                                                        + Connect
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ═══ ONLINE STORES ═══ */}
                {tab === "stores" && (
                    <div className="space-y-4 animate-fade-in-up">
                        <p className="text-sm text-slate-500 mb-2">Connect your online stores. Nexora will create marketing content for your products automatically.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {STORE_PLATFORMS.map((platform, i) => {
                                const connected = storeIntegrations.find(s => s.platform === platform.id);
                                return (
                                    <div key={platform.id} className={`glass-card p-5 animate-fade-in-up stagger-${Math.min(i + 1, 4)}`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white text-xl shrink-0`}>
                                                    {platform.icon}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-sm">{platform.label}</h3>
                                                        {connected && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200">
                                                                ● Connected
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-0.5">{platform.desc}</p>
                                                    {connected && (
                                                        <p className="text-[10px] text-slate-500 mt-1.5">
                                                            {connected.storeName} · {connected.storeUrl}
                                                            {connected.products ? ` · ${connected.products} products` : ""}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="shrink-0 ml-2">
                                                {connected ? (
                                                    <button onClick={() => handleDisconnect(connected.id, "store")} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                                                        Disconnect
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => { setShowConnect({ type: "store", platform }); setError(null); setAccountName(""); setAccountUrl(""); }}
                                                        className="text-xs px-3 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-all font-medium"
                                                    >
                                                        + Connect
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ CONNECT MODAL ═══ */}
            {showConnect && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowConnect(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-black/[0.06] w-full max-w-md">
                        <div className="p-5 border-b border-black/[0.06]">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${showConnect.platform.color} flex items-center justify-center text-white text-lg`}>
                                    {showConnect.platform.icon}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Connect {showConnect.platform.label}</h2>
                                    <p className="text-xs text-slate-500">{showConnect.platform.desc}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            {showConnect.type === "social" ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Username / Account Name</label>
                                        <div className="flex items-center gap-1">
                                            <span className="text-slate-400 text-sm">@</span>
                                            <input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="your_username" className="form-input flex-1" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Profile URL <span className="text-slate-400 text-xs">(optional)</span></label>
                                        <input value={accountUrl} onChange={e => setAccountUrl(e.target.value)} placeholder={`https://${showConnect.platform.id}.com/your_username`} className="form-input" />
                                    </div>
                                    <div className="p-3 rounded-xl bg-violet-50 border border-violet-200">
                                        <h4 className="text-xs font-semibold text-violet-700 mb-1.5">🔗 What Nexora will do</h4>
                                        <ul className="space-y-1 text-[10px] text-violet-600">
                                            <li>• Generate platform-optimized content for your brand</li>
                                            <li>• Create captions, hashtags, and image suggestions</li>
                                            <li>• Track your posting schedule and engagement</li>
                                            <li>• Analyze what works best for your audience</li>
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
                                        <input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="My Awesome Store" className="form-input" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Store URL</label>
                                        <input value={accountUrl} onChange={e => setAccountUrl(e.target.value)} placeholder={
                                            showConnect.platform.id === "shopify" ? "https://my-store.myshopify.com" :
                                                showConnect.platform.id === "etsy" ? "https://www.etsy.com/shop/myshop" :
                                                    "https://your-store-url.com"
                                        } className="form-input" />
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                                        <h4 className="text-xs font-semibold text-emerald-700 mb-1.5">🛒 What Nexora will do</h4>
                                        <ul className="space-y-1 text-[10px] text-emerald-600">
                                            <li>• Analyze your products and create marketing content</li>
                                            <li>• Generate product-focused social media posts</li>
                                            <li>• Create ad copy and promotional materials</li>
                                            <li>• Build SEO-optimized content for your store</li>
                                        </ul>
                                    </div>
                                </>
                            )}
                            {error && <div className="p-2 rounded-lg bg-red-50 text-red-500 text-xs">{error}</div>}
                        </div>
                        <div className="p-5 border-t border-black/[0.06] flex justify-end gap-2">
                            <button onClick={() => setShowConnect(null)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                            <button onClick={handleConnect} disabled={saving} className="btn-primary text-sm py-2 px-4 disabled:opacity-40">
                                {saving ? "Connecting..." : `Connect ${showConnect.platform.label}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
