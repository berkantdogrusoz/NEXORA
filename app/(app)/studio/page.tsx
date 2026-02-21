"use client";

import { useState } from "react";

const ASPECT_RATIOS = [
    { label: "16:9", value: "16:9" },
    { label: "9:16", value: "9:16" },
    { label: "1:1", value: "1:1" },
];

const DURATIONS = [
    { label: "4s", value: "4" },
    { label: "8s", value: "8" },
];

export default function StudioPage() {
    const [prompt, setPrompt] = useState("");
    const [model, setModel] = useState("zeroscope");
    const [generating, setGenerating] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState("16:9");
    const [duration, setDuration] = useState("4");
    const [quality, setQuality] = useState<"hd" | "sd">("hd");
    const [history, setHistory] = useState<
        { url: string; prompt: string; createdAt: number }[]
    >([]);

    const generateVideo = async () => {
        if (!prompt) return;
        setGenerating(true);
        setError(null);

        try {
            // 1. Deduct credits first (Tiered pricing)
            const creditCost = model === "zeroscope" ? 12.5 : 25;
            const creditRes = await fetch("/api/credits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: creditCost }),
            });

            if (!creditRes.ok) {
                const creditData = await creditRes.json();
                if (creditData.code === "INSUFFICIENT_CREDITS") {
                    setError("Insufficient credits. Please upgrade your plan.");
                } else {
                    setError(creditData.error || "Failed to process credits.");
                }
                setGenerating(false);
                return;
            }

            // 2. Generate video
            const res = await fetch("/api/video/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setVideoUrl(data.videoUrl);
                setHistory((prev) => [
                    { url: data.videoUrl, prompt, createdAt: Date.now() },
                    ...prev,
                ]);
            } else {
                setError(data.error || "Failed to generate video.");
            }
        } catch {
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
        <div className="min-h-screen p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-1">Video Studio</h1>
                    <p className="text-sm text-slate-500">
                        Generate AI videos from text prompts
                    </p>
                </div>

                <div className="flex gap-6">
                    {/* Left Panel — History */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    History
                                </h3>
                                <button className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors text-sm">
                                    +
                                </button>
                            </div>
                            <div className="space-y-2">
                                {history.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-xs text-slate-600">
                                            No videos yet. Generate your first!
                                        </p>
                                    </div>
                                ) : (
                                    history.map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setVideoUrl(item.url);
                                                setPrompt(item.prompt);
                                            }}
                                            className="w-full rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all group"
                                        >
                                            <video
                                                src={item.url}
                                                muted
                                                className="w-full aspect-video object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="p-2 bg-[#0a0a0a]">
                                                <p className="text-[10px] text-slate-400 truncate">
                                                    {item.prompt}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Area */}
                    <div className="flex-1 flex flex-col items-center">
                        {/* Video Display */}
                        <div className="w-full max-w-3xl mb-8">
                            {videoUrl ? (
                                <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl group">
                                    <video
                                        src={videoUrl}
                                        controls
                                        autoPlay
                                        loop
                                        className="w-full aspect-video object-cover"
                                    />
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <a
                                            href={`/api/download?url=${encodeURIComponent(videoUrl)}`}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-white text-xs font-medium border border-white/10 hover:bg-black/80 transition"
                                        >
                                            ↓ Download
                                        </a>
                                        <button
                                            onClick={scheduleToCalendar}
                                            className="px-3 py-1.5 rounded-lg bg-violet-600/80 backdrop-blur text-white text-xs font-medium border border-violet-500/30 hover:bg-violet-600 transition"
                                        >
                                            📅 Calendar
                                        </button>
                                    </div>
                                </div>
                            ) : generating ? (
                                <div className="w-full aspect-video rounded-2xl border border-white/[0.06] bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 animate-pulse flex items-center justify-center text-3xl">
                                            🎬
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-white mb-1">
                                            Generating your video...
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            This may take 30-60 seconds
                                        </p>
                                    </div>
                                    <div className="w-48 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-pulse w-2/3" />
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full aspect-video rounded-2xl border border-white/[0.06] bg-[#0a0a0a] flex flex-col items-center justify-center">
                                    <div className="text-6xl mb-4 opacity-20">🎬</div>
                                    <p className="text-sm text-slate-600">
                                        Enter a prompt below to generate a video
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="w-full max-w-3xl mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Prompt Bar */}
                        <div className="w-full max-w-3xl">
                            <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-4">
                                {/* Text Input */}
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe your video... (e.g., 'A futuristic city at sunset, cinematic drone shot')"
                                    rows={2}
                                    className="w-full bg-transparent resize-none text-white text-sm placeholder:text-slate-600 focus:outline-none mb-4"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            generateVideo();
                                        }
                                    }}
                                />

                                {/* Model Selector */}
                                <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 mb-4 inline-flex">
                                    {[
                                        { id: "zeroscope", label: "Standard (SD)", pro: false, cost: 12.5 },
                                        { id: "luma", label: "Cinematic (HD)", pro: true, cost: 25 },
                                    ].map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => setModel(m.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${model === m.id
                                                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                                }`}
                                        >
                                            {m.label}
                                            {m.pro && (
                                                <span className="text-[8px] px-1 py-0.5 rounded-sm bg-amber-500/20 text-amber-500 border border-amber-500/20">
                                                    PRO
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Controls Row */}
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Aspect Ratio */}
                                        <div className="flex items-center bg-white/[0.04] rounded-lg border border-white/[0.06] overflow-hidden">
                                            {ASPECT_RATIOS.map((ar) => (
                                                <button
                                                    key={ar.value}
                                                    onClick={() => setAspectRatio(ar.value)}
                                                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${aspectRatio === ar.value
                                                        ? "bg-white/10 text-white"
                                                        : "text-slate-500 hover:text-slate-300"
                                                        }`}
                                                >
                                                    ⬜ {ar.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Quality */}
                                        <button
                                            onClick={() =>
                                                setQuality(quality === "hd" ? "sd" : "hd")
                                            }
                                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${quality === "hd"
                                                ? "bg-white/10 border-white/10 text-white"
                                                : "bg-white/[0.04] border-white/[0.06] text-slate-500"
                                                }`}
                                        >
                                            🎯 {quality.toUpperCase()}
                                        </button>

                                        {/* Duration */}
                                        <div className="flex items-center bg-white/[0.04] rounded-lg border border-white/[0.06] overflow-hidden">
                                            {DURATIONS.map((d) => (
                                                <button
                                                    key={d.value}
                                                    onClick={() => setDuration(d.value)}
                                                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${duration === d.value
                                                        ? "bg-white/10 text-white"
                                                        : "text-slate-500 hover:text-slate-300"
                                                        }`}
                                                >
                                                    ⏱ {d.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Generate Button */}
                                    <button
                                        onClick={generateVideo}
                                        disabled={generating || !prompt}
                                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 shadow-lg shadow-violet-500/20"
                                    >
                                        {generating ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                Generate
                                                <span className="text-xs opacity-70">
                                                    ↵ {model === "zeroscope" ? 12.5 : 25}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
