"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

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

const PLAN = {
    name: "Free",
    postsPerWeek: 3,
    messagesPerDay: 10,
    maxBrands: 1,
};

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInstagramConnected, setIsInstagramConnected] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [dashboardRes, statusRes] = await Promise.all([
                fetch("/api/dashboard"),
                fetch("/api/instagram/status"),
            ]);

            if (dashboardRes.ok) setData(await dashboardRes.json());
            if (statusRes.ok) {
                const statusData = await statusRes.json();
                setIsInstagramConnected(statusData.connected);
            }
        } catch {
            /* empty */
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const stats = data?.stats;
    const postsUsed = stats?.weekPosts || 0;
    const postsMax = PLAN.postsPerWeek;
    const postsPercent = Math.min((postsUsed / postsMax) * 100, 100);

    return (
        <div className="min-h-screen p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
                    <p className="text-sm text-slate-500">
                        Welcome back — here&apos;s what&apos;s happening.
                    </p>
                </div>

                {/* Connect Instagram Banner */}
                {!loading && !isInstagramConnected && (
                    <div className="mb-6 p-[1px] rounded-2xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
                        <div className="bg-[#0a0a0a] rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-2xl shadow-lg">
                                    📸
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white">
                                        Connect Instagram
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        Link your Business account to enable auto-posting.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/store"
                                className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
                            >
                                Connect Now →
                            </Link>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5 h-28 animate-pulse"
                            >
                                <div className="h-6 bg-white/[0.06] rounded w-12 mb-2" />
                                <div className="h-4 bg-white/[0.04] rounded w-20" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {[
                                {
                                    icon: "📸",
                                    value: stats?.weekPosts || 0,
                                    label: "Posts this week",
                                },
                                {
                                    icon: "✅",
                                    value: stats?.weekApproved || 0,
                                    label: "Approved",
                                },
                                {
                                    icon: "🚀",
                                    value: stats?.weekPosted || 0,
                                    label: "Posted",
                                },
                                {
                                    icon: "🤖",
                                    value: stats?.totalPosts || 0,
                                    label: "All-time",
                                },
                            ].map((card, i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5"
                                >
                                    <div className="text-xl mb-2">{card.icon}</div>
                                    <div className="text-2xl font-bold text-white">
                                        {card.value}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        {card.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            {/* Usage */}
                            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-white">
                                        📊 Usage
                                    </h3>
                                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.04]">
                                        {PLAN.name} Plan
                                    </span>
                                </div>
                                <div className="mb-4">
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-xs text-slate-400">
                                            Posts this week
                                        </span>
                                        <span className="text-xs font-medium text-white">
                                            {postsUsed}/{postsMax}
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${postsPercent >= 100
                                                    ? "bg-red-500"
                                                    : postsPercent >= 70
                                                        ? "bg-amber-500"
                                                        : "bg-violet-500"
                                                }`}
                                            style={{ width: `${postsPercent}%` }}
                                        />
                                    </div>
                                </div>
                                <Link
                                    href="/pricing"
                                    className="block w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-center text-xs font-bold text-white transition-all"
                                >
                                    Upgrade Plan
                                </Link>
                            </div>

                            {/* Quick Actions */}
                            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
                                <h3 className="text-sm font-semibold text-white mb-4">
                                    ⚡ Quick Actions
                                </h3>
                                <div className="space-y-2">
                                    <Link
                                        href="/studio"
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.06] transition-all"
                                    >
                                        <span className="text-base">🎬</span>
                                        <div>
                                            <div className="text-sm font-medium text-white">
                                                Create Video
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                Generate AI video
                                            </div>
                                        </div>
                                    </Link>
                                    <Link
                                        href="/generate"
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.06] transition-all"
                                    >
                                        <span className="text-base">🖼️</span>
                                        <div>
                                            <div className="text-sm font-medium text-white">
                                                Generate Image
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                DALL-E 3 powered
                                            </div>
                                        </div>
                                    </Link>
                                    <Link
                                        href="/calendar"
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.06] transition-all"
                                    >
                                        <span className="text-base">📅</span>
                                        <div>
                                            <div className="text-sm font-medium text-white">
                                                Open Calendar
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                Schedule posts
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            {/* Brand */}
                            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
                                <h3 className="text-sm font-semibold text-white mb-4">
                                    🏪 Your Brand
                                </h3>
                                {data?.brands && data.brands.length > 0 ? (
                                    <div>
                                        <div className="text-base font-bold text-white mb-0.5">
                                            {data.brands[0].name}
                                        </div>
                                        <div className="text-xs text-slate-500 mb-3">
                                            {data.brands[0].niche}
                                        </div>
                                        <Link
                                            href="/autopilot"
                                            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                                        >
                                            Edit brand →
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-xs text-slate-500 mb-2">No brand yet</p>
                                        <Link
                                            href="/autopilot"
                                            className="text-xs text-violet-400 hover:text-violet-300 font-bold"
                                        >
                                            Create Brand →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-white">
                                    📋 Recent Activity
                                </h3>
                                <Link
                                    href="/calendar"
                                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                                >
                                    View Calendar →
                                </Link>
                            </div>
                            {!data?.recentActivity || data.recentActivity.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-3 opacity-30">📝</div>
                                    <p className="text-sm text-slate-500">
                                        No activity yet. Generate your first content!
                                    </p>
                                    <Link
                                        href="/calendar"
                                        className="mt-3 inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold"
                                    >
                                        ✨ Generate Content
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {data.recentActivity.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
                                        >
                                            {item.output?.imageUrl ? (
                                                <img
                                                    src={item.output.imageUrl}
                                                    alt=""
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-lg">
                                                    📸
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white truncate">
                                                    {item.content?.slice(0, 60)}
                                                </p>
                                                <p className="text-[10px] text-slate-500">
                                                    {new Date(item.created_at).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                            <span
                                                className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wider ${item.status === "approved"
                                                        ? "bg-emerald-500/10 text-emerald-400"
                                                        : item.status === "posted"
                                                            ? "bg-blue-500/10 text-blue-400"
                                                            : item.status === "failed"
                                                                ? "bg-red-500/10 text-red-400"
                                                                : "bg-slate-500/10 text-slate-400"
                                                    }`}
                                            >
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
        </div>
    );
}
