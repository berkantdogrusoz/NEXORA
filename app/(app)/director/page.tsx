"use client";

import { useState, useRef, useEffect } from "react";
import { useCredits } from "@/app/providers/credit-provider";
import {
    Upload, X, Loader2, Download, Settings2, Video,
    ChevronDown, ChevronUp, Clapperboard, Camera, Zap,
    Sparkles, Eye, Film, Crosshair
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ═══════════════════════════════════════
//   CINEMA STUDIO CONFIGURATION
// ═══════════════════════════════════════

const DOP_MODELS = [
    { id: "dop-lite", name: "DOP Lite", desc: "Fast preview", cost: 100, speed: "~30s" },
    { id: "dop-preview", name: "DOP Preview", desc: "Balanced quality", cost: 150, speed: "~60s" },
    { id: "dop-turbo", name: "DOP Turbo", desc: "Highest fidelity", cost: 200, speed: "~90s" },
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

export default function DirectorStudioPage() {
    const { credits, deductCredits, refundCredits, planName } = useCredits();
    const router = useRouter();

    // Core state
    const [prompt, setPrompt] = useState("");
    const [generating, setGenerating] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Reference image
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [referencePreview, setReferencePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    // Cinema Controls
    const [model, setModel] = useState("dop-preview");
    const [cameraMovement, setCameraMovement] = useState("auto");
    const [motionIntensity, setMotionIntensity] = useState(50);
    const [genre, setGenre] = useState("cinematic");
    const [quality, setQuality] = useState<"720p" | "1080p">("720p");
    const [enhancePrompt, setEnhancePrompt] = useState(true);
    const [soulMode, setSoulMode] = useState(false);
    const [seed, setSeed] = useState("");

    // Collapsible sidebar panels
    const [modelOpen, setModelOpen] = useState(true);
    const [cameraOpen, setCameraOpen] = useState(true);
    const [motionOpen, setMotionOpen] = useState(false);
    const [advancedOpen, setAdvancedOpen] = useState(false);

    // History
    const [history, setHistory] = useState<{ url: string; prompt: string; model: string; createdAt: number }[]>([]);

    // Redirect Free users
    useEffect(() => {
        if (credits !== null && planName === "Free") {
            router.push("/pricing");
        }
    }, [credits, planName, router]);

    // Load history
    useEffect(() => {
        fetch("/api/generations?type=director")
            .then((res) => res.json())
            .then((data) => {
                if (data.generations) {
                    setHistory(
                        data.generations.map((g: any) => ({
                            url: g.output_url,
                            prompt: g.prompt,
                            model: g.model_id,
                            createdAt: new Date(g.created_at).getTime(),
                        }))
                    );
                }
            })
            .catch(() => { });
    }, []);

    const selectedModel = DOP_MODELS.find((m) => m.id === model) || DOP_MODELS[1];
    const cost = selectedModel.cost;

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
        if (file.size > 10 * 1024 * 1024) { setError("Image must be under 10MB."); return; }

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
        setSoulMode(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleGenerate = async () => {
        if (!prompt && !referenceImage) return;
        if (credits !== null && credits < cost) {
            setError("Insufficient credits. Please upgrade your plan.");
            return;
        }

        setGenerating(true);
        setError(null);
        setVideoUrl(null);
        deductCredits(cost);

        try {
            const res = await fetch("/api/video/director", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    imageUrl: referenceImage || undefined,
                    model,
                    cameraMovement,
                    motionIntensity: motionIntensity / 100,
                    genre,
                    quality,
                    enhancePrompt,
                    soulMode,
                    seed: seed || undefined,
                }),
            });

            let data: any;
            try {
                data = await res.json();
            } catch {
                const text = await res.text().catch(() => "");
                setError(`Server error (${res.status}): ${text.slice(0, 200) || "No response"}`);
                refundCredits(cost);
                return;
            }

            if (res.ok && data.success) {
                setVideoUrl(data.url);
                setHistory((prev) => [
                    { url: data.url, prompt, model: data.model || model, createdAt: Date.now() },
                    ...prev.slice(0, 9),
                ]);
            } else {
                setError(data.error || "Generation failed.");
                refundCredits(cost);
            }
        } catch (err: any) {
            setError(`Error: ${err.message || "Connection failed"}`);
            refundCredits(cost);
        } finally {
            setGenerating(false);
        }
    };

    if (credits === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const cameraLabel = CAMERA_MOVEMENTS.find(c => c.id === cameraMovement)?.label || "Auto";
    const genreLabel = GENRES.find(g => g.id === genre)?.label || "Cinematic";

    return (
        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tight">
                    <Clapperboard className="w-8 h-8 text-cyan-500" />
                    Director Studio
                </h1>
                <p className="text-white/50 mt-2 text-sm font-medium tracking-wide uppercase">
                    Cinema Studio — Powered by Higgsfield DOP
                </p>
            </div>

            <div className="grid lg:grid-cols-[1fr,380px] gap-6">
                {/* ═══ Main Content ═══ */}
                <div className="space-y-6">
                    {/* Prompt Box */}
                    <div className="bg-[#0a0a0a] border border-white/[0.08] border-t-2 border-t-cyan-500/60 rounded-sm p-5">
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
                                    {uploading ? "Uploading..." : soulMode ? "Soul Mode" : "Reference"}
                                </span>
                            </div>
                        )}

                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
                            placeholder={referenceImage
                                ? "Describe how to animate this image with cinematic camera motion..."
                                : "Describe your cinematic scene... e.g., 'A dramatic tracking shot through a neon-lit city at night, rain reflecting off cobblestones'"
                            }
                            className="w-full h-28 bg-transparent text-white placeholder-white/30 resize-none outline-none border-none text-sm leading-relaxed"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleGenerate();
                                }
                            }}
                        />

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
                            <div className="flex items-center gap-4">
                                <div className="text-xs text-white/40 uppercase tracking-wider font-medium">
                                    <span className="font-bold text-cyan-400">{cost}</span> credits / video
                                </div>

                                {/* Upload button */}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-sm text-[10px] text-white/50 hover:border-cyan-500/30 hover:text-cyan-400 transition-all uppercase tracking-wider font-medium disabled:opacity-40"
                                >
                                    <Upload className="w-3 h-3" />
                                    {uploading ? "Uploading..." : "Image"}
                                </button>

                                {/* Soul Mode toggle (only when image uploaded) */}
                                {referenceImage && (
                                    <button
                                        onClick={() => setSoulMode(!soulMode)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] border uppercase tracking-wider font-bold transition-all ${soulMode
                                            ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                                            : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:border-white/[0.12]"
                                            }`}
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        Soul
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={generating || uploading || (!prompt && !referenceImage)}
                                className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white px-8 py-3 rounded-sm font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-wider text-sm"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Clapperboard className="w-4 h-4 mr-2" />
                                        Generate Cinema
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Output Area */}
                    <div className="aspect-video bg-black/80 border border-white/[0.06] rounded-sm overflow-hidden relative flex items-center justify-center group">
                        {generating ? (
                            <div className="text-center space-y-4">
                                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
                                <div className="text-cyan-400 font-medium animate-pulse text-sm uppercase tracking-wider">
                                    Generating with {selectedModel.name}...
                                </div>
                                <div className="text-white/30 text-xs uppercase tracking-wider">
                                    Estimated {selectedModel.speed} • Do not close this page
                                </div>
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
                                <p className="text-sm font-medium uppercase tracking-wider">Your cinematic video will appear here</p>
                            </div>
                        )}
                    </div>

                    {/* History */}
                    {history.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Video className="w-4 h-4 text-cyan-400" />
                                Previous Generations
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {history.slice(0, 6).map((item, i) => (
                                    <div key={i} className="group relative bg-[#0a0a0a] border border-white/[0.06] rounded-sm overflow-hidden hover:border-cyan-500/20 transition-all">
                                        <video
                                            src={item.url}
                                            muted
                                            loop
                                            playsInline
                                            className="w-full aspect-video bg-black object-cover"
                                            onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                                            onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                                        />
                                        <div className="p-2.5">
                                            <p className="text-[10px] text-white/40 truncate uppercase tracking-wider">{item.prompt}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══ Sidebar Controls ═══ */}
                <div className="space-y-4">
                    {/* Settings Header */}
                    <div className="flex items-center gap-2 px-1">
                        <Settings2 className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-xs font-bold text-white/60 uppercase tracking-[0.2em]">Cinema Settings</h3>
                    </div>

                    {/* DOP Model */}
                    <div className="bg-[#0a0a0a] border border-white/[0.08] border-t-2 border-t-cyan-500/60 rounded-sm">
                        <button
                            onClick={() => setModelOpen(!modelOpen)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-white/80 uppercase tracking-[0.15em]">DOP Model</span>
                                <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-sm font-medium">
                                    {selectedModel.name}
                                </span>
                            </div>
                            {modelOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                        </button>
                        <div className={`grid transition-all duration-300 ease-in-out ${modelOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                            <div className="overflow-hidden">
                                <div className="px-4 pb-4 space-y-2">
                                    {DOP_MODELS.map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => setModel(m.id)}
                                            className={`w-full px-3 py-2.5 text-xs rounded-sm border text-left transition-all font-medium uppercase tracking-wider flex items-center justify-between ${model === m.id
                                                ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 font-bold"
                                                : "bg-black/40 border-white/[0.06] text-white/50 hover:border-white/[0.12] hover:text-white/70"
                                                }`}
                                        >
                                            <div>
                                                <span>{m.name}</span>
                                                <span className="block text-[9px] text-white/30 normal-case mt-0.5">{m.desc} · {m.speed}</span>
                                            </div>
                                            <span className="text-[10px] text-white/30 font-normal normal-case">{m.cost} cr</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Camera Movement */}
                    <div className="bg-[#0a0a0a] border border-white/[0.08] border-t-2 border-t-cyan-500/60 rounded-sm">
                        <button
                            onClick={() => setCameraOpen(!cameraOpen)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-white/80 uppercase tracking-[0.15em]">Camera</span>
                                <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-sm font-medium">
                                    {cameraLabel}
                                </span>
                            </div>
                            {cameraOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                        </button>
                        <div className={`grid transition-all duration-300 ease-in-out ${cameraOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                            <div className="overflow-hidden">
                                <div className="px-4 pb-4">
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {CAMERA_MOVEMENTS.map((cam) => (
                                            <button
                                                key={cam.id}
                                                onClick={() => setCameraMovement(cam.id)}
                                                className={`px-2 py-2 text-[9px] rounded-sm border text-center transition-all font-bold uppercase tracking-wider ${cameraMovement === cam.id
                                                    ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                                                    : "bg-black/40 border-white/[0.06] text-white/40 hover:border-white/[0.12] hover:text-white/70"
                                                    }`}
                                            >
                                                {cam.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Motion & Genre */}
                    <div className="bg-[#0a0a0a] border border-white/[0.08] border-t-2 border-t-cyan-500/60 rounded-sm">
                        <button
                            onClick={() => setMotionOpen(!motionOpen)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-white/80 uppercase tracking-[0.15em]">Motion & Genre</span>
                                <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-sm font-medium">
                                    {motionIntensity}% · {genreLabel}
                                </span>
                            </div>
                            {motionOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                        </button>
                        <div className={`grid transition-all duration-300 ease-in-out ${motionOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                            <div className="overflow-hidden">
                                <div className="px-4 pb-4 space-y-4">
                                    {/* Intensity Slider */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Intensity</p>
                                            <span className="text-[10px] font-bold text-cyan-400">{motionIntensity}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={motionIntensity}
                                            onChange={(e) => setMotionIntensity(Number(e.target.value))}
                                            className="w-full h-1 bg-white/[0.06] rounded-sm appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                                        />
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[9px] text-white/20 uppercase tracking-wider">Subtle</span>
                                            <span className="text-[9px] text-white/20 uppercase tracking-wider">Dynamic</span>
                                        </div>
                                    </div>

                                    {/* Genre */}
                                    <div>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Genre</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {GENRES.map((g) => (
                                                <button
                                                    key={g.id}
                                                    onClick={() => setGenre(g.id)}
                                                    className={`px-2.5 py-1.5 text-[10px] rounded-sm border transition-all font-bold uppercase tracking-wider ${genre === g.id
                                                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                                                        : "bg-black/40 border-white/[0.06] text-white/40 hover:border-white/[0.12] hover:text-white/70"
                                                        }`}
                                                >
                                                    {g.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Advanced */}
                    <div className="bg-[#0a0a0a] border border-white/[0.08] border-t-2 border-t-cyan-500/60 rounded-sm">
                        <button
                            onClick={() => setAdvancedOpen(!advancedOpen)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-white/80 uppercase tracking-[0.15em]">Advanced</span>
                                <span className="text-[10px] px-2 py-0.5 bg-white/[0.03] text-white/30 border border-white/[0.06] rounded-sm font-medium">
                                    {quality} · {enhancePrompt ? "AI Enhanced" : "Raw"}
                                </span>
                            </div>
                            {advancedOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                        </button>
                        <div className={`grid transition-all duration-300 ease-in-out ${advancedOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                            <div className="overflow-hidden">
                                <div className="px-4 pb-4 space-y-4">
                                    {/* Quality */}
                                    <div>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Quality</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(["720p", "1080p"] as const).map((q) => (
                                                <button
                                                    key={q}
                                                    onClick={() => setQuality(q)}
                                                    className={`px-3 py-2.5 text-xs rounded-sm border text-center transition-all font-medium uppercase tracking-wider ${quality === q
                                                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 font-bold"
                                                        : "bg-black/40 border-white/[0.06] text-white/50 hover:border-white/[0.12] hover:text-white/70"
                                                        }`}
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Enhance Prompt */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">AI Enhance</span>
                                        <button
                                            onClick={() => setEnhancePrompt(!enhancePrompt)}
                                            className={`w-9 h-5 rounded-sm transition-colors relative ${enhancePrompt ? "bg-cyan-500" : "bg-white/10"}`}
                                        >
                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-sm shadow transition-transform ${enhancePrompt ? "left-[18px]" : "left-0.5"}`} />
                                        </button>
                                    </div>

                                    {/* Seed */}
                                    <div>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Seed</p>
                                        <input
                                            type="number"
                                            value={seed}
                                            onChange={(e) => setSeed(e.target.value)}
                                            placeholder="Random"
                                            className="w-full px-3 py-2 bg-black/40 border border-white/[0.06] rounded-sm text-xs text-white placeholder-white/20 outline-none focus:border-cyan-500/40 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
