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

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/dashboard");
            if (res.ok) setData(await res.json());
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
        <main className="relative min-h-screen overflow-hidden">
            <div className="orb-bg" aria-hidden="true"><div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" /></div>
            <Navbar />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-2xl font-bold tracking-tight">Welcome back 👋</h1>
                    <p className="text-sm text-slate-500">Here&apos;s what&apos;s happening with your Instagram marketing.</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="glass-card p-5"><div className="h-8 skeleton w-16 mb-2" /><div className="h-4 skeleton w-24" /></div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* ═══ STATS CARDS ═══ */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in-up stagger-1">
                            <div className="glass-card p-5">
                                <div className="text-2xl mb-1">📸</div>
                                <div className="text-2xl font-bold">{stats?.weekPosts || 0}</div>
                                <div className="text-xs text-slate-400">Posts this week</div>
                            </div>
                            <div className="glass-card p-5">
                                <div className="text-2xl mb-1">✅</div>
                                <div className="text-2xl font-bold">{stats?.weekApproved || 0}</div>
                                <div className="text-xs text-slate-400">Approved</div>
                            </div>
                            <div className="glass-card p-5">
                                <div className="text-2xl mb-1">🚀</div>
                                <div className="text-2xl font-bold">{stats?.weekPosted || 0}</div>
                                <div className="text-xs text-slate-400">Posted</div>
                            </div>
                            <div className="glass-card p-5">
                                <div className="text-2xl mb-1">🤖</div>
                                <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
                                <div className="text-xs text-slate-400">All-time posts</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {/* ═══ USAGE METER ═══ */}
                            <div className="glass-card p-5 animate-fade-in-up stagger-2">
                                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                    📊 Usage
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{PLAN.name} Plan</span>
                                </h3>

                                {/* Posts meter */}
                                <div className="mb-4">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-xs text-slate-500">Posts this week</span>
                                        <span className="text-xs font-medium">{postsUsed}/{postsMax}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500 ${postsPercent >= 100 ? "bg-red-400" : postsPercent >= 70 ? "bg-amber-400" : "bg-violet-500"}`}
                                            style={{ width: `${postsPercent}%` }} />
                                    </div>
                                    {postsPercent >= 100 && (
                                        <p className="text-[10px] text-red-400 mt-1">Limit reached! Upgrade to Growth for 7 posts/week →</p>
                                    )}
                                </div>

                                {/* Messages meter */}
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-xs text-slate-500">AI messages today</span>
                                        <span className="text-xs font-medium">{msgsUsed}/{msgsMax}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500 ${msgsPercent >= 100 ? "bg-red-400" : msgsPercent >= 70 ? "bg-amber-400" : "bg-emerald-500"}`}
                                            style={{ width: `${msgsPercent}%` }} />
                                    </div>
                                </div>

                                <Link href="/pricing" className="mt-4 block text-xs text-center text-violet-600 hover:text-violet-700 font-medium">
                                    Upgrade for more →
                                </Link>
                            </div>

                            {/* ═══ QUICK ACTIONS ═══ */}
                            <div className="glass-card p-5 animate-fade-in-up stagger-3">
                                <h3 className="text-sm font-semibold mb-4">⚡ Quick Actions</h3>
                                <div className="space-y-2">
                                    {(stats?.totalBrands || 0) === 0 ? (
                                        <Link href="/autopilot" className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 hover:border-violet-300 transition-all group">
                                            <span className="text-lg">🎯</span>
                                            <div>
                                                <div className="text-sm font-medium text-violet-700">Set Up Your Brand</div>
                                                <div className="text-[10px] text-violet-400">First step — tell Nexora about your business</div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <Link href="/calendar" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-violet-50 border border-transparent hover:border-violet-200 transition-all">
                                            <span className="text-lg">✨</span>
                                            <div>
                                                <div className="text-sm font-medium">Generate This Week</div>
                                                <div className="text-[10px] text-slate-400">Create 7 posts with AI images</div>
                                            </div>
                                        </Link>
                                    )}

                                    <Link href="/calendar" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-violet-50 border border-transparent hover:border-violet-200 transition-all">
                                        <span className="text-lg">📅</span>
                                        <div>
                                            <div className="text-sm font-medium">Open Calendar</div>
                                            <div className="text-[10px] text-slate-400">Review and approve posts</div>
                                        </div>
                                    </Link>

                                    <Link href="/assistant" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-violet-50 border border-transparent hover:border-violet-200 transition-all">
                                        <span className="text-lg">🤖</span>
                                        <div>
                                            <div className="text-sm font-medium">Chat with AI</div>
                                            <div className="text-[10px] text-slate-400">Get marketing advice</div>
                                        </div>
                                    </Link>

                                    <Link href="/store" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-violet-50 border border-transparent hover:border-violet-200 transition-all">
                                        <span className="text-lg">🔗</span>
                                        <div>
                                            <div className="text-sm font-medium">Connect Instagram</div>
                                            <div className="text-[10px] text-slate-400">Enable auto-posting</div>
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            {/* ═══ STREAK & BRAND ═══ */}
                            <div className="space-y-4 animate-fade-in-up stagger-4">
                                {/* Streak */}
                                <div className="glass-card p-5">
                                    <h3 className="text-sm font-semibold mb-3">🔥 Streak</h3>
                                    <div className="flex items-end gap-1">
                                        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => {
                                            const hasPost = (data?.recentActivity || []).length > i;
                                            return (
                                                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                                    <div className={`w-full h-8 rounded-lg ${hasPost ? "bg-gradient-to-t from-violet-500 to-violet-400" : "bg-slate-100"}`} />
                                                    <span className="text-[9px] text-slate-400">{day}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 text-center">
                                        Approve posts daily to keep your streak! 🎯
                                    </p>
                                </div>

                                {/* Current Brand */}
                                <div className="glass-card p-5">
                                    <h3 className="text-sm font-semibold mb-2">🏪 Your Brand</h3>
                                    {data?.brands && data.brands.length > 0 ? (
                                        <div>
                                            <div className="text-sm font-bold text-violet-700">{data.brands[0].name}</div>
                                            <div className="text-[10px] text-slate-400">{data.brands[0].niche}</div>
                                            <Link href="/autopilot" className="text-[10px] text-violet-500 hover:text-violet-700 mt-1 inline-block">Edit brand →</Link>
                                        </div>
                                    ) : (
                                        <div className="text-center py-2">
                                            <p className="text-xs text-slate-400 mb-2">No brand yet</p>
                                            <Link href="/autopilot" className="text-xs text-violet-600 font-medium">Create Brand →</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ═══ RECENT ACTIVITY ═══ */}
                        <div className="glass-card p-5 animate-fade-in-up stagger-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold">📋 Recent Activity</h3>
                                <Link href="/calendar" className="text-xs text-violet-600 hover:text-violet-700">View Calendar →</Link>
                            </div>
                            {(!data?.recentActivity || data.recentActivity.length === 0) ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">📝</div>
                                    <p className="text-sm text-slate-400">No activity yet. Generate your first week of content!</p>
                                    <Link href="/calendar" className="mt-3 inline-block btn-primary text-sm py-2 px-4">
                                        ✨ Generate Content
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {data.recentActivity.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                            {item.output?.imageUrl ? (
                                                <img src={item.output.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-lg">📸</div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-slate-600 truncate">{item.content?.slice(0, 80)}</p>
                                                <p className="text-[10px] text-slate-400">
                                                    {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full shrink-0 ${item.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                                                    item.status === "posted" ? "bg-blue-50 text-blue-600" :
                                                        item.status === "failed" ? "bg-red-50 text-red-500" :
                                                            "bg-slate-100 text-slate-500"
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
