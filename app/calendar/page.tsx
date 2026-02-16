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
    draft: "bg-slate-100 text-slate-500",
    approved: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    posted: "bg-blue-50 text-blue-600 border border-blue-200",
    failed: "bg-red-50 text-red-500 border border-red-200",
};

export default function CalendarPage() {
    const [posts, setPosts] = useState<ScheduledPost[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
    const [weekOffset, setWeekOffset] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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
                body: JSON.stringify({
                    brandId: brands[0].id,
                    count: 7,
                    generateImages: true,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.error || "Generation failed.");
            }
            setSuccess("Week generated! 🎉 Content with images ready for review.");
            setTimeout(() => setSuccess(null), 4000);
            await fetchData();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed.");
        }
        finally { setGenerating(false); }
    };

    const updatePostStatus = async (postId: string, status: "approved" | "draft") => {
        try {
            await fetch("/api/calendar", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId, status }),
            });
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, status } : p));
            if (selectedPost?.id === postId) {
                setSelectedPost({ ...selectedPost, status });
            }
        } catch { /* empty */ }
    };

    const weekDates = getWeekDates();
    const isThisWeek = weekOffset === 0;
    const isNextWeek = weekOffset === 1;

    const weekLabel = isThisWeek ? "This Week" : isNextWeek ? "Next Week" : (() => {
        const d = weekDates[0];
        return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    })();

    return (
        <main className="relative min-h-screen overflow-hidden">
            <div className="orb-bg" aria-hidden="true"><div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" /></div>
            <Navbar />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 animate-fade-in-up">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">📅 Content Calendar</h1>
                        <p className="text-sm text-slate-500">Plan, preview, and approve your Instagram posts for the week.</p>
                    </div>
                    <button onClick={generateWeek} disabled={generating} className="btn-primary text-sm py-2 px-4 disabled:opacity-40">
                        {generating ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Generating week...
                            </span>
                        ) : "✨ Generate This Week"}
                    </button>
                </div>

                {success && <div className="mb-6 p-3 glass-card border-emerald-200 text-emerald-600 text-sm animate-fade-in-up">{success}</div>}
                {error && <div className="mb-6 p-3 glass-card border-red-200 text-red-500 text-sm animate-fade-in-up">{error}</div>}

                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-4 animate-fade-in-up stagger-1">
                    <button onClick={() => setWeekOffset(w => w - 1)} className="btn-secondary text-xs py-1.5 px-3">← Previous</button>
                    <h2 className="text-sm font-semibold">{weekLabel}</h2>
                    <button onClick={() => setWeekOffset(w => w + 1)} className="btn-secondary text-xs py-1.5 px-3">Next →</button>
                </div>

                {/* Calendar Grid */}
                {loading ? (
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="glass-card p-3 min-h-[200px]">
                                <div className="h-4 skeleton w-12 mb-3" />
                                <div className="h-20 skeleton rounded-lg mb-2" />
                                <div className="h-3 skeleton w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-2 animate-fade-in-up stagger-2">
                        {weekDates.map((date, dayIndex) => {
                            const dayPosts = posts.filter(p => {
                                const postDate = new Date(p.scheduledAt);
                                return postDate.toDateString() === date.toDateString();
                            });
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isPast = date < new Date() && !isToday;

                            return (
                                <div key={dayIndex} className={`glass-card p-3 min-h-[220px] transition-all ${isToday ? "border-violet-300 ring-1 ring-violet-100" : ""} ${isPast ? "opacity-60" : ""}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <div className={`text-xs font-semibold ${isToday ? "text-violet-600" : "text-slate-700"}`}>
                                                {DAY_SHORT[dayIndex]}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                {date.getDate()} {date.toLocaleDateString("en-US", { month: "short" })}
                                            </div>
                                        </div>
                                        {isToday && (
                                            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 font-medium">TODAY</span>
                                        )}
                                    </div>

                                    {dayPosts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-[150px] text-center">
                                            <div className="text-slate-300 text-2xl mb-1">📝</div>
                                            <p className="text-[10px] text-slate-300">No post</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {dayPosts.map(post => (
                                                <button key={post.id} onClick={() => setSelectedPost(post)} className="w-full text-left group">
                                                    {post.output?.imageUrl && (
                                                        <div className="w-full aspect-square rounded-lg overflow-hidden mb-1.5 border border-black/[0.06]">
                                                            <img
                                                                src={post.output.imageUrl}
                                                                alt="Post"
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        </div>
                                                    )}
                                                    <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">
                                                        {post.content?.slice(0, 60)}...
                                                    </p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${STATUS_STYLES[post.status] || ""}`}>
                                                            {post.status}
                                                        </span>
                                                        <span className="text-[8px] text-slate-400">📸</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Stats Bar */}
                {posts.length > 0 && (
                    <div className="mt-4 flex items-center gap-4 text-[10px] text-slate-400 animate-fade-in-up stagger-3">
                        <span>📊 {posts.length} posts this week</span>
                        <span>✅ {posts.filter(p => p.status === "approved").length} approved</span>
                        <span>📝 {posts.filter(p => p.status === "draft").length} drafts</span>
                        <span>🚀 {posts.filter(p => p.status === "posted").length} posted</span>
                    </div>
                )}
            </div>

            {/* ═══ POST DETAIL MODAL ═══ */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedPost(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-black/[0.06] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b border-black/[0.06] flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    📸 Instagram Post
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_STYLES[selectedPost.status] || ""}`}>
                                        {selectedPost.status}
                                    </span>
                                </h2>
                                <p className="text-xs text-slate-500">
                                    {selectedPost.scheduledAt ? new Date(selectedPost.scheduledAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Unscheduled"}
                                    {selectedPost.output?.bestTime ? ` at ${selectedPost.output.bestTime}` : ""}
                                </p>
                            </div>
                            <button onClick={() => setSelectedPost(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                        </div>

                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Image */}
                                <div>
                                    {selectedPost.output?.imageUrl ? (
                                        <div className="aspect-square rounded-xl overflow-hidden border border-black/[0.06] shadow-sm">
                                            <img src={selectedPost.output.imageUrl} alt="Post visual" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="aspect-square rounded-xl bg-slate-100 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">🖼️</div>
                                                <p className="text-xs text-slate-400">No image generated</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Caption + Details */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Caption</label>
                                        <div className="p-3 rounded-xl bg-slate-50 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                                            {selectedPost.content}
                                        </div>
                                    </div>

                                    {selectedPost.output?.hashtags && selectedPost.output.hashtags.length > 0 && (
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hashtags</label>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedPost.output.hashtags.map((tag, i) => (
                                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Posting Time</label>
                                        <p className="text-sm text-slate-500">
                                            {selectedPost.output?.dayOfWeek && `${DAY_NAMES[["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].indexOf(selectedPost.output.dayOfWeek)] || selectedPost.output.dayOfWeek}`}
                                            {selectedPost.output?.bestTime ? ` at ${selectedPost.output.bestTime}` : ""}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-black/[0.06] flex items-center justify-between">
                            <div className="flex gap-2">
                                {selectedPost.status === "draft" && (
                                    <button onClick={() => updatePostStatus(selectedPost.id, "approved")} className="btn-primary text-sm py-2 px-4">
                                        ✅ Approve Post
                                    </button>
                                )}
                                {selectedPost.status === "approved" && (
                                    <button onClick={() => updatePostStatus(selectedPost.id, "draft")} className="btn-secondary text-sm py-2 px-4">
                                        ↩ Back to Draft
                                    </button>
                                )}
                            </div>
                            <button onClick={() => setSelectedPost(null)} className="btn-secondary text-sm py-2 px-4">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
