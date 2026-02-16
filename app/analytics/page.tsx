"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/app/components/navbar";

type Stats = {
    totalCampaigns: number;
    totalGenerations: number;
    totalAgents: number;
    platformBreakdown: { instagram: number; googleAds: number };
    recentCampaigns: { id: string; productName: string; platform: string; createdAt: number; contentCount: number }[];
    recentAgents: { id: string; name: string; builtIn: boolean }[];
};

export default function AnalyticsPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const [campaignsRes, agentsRes] = await Promise.all([
                fetch("/api/campaigns"),
                fetch("/api/agents"),
            ]);
            if (!campaignsRes.ok || !agentsRes.ok) throw new Error("Failed to load data.");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const campaigns: any[] = await campaignsRes.json();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const agents: any[] = await agentsRes.json();

            const totalGenerations = campaigns.reduce((sum: number, c: { contents?: unknown[] }) => sum + (c.contents?.length || 0), 0);
            const instagram = campaigns.filter((c: { platform: string }) => c.platform === "instagram").length;

            setStats({
                totalCampaigns: campaigns.length,
                totalGenerations,
                totalAgents: agents.length,
                platformBreakdown: { instagram, googleAds: campaigns.length - instagram },
                recentCampaigns: campaigns.slice(0, 5).map((c: { id: string; productName: string; platform: string; createdAt: number; contents?: unknown[] }) => ({
                    id: c.id, productName: c.productName, platform: c.platform, createdAt: c.createdAt, contentCount: c.contents?.length || 0,
                })),
                recentAgents: agents.slice(0, 5).map((a: { id: string; name: string; builtIn: boolean }) => ({ id: a.id, name: a.name, builtIn: a.builtIn })),
            });
        } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const statCards = stats ? [
        { label: "Campaigns", value: stats.totalCampaigns, icon: "📣", color: "violet" },
        { label: "Generations", value: stats.totalGenerations, icon: "⚡", color: "blue" },
        { label: "AI Agents", value: stats.totalAgents, icon: "🤖", color: "emerald" },
        { label: "Instagram", value: stats.platformBreakdown.instagram, icon: "📸", color: "pink" },
        { label: "Google Ads", value: stats.platformBreakdown.googleAds, icon: "🔍", color: "amber" },
    ] : [];

    return (
        <main className="relative min-h-screen overflow-hidden">
            <div className="orb-bg" aria-hidden="true"><div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" /></div>
            <Navbar />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
                <div className="animate-fade-in-up mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-sm text-slate-500">Your usage overview and activity.</p>
                </div>

                {error && <div className="mb-6 p-3 glass-card border-red-200 text-red-500 text-sm">{error}</div>}

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="glass-card p-5"><div className="h-8 skeleton w-1/2 mb-2" /><div className="h-4 skeleton w-2/3" /></div>)}
                    </div>
                ) : stats && (
                    <>
                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                            {statCards.map((s, i) => (
                                <div key={s.label} className={`glass-card p-5 animate-fade-in-up stagger-${Math.min(i + 1, 4)}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">{s.icon}</span>
                                        <span className="text-[10px] uppercase tracking-widest text-slate-400">{s.label}</span>
                                    </div>
                                    <div className={`text-2xl font-bold ${s.color === "violet" ? "text-violet-600" :
                                            s.color === "blue" ? "text-blue-600" :
                                                s.color === "emerald" ? "text-emerald-600" :
                                                    s.color === "pink" ? "text-pink-500" :
                                                        "text-amber-500"
                                        }`}>{s.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Platform Distribution */}
                        {stats.totalCampaigns > 0 && (
                            <div className="glass-card p-5 mb-6 animate-fade-in-up">
                                <h3 className="text-sm font-semibold mb-3">Platform Distribution</h3>
                                <div className="flex gap-2 items-center">
                                    <div className="flex-1 h-4 rounded-full bg-slate-100 overflow-hidden">
                                        {stats.totalCampaigns > 0 && (
                                            <>
                                                <div
                                                    className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-l-full float-left"
                                                    style={{ width: `${(stats.platformBreakdown.instagram / stats.totalCampaigns) * 100}%` }}
                                                />
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-r-full float-left"
                                                    style={{ width: `${(stats.platformBreakdown.googleAds / stats.totalCampaigns) * 100}%` }}
                                                />
                                            </>
                                        )}
                                    </div>
                                    <div className="flex gap-3 text-[10px] text-slate-400 shrink-0">
                                        <span><span className="inline-block w-2 h-2 rounded-full bg-pink-400 mr-1" />Instagram</span>
                                        <span><span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1" />Google Ads</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-card p-5 animate-fade-in-up">
                                <h3 className="text-sm font-semibold mb-3">Recent Campaigns</h3>
                                {stats.recentCampaigns.length === 0 ? (
                                    <p className="text-xs text-slate-400">No campaigns yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {stats.recentCampaigns.map(c => (
                                            <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50">
                                                <div>
                                                    <span className="text-xs font-medium">{c.productName}</span>
                                                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${c.platform === "instagram" ? "bg-pink-50 text-pink-400" : "bg-blue-50 text-blue-400"}`}>
                                                        {c.platform === "instagram" ? "📸" : "🔍"}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-slate-400">{c.contentCount} gen{c.contentCount !== 1 ? "s" : ""}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="glass-card p-5 animate-fade-in-up">
                                <h3 className="text-sm font-semibold mb-3">Your Agents</h3>
                                {stats.recentAgents.length === 0 ? (
                                    <p className="text-xs text-slate-400">No agents yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {stats.recentAgents.map(a => (
                                            <div key={a.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/50">
                                                <span className="text-xs font-medium">{a.name}</span>
                                                {a.builtIn && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400">Built-in</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
