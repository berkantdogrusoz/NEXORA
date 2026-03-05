"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    Coins,
    MessageSquare,
    Crown,
    BarChart3,
    Zap,
    Clapperboard,
    ImagePlus,
    Film,
    Bot,
    ChevronRight,
    ArrowUpRight,
} from "lucide-react";

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
    const creditsAvailable = Math.floor(stats?.credits || 0);
    const creditsMax = stats?.maxCredits || 50;
    const creditsUsed = creditsMax - creditsAvailable;
    const creditsPercent = Math.min((creditsUsed / creditsMax) * 100, 100);
    const planName = stats?.planName || "Free";

    const quickActions = [
        {
            href: "/studio",
            icon: Clapperboard,
            label: "Video Studio",
            desc: "Kling 3.0, Luma, Runway",
            accent: "cyan",
        },
        {
            href: "/generate",
            icon: ImagePlus,
            label: "Image Gen",
            desc: "DALL-E 3, FLUX, Recraft",
            accent: "blue",
        },
        {
            href: "/director",
            icon: Film,
            label: "Director Studio",
            desc: "Higgsfield AI Cinema",
            accent: "violet",
        },
        {
            href: "/assistant",
            icon: Bot,
            label: "AI Assistant",
            desc: "GPT-4o, Gemini 2.5",
            accent: "amber",
        },
    ];

    return (
        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tight">
                    <LayoutDashboard className="w-8 h-8 text-cyan-500" />
                    Dashboard
                </h1>
                <p className="text-white/40 mt-2 text-sm font-medium tracking-wide uppercase">
                    Account Overview & Quick Actions
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-[#0a0a0a] border border-white/[0.06] border-t-2 border-t-cyan-500/30 rounded-sm p-5 h-28 animate-pulse"
                        >
                            <div className="h-4 bg-white/[0.06] rounded-sm w-20 mb-3" />
                            <div className="h-7 bg-white/[0.04] rounded-sm w-16" />
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {/* Credits Card */}
                        <div className="bg-[#0a0a0a] border border-white/[0.06] border-t-2 border-t-cyan-500/60 rounded-sm p-5 group hover:border-t-cyan-400 transition-all">
                            <div className="flex items-center gap-2 mb-4">
                                <Coins className="w-4 h-4 text-cyan-400" />
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                                    Credits Available
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-white tabular-nums">
                                    {creditsAvailable}
                                </span>
                                <span className="text-xs text-white/20 font-medium">/ {creditsMax}</span>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-4 w-full h-1 bg-white/[0.06] rounded-sm overflow-hidden">
                                <div
                                    className={`h-full rounded-sm transition-all duration-700 ${creditsPercent >= 90
                                        ? "bg-red-500"
                                        : creditsPercent >= 60
                                            ? "bg-amber-500"
                                            : "bg-gradient-to-r from-cyan-500 to-cyan-400"
                                        }`}
                                    style={{ width: `${Math.max(100 - creditsPercent, 2)}%` }}
                                />
                            </div>
                        </div>

                        {/* Messages Card */}
                        <div className="bg-[#0a0a0a] border border-white/[0.06] border-t-2 border-t-blue-500/60 rounded-sm p-5 group hover:border-t-blue-400 transition-all">
                            <div className="flex items-center gap-2 mb-4">
                                <MessageSquare className="w-4 h-4 text-blue-400" />
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                                    Assistant Messages
                                </span>
                            </div>
                            <span className="text-4xl font-black text-white tabular-nums">
                                {stats?.totalMessages || 0}
                            </span>
                        </div>

                        {/* Plan Card */}
                        <div className="bg-[#0a0a0a] border border-white/[0.06] border-t-2 border-t-amber-500/60 rounded-sm p-5 group hover:border-t-amber-400 transition-all">
                            <div className="flex items-center gap-2 mb-4">
                                <Crown className="w-4 h-4 text-amber-400" />
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                                    Current Plan
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-black text-white">
                                    {planName}
                                </span>
                                {planName === "Free" && (
                                    <Link
                                        href="/pricing"
                                        className="text-[9px] px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-sm font-bold uppercase tracking-wider hover:bg-cyan-500/20 transition-colors"
                                    >
                                        Upgrade
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Usage + Quick Actions Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Usage Panel */}
                        <div className="bg-[#0a0a0a] border border-white/[0.06] border-t-2 border-t-cyan-500/60 rounded-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                                    <h3 className="text-xs font-bold text-white/80 uppercase tracking-[0.15em]">
                                        Usage
                                    </h3>
                                </div>
                                <span className="text-[10px] px-2.5 py-1 bg-white/[0.04] text-white/50 border border-white/[0.06] rounded-sm font-bold uppercase tracking-wider">
                                    {planName} Plan
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium">
                                            Credits consumed
                                        </span>
                                        <span className="text-[11px] font-bold text-white tabular-nums">
                                            {creditsUsed} <span className="text-white/30">/ {creditsMax}</span>
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-white/[0.04] rounded-sm overflow-hidden">
                                        <div
                                            className={`h-full rounded-sm transition-all duration-700 ${creditsPercent >= 90
                                                ? "bg-gradient-to-r from-red-600 to-red-500"
                                                : creditsPercent >= 60
                                                    ? "bg-gradient-to-r from-amber-600 to-amber-500"
                                                    : "bg-gradient-to-r from-cyan-600 to-cyan-400"
                                                }`}
                                            style={{ width: `${creditsPercent}%` }}
                                        />
                                    </div>
                                </div>

                                {creditsPercent >= 80 && (
                                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-sm p-3 flex items-center gap-3">
                                        <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                        <p className="text-[11px] text-amber-400/80">
                                            Running low on credits — upgrade or purchase a credit pack.
                                        </p>
                                    </div>
                                )}

                                <Link
                                    href="/pricing"
                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-sm bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-xs font-bold uppercase tracking-[0.15em] transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/10 mt-2"
                                >
                                    <Zap className="w-3.5 h-3.5" />
                                    {planName === "Free" ? "Upgrade Plan" : "Buy Credits"}
                                </Link>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-[#0a0a0a] border border-white/[0.06] border-t-2 border-t-cyan-500/60 rounded-sm p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Zap className="w-4 h-4 text-cyan-400" />
                                <h3 className="text-xs font-bold text-white/80 uppercase tracking-[0.15em]">
                                    Quick Actions
                                </h3>
                            </div>

                            <div className="space-y-2">
                                {quickActions.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <Link
                                            key={action.href}
                                            href={action.href}
                                            className="group flex items-center gap-4 p-3.5 rounded-sm bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-cyan-500/20 transition-all"
                                        >
                                            <div className="w-9 h-9 rounded-sm bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all">
                                                <Icon className="w-4 h-4 text-cyan-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[12px] font-bold text-white uppercase tracking-wider">
                                                    {action.label}
                                                </div>
                                                <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">
                                                    {action.desc}
                                                </div>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-cyan-400 transition-colors" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
