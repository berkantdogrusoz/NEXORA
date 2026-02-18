"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/navbar";

type DashboardData = {
    stats: {
        totalBrands: number;
        totalPosts: number;
        weekPosts: number;
        weekApproved: number;
        weekPosted: number;
        weekDraft: number;
        todayMessages: number;
    };
    brands: { id: string; name: string; niche: string; status: string }[];
    recentActivity: {
        id: string;
        type: string;
        platform: string;
        content: string;
        status: string;
        created_at: string;
        output?: { imageUrl?: string };
    }[];
};

const PLAN = { name: "Starter", postsPerWeek: 3, messagesPerDay: 10, maxBrands: 1 }; // Free plan limits

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInstagramConnected, setIsInstagramConnected] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [dashboardRes, statusRes] = await Promise.all([
                fetch("/api/dashboard"),
                fetch("/api/instagram/status")
            ]);

            if (dashboardRes.ok) setData(await dashboardRes.json());
            if (statusRes.ok) {
                const statusData = await statusRes.json();
                setIsInstagramConnected(statusData.connected);
            }
        } catch { /* empty */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const stats = data?.stats;
    const postsUsed = stats?.weekPosts || 0;
    const postsMax = PLAN.postsPerWeek;
    const postsPercent = Math.min((postsUsed / postsMax) * 100, 100);
    const msgsUsed = stats?.todayMessages || 0;
    const msgsMax = PLAN.messagesPerDay;
    const msgsPercent = Math.min((msgsUsed / msgsMax) * 100, 100);

    return (
        <main className="relative min-h-screen font-sans pb-20 text-slate-100">
            <Navbar />

            <div className="pt-24 px-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back 👋</h1>
                    <p className="text-sm text-slate-400">Here's what's happening with your Instagram marketing.</p>
                </div>

                {/* 🚨 CONNECT INSTAGRAM BANNER (Visible if not connected) 🚨 */}
                {!loading && !isInstagramConnected && (
                    <div className="mb-8 p-1 rounded-2xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-fade-in-up shadow-2xl shadow-pink-500/20">
                        <div className="bg-black/90 backdrop-blur-xl rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-3xl shadow-lg shadow-pink-500/30 shrink-0">
                                    📸
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">Connect Your Instagram</h2>
                                    <p className="text-slate-300 text-sm max-w-lg">
                                        To start using Autopilot and auto-posting, you need to link your Instagram Business account. It takes 10 seconds.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/store"
                                className="whitespace-nowrap px-8 py-3 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-xl"
                            >
                                Connect Now →
                            </Link>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="glass-card p-5 h-32 flex flex-col justify-center animate-pulse bg-white/5">
                                <div className="h-8 bg-white/10 rounded w-12 mb-2" />
                                <div className="h-4 bg-white/5 rounded w-20" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* ═══ STATS CARDS ═══ */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in-up stagger-1">
                            <div className="glass-card p-6">
                                <div className="text-2xl mb-2">📸</div>
                                <div className="text-3xl font-bold text-white">{stats?.weekPosts || 0}</div>
                                <div className="text-xs text-slate-400 mt-1">Posts this week</div>
                            </div>
                            <div className="glass-card p-6">
                                <div className="text-2xl mb-2">✅</div>
                                <div className="text-3xl font-bold text-white">{stats?.weekApproved || 0}</div>
                                <div className="text-xs text-slate-400 mt-1">Approved</div>
                            </div>
                            <div className="glass-card p-6">
                                <div className="text-2xl mb-2">🚀</div>
                                <div className="text-3xl font-bold text-white">{stats?.weekPosted || 0}</div>
                                <div className="text-xs text-slate-400 mt-1">Posted</div>
                            </div>
                            <div className="glass-card p-6">
                                <div className="text-2xl mb-2">🤖</div>
                                <div className="text-3xl font-bold text-white">{stats?.totalPosts || 0}</div>
                                <div className="text-xs text-slate-400 mt-1">All-time posts</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* ═══ USAGE METER ═══ */}
                            <div className="glass-card p-6 animate-fade-in-up stagger-2">
                                <h3 className="text-sm font-bold text-white mb-6 flex items-center justify-between">
                                    <span>📊 Usage</span>
                                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-slate-300 border border-white/5">{PLAN.name} Plan</span>
                                </h3>

                                {/* Posts meter */}
                                <div className="mb-6">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs text-slate-400">Posts this week</span>
                                        <span className="text-xs font-medium text-slate-200">{postsUsed}/{postsMax}</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(139,92,246,0.3)] ${postsPercent >= 100 ? "bg-red-500" : postsPercent >= 70 ? "bg-amber-500" : "bg-violet-500"}`}
                                            style={{ width: `${postsPercent}%` }} />
                                    </div>
                                    {postsPercent >= 100 && (
                                        <p className="text-[10px] text-red-400 mt-2 flex items-center gap-1">
                                            <span>⚠️</span> Limit reached! Upgrade to Growth
                                        </p>
                                    )}
                                </div>

                                {/* Messages meter */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs text-slate-400">AI messages today</span>
                                        <span className="text-xs font-medium text-slate-200">{msgsUsed}/{msgsMax}</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] ${msgsPercent >= 100 ? "bg-red-500" : msgsPercent >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                                            style={{ width: `${msgsPercent}%` }} />
                                    </div>
                                </div>

                                <Link href="/pricing" className="mt-6 block w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-center text-xs font-bold text-white transition-all">
                                    Upgrade Plan
                                </Link>
                            </div>

                            {/* ═══ QUICK ACTIONS ═══ */}
                            <div className="glass-card p-6 animate-fade-in-up stagger-3">
                                <h3 className="text-sm font-bold text-white mb-4">⚡ Quick Actions</h3>
                                <div className="space-y-3">
                                    {(stats?.totalBrands || 0) === 0 ? (
                                        <Link href="/autopilot" className="flex items-center gap-3 p-3 rounded-xl bg-violet-600/10 border border-violet-500/20 hover:bg-violet-600/20 hover:border-violet-500/40 transition-all group">
                                            <span className="text-lg">🎯</span>
                                            <div>
                                                <div className="text-sm font-bold text-violet-200 group-hover:text-white transition-colors">Set Up Your Brand</div>
                                                <div className="text-[10px] text-violet-400">First step — tell Nexora about your business</div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <Link href="/calendar" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all group">
                                            <span className="text-lg">✨</span>
                                            <div>
                                                <div className="text-sm font-bold text-slate-200 group-hover:text-white">Generate This Week</div>
                                                <div className="text-[10px] text-slate-400">Create 7 posts with AI images</div>
                                            </div>
                                        </Link>
                                    )}

                                    <Link href="/calendar" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all group">
                                        <span className="text-lg">📅</span>
                                        <div>
                                            <div className="text-sm font-bold text-slate-200 group-hover:text-white">Open Calendar</div>
                                            <div className="text-[10px] text-slate-400">Review and approve posts</div>
                                        </div>
                                    </Link>

                                    <Link href="/assistant" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all group">
                                        <span className="text-lg">🤖</span>
                                        <div>
                                            <div className="text-sm font-bold text-slate-200 group-hover:text-white">Chat with AI</div>
                                            <div className="text-[10px] text-slate-400">Get marketing advice</div>
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            {/* ═══ STREAK & BRAND ═══ */}
                            <div className="space-y-4 animate-fade-in-up stagger-4">
                                {/* Streak */}
                                <div className="glass-card p-6">
                                    <h3 className="text-sm font-bold text-white mb-4">🔥 Streak</h3>
                                    <div className="flex items-end gap-1 mb-2">
                                        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => {
                                            const hasPost = (data?.recentActivity || []).length > i;
                                            return (
                                                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                                    <div className={`w-full h-10 rounded-lg transition-all ${hasPost ? "bg-gradient-to-t from-violet-600 to-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.3)]" : "bg-white/5"}`} />
                                                    <span className="text-[9px] text-slate-500">{day}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Current Brand */}
                                <div className="glass-card p-6">
                                    <h3 className="text-sm font-bold text-white mb-3">🏪 Your Brand</h3>
                                    {data?.brands && data.brands.length > 0 ? (
                                        <div>
                                            <div className="text-sm font-bold text-white mb-0.5">{data.brands[0].name}</div>
                                            <div className="text-[10px] text-slate-400">{data.brands[0].niche}</div>
                                            <Link href="/autopilot" className="text-[10px] text-violet-400 hover:text-violet-300 mt-2 inline-block transition-colors">Edit brand →</Link>
                                        </div>
                                    ) : (
                                        <div className="text-center py-2">
                                            <p className="text-xs text-slate-400 mb-2">No brand yet</p>
                                            <Link href="/autopilot" className="text-xs text-violet-400 hover:text-violet-300 font-bold">Create Brand →</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ═══ RECENT ACTIVITY ═══ */}
                        <div className="glass-card p-6 animate-fade-in-up stagger-5">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold text-white">📋 Recent Activity</h3>
                                <Link href="/calendar" className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium">View Calendar →</Link>
                            </div>
                            {(!data?.recentActivity || data.recentActivity.length === 0) ? (
                                <div className="text-center py-10">
                                    <div className="text-4xl mb-3 opacity-50 grayscale">📝</div>
                                    <p className="text-sm text-slate-400">No activity yet. Generate your first week of content!</p>
                                    <Link href="/calendar" className="mt-4 inline-block btn-primary text-sm py-2 px-4 shadow-lg shadow-violet-500/20">
                                        ✨ Generate Content
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {data.recentActivity.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
                                            {item.output?.imageUrl ? (
                                                <img src={item.output.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover ring-1 ring-white/10" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-lg text-violet-300 ring-1 ring-white/10">📸</div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-200 truncate font-medium">{item.content?.slice(0, 80)}</p>
                                                <p className="text-[10px] text-slate-500">
                                                    {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${item.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    item.status === "posted" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                        item.status === "failed" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                            "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
