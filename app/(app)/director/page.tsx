"use client";

import { useState, useRef, useEffect } from "react";
import { useCredits } from "@/app/providers/credit-provider";
import { Upload, X, Loader2, Settings2, ChevronDown, Sparkles, Clapperboard, Film } from "lucide-react";
import { getDefaultStylePresetId, getStylePresetsForMode } from "@/lib/style-presets";
import { resizeAndCompress } from "@/app/components/generation/image-upload-utils";
import GenerationLoadingOverlay from "@/app/components/generation/generation-loading-overlay";
import VideoPreviewOverlay from "@/app/components/generation/video-preview-overlay";
import VideoGallery, { type VideoHistoryItem } from "@/app/components/generation/video-gallery";
import PromptBarTabs from "@/app/components/generation/prompt-bar-tabs";

const DOP_MODELS = [
    { id: "dop-lite", name: "DOP Lite", desc: "Fast preview", cost: 100, speed: "~30s", tier: "Standard" },
    { id: "dop-preview", name: "DOP Preview", desc: "Balanced quality", cost: 150, speed: "~60s", tier: "Pro" },
    { id: "dop-turbo", name: "DOP Turbo", desc: "Highest fidelity", cost: 200, speed: "~90s", tier: "Pro" },
];

const CAMERA_MOVEMENTS = [
    { id: "auto", label: "Auto" },
    { id: "dolly_in", label: "Dolly In" },
    { id: "dolly_out", label: "Dolly Out" },
    { id: "pan_left", label: "Pan Left" },
    { id: "pan_right", label: "Pan Right" },
    { id: "crane_up", label: "Crane Up" },
    { id: "crane_down", label: "Crane Down" },
    { id: "zoom_in", label: "Zoom In" },
    { id: "zoom_out", label: "Zoom Out" },
    { id: "orbit_left", label: "Orbit Left" },
    { id: "orbit_right", label: "Orbit Right" },
    { id: "drone_flyover", label: "Drone Flyover" },
    { id: "tracking_shot", label: "Tracking" },
    { id: "fixed", label: "Fixed" },
];

const GENRES = [
    { id: "cinematic", label: "Cinematic" },
    { id: "action", label: "Action" },
    { id: "horror", label: "Horror" },
    { id: "comedy", label: "Comedy" },
    { id: "suspense", label: "Suspense" },
    { id: "drama", label: "Drama" },
    { id: "documentary", label: "Documentary" },
];

const ASPECT_RATIOS = [
    { label: "16:9 (Wide)", value: "16:9" },
    { label: "9:16 (Vertical)", value: "9:16" },
];

const DIRECTOR_STYLE_PRESETS = getStylePresetsForMode("director");

export default function DirectorPage() {
    const { credits, deductCredits, refundCredits, planName } = useCredits();

    const [prompt, setPrompt] = useState("");
    const [model, setModel] = useState("dop-preview");
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Director Settings
    const [cameraMovement, setCameraMovement] = useState("auto");
    const [motionIntensity, setMotionIntensity] = useState(50);
    const [genre, setGenre] = useState("cinematic");
    const [quality, setQuality] = useState<"720p" | "1080p">("720p");
    const [enhancePrompt, setEnhancePrompt] = useState(true);
    const [stylePreset, setStylePreset] = useState(getDefaultStylePresetId("director"));
    const [promptIntensity, setPromptIntensity] = useState(75);
    const [customDirection, setCustomDirection] = useState("");
    const [soulMode, setSoulMode] = useState(false);
    const [seed, setSeed] = useState("");
    const [aspectRatio, setAspectRatio] = useState("16:9");
    
    // Image Upload State
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [referencePreview, setReferencePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    // Gallery State
    const [history, setHistory] = useState<VideoHistoryItem[]>([]);
    const [previewVideo, setPreviewVideo] = useState<string | null>(null);

    // Settings dropdown
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);

    const selectedModelConfig = DOP_MODELS.find(m => m.id === model) || DOP_MODELS[0];
    const selectedPreset = DIRECTOR_STYLE_PRESETS.find((preset) => preset.id === stylePreset) || DIRECTOR_STYLE_PRESETS[0];

    useEffect(() => {
        fetch("/api/generations?type=director")
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

        setGenerating(true);
        setError(null);
        setSettingsOpen(false);

        deductCredits(selectedModelConfig.cost);

        try {
            const res = await fetch("/api/video/director", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: prompt || "Animate this image with cinematic motion",
                    model,
                    aspectRatio, // Can be useful for DOP mapping
                    cameraMovement,
                    motionIntensity: motionIntensity / 100,
                    genre,
                    quality,
                    imageUrl: referenceImage || undefined,
                    stylePreset,
                    intensity: promptIntensity,
                    customDirection,
                    soulMode,
                    seed: seed ? parseInt(seed, 10) : undefined,
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
                setPreviewVideo(data.url || data.videoUrl);
                setHistory((prev) => [
                    { url: data.url || data.videoUrl, prompt, createdAt: Date.now() },
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
                    Blueprints Studio
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
                            placeholder={referenceImage ? "Describe how to sequence this video..." : "Describe your blueprint... e.g., 'A dramatic tracking shot through a neon-lit city'"}
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

                             {cameraMovement && genre && (
                                 <div className="px-3 py-1.5 rounded-full bg-white/5 text-white/50 text-[10px] font-bold uppercase tracking-wider">
                                     {CAMERA_MOVEMENTS.find(c => c.id === cameraMovement)?.label} · {GENRES.find(g => g.id === genre)?.label}
                                 </div>
                             )}
                        </div>
                    </div>

                    {/* Settings Drawer (Expanded) */}
                    <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${settingsOpen ? 'max-h-[800px] opacity-100 border-t border-white/5 mt-2' : 'max-h-0 opacity-0'}`}
                    >
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 h-full max-h-[60vh] overflow-y-auto hide-scrollbar">
                            {/* Left Col: Model & Directing */}
                            <div className="space-y-5">
                                {/* Model */}
                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">DOP Model</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {DOP_MODELS.map(m => (
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

                                {/* Camera Movement */}
                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Camera View</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {CAMERA_MOVEMENTS.slice(0, 9).map(cam => (
                                            <button
                                                key={cam.id}
                                                onClick={() => setCameraMovement(cam.id)}
                                                className={`flex-1 py-2 text-[9px] rounded-xl border text-center transition-all font-bold uppercase ${cameraMovement === cam.id
                                                    ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                                                    : "bg-black/40 border-white/5 text-white/50 hover:border-white/10 hover:text-white"
                                                }`}
                                            >
                                                {cam.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Genre & Motion */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Aspect Ratio */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Ratio</label>
                                        <div className="flex flex-col gap-2">
                                            {ASPECT_RATIOS.map(ar => (
                                                <button
                                                    key={ar.value}
                                                    onClick={() => setAspectRatio(ar.value)}
                                                    className={`py-2 text-[10px] rounded-xl border text-center transition-all font-bold ${aspectRatio === ar.value
                                                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                                                        : "bg-black/40 border-white/5 text-white/50 hover:border-white/10 hover:text-white"
                                                    }`}
                                                >
                                                    {ar.label.split(' ')[0]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Genre</label>
                                        <select 
                                            value={genre}
                                            onChange={(e) => setGenre(e.target.value)}
                                            className="w-full bg-black/40 border border-white/5 hover:border-white/10 rounded-xl px-3 py-[10px] text-xs font-bold uppercase tracking-wider text-white outline-none appearance-none"
                                        >
                                            {GENRES.map(g => (
                                                <option key={g.id} value={g.id}>{g.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Style & Details */}
                            <div className="space-y-5">
                                {/* Style Preset */}
                                <div className="flex flex-col">
                                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Style Preset</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
                                            className="w-full bg-black/40 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none flex items-center justify-between transition-colors z-10 relative"
                                        >
                                            <span className="truncate pr-2">
                                                {selectedPreset ? `${selectedPreset.name} - ${selectedPreset.description}` : "Select Style"}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform ${isStyleDropdownOpen ? "rotate-180" : ""}`} />
                                        </button>
                                        
                                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isStyleDropdownOpen ? "max-h-[250px] mt-2 opacity-100" : "max-h-0 opacity-0"}`}>
                                            <div className="bg-[#121419] border border-white/10 rounded-xl overflow-hidden shadow-inner max-h-[200px] overflow-y-auto w-full flex flex-col hide-scrollbar">
                                                {DIRECTOR_STYLE_PRESETS.map(preset => (
                                                    <button
                                                        key={preset.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setStylePreset(preset.id);
                                                            setIsStyleDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2.5 text-xs hover:bg-white/5 transition-colors flex flex-col gap-0.5 ${stylePreset === preset.id ? 'bg-cyan-500/10 text-cyan-400' : 'text-white/80'}`}
                                                    >
                                                        <span className="font-bold truncate">{preset.name}</span>
                                                        <span className={`text-[10px] truncate w-full ${stylePreset === preset.id ? 'text-cyan-400/70' : 'text-white/40'}`}>{preset.description}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhance & Soul */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col justify-between bg-black/40 border border-white/5 rounded-xl px-4 py-3 cursor-pointer" onClick={() => setEnhancePrompt(!enhancePrompt)}>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-white uppercase tracking-wider">AI Enhance</p>
                                            <div className={`w-7 h-4 rounded-full transition-colors relative ${enhancePrompt ? "bg-cyan-500" : "bg-white/10"}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${enhancePrompt ? "left-[14px]" : "left-0.5"}`} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`flex flex-col justify-between border rounded-xl px-4 py-3 cursor-pointer transition-colors ${soulMode ? "bg-purple-500/10 border-purple-500/30" : "bg-black/40 border-white/5"}`} onClick={() => setSoulMode(!soulMode)}>
                                        <div className="flex items-center justify-between">
                                            <p className={`text-[10px] font-bold uppercase tracking-wider ${soulMode ? "text-purple-400" : "text-white"}`}>Soul Mode</p>
                                            <Sparkles className={`w-4 h-4 ${soulMode ? "text-purple-400" : "text-white/20"}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Motion Intensity */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Motion Intensity</label>
                                        <span className="text-[10px] text-cyan-400 font-bold">{motionIntensity}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100"
                                        value={motionIntensity}
                                        onChange={(e) => setMotionIntensity(Number(e.target.value))}
                                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full"
                                    />
                                </div>

                                {/* Prompt Intensity */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Prompt Intensity</label>
                                        <span className="text-[10px] text-cyan-400 font-bold">{promptIntensity}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100"
                                        value={promptIntensity}
                                        onChange={(e) => setPromptIntensity(Number(e.target.value))}
                                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full"
                                    />
                                </div>
                                
                                {/* Custom Direction */}
                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">Custom Direction</label>
                                    <input
                                        type="text"
                                        value={customDirection}
                                        onChange={(e) => setCustomDirection(e.target.value)}
                                        placeholder="Mood, lighting, specific focus..."
                                        className="w-full px-3 py-2 bg-black/40 border border-white/[0.06] rounded-xl text-xs text-white placeholder-white/20 outline-none focus:border-cyan-500/40 transition-colors"
                                    />
                                </div>

                                {/* Seed */}
                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">Seed (Optional)</label>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        value={seed}
                                        onChange={(e) => setSeed(e.target.value.replace(/[^0-9]/g, ""))}
                                        placeholder="e.g. 42"
                                        className="w-full px-3 py-2 bg-black/40 border border-white/[0.06] rounded-xl text-xs text-white placeholder-white/20 outline-none focus:border-cyan-500/40 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Nav / Submit Row */}
                    <div className="flex items-center justify-between px-2 md:px-4 py-2 mt-1 relative z-20">
                        <PromptBarTabs active="blueprints" />
                        
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
                <VideoPreviewOverlay
                    videoUrl={previewVideo}
                    onClose={() => setPreviewVideo(null)}
                />
            )}

            {/* Full Screen Loading Overlay while generating */}
            {generating && (
                <GenerationLoadingOverlay
                    title="Architecting Blueprint"
                    subtitle="This takes about 30-60 seconds"
                    icon={Film}
                />
            )}

            {/* Gallery */}
            <VideoGallery
                history={history}
                title="Recent Blueprints"
                onSelectVideo={setPreviewVideo}
            />

        </div>
    );
}
