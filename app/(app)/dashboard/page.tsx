"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    Sparkles,
    Coins,
    MessageSquare,
    Crown,
    WandSparkles,
    ImagePlus,
    Video,
    Scaling,
    Palette,
    ArrowRight,
    Send,
    Search,
    Bot,
    Library,
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
    const planName = stats?.planName || "Free";

    const quickActions = [
        {
            href: "/generate",
            icon: ImagePlus,
            label: "Image",
        },
        {
            href: "/studio",
            icon: Video,
            label: "Video",
        },
        {
            href: "/director",
            icon: WandSparkles,
            label: "Blueprints",
        },
        {
            href: "/generate",
            icon: Scaling,
            label: "Upscaler",
        },
        {
            href: "/director",
            icon: Palette,
            label: "Canvas",
        },
        {
            href: "/assistant",
            icon: Bot,
            label: "Draw",
        },
    ];

    const featuredBlueprints = [
        {
            title: "Consistent Character",
            subtitle: "Keep the same identity in every frame",
            href: "/director",
        },
        {
            title: "Product Photography",
            subtitle: "Studio quality product scenes in seconds",
            href: "/generate",
        },
        {
            title: "Instant Ads",
            subtitle: "Generate social ad packs for mobile feeds",
            href: "/studio",
        },
        {
            title: "Fashion Editorial",
            subtitle: "Creative campaigns with cinematic style",
            href: "/generate",
        },
    ];

    return (
        <div className="flex-1 p-0 md:p-3 w-full">
            <div className="relative overflow-hidden border-y md:border border-white/[0.08] md:rounded-3xl min-h-[340px] md:min-h-[420px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.35),transparent_38%),radial-gradient(circle_at_75%_18%,rgba(20,184,166,0.3),transparent_33%),linear-gradient(170deg,#1a1d21_0%,#101113_55%,#070709_100%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black" />

                <div className="relative z-10 px-5 md:px-10 pt-8 md:pt-14 pb-8 md:pb-12">
                    <p className="text-white/60 text-xs uppercase tracking-[0.24em] mb-4 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        Create
                    </p>
                    <h1 className="text-4xl md:text-7xl leading-[0.92] font-black tracking-tight text-white max-w-5xl">
                        YOURS TO CREATE
                    </h1>

                    <div className="mt-8 md:mt-12 max-w-5xl bg-[#111215]/85 border border-white/10 rounded-3xl p-3 md:p-4 backdrop-blur-xl shadow-2xl shadow-black/40">
                        <div className="flex items-center gap-2 md:gap-3">
                            <button className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-white/70">
                                <ImagePlus className="w-4 h-4" />
                            </button>
                            <div className="flex-1 h-10 rounded-2xl bg-transparent text-white/80 flex items-center text-base md:text-2xl font-medium">
                                Type a prompt...
                            </div>
                            <button className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-white/70">
                                <Search className="w-4 h-4" />
                            </button>
                            <Link href="/generate" className="h-10 px-5 md:px-8 rounded-2xl bg-white/10 border border-white/10 text-white/60 hover:text-white hover:bg-white/15 transition-all inline-flex items-center gap-2 font-bold">
                                Generate
                                <Send className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <Link
                                        key={action.label}
                                        href={action.href}
                                        className="shrink-0 px-4 py-2 rounded-full border border-white/15 bg-black/30 hover:bg-white/10 text-white/90 text-sm font-medium inline-flex items-center gap-2 transition-colors"
                                    >
                                        <Icon className="w-4 h-4 text-white/70" />
                                        {action.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 md:px-8 pt-8 md:pt-10 pb-8 space-y-8">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 rounded-2xl bg-white/[0.04] border border-white/[0.08] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="rounded-2xl bg-[#101216] border border-white/[0.08] p-4">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45 flex items-center gap-2">
                                    <Coins className="w-3.5 h-3.5" /> Credits
                                </p>
                                <p className="text-3xl font-black mt-2 tabular-nums text-white">{creditsAvailable}</p>
                            </div>
                            <div className="rounded-2xl bg-[#101216] border border-white/[0.08] p-4">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45 flex items-center gap-2">
                                    <MessageSquare className="w-3.5 h-3.5" /> Messages
                                </p>
                                <p className="text-3xl font-black mt-2 tabular-nums text-white">{stats?.totalMessages || 0}</p>
                            </div>
                            <div className="rounded-2xl bg-[#101216] border border-white/[0.08] p-4">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45 flex items-center gap-2">
                                    <Crown className="w-3.5 h-3.5" /> Plan
                                </p>
                                <p className="text-3xl font-black mt-2 text-white">{planName}</p>
                            </div>
                        </div>

                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-3xl font-black tracking-tight text-white">Featured Blueprints</h2>
                                <Link href="/director" className="text-white/70 hover:text-white text-base inline-flex items-center gap-2">
                                    View More <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                                {featuredBlueprints.map((item, index) => (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        className="group min-h-[190px] rounded-3xl border border-white/10 p-5 flex flex-col justify-end relative overflow-hidden bg-[#121419]"
                                    >
                                        <div className={`absolute inset-0 opacity-80 ${index % 4 === 0
                                            ? "bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.4),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(249,115,22,0.3),transparent_35%)]"
                                            : index % 4 === 1
                                                ? "bg-[radial-gradient(circle_at_70%_15%,rgba(16,185,129,0.35),transparent_45%),radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.28),transparent_38%)]"
                                                : index % 4 === 2
                                                    ? "bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.33),transparent_42%),radial-gradient(circle_at_15%_75%,rgba(56,189,248,0.28),transparent_40%)]"
                                                    : "bg-[radial-gradient(circle_at_20%_25%,rgba(251,191,36,0.3),transparent_42%),radial-gradient(circle_at_82%_80%,rgba(20,184,166,0.25),transparent_38%)]"
                                            }`} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                                        <div className="relative z-10">
                                            <h3 className="text-2xl leading-[1.02] font-black text-white max-w-[14ch]">{item.title}</h3>
                                            <p className="text-white/70 text-sm mt-2 max-w-[22ch]">{item.subtitle}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#101216] p-4">
                            <div className="flex items-center gap-3">
                                <Library className="w-4 h-4 text-white/70" />
                                <p className="text-white/80 text-sm">Usage: {creditsUsed} / {creditsMax} credits used this cycle.</p>
                            </div>
                            <Link href="/pricing" className="text-sm text-sky-300 hover:text-sky-200 font-semibold">
                                {planName === "Free" ? "Upgrade" : "Manage"}
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
