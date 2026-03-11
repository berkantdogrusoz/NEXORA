"use client";

import { useState, useRef, useEffect } from "react";
import { useCredits } from "@/app/providers/credit-provider";
import { Upload, X, Loader2, Play, Download, Settings2, Video, Lock, ChevronDown, ChevronUp, Clapperboard, Sparkles, ImagePlus, Film } from "lucide-react";
import Image from "next/image";
import { getDefaultStylePresetId, getStylePresetsForMode, STYLE_PRESET_CATEGORIES } from "@/lib/style-presets";
import Link from "next/link";

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
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState("16:9");
    const [duration, setDuration] = useState("5");
    const [quality, setQuality] = useState<"hd" | "sd">("hd");
    const [stylePreset, setStylePreset] = useState(getDefaultStylePresetId("video"));
    const [presetCategory, setPresetCategory] = useState<"all" | (typeof STYLE_PRESET_CATEGORIES)[number]>("all");
    const [enhancePrompt, setEnhancePrompt] = useState(true);
    const [intensity, setIntensity] = useState(70);
    const [customDirection, setCustomDirection] = useState("");
    
    // Image Upload State
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [referencePreview, setReferencePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    // Gallery State
    const [history, setHistory] = useState<
        { url: string; prompt: string; createdAt: number }[]
    >([]);
    const [previewVideo, setPreviewVideo] = useState<string | null>(null); // For playing selected video

    // Settings dropdown
    const [settingsOpen, setSettingsOpen] = useState(false);

    const selectedModelConfig = VIDEO_MODELS.find(m => m.id === model) || VIDEO_MODELS[0];
    const selectedPreset = VIDEO_STYLE_PRESETS.find((preset) => preset.id === stylePreset) || VIDEO_STYLE_PRESETS[0];
    const filteredPresets = VIDEO_STYLE_PRESETS.filter((preset) => presetCategory === "all" || preset.category === presetCategory);

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

        const reader = new FileReader();
        reader.onload = () => setReferencePreview(reader.result as string);
        reader.readAsDataURL(file);

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
        setSettingsOpen(false);

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
                setPreviewVideo(data.videoUrl);
                setHistory((prev) => [
                    { url: data.videoUrl, prompt, createdAt: Date.now() },
                    ...prev,
                ]);
                setPrompt("");
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
        <div className="flex-1 w-full h-full relative overflow-y-auto hide-scrollbar flex flex-col items-center pb-20">
            
            {/* Hero Header */}
            <div className="w-full pt-14 pb-8 md:pt-24 md:pb-12 px-4 flex flex-col items-center z-10 transition-all">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white text-center uppercase tracking-[0.1em] drop-shadow-2xl">
                    Yours to Create
                </h1>
                <p className="text-cyan-400 text-xs md:text-sm font-bold tracking-[0.2em] uppercase mt-4 text-center">
                    Video Studio
                </p>
            </div>

            {/* Main Prompt Bar Container */}
            <div className="w-full max-w-[800px] px-4 z-20 relative transition-all">
                
                {/* Error Alert */}
                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-center animate-in fade-in slide-in-from-bottom-2">
                        {error}
                    </div>
                )}

                <div className="bg-[#121419]/90 backdrop-blur-3xl border border-white/10 hover:border-white/20 rounded-[32px] md:rounded-[40px] p-2 md:p-3 shadow-2xl transition-all relative">
                    
                    {/* Top Half: Input Area */}
                    <div className={`bg-black/40 rounded-[24px] md:rounded-[32px] p-4 flex flex-col border border-transparent focus-within:border-white/[0.08] transition-all relative z-20 ${generating ? 'opacity-50 pointer-events-none' : ''}`}>
                        
                        {/* Reference Image Attachment */}
                        {referencePreview && (
                            <div className="mb-3 relative inline-block self-start group">
                                <img
                                    src={referencePreview}
                                    alt="Reference"
                                    className="h-16 w-16 md:h-20 md:w-20 rounded-2xl object-cover border-2 border-white/10 group-hover:border-cyan-500/50 transition-colors"
                                />
                                <button
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-400 shadow-lg scale-0 group-hover:scale-100 transition-transform"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                        <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
                                    </div>
                                )}
                            </div>
                        )}

                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={referenceImage ? "Describe how to animate this image..." : "Describe your video... e.g., 'A futuristic city at sunset, cinematic drone shot'"}
                            className="w-full h-20 md:h-24 bg-transparent text-white placeholder-white/25 resize-none outline-none border-none text-sm leading-relaxed"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    generateVideo();
                                }
                            }}
                        />
                        
                        {/* Quick Actions inside Textarea Bottom */}
                        <div className="flex justify-between items-center mt-2">
                             <div className="flex items-center gap-2">
                                 <button 
                                     onClick={() => setSettingsOpen(!settingsOpen)}
                                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${settingsOpen ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'}`}
                                 >
                                     <Settings2 className="w-3.5 h-3.5" />
                                     <span className="hidden sm:inline">Settings</span>
                                 </button>
                                 
                                 {/* Hidden Image Upload Input */}
                                 <input
                                      type="file"
                                      ref={fileInputRef}
                                      onChange={handleImageUpload}
                                      accept="image/jpeg,image/png,image/webp"
                                      className="hidden"
                                 />
                                 
                                 <button
                                     onClick={() => fileInputRef.current?.click()}
                                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${referenceImage ? 'bg-green-500/20 text-green-400' : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'}`}
                                 >
                                     <Upload className="w-3.5 h-3.5" />
                                     <span className="hidden sm:inline">Image</span>
                                 </button>
                             </div>

                             {aspectRatio && duration && (
                                 <div className="px-3 py-1.5 rounded-full bg-white/5 text-white/50 text-[10px] font-bold uppercase tracking-wider">
                                     {ASPECT_RATIOS.find(s => s.value === aspectRatio)?.label.split(' ')[0]} · {duration}s · {quality.toUpperCase()}
                                 </div>
                             )}
                        </div>
                    </div>

                    {/* Settings Drawer (Expanded) */}
                    <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${settingsOpen ? 'max-h-[800px] opacity-100 border-t border-white/5 mt-2' : 'max-h-0 opacity-0'}`}
                    >
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Col: Model & Settings */}
                            <div className="space-y-5">
                                {/* Model */}
                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Video Model</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {VIDEO_MODELS.map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => setModel(m.id)}
                                                className={`px-3 py-2 text-[10px] rounded-xl border text-left transition-all font-medium flex flex-col gap-1 ${model === m.id
                                                    ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                                    : "bg-black/40 border-white/5 text-white/50 hover:border-white/10 hover:text-white"
                                                }`}
                                            >
                                                <span className="font-bold flex items-center justify-between w-full">
                                                    {m.name}
                                                    {m.tier === 'Pro' && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded uppercase font-black">Pro</span>}
                                                </span>
                                                <span className="text-[9px] text-white/30">{m.cost} cr</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Aspect Ratio */}
                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Aspect Ratio</label>
                                    <div className="flex gap-2">
                                        {ASPECT_RATIOS.map(ar => (
                                            <button
                                                key={ar.value}
                                                onClick={() => setAspectRatio(ar.value)}
                                                className={`flex-1 py-2 text-[10px] rounded-xl border text-center transition-all font-bold ${aspectRatio === ar.value
                                                    ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                                                    : "bg-black/40 border-white/5 text-white/50 hover:border-white/10 hover:text-white"
                                                }`}
                                            >
                                                {ar.label.split(' ')[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Duration & Quality Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Duration</label>
                                        <div className="flex gap-2">
                                            {DURATIONS.map(d => (
                                                <button
                                                    key={d.value}
                                                    onClick={() => setDuration(d.value)}
                                                    className={`flex-1 py-2 text-[10px] rounded-xl border text-center transition-all font-bold ${duration === d.value
                                                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                                                        : "bg-black/40 border-white/5 text-white/50 hover:border-white/10 hover:text-white"
                                                    }`}
                                                >
                                                    {d.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Quality</label>
                                        <div className="flex gap-2">
                                            {(["hd", "sd"] as const).map(q => (
                                                <button
                                                    key={q}
                                                    onClick={() => setQuality(q)}
                                                    className={`flex-1 py-2 text-[10px] rounded-xl border text-center transition-all font-bold uppercase ${quality === q
                                                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                                                        : "bg-black/40 border-white/5 text-white/50 hover:border-white/10 hover:text-white"
                                                    }`}
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Style & Details */}
                            <div className="space-y-5">
                                {/* Style Preset */}
                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Style Preset</label>
                                    <select 
                                        value={stylePreset}
                                        onChange={(e) => setStylePreset(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none appearance-none"
                                    >
                                        {VIDEO_STYLE_PRESETS.map(preset => (
                                            <option key={preset.id} value={preset.id}>{preset.name} - {preset.description}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Enhance */}
                                <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl px-4 py-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-white uppercase tracking-wider">AI Enhance</p>
                                        <p className="text-[9px] text-white/40 mt-0.5">Auto-optimizes prompt for quality</p>
                                    </div>
                                    <button
                                        onClick={() => setEnhancePrompt(!enhancePrompt)}
                                        className={`w-9 h-5 rounded-full transition-colors relative ${enhancePrompt ? "bg-cyan-500" : "bg-white/10"}`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${enhancePrompt ? "left-[18px]" : "left-0.5"}`} />
                                    </button>
                                </div>

                                {/* Intensity */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Intensity</label>
                                        <span className="text-[10px] text-cyan-400 font-bold">{intensity}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100"
                                        value={intensity}
                                        onChange={(e) => setIntensity(Number(e.target.value))}
                                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Nav / Submit Row */}
                    <div className="flex items-center justify-between px-2 md:px-4 py-2 mt-1 relative z-20">
                        {/* Tabs */}
                        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto hide-scrollbar">
                            <Link href="/generate" className="px-4 py-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 font-bold text-[10px] md:text-xs flex items-center gap-2 uppercase tracking-wider flex-shrink-0 transition-colors">
                                <ImagePlus className="w-4 h-4" />
                                <span className="hidden sm:inline">Image</span>
                            </Link>
                            <Link href="/studio" className="px-4 py-2 rounded-full bg-white/10 text-white font-bold text-[10px] md:text-xs flex items-center gap-2 uppercase tracking-wider flex-shrink-0">
                                <Video className="w-4 h-4 text-cyan-400" />
                                <span className="hidden sm:inline">Video</span>
                            </Link>
                            <Link href="/director" className="px-4 py-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 font-bold text-[10px] md:text-xs flex items-center gap-2 uppercase tracking-wider flex-shrink-0 transition-colors hidden sm:flex">
                                <Film className="w-4 h-4" />
                                <span className="hidden sm:inline">Blueprints</span>
                            </Link>
                        </div>
                        
                        {/* Generate Button */}
                        <div className="flex items-center gap-3 flex-shrink-0 pl-3 md:pl-4 border-l border-white/5">
                            <div className="hidden md:block text-right">
                                <div className="text-[10px] text-white/40 uppercase font-bold tracking-[0.2em]">{selectedModelConfig.cost} cr</div>
                            </div>
                            <button 
                                onClick={generateVideo}
                                disabled={generating || (!prompt && !referenceImage)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full h-10 md:h-11 px-5 md:px-8 flex items-center justify-center gap-2 font-black text-[10px] md:text-xs text-white uppercase tracking-wider shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02] active:scale-95"
                            >
                                {generating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Clapperboard className="w-4 h-4" />
                                )}
                                <span>{generating ? 'Generating' : 'Generate'}</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Video Player Overlay (When a video is recently generated) */}
            {previewVideo && !generating && (
                <div className="w-full max-w-4xl px-4 z-20 relative mt-8 animate-in slide-in-from-top-4 fade-in duration-500">
                    <div className="bg-[#121419]/90 backdrop-blur-3xl border border-cyan-500/20 rounded-3xl p-2 shadow-[0_20px_50px_rgba(6,182,212,0.1)] relative">
                        <button 
                            onClick={() => setPreviewVideo(null)}
                            className="absolute -top-3 -right-3 w-8 h-8 bg-black border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white z-30"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="aspect-video bg-black rounded-[20px] overflow-hidden relative">
                            <video
                                src={previewVideo}
                                controls
                                autoPlay
                                loop
                                playsInline
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute top-4 right-4 flex gap-2">
                                <a
                                    href={`/api/download?url=${encodeURIComponent(previewVideo)}`}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-black/60 hover:bg-cyan-600 text-white rounded-xl backdrop-blur-md transition-colors border border-white/10"
                                >
                                    <Download className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Screen Loading Overlay while generating */}
            {generating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in">
                    <div className="bg-[#121419] border border-white/10 rounded-3xl p-8 flex flex-col items-center max-w-sm w-full shadow-2xl">
                        <div className="relative w-16 h-16 mb-6">
                            <Loader2 className="w-16 h-16 text-cyan-500 animate-spin absolute inset-0" />
                            <Clapperboard className="w-8 h-8 text-white absolute inset-0 m-auto animate-pulse" />
                        </div>
                        <h3 className="text-white font-black uppercase tracking-wider text-sm mb-2">Synthesizing Video</h3>
                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest text-center mb-6">This takes about 30-60 seconds</p>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-2/3 animate-pulse rounded-full" />
                        </div>
                    </div>
                </div>
            )}

            {/* Gallery */}
            {history.length > 0 && (
                <div className="w-full max-w-7xl px-4 mt-16 md:mt-24 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-white/80 font-black tracking-[0.15em] uppercase text-xs md:text-sm">Recent Videos</h2>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>
                    
                    {/* Grid Layout */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {history.map((item, i) => (
                            <div key={i} className="group relative bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/5 aspect-video transition-transform hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                <video
                                    src={item.url}
                                    muted
                                    loop
                                    playsInline
                                    onMouseEnter={(e) => e.currentTarget.play()}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.pause();
                                        e.currentTarget.currentTime = 0;
                                    }}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 md:p-5">
                                    <p className="text-white text-[10px] md:text-xs line-clamp-2 font-medium mb-4 leading-relaxed opacity-90">{item.prompt}</p>
                                    <div className="flex gap-2 w-full">
                                        <button
                                            onClick={() => setPreviewVideo(item.url)}
                                            className="py-2 flex-1 bg-cyan-600 backdrop-blur-md text-white border border-cyan-500/20 text-[10px] font-bold rounded-xl hover:bg-cyan-500 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                                        >
                                            <Play className="w-3.5 h-3.5 fill-current" /> Play
                                        </button>
                                        <a
                                            href={`/api/download?url=${encodeURIComponent(item.url)}`}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/10 text-[10px] font-bold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center"
                                        >
                                            <Download className="w-3.5 h-3.5" />
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
