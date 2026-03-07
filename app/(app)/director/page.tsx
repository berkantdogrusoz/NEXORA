"use client";

import { useState, useRef, useEffect } from "react";
import { useCredits } from "@/app/providers/credit-provider";
import {
    Upload, X, Loader2, Play, Download, Video, Lock,
    ChevronDown, ChevronUp, Camera, Clapperboard, Sparkles,
    Film, Crosshair, Zap, Eye, Settings2
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
    { id: "auto", label: "Auto", icon: "🎬" },
    { id: "dolly_in", label: "Dolly In", icon: "⬆️" },
    { id: "dolly_out", label: "Dolly Out", icon: "⬇️" },
    { id: "pan_left", label: "Pan Left", icon: "⬅️" },
    { id: "pan_right", label: "Pan Right", icon: "➡️" },
    { id: "crane_up", label: "Crane Up", icon: "🏗️" },
    { id: "crane_down", label: "Crane Down", icon: "📐" },
    { id: "zoom_in", label: "Zoom In", icon: "🔍" },
    { id: "zoom_out", label: "Zoom Out", icon: "🔎" },
    { id: "orbit_left", label: "Orbit Left", icon: "🔄" },
    { id: "orbit_right", label: "Orbit Right", icon: "🔃" },
    { id: "drone_flyover", label: "Drone Flyover", icon: "🛸" },
    { id: "tracking_shot", label: "Tracking", icon: "🎯" },
    { id: "fixed", label: "Fixed", icon: "📌" },
];

const GENRES = [
    { id: "cinematic", label: "Cinematic", color: "from-amber-500 to-orange-500" },
    { id: "action", label: "Action", color: "from-red-500 to-pink-500" },
    { id: "horror", label: "Horror", color: "from-purple-600 to-violet-800" },
    { id: "comedy", label: "Comedy", color: "from-yellow-400 to-amber-500" },
    { id: "suspense", label: "Suspense", color: "from-slate-500 to-gray-700" },
    { id: "drama", label: "Drama", color: "from-blue-500 to-indigo-600" },
    { id: "documentary", label: "Documentary", color: "from-emerald-500 to-teal-600" },
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

    // Cinema Controls
    const [model, setModel] = useState("dop-preview");
    const [cameraMovement, setCameraMovement] = useState("auto");
    const [motionIntensity, setMotionIntensity] = useState(50);
    const [genre, setGenre] = useState("cinematic");
    const [quality, setQuality] = useState<"720p" | "1080p">("720p");
    const [enhancePrompt, setEnhancePrompt] = useState(true);
    const [soulMode, setSoulMode] = useState(false);
    const [seed, setSeed] = useState("");

    // UI panels
    const [showAdvanced, setShowAdvanced] = useState(false);

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

    const handleGenerate = async () => {
        if (!prompt && !referenceImage) return;
        if (credits !== null && credits < cost) {
            setError("Insufficient credits.");
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
                    imageUrl: referenceImage,
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

            const data = await res.json();
            if (!res.ok) {
                refundCredits(cost);
                setError(data.error || "Generation failed.");
                return;
            }

            setVideoUrl(data.url);
            setHistory((prev) => [
                { url: data.url, prompt, model: data.model || model, createdAt: Date.now() },
                ...prev,
            ]);
        } catch {
            refundCredits(cost);
            setError("Something went wrong. Credits refunded.");
        } finally {
            setGenerating(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setReferenceImage(base64);
            setReferencePreview(base64);
        };
        reader.readAsDataURL(file);
    };

    // If credits haven't loaded yet, show skeleton
    if (credits === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* ── Header ── */}
            <div className="border-b border-white/[0.06] bg-gradient-to-r from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f]">
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/20">
                            <Clapperboard className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">Cinema Studio</h1>
                            <p className="text-xs text-slate-500">Powered by Higgsfield DOP • Professional AI Cinematography</p>
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                            <span className="text-xs text-slate-500">Model:</span>
                            <span className="text-xs font-bold text-amber-400 uppercase">{selectedModel.name}</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs font-bold text-cyan-400">{cost} credits</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* ═════════════════════════════════════════════
                        LEFT: PROMPT + PREVIEW (8 cols)
                    ═════════════════════════════════════════════ */}
                    <div className="lg:col-span-8 space-y-5">

                        {/* Prompt Input */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
                            <div className="flex items-center gap-2">
                                <Film className="w-4 h-4 text-amber-400" />
                                <span className="text-sm font-semibold text-white">Scene Description</span>
                                <span className="text-xs text-slate-500 ml-auto">{prompt.length}/500</span>
                            </div>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
                                placeholder="A cinematic tracking shot through a neon-lit Tokyo alley at night. Rain reflects off wet cobblestones. Camera slowly dollies forward..."
                                className="w-full h-28 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-amber-500/40 transition-colors"
                            />

                            {/* Reference Image */}
                            <div className="flex items-center gap-3">
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                {referencePreview ? (
                                    <div className="relative group">
                                        <Image src={referencePreview} alt="Reference" width={80} height={80} className="w-20 h-20 object-cover rounded-xl border border-white/[0.08]" />
                                        <button
                                            onClick={() => { setReferenceImage(null); setReferencePreview(null); }}
                                            className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-slate-400 hover:border-amber-500/30 hover:text-amber-400 transition-all"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        Reference Image
                                    </button>
                                )}

                                {referenceImage && (
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={soulMode}
                                            onChange={(e) => setSoulMode(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`w-8 h-4 rounded-full transition-colors ${soulMode ? "bg-amber-500" : "bg-white/10"}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${soulMode ? "translate-x-4" : "translate-x-0"}`} />
                                        </div>
                                        <span className="text-xs text-slate-400 group-hover:text-amber-400">Soul Mode</span>
                                    </label>
                                )}

                                <div className="ml-auto">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={generating || (!prompt && !referenceImage)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-500/20"
                                    >
                                        {generating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Clapperboard className="w-4 h-4" />
                                                Generate Cinema • {cost} cr
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Generating Status */}
                        {generating && (
                            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-8 text-center space-y-4">
                                <div className="relative mx-auto w-16 h-16">
                                    <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full" />
                                    <div className="absolute inset-0 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                    <Camera className="absolute inset-0 m-auto w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Generating with {selectedModel.name}...</p>
                                    <p className="text-xs text-slate-500 mt-1">Estimated time: {selectedModel.speed} • Do not close this page</p>
                                </div>
                            </div>
                        )}

                        {/* Video Preview */}
                        {videoUrl && !generating && (
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                                <video
                                    src={videoUrl}
                                    controls
                                    autoPlay
                                    loop
                                    className="w-full aspect-video bg-black"
                                />
                                <div className="p-4 flex items-center justify-between">
                                    <p className="text-xs text-slate-500 truncate max-w-[60%]">{prompt}</p>
                                    <a
                                        href={videoUrl}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-xs text-white font-medium transition-all"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* History */}
                        {history.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Video className="w-4 h-4 text-amber-400" />
                                    Previous Generations
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {history.slice(0, 6).map((item, i) => (
                                        <div key={i} className="group relative bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden hover:border-amber-500/20 transition-all">
                                            <video
                                                src={item.url}
                                                muted
                                                loop
                                                className="w-full aspect-video bg-black object-cover"
                                                onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                                                onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                                            />
                                            <div className="p-3">
                                                <p className="text-xs text-slate-400 truncate">{item.prompt}</p>
                                                <p className="text-[10px] text-slate-600 mt-1">{item.model} • {new Date(item.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ═════════════════════════════════════════════
                        RIGHT: CINEMA CONTROLS (4 cols)
                    ═════════════════════════════════════════════ */}
                    <div className="lg:col-span-4 space-y-4">

                        {/* DOP Model Selector */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Camera className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">DOP Model</span>
                            </div>
                            <div className="space-y-2">
                                {DOP_MODELS.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setModel(m.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${model === m.id
                                            ? "bg-amber-500/10 border-amber-500/30 text-white"
                                            : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-white/[0.12]"
                                            }`}
                                    >
                                        <div>
                                            <span className="text-sm font-semibold">{m.name}</span>
                                            <span className="block text-[10px] text-slate-500 mt-0.5">{m.desc} • {m.speed}</span>
                                        </div>
                                        <span className={`text-xs font-bold ${model === m.id ? "text-amber-400" : "text-slate-600"}`}>
                                            {m.cost} cr
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Camera Movement */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Crosshair className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Camera Movement</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                                {CAMERA_MOVEMENTS.map((cam) => (
                                    <button
                                        key={cam.id}
                                        onClick={() => setCameraMovement(cam.id)}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all ${cameraMovement === cam.id
                                            ? "bg-amber-500/10 border-amber-500/30"
                                            : "bg-white/[0.02] border-white/[0.04] hover:border-white/[0.1]"
                                            }`}
                                    >
                                        <span className="text-base">{cam.icon}</span>
                                        <span className={`text-[9px] font-medium leading-tight ${cameraMovement === cam.id ? "text-amber-300" : "text-slate-500"}`}>
                                            {cam.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Motion Intensity */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">Motion Intensity</span>
                                </div>
                                <span className="text-xs font-bold text-amber-400">{motionIntensity}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={motionIntensity}
                                onChange={(e) => setMotionIntensity(Number(e.target.value))}
                                className="w-full h-1.5 bg-white/[0.06] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-amber-500/30"
                            />
                            <div className="flex justify-between mt-2">
                                <span className="text-[10px] text-slate-600">Subtle</span>
                                <span className="text-[10px] text-slate-600">Dynamic</span>
                            </div>
                        </div>

                        {/* Genre */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Genre Motion</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {GENRES.map((g) => (
                                    <button
                                        key={g.id}
                                        onClick={() => setGenre(g.id)}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${genre === g.id
                                            ? `bg-gradient-to-r ${g.color} text-white border-transparent shadow-lg`
                                            : "bg-white/[0.03] border-white/[0.06] text-slate-500 hover:border-white/[0.12]"
                                            }`}
                                    >
                                        {g.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quality */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Eye className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Quality</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {(["720p", "1080p"] as const).map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => setQuality(q)}
                                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${quality === q
                                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                            : "bg-white/[0.02] border-white/[0.06] text-slate-500 hover:border-white/[0.12]"
                                            }`}
                                    >
                                        {q === "1080p" ? "1080p HD" : "720p"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Advanced Settings */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="w-full flex items-center justify-between p-4 text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <Settings2 className="w-4 h-4 text-slate-500" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Advanced</span>
                                </div>
                                {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                            </button>
                            {showAdvanced && (
                                <div className="px-4 pb-4 space-y-4 border-t border-white/[0.04] pt-4">
                                    {/* Enhance Prompt */}
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-xs text-slate-400">Enhance Prompt (AI)</span>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={enhancePrompt}
                                                onChange={(e) => setEnhancePrompt(e.target.checked)}
                                                className="sr-only"
                                            />
                                            <div className={`w-9 h-5 rounded-full transition-colors ${enhancePrompt ? "bg-amber-500" : "bg-white/10"}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${enhancePrompt ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                                            </div>
                                        </div>
                                    </label>

                                    {/* Seed */}
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Seed (optional)</label>
                                        <input
                                            type="number"
                                            value={seed}
                                            onChange={(e) => setSeed(e.target.value)}
                                            placeholder="Random"
                                            className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
