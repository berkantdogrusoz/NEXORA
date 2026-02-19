"use client";

import { useState } from "react";
import Navbar from "@/app/components/navbar";

export default function StudioPage() {
    const [prompt, setPrompt] = useState("");
    const [generating, setGenerating] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateVideo = async () => {
        if (!prompt) return;
        setGenerating(true);
        setError(null);
        setVideoUrl(null);

        try {
            const res = await fetch("/api/video/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setVideoUrl(data.videoUrl);
            } else {
                setError(data.error || "Failed to generate video.");
            }
        } catch (err) {
            setError("Something went wrong.");
        } finally {
            setGenerating(false);
        }
    };

    const scheduleToCalendar = async () => {
        if (!videoUrl) return;

        try {
            const res = await fetch("/api/calendar/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: prompt,
                    videoUrl: videoUrl,
                    // Default to scheduling for tomorrow or let backend handle it
                }),
            });

            if (res.ok) {
                alert("Video sent to Calendar as Draft! 🗓️");
            } else {
                alert("Failed to schedule.");
            }
        } catch {
            alert("Error scheduling post.");
        }
    };

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-black pointer-events-none" />

            <Navbar />

            <div className="pt-32 px-6 max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400 mb-4">
                        AI Creative Studio
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Turn your text into viral videos in seconds. Powered by state-of-the-art AI.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    {/* Input Area */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-2 pl-4 flex items-center gap-2 shadow-2xl shadow-violet-500/10 backdrop-blur-md">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your video (e.g., 'A futuristic city at sunset, cinematic lighting')..."
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 h-12"
                            onKeyDown={(e) => e.key === "Enter" && generateVideo()}
                        />
                        <button
                            onClick={generateVideo}
                            disabled={generating || !prompt}
                            className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {generating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <span>✨</span>
                                    Generate
                                </>
                            )}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-center animate-fade-in-up">
                            Failed: {error}
                        </div>
                    )}

                    {/* Video Output */}
                    {videoUrl && (
                        <div className="mt-12 animate-fade-in-up">
                            <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                                <video
                                    src={videoUrl}
                                    controls
                                    autoPlay
                                    loop
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <a
                                        href={videoUrl}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-black/50 backdrop-blur text-white px-4 py-2 rounded-lg text-sm border border-white/10 hover:bg-white/10 transition"
                                    >
                                        Download
                                    </a>
                                    <button
                                        onClick={scheduleToCalendar}
                                        className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm border border-white/10 hover:bg-violet-500 transition shadow-lg shadow-violet-500/20"
                                    >
                                        🗓️ Send to Calendar
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-center">
                                <p className="text-sm text-slate-500">
                                    Generated with Stable Video Diffusion • Automatic drafts
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Empty State / Examples */}
                    {!videoUrl && !generating && (
                        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 opacity-50">
                            <div className="aspect-video bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                                <span className="text-slate-600 text-sm">Example 1</span>
                            </div>
                            <div className="aspect-video bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                                <span className="text-slate-600 text-sm">Example 2</span>
                            </div>
                            <div className="aspect-video bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                                <span className="text-slate-600 text-sm">Example 3</span>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </main>
    );
}
