"use client";

import { useState, useRef, useEffect } from "react";
import { useCredits } from "@/app/providers/credit-provider";
import { Upload, X, Loader2, Play, Download, Settings2, Video, Lock, ChevronDown, ChevronUp, Clapperboard } from "lucide-react";
import Image from "next/image";
import { getDefaultStylePresetId, getStylePresetsForMode, STYLE_PRESET_CATEGORIES } from "@/lib/style-presets";

const ASPECT_RATIOS = [
    { label: "16:9 (Wide)", value: "16:9" },
    { label: "9:16 (Vertical)", value: "9:16" },
    { label: "1:1 (Square)", value: "1:1" },
];

const DURATIONS = [
    { label: "5s", value: "5" },
    { label: "10s", value: "10" },
];

const VIDEO_MODELS = [
    { id: "kling-3", name: "Kling 3.0", tier: "Standard", cost: 50, supportsImage: true },
    { id: "luma", name: "Luma Ray 2", tier: "Pro", cost: 60, supportsImage: true },
    { id: "runway-gen4", name: "Runway Gen-4.5", tier: "Pro", cost: 75, supportsImage: true },
    { id: "runway-gwm", name: "GWM-1", tier: "Pro", cost: 85, supportsImage: true },
    { id: "seedance-2", name: "Seedance 2.0", tier: "Pro", cost: 100, supportsImage: true },
    { id: "sora-2", name: "Sora 2", tier: "Pro", cost: 120, supportsImage: true },
];

const VIDEO_STYLE_PRESETS = getStylePresetsForMode("video");

export default function StudioPage() {
    const { credits, deductCredits, refundCredits, planName } = useCredits();

    const [prompt, setPrompt] = useState("");
    const [model, setModel] = useState("kling-3");
    const [generating, setGenerating] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState("16:9");
    const [duration, setDuration] = useState("5");
    const [quality, setQuality] = useState<"hd" | "sd">("hd");
    const [stylePreset, setStylePreset] = useState(getDefaultStylePresetId("video"));
    const [presetCategory, setPresetCategory] = useState<"all" | (typeof STYLE_PRESET_CATEGORIES)[number]>("all");
    const [enhancePrompt, setEnhancePrompt] = useState(true);
    const [intensity, setIntensity] = useState(70);
    const [customDirection, setCustomDirection] = useState("");
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [referencePreview, setReferencePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [history, setHistory] = useState<
        { url: string; prompt: string; createdAt: number }[]
    >([]);

    // Collapsible panels
    const [modelOpen, setModelOpen] = useState(false);
    const [presetOpen, setPresetOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [refOpen, setRefOpen] = useState(false);

    const selectedModelConfig = VIDEO_MODELS.find(m => m.id === model) || VIDEO_MODELS[0];
    const selectedPreset = VIDEO_STYLE_PRESETS.find((preset) => preset.id === stylePreset) || VIDEO_STYLE_PRESETS[0];
    const filteredPresets = VIDEO_STYLE_PRESETS.filter((preset) => presetCategory === "all" || preset.category === presetCategory);

    // Load history from database on mount
    useEffect(() => {
        fetch("/api/generations?type=video")
            .then(r => r.json())
            .then(data => {
                if (data.generations?.length) {
                    setHistory(data.generations.map((g: any) => ({
                        url: g.output_url,
                        prompt: g.prompt,
                        createdAt: new Date(g.created_at).getTime(),
                    })));
                }
            })
            .catch(() => { });
    }, []);

    const [uploading, setUploading] = useState(false);

    const resizeAndCompress = (file: File): Promise<{ base64: string; contentType: string }> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                const MAX = 1536;
                let w = img.width, h = img.height;
                if (w > MAX || h > MAX) {
                    const ratio = Math.min(MAX / w, MAX / h);
                    w = Math.round(w * ratio);
                    h = Math.round(h * ratio);
                }
                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
                resolve({ base64: dataUrl.split(",")[1], contentType: "image/jpeg" });
            };
            img.src = URL.createObjectURL(file);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setError("Image must be under 10MB.");
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = () => setReferencePreview(reader.result as string);
        reader.readAsDataURL(file);

        // Resize, compress, and upload to Supabase
        setUploading(true);
        setError(null);
        try {
            const { base64, contentType } = await resizeAndCompress(file);
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ base64, contentType }),
            });
            const data = await res.json();
            if (res.ok && data.url) {
                setReferenceImage(data.url);
            } else {
                setError(data.error || "Failed to upload image.");
                setReferencePreview(null);
            }
        } catch {
            setError("Failed to upload image.");
            setReferencePreview(null);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setReferenceImage(null);
        setReferencePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const generateVideo = async () => {
        if (!prompt && !referenceImage) return;

        // Block Pro models if user is on Free or Standard plan
        if (selectedModelConfig.tier === "Pro" && (planName === "Free" || planName === "Standard")) {
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
                    stylePreset,
                    intensity,
                    customDirection,
                    enhancePrompt,
                }),
            });

            let data: any;
            try {
                data = await res.json();
            } catch {
                const text = await res.text().catch(() => "");
                setError(`Server error (${res.status}): ${text.slice(0, 200) || "No response"}`);
                refundCredits(selectedModelConfig.cost);
                return;
            }

            if (res.ok && data.success) {
                setVideoUrl(data.videoUrl);
                setHistory((prev) => [
                    { url: data.videoUrl, prompt, createdAt: Date.now() },
                    ...prev.slice(0, 9),
                ]);
            } else {
                setError(data.error || "Failed to generate video.");
                refundCredits(selectedModelConfig.cost);
            }
        } catch (err: any) {
            setError(`Error: ${err.message || "Connection failed"}`);
            refundCredits(selectedModelConfig.cost);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tight">
                    <Clapperboard className="w-8 h-8 text-cyan-500" />
                    Video Studio
                </h1>
                <p className="text-white/50 mt-2 text-sm font-medium tracking-wide uppercase">
                    AI Video Generation — Kling 3.0, Luma Ray 2, Runway Gen-4.5 & More
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr,340px] gap-4">
                {/* Main Content Area */}
                <div className="space-y-5 order-1">
                    {/* Prompt Box */}
                    <div className="neon-frame rounded-2xl p-4 md:p-5">
                        {/* Reference Image Preview */}
                        {referencePreview && (
                            <div className="mb-4 relative inline-block">
                                <img
                                    src={referencePreview}
                                    alt="Reference"
                                    className="h-20 rounded-sm border border-white/10 object-cover"
                                />
                                <button
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-400 transition"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-sm text-[9px] bg-black/70 text-cyan-400 font-bold uppercase tracking-wider">
                                    {uploading ? "Uploading..." : "Reference"}
                                </span>
                            </div>
                        )}

                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={referenceImage ? "Describe how to animate this image..." : "Describe your video... e.g., 'A futuristic city at sunset, cinematic drone shot, 8k resolution'"}
                            className="w-full h-28 md:h-32 bg-transparent text-white placeholder-white/35 resize-none outline-none border-none text-sm md:text-base leading-relaxed"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    generateVideo();
                                }
                            }}
                        />

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.08]">
                            <div className="text-xs text-white/45 uppercase tracking-wider font-medium">
                                <span className="font-bold text-cyan-400">{selectedModelConfig.cost}</span> credits / video
                            </div>

                            <button
                                onClick={generateVideo}
                                disabled={generating || uploading || (!prompt && !referenceImage)}
                                className="bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white px-6 md:px-8 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-wider text-sm"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Video className="w-4 h-4 mr-2" />
                                        Generate Video
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Output Area */}
                    <div className="aspect-video bg-black/80 border border-white/[0.08] rounded-2xl overflow-hidden relative flex items-center justify-center group">
                        {generating ? (
                            <div className="text-center space-y-4">
                                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
                                <div className="text-cyan-400 font-medium animate-pulse text-sm uppercase tracking-wider">
                                    Synthesizing your video...
                                </div>
                                <div className="text-white/30 text-xs uppercase tracking-wider">This may take 30-60 seconds</div>
                                <div className="w-48 h-0.5 bg-white/[0.06] rounded-sm overflow-hidden mx-auto">
                                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-sm animate-pulse w-2/3" />
                                </div>
                            </div>
                        ) : videoUrl ? (
                            <>
                                <video
                                    src={videoUrl}
                                    controls
                                    autoPlay
                                    muted
                                    playsInline
                                    loop
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <a
                                        href={`/api/download?url=${encodeURIComponent(videoUrl)}`}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-black/70 hover:bg-cyan-600 text-white rounded-sm backdrop-blur-md transition-colors border border-white/10"
                                    >
                                        <Download className="w-5 h-5" />
                                    </a>
                                </div>
                            </>
                        ) : error ? (
                            <div className="text-red-400 text-center px-4">
                                <p className="font-bold mb-2 uppercase tracking-wider text-sm">Generation Failed</p>
                                <p className="text-xs opacity-80">{error}</p>
                            </div>
                        ) : (
                            <div className="text-white/15 text-center">
                                <Clapperboard className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p className="text-sm font-medium uppercase tracking-wider">Your generated video will appear here</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-3 order-2 xl:sticky xl:top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto pr-1">
                    {/* Settings Header */}
                    <div className="flex items-center gap-2 px-1">
                        <Settings2 className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-xs font-bold text-white/60 uppercase tracking-[0.2em]">Studio Settings</h3>
                    </div>

                    {/* Model Selection — Collapsible */}
                    <div className="bg-[#0c0f13] border border-white/[0.1] rounded-2xl">
                        <button
                            onClick={() => setModelOpen(!modelOpen)}
                            className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-white/80 uppercase tracking-[0.15em]">AI Model</span>
                                <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-sm font-medium">
                                    {selectedModelConfig.name}
                                </span>
                            </div>
                            {modelOpen ? (
                                <ChevronUp className="w-4 h-4 text-white/40" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-white/40" />
                            )}
                        </button>
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${modelOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                        >
                            <div className="overflow-hidden">
                                <div className="px-3 pb-3 space-y-1.5">
                                    {VIDEO_MODELS.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => setModel(m.id)}
                                            className={`w-full px-2.5 py-2 text-[11px] rounded-sm border text-left transition-all font-medium flex items-center justify-between ${model === m.id
                                                ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 font-bold"
                                                : "bg-black/40 border-white/[0.06] text-white/50 hover:border-white/[0.12] hover:text-white/70"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{m.name}</span>
                                                {m.tier === "Pro" && (
                                                    <span className="text-[8px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-sm font-bold normal-case">
                                                        PRO
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-white/30 font-normal normal-case">{m.cost} cr</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Prompt Style Presets */}
                    <div className="bg-[#0c0f13] border border-white/[0.1] rounded-2xl">
                        <button
                            onClick={() => setPresetOpen(!presetOpen)}
                            className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-white/80 uppercase tracking-[0.15em]">Style Preset</span>
                                <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-sm font-medium">
                                    {selectedPreset?.name || "Preset"}
                                </span>
                            </div>
                            {presetOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                        </button>
                        <div className={`grid transition-all duration-300 ease-in-out ${presetOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                            <div className="overflow-hidden">
                                <div className="px-4 pb-4 space-y-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        <button
                                            onClick={() => setPresetCategory("all")}
                                            className={`px-2.5 py-1.5 text-[10px] rounded-sm border uppercase tracking-wider font-bold transition ${presetCategory === "all" ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400" : "bg-black/40 border-white/[0.06] text-white/40 hover:text-white/70"}`}
                                        >
                                            All
                                        </button>
                                        {STYLE_PRESET_CATEGORIES.map((category) => (
                                            <button
                                                key={category}
                                                onClick={() => setPresetCategory(category)}
                                                className={`px-2.5 py-1.5 text-[10px] rounded-sm border uppercase tracking-wider font-bold transition ${presetCategory === category ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400" : "bg-black/40 border-white/[0.06] text-white/40 hover:text-white/70"}`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-auto pr-1">
                                        {filteredPresets.map((preset) => (
                                            <button
                                                key={preset.id}
                                                onClick={() => setStylePreset(preset.id)}
                                                className={`px-2.5 py-2 text-left rounded-sm border transition-all ${stylePreset === preset.id ? "bg-cyan-500/15 border-cyan-500/50" : "bg-black/40 border-white/[0.06] text-white/50 hover:border-white/[0.12] hover:text-white/70"}`}
                                            >
                                                <p className="text-xs font-semibold uppercase tracking-wider text-white">{preset.name}</p>
                                                <p className="text-[10px] text-white/45 mt-1 normal-case">{preset.description}</p>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">AI Enhance</span>
                                            <button
                                                onClick={() => setEnhancePrompt(!enhancePrompt)}
                                                className={`w-9 h-5 rounded-sm transition-colors relative ${enhancePrompt ? "bg-cyan-500" : "bg-white/10"}`}
                                            >
                                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-sm shadow transition-transform ${enhancePrompt ? "left-[18px]" : "left-0.5"}`} />
                                            </button>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Intensity</span>
                                                <span className="text-[10px] font-bold text-cyan-400">{intensity}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={intensity}
                                                onChange={(e) => setIntensity(Number(e.target.value))}
                                                className="w-full h-1 bg-white/[0.06] rounded-sm appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Custom Direction</p>
                                            <textarea
                                                value={customDirection}
                                                onChange={(e) => setCustomDirection(e.target.value.slice(0, 220))}
                                                placeholder="Optional: camera vibe, scene mood, or extra direction"
                                                className="w-full h-20 px-3 py-2 bg-black/40 border border-white/[0.06] rounded-sm text-xs text-white placeholder-white/20 outline-none focus:border-cyan-500/40 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Video Settings — Collapsible */}
                    <div className="bg-[#0c0f13] border border-white/[0.1] rounded-2xl">
                        <button
                            onClick={() => setSettingsOpen(!settingsOpen)}
                            className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-white/80 uppercase tracking-[0.15em]">Video Settings</span>
                                <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-sm font-medium">
                                    {aspectRatio} · {duration}s · {quality.toUpperCase()}
                                </span>
                            </div>
                            {settingsOpen ? (
                                <ChevronUp className="w-4 h-4 text-white/40" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-white/40" />
                            )}
                        </button>
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${settingsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                        >
                            <div className="overflow-hidden">
                                <div className="px-3 pb-3 space-y-3">
                                    {/* Aspect Ratio */}
                                    <div>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Aspect Ratio</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {ASPECT_RATIOS.map(ar => (
                                                <button
                                                    key={ar.value}
                                                    onClick={() => setAspectRatio(ar.value)}
                                                    className={`px-2.5 py-2 text-[11px] rounded-sm border text-center transition-all font-medium ${aspectRatio === ar.value
                                                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 font-bold"
                                                        : "bg-black/40 border-white/[0.06] text-white/50 hover:border-white/[0.12] hover:text-white/70"
                                                        }`}
                                                >
                                                    {ar.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Duration */}
                                    <div>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Duration</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {DURATIONS.map(d => (
                                                <button
                                                    key={d.value}
                                                    onClick={() => setDuration(d.value)}
                                                    className={`px-2.5 py-2 text-[11px] rounded-sm border text-center transition-all font-medium ${duration === d.value
                                                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 font-bold"
                                                        : "bg-black/40 border-white/[0.06] text-white/50 hover:border-white/[0.12] hover:text-white/70"
                                                        }`}
                                                >
                                                    {d.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quality */}
                                    <div>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Quality</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(["hd", "sd"] as const).map(q => (
                                                <button
                                                    key={q}
                                                    onClick={() => setQuality(q)}
                                                    className={`px-3 py-2.5 text-xs rounded-sm border text-center transition-all font-medium uppercase tracking-wider ${quality === q
                                                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 font-bold"
                                                        : "bg-black/40 border-white/[0.06] text-white/50 hover:border-white/[0.12] hover:text-white/70"
                                                        }`}
                                                >
                                                    {q.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reference Image — Collapsible */}
                    <div className="bg-[#0c0f13] border border-white/[0.1] rounded-2xl">
                        <button
                            onClick={() => setRefOpen(!refOpen)}
                            className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-white/80 uppercase tracking-[0.15em]">Reference Image</span>
                                <span className={`text-[10px] px-2 py-0.5 border rounded-sm font-medium ${referenceImage
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : "bg-white/[0.03] text-white/30 border-white/[0.06]"
                                    }`}>
                                    {uploading ? "Uploading..." : referenceImage ? "Active" : "None"}
                                </span>
                            </div>
                            {refOpen ? (
                                <ChevronUp className="w-4 h-4 text-white/40" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-white/40" />
                            )}
                        </button>
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${refOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                        >
                            <div className="overflow-hidden">
                                <div className="px-3 pb-3">
                                    <p className="text-[11px] text-white/40 mb-4 leading-relaxed">
                                        Upload an image to create image-to-video generation. The AI will animate your image with cinematic motion.
                                    </p>

                                    {!referencePreview ? (
                                        <div
                                            className={`border-2 border-dashed border-white/[0.08] rounded-sm p-8 text-center hover:border-cyan-500/40 hover:bg-cyan-500/[0.03] transition-all cursor-pointer group ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="w-7 h-7 text-white/30 mx-auto mb-3 group-hover:text-cyan-400 transition-colors" />
                                            <p className="text-xs text-white/50 font-medium uppercase tracking-wider">{uploading ? "Uploading..." : "Click to upload reference"}</p>
                                            <p className="text-[10px] text-white/30 mt-1">JPG, PNG up to 10MB</p>
                                        </div>
                                    ) : (
                                        <div className="relative rounded-sm overflow-hidden border border-white/[0.1] aspect-video group">
                                            <Image
                                                src={referencePreview}
                                                alt="Reference"
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <button
                                                    onClick={removeImage}
                                                    className="p-2 bg-red-500 rounded-sm text-white hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-black/80 text-cyan-400 text-[10px] uppercase font-bold tracking-wider border-t border-cyan-500/20">
                                                Reference Active
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Section */}
            {history.length > 0 && (
                <div className="mt-16">
                    <h3 className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Video className="w-4 h-4 text-cyan-400" />
                        Your Videos
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {history.map((item, i) => (
                            <div key={i} className="group relative aspect-video bg-[#0a0a0a] rounded-sm overflow-hidden border border-white/[0.06]">
                                <video
                                    src={item.url}
                                    className="w-full h-full object-cover"
                                    muted
                                    loop
                                    playsInline
                                    onMouseEnter={(e) => e.currentTarget.play()}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.pause();
                                        e.currentTarget.currentTime = 0;
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                                    <p className="text-white text-[11px] line-clamp-2 font-medium mb-3">{item.prompt}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setVideoUrl(item.url);
                                                setPrompt(item.prompt);
                                            }}
                                            className="px-3 py-1.5 bg-cyan-600 text-white text-[10px] font-bold rounded-sm hover:bg-cyan-500 transition-colors flex items-center gap-1 flex-1 justify-center uppercase tracking-wider"
                                        >
                                            <Play className="w-3 h-3" /> View
                                        </button>
                                        <a
                                            href={`/api/download?url=${encodeURIComponent(item.url)}`}
                                            download
                                            className="px-3 py-1.5 bg-white/10 text-white text-[10px] font-bold rounded-sm hover:bg-white/20 transition-colors flex items-center gap-1 justify-center uppercase tracking-wider"
                                        >
                                            <Download className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
