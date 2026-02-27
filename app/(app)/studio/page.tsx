"use client";

import { useState, useRef } from "react";
import { useCredits } from "@/app/providers/credit-provider";

const ASPECT_RATIOS = [
    { label: "16:9", value: "16:9" },
    { label: "9:16", value: "9:16" },
    { label: "1:1", value: "1:1" },
];

const DURATIONS = [
    { label: "5s", value: "5" },
    { label: "10s", value: "10" },
];

const VIDEO_MODELS = [
    { id: "wan-2.1", name: "Wan-2.1 Turbo", tier: "Standard", cost: 8, supportsImage: true },
    { id: "kling-3", name: "Kling 3.0", tier: "Standard", cost: 15, supportsImage: true },
    { id: "luma", name: "Luma Dream Machine Ray 2", tier: "Pro", cost: 25, supportsImage: true },
    { id: "runway-gen4", name: "Runway Gen-4.5", tier: "Pro", cost: 35, supportsImage: true },
    { id: "runway-gwm", name: "Runway GWM-1", tier: "Pro", cost: 45, supportsImage: false },
    { id: "seedance-2", name: "Seedance 2.0 (Cinematic)", tier: "Pro", cost: 50, supportsImage: true },
];

export default function StudioPage() {
    const { credits, deductCredits, refundCredits, planName } = useCredits();

    const [prompt, setPrompt] = useState("");
    const [model, setModel] = useState("wan-2.1");
    const [generating, setGenerating] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState("16:9");
    const [duration, setDuration] = useState("5");
    const [quality, setQuality] = useState<"hd" | "sd">("hd");
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [referencePreview, setReferencePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [history, setHistory] = useState<
        { url: string; prompt: string; createdAt: number }[]
    >([]);

    const selectedModelConfig = VIDEO_MODELS.find(m => m.id === model) || VIDEO_MODELS[0];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setError("Image must be under 10MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setReferenceImage(base64);
            setReferencePreview(base64);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setReferenceImage(null);
        setReferencePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const generateVideo = async () => {
        if (!prompt && !referenceImage) return;

        // Block Pro models if user is on Free plan
        if (selectedModelConfig.tier === "Pro" && planName === "Free") {
            setError(`You need a Premium plan to use ${selectedModelConfig.name}.`);
            return;
        }

        if (credits !== null && credits < selectedModelConfig.cost) {
            setError("Insufficient credits. Please upgrade your plan.");
            return;
        }

        if (referenceImage && !selectedModelConfig.supportsImage) {
            setError(`${selectedModelConfig.name} does not support image-to-video.`);
            return;
        }

        setGenerating(true);
        setError(null);

        // Instantly deduct credits from UI
        deductCredits(selectedModelConfig.cost);

        try {
            const res = await fetch("/api/video/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: prompt || "Animate this image with cinematic motion",
                    model,
                    aspectRatio,
                    quality,
                    duration,
                    imageUrl: referenceImage || undefined,
                }),
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
                refundCredits(selectedModelConfig.cost); // refund on error
            }
        } catch {
            setError("Something went wrong.");
            refundCredits(selectedModelConfig.cost); // refund on error
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-1">Video Studio</h1>
                    <p className="text-sm text-slate-500">
                        Generate AI videos from text prompts or reference images
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
                                        muted
                                        playsInline
                                        loop
                                        className="w-full aspect-video object-cover bg-black"
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
                                    </div>
                                </div>
                            ) : generating ? (
                                <div className="w-full aspect-video rounded-2xl border border-white/[0.06] bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 animate-pulse flex items-center justify-center text-3xl">
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
                                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse w-2/3" />
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

                                {/* Reference Image Upload */}
                                {referencePreview ? (
                                    <div className="mb-4 relative inline-block">
                                        <img
                                            src={referencePreview}
                                            alt="Reference"
                                            className="h-20 rounded-xl border border-white/10 object-cover"
                                        />
                                        <button
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-400 transition"
                                        >
                                            ✕
                                        </button>
                                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] bg-black/70 text-cyan-400 font-medium">
                                            Reference
                                        </span>
                                    </div>
                                ) : null}

                                {/* Text Input */}
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={referenceImage ? "Describe how to animate this image..." : "Describe your video... (e.g., 'A futuristic city at sunset, cinematic drone shot')"}
                                    rows={2}
                                    className="w-full bg-transparent resize-none text-white text-sm placeholder:text-slate-600 focus:outline-none mb-4"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            generateVideo();
                                        }
                                    }}
                                />

                                {/* Model Dropdown and Config Row */}
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                    <select
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                                    >
                                        {VIDEO_MODELS.map((m) => (
                                            <option key={m.id} value={m.id} className="bg-black text-white">
                                                {m.name} ({m.tier})
                                            </option>
                                        ))}
                                    </select>

                                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                        {selectedModelConfig.tier === "Pro" && (
                                            <span className="px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-500 border border-amber-500/20 font-medium">
                                                PRO
                                            </span>
                                        )}
                                        <span>Cost: {selectedModelConfig.cost} credits</span>
                                    </div>
                                </div>

                                {/* Controls Row */}
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Image Upload Button */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${referenceImage
                                                ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400"
                                                : "bg-white/[0.04] border-white/[0.06] text-slate-500 hover:text-slate-300"
                                                }`}
                                            title="Upload reference image for image-to-video"
                                        >
                                            🖼️ {referenceImage ? "Image Added" : "Add Image"}
                                        </button>

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
                                        disabled={generating || (!prompt && !referenceImage)}
                                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/20"
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
                                                    ⚡ {selectedModelConfig.cost}
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
        </div >
    );
}
