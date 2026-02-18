"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/app/components/navbar";

type ScheduledPost = {
    id: string;
    brandId: string;
    type: string;
    platform: string;
    content: string;
    status: "draft" | "approved" | "posted" | "failed";
    scheduledAt: string;
    postedAt?: string;
    output: {
        caption?: string;
        hashtags?: string[];
        imageUrl?: string;
        imagePrompt?: string;
        bestTime?: string;
        dayOfWeek?: string;
    };
};

type Brand = {
    id: string;
    name: string;
    niche: string;
    tone: string;
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_STYLES: Record<string, string> = {
    draft: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
    approved: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    posted: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    failed: "bg-red-500/20 text-red-300 border border-red-500/30",
};

export default function CalendarPage() {
    const [posts, setPosts] = useState<ScheduledPost[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
    const [weekOffset, setWeekOffset] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const getWeekDates = useCallback(() => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(now);
        monday.setDate(now.getDate() + daysToMonday + weekOffset * 7);
        monday.setHours(0, 0, 0, 0);

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            return d;
        });
    }, [weekOffset]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [postsRes, brandsRes] = await Promise.all([
                fetch("/api/calendar"),
                fetch("/api/autopilot"),
            ]);
            if (postsRes.ok) {
                const data = await postsRes.json();
                setPosts(data.posts || []);
            }
            if (brandsRes.ok) {
                const data = await brandsRes.json();
                setBrands(data.brands || []);
            }
        } catch { /* empty */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const generateWeek = async () => {
        if (brands.length === 0) {
            setError("Create a brand in Autopilot first.");
            return;
        }
        setGenerating(true);
        setError(null);
        try {
            const res = await fetch("/api/autopilot/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brandId: brands[0].id }),
            });
            if (res.ok) {
                await fetchData();
            } else {
                setError("Failed to generate content.");
            }
        } catch {
            setError("Something went wrong.");
        } finally {
            setGenerating(false);
        }
    };

    const weekDates = getWeekDates();
    const currentMonth = weekDates[0].toLocaleString("default", { month: "long" });
    const currentYear = weekDates[0].getFullYear();

    return (
        <main className="relative min-h-screen text-slate-100 font-sans pb-20">
            <Navbar />

            <div className="pt-24 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in-up">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Content Calendar</h1>
                        <p className="text-sm text-slate-400">Manage and schedule your Instagram posts.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                            <button onClick={() => setWeekOffset(prev => prev - 1)} className="p-1 px-3 hover:bg-white/10 rounded-md text-slate-300 transition">←</button>
                            <span className="px-4 py-1 text-sm font-medium text-white min-w-[140px] text-center">
                                {currentMonth} {currentYear}
                            </span>
                            <button onClick={() => setWeekOffset(prev => prev + 1)} className="p-1 px-3 hover:bg-white/10 rounded-md text-slate-300 transition">→</button>
                        </div>

                        <button
                            onClick={generateWeek}
                            disabled={generating}
                            className="btn-primary flex items-center gap-2 shadow-lg shadow-violet-500/20"
                        >
                            {generating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <span>✨</span>
                                    <span>Generate Week</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm animate-fade-in-up">
                        ⚠️ {error}
                    </div>
                )}

                {/* Calendar Grid */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 animate-fade-in-up stagger-1">
                    {weekDates.map((date, i) => {
                        const dateStr = date.toISOString().split("T")[0];
                        const dayPosts = posts.filter(p => p.scheduledAt.startsWith(dateStr));
                        const isToday = new Date().toISOString().split("T")[0] === dateStr;

                        return (
                            <div key={i} className={`glass-card min-h-[180px] flex flex-col p-3 ${isToday ? "ring-1 ring-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.2)]" : ""}`}>
                                <div className="text-center mb-3 pb-2 border-b border-white/5">
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{DAY_SHORT[i]}</div>
                                    <div className={`text-lg font-bold ${isToday ? "text-violet-400" : "text-slate-300"}`}>
                                        {date.getDate()}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-2">
                                    {dayPosts.map(post => (
                                        <div
                                            key={post.id}
                                            onClick={() => setSelectedPost(post)}
                                            className="group cursor-pointer p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
                                        >
                                            <div className="flex items-center gap-2 mb-1.5">
                                                {post.output?.imageUrl ? (
                                                    <img src={post.output.imageUrl} alt="" className="w-6 h-6 rounded object-cover ring-1 ring-white/10" />
                                                ) : (
                                                    <div className="w-6 h-6 rounded bg-violet-500/20 flex items-center justify-center text-[10px]">📸</div>
                                                )}
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${STATUS_STYLES[post.status]}`}>
                                                    {post.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed group-hover:text-slate-300 transition-colors">
                                                {post.output?.caption || post.content}
                                            </p>
                                        </div>
                                    ))}
                                    {dayPosts.length === 0 && (
                                        <div className="h-full flex items-center justify-center text-slate-600/50 text-2xl select-none">
                                            +
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Post Detail Modal */}
                {selectedPost && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto outline-none border border-white/20 shadow-2xl">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">Post Details</h3>
                                        <p className="text-xs text-slate-400">Scheduled for {new Date(selectedPost.scheduledAt).toLocaleDateString()}</p>
                                    </div>
                                    <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                                        ✕
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="aspect-square rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                                            {selectedPost.output?.imageUrl ? (
                                                <img src={selectedPost.output.imageUrl} alt="Post" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center p-6">
                                                    <div className="text-4xl mb-2">🖼️</div>
                                                    <p className="text-sm text-slate-500">Image generating...</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 transition">
                                                Regenerate Image
                                            </button>
                                            <button className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 transition">
                                                Edit Image
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Caption</label>
                                            <textarea
                                                className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 resize-none"
                                                defaultValue={selectedPost.output?.caption || ""}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Hashtags</label>
                                            <div className="p-3 bg-black/20 border border-white/10 rounded-xl text-xs text-violet-300 leading-relaxed">
                                                {(selectedPost.output?.hashtags || []).join(" ")}
                                            </div>
                                        </div>

                                        <div className="pt-4 flex gap-3">
                                            <button className="flex-1 btn-primary py-2.5 text-sm shadow-lg shadow-violet-500/10">
                                                Approve & Schedule
                                            </button>
                                            {selectedPost.status === "approved" && (
                                                <button className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                                                    ed
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
