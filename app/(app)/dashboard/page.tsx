"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type DashboardData = {
    stats: {
        credits: number;
        maxCredits: number;
        planName: string;
        totalMessages: number;
    };
};

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const dashboardRes = await fetch("/api/dashboard");
            if (dashboardRes.ok) setData(await dashboardRes.json());
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
    const creditsUsed = (stats?.maxCredits || 100) - Math.floor(stats?.credits || 0);
    const creditsMax = stats?.maxCredits || 100;
    const creditsPercent = Math.min((creditsUsed / creditsMax) * 100, 100);

    return (
        <div className="min-h-screen p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
                    <p className="text-sm text-slate-500">
                        Welcome back — here&apos;s your current account status.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
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
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            {[
                                {
                                    icon: "💰",
                                    value: Math.floor(stats?.credits || 0),
                                    label: "Credits Available",
                                },
                                {
                                    icon: "🤖",
                                    value: stats?.totalMessages || 0,
                                    label: "Assistant Messages",
                                },
                                {
                                    icon: "⭐",
                                    value: stats?.planName || "Free",
                                    label: "Current Plan",
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Usage */}
                            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-white">
                                        📊 Usage
                                    </h3>
                                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.04]">
                                        {stats?.planName || "Free"} Plan
                                    </span>
                                </div>
                                <div className="mb-4">
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-xs text-slate-400">
                                            Credits used
                                        </span>
                                        <span className="text-xs font-medium text-white">
                                            {creditsUsed}/{creditsMax}
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${creditsPercent >= 100
                                                ? "bg-red-500"
                                                : creditsPercent >= 70
                                                    ? "bg-amber-500"
                                                    : "bg-cyan-500"
                                                }`}
                                            style={{ width: `${creditsPercent}%` }}
                                        />
                                    </div>
                                </div>
                                <Link
                                    href="/pricing"
                                    className="block w-full py-2 rounded-xl bg-[white]/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-center text-xs font-bold text-white transition-all"
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
                                                DALL-E 3 & FLUX
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
