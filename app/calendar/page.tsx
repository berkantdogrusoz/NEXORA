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

    const weekDates = getWeekDates();
    const currentMonth = weekDates[0].toLocaleString("default", { month: "long" });
    const currentYear = weekDates[0].getFullYear();

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
                    weekOffset: weekOffset
                }),
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

    const clearWeek = async () => {
        if (!confirm("Are you sure you want to delete all drafts for this week?")) return;

        setLoading(true);
        try {
            const startDate = weekDates[0].toISOString();
            const endDate = weekDates[6].toISOString(); // End of the week

            // End date should handle full day, so let's make it end of the day or just use next day logic in backend
            // To be safe, let's just send the dates as is, backend uses gte/lte which works with ISO strings.
            // But strict ISO for [6] is 00:00:00. We want to include the whole Sunday.
            const endOfDay = new Date(weekDates[6]);
            endOfDay.setHours(23, 59, 59, 999);

            const res = await fetch("/api/calendar/clear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ startDate, endDate: endOfDay.toISOString() }),
            });

            if (res.ok) {
                await fetchData();
            } else {
                setError("Failed to clear drafts.");
            }
        } catch {
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };



    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !selectedPost) return;

        const file = e.target.files[0];
        setLoading(true);

        try {
            // Upload to Supabase Storage
            const filename = `custom/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
            const { data, error } = await (await import("@/lib/supabase")).supabase.storage
                .from("instagram-images")
                .upload(filename, file);

            if (error) throw error;

            // Get Public URL
            const { data: urlData } = (await import("@/lib/supabase")).supabase.storage
                .from("instagram-images")
                .getPublicUrl(filename);

            const publicUrl = urlData.publicUrl;

            // Update Post in DB
            const res = await fetch("/api/calendar/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    postId: selectedPost.id,
                    updates: { output: { imageUrl: publicUrl } }
                }),
            });

            if (!res.ok) throw new Error("Failed to update post");

            // Update Local State
            const updatedPost = { ...selectedPost, output: { ...selectedPost.output, imageUrl: publicUrl } };
            setSelectedPost(updatedPost);
            setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));

        } catch (err) {
            console.error("Upload failed", err);
            setError("Failed to upload image.");
        } finally {
            setLoading(false);
        }
    };

    const regenerateImage = async () => {
        if (!selectedPost) return;
        setLoading(true);
        try {
            const res = await fetch("/api/calendar/regenerate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId: selectedPost.id }),
            });

            if (res.ok) {
                const data = await res.json();
                // Update Local State
                const updatedPost = { ...selectedPost, output: { ...selectedPost.output, imageUrl: data.imageUrl } };
                setSelectedPost(updatedPost);
                setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
            } else {
                setError("Failed to regenerate image.");
            }
        } catch {
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const approvePost = async () => {
        if (!selectedPost) return;
        setLoading(true);
        try {
            const res = await fetch("/api/calendar/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    postId: selectedPost.id,
                    updates: { status: "approved" }
                }),
            });

            if (res.ok) {
                // Update Local State
                const updatedPost = { ...selectedPost, status: "approved" } as ScheduledPost;
                setSelectedPost(updatedPost);
                setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
                // Optional: Close modal or show success message?
                // For now, just keeping it open so they see the change
            } else {
                setError("Failed to approve post.");
            }
        } catch {
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const publishNow = async () => {
        if (!selectedPost) return;

        // Confirmation
        if (!confirm("Are you sure you want to post this to Instagram immediately?")) return;

        setLoading(true);

        try {
            const res = await fetch("/api/instagram/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image_url: selectedPost.output?.imageUrl,
                    caption: selectedPost.output?.caption,
                    postId: selectedPost.id
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Update Local State
                const updatedPost = { ...selectedPost, status: "posted" } as ScheduledPost;
                setSelectedPost(updatedPost);
                setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
                alert("Successfully posted to Instagram! 🚀");
            } else {
                console.error("Publish Error:", data);
                setError(data.error || "Failed to publish post.");
                alert(`Error: ${data.error || "Failed to publish."}`);
            }
        } catch (e: any) {
            console.error("Publish execution error:", e);
            setError("Network error or server failure.");
            alert("Something went wrong while publishing.");
        } finally {
            setLoading(false);
        }
    };

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
                            onClick={clearWeek}
                            disabled={loading || posts.filter(p => {
                                const d = new Date(p.scheduledAt);
                                return d >= weekDates[0] && d <= weekDates[6] && p.status === "draft";
                            }).length === 0}
                            className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Clear Drafts
                        </button>

                        <button
                            onClick={generateWeek}
                            disabled={generating || weekOffset > 1} // Limit to current (0) and next week (1)
                            className={`btn-primary flex items-center gap-2 shadow-lg ${weekOffset > 1 ? "bg-slate-700 cursor-not-allowed" : "shadow-violet-500/20"}`}
                            title={weekOffset > 1 ? "You can only schedule up to 2 weeks in advance." : "Generate AI content"}
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
                                                    <p className="text-sm text-slate-500">
                                                        {loading ? "Image generating..." : "No image available. Click Regenerate."}
                                                    </p>
                                                </div>
                                            )}
                                            {/* Hidden File Input */}
                                            <input
                                                type="file"
                                                id="imageUpload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={regenerateImage}
                                                disabled={loading}
                                                className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 transition disabled:opacity-50"
                                            >
                                                {loading ? "Processing..." : "Regenerate Image"}
                                            </button>
                                            <button
                                                onClick={() => document.getElementById('imageUpload')?.click()}
                                                disabled={loading}
                                                className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 transition disabled:opacity-50"
                                            >
                                                {loading ? "Uploading..." : "Upload Selection"}
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
                                            <button
                                                onClick={approvePost}
                                                disabled={loading || selectedPost.status === "approved" || selectedPost.status === "posted"}
                                                className="flex-1 btn-primary py-2.5 text-sm shadow-lg shadow-violet-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {selectedPost.status === "approved" ? "Approved ✓" : "Approve & Schedule"}
                                            </button>

                                            <button
                                                onClick={publishNow}
                                                disabled={loading || selectedPost.status === "posted"}
                                                className="px-4 py-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/20 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? "Processing..." : "Post Now 🚀"}
                                            </button>

                                            {selectedPost.status === "approved" && (
                                                <button className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                                                    Scheduled
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
