"use client";

import { useState, useRef, useEffect } from "react";
import { useCredits } from "@/app/providers/credit-provider";
import { Upload, X, Loader2, Play, Download, Settings2, Video, Lock, Camera, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const CAMERA_TYPES = [
    { label: "Default (Auto)", value: "auto" },
    { label: "Fixed Camera", value: "fixed" },
    { label: "Pan Left", value: "pan_left" },
    { label: "Pan Right", value: "pan_right" },
    { label: "Zoom In", value: "zoom_in" },
    { label: "Zoom Out", value: "zoom_out" },
];

export default function DirectorStudioPage() {
    const { credits, deductCredits, refundCredits, planName } = useCredits();
    const router = useRouter();

    const [prompt, setPrompt] = useState("");
    const [generating, setGenerating] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [referencePreview, setReferencePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [history, setHistory] = useState<
        { url: string; prompt: string; createdAt: number }[]
    >([]);

    // Director Settings
    const [cameraMode, setCameraMode] = useState("auto");
    const [soulMode, setSoulMode] = useState(false);

    // Collapsible panels
    const [cameraOpen, setCameraOpen] = useState(true);
    const [soulOpen, setSoulOpen] = useState(true);

    // Redirect Free users to pricing (only after credits have loaded)
    useEffect(() => {
        if (credits !== null && planName === "Free") {
            router.push("/pricing");
        }
    }, [credits, planName, router]);

    // Load history
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
            setSoulMode(true);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setReferenceImage(null);
        setReferencePreview(null);
        setSoulMode(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const generateVideo = async () => {
        if (!prompt && (!referenceImage || !soulMode)) {
            setError("Please provide a prompt or upload a reference image.");
            return;
        }

        if (planName === "Free") {
            setError("Director Studio is a Premium-only feature.");
            router.push("/pricing");
            return;
        }

        const cost = 150;

        if (credits !== null && credits < cost) {
            setError(`Insufficient credits. You need ${cost} credits.`);
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
                    cameraMode,
                    soulMode
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                refundCredits(cost);
                throw new Error(data.error || "Failed to generate video");
            }

            setVideoUrl(data.url);

            setHistory(prev => [{
                url: data.url,
                prompt: prompt || "Soul Mode Generation",
                createdAt: Date.now()
            }, ...prev]);

        } catch (err: any) {
            setError(err.message || "An error occurred during generation");
        } finally {
            setGenerating(false);
        }
    };

    const selectedCameraLabel = CAMERA_TYPES.find(c => c.value === cameraMode)?.label || "Auto";

    // Show loading while credits are being fetched
    if (credits === null) {
        return (
            <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        );
    }

    if (planName === "Free") {
        return (
            <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-cyan-600/20 rounded-sm flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-cyan-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white uppercase tracking-wide">Premium Feature</h1>
                    <p className="text-white/60">
                        The Director Studio (Powered by Higgsfield AI) is exclusively available for Premium members. Upgrade to get access to advanced camera controls and Soul Mode.
                    </p>
                    <button onClick={() => router.push("/pricing")} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white mt-4 font-bold rounded-sm py-6 transition-colors uppercase tracking-wider">
                        View Premium Plans
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tight">
                    <Camera className="w-8 h-8 text-cyan-500" />
                    Director Studio
                    <span className="text-[10px] px-2.5 py-1 bg-cyan-500/20 text-cyan-400 uppercase tracking-[0.2em] font-black border border-cyan-500/30 rounded-sm">
                        Premium
                    </span>
                </h1>
                <p className="text-white/50 mt-2 text-sm font-medium tracking-wide uppercase">
                    Powered by Higgsfield AI — Character consistency & advanced camera controls
                </p>
            </div>

            <div className="grid lg:grid-cols-[1fr,380px] gap-6">
                {/* Main Content Area */}
                <div className="space-y-6">
                    {/* Prompt Box */}
                    <div className="bg-[#0a0a0a] border border-white/[0.08] border-t-2 border-t-cyan-500/60 rounded-sm p-5">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your cinematic scene... e.g., 'A cyberpunk bounty hunter walking through rain-slicked neon streets, cinematic lighting, 8k resolution'"
                            className="w-full h-28 bg-transparent text-white placeholder-white/30 resize-none outline-none border-none text-sm leading-relaxed"
                        />

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
                            <div className="text-xs text-white/40 uppercase tracking-wider font-medium">
                                <span className="font-bold text-cyan-400">150</span> credits / run
                            </div>

                            <button
                                onClick={generateVideo}
                                disabled={generating || (!prompt && !referenceImage)}
                                className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white px-8 py-3 rounded-sm font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-wider text-sm"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Directing...
                                    </>
                                ) : (
                                    <>
                                        <Video className="w-4 h-4 mr-2" />
                                        Generate Scene
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Output Area */}
                    <div className="aspect-[16/9] bg-black/80 border border-white/[0.06] rounded-sm overflow-hidden relative flex items-center justify-center group">
                        {generating ? (
                            <div className="text-center space-y-4">
                                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
                                <div className="text-cyan-400 font-medium animate-pulse text-sm uppercase tracking-wider">
                                    Synthesizing camera motion & characters...
                                </div>
                                <div className="text-white/30 text-xs uppercase tracking-wider">This may take 1-2 minutes</div>
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
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <a
                                        href={videoUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        download
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
                                <Camera className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p className="text-sm font-medium uppercase tracking-wider">Your cinematic output will appear here</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-4">
                    {/* Settings Header */}
                    <div className="flex items-center gap-2 px-1">
                        <Settings2 className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-xs font-bold text-white/60 uppercase tracking-[0.2em]">Director Settings</h3>
                    </div>

                    {/* Camera Controls — Collapsible */}
                    <div className="bg-[#0a0a0a] border border-white/[0.08] border-t-2 border-t-cyan-500/60 rounded-sm">
                        <button
                            onClick={() => setCameraOpen(!cameraOpen)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-white/80 uppercase tracking-[0.15em]">Camera Motion</span>
                                <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-sm font-medium">
                                    {selectedCameraLabel}
                                </span>
                            </div>
                            {cameraOpen ? (
                                <ChevronUp className="w-4 h-4 text-white/40" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-white/40" />
                            )}
                        </button>
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${cameraOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                        >
                            <div className="overflow-hidden">
                                <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                                    {CAMERA_TYPES.map(cam => (
                                        <button
                                            key={cam.value}
                                            onClick={() => setCameraMode(cam.value)}
                                            className={`px-3 py-2.5 text-xs rounded-sm border text-center transition-all font-medium uppercase tracking-wider ${cameraMode === cam.value
                                                ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 font-bold"
                                                : "bg-black/40 border-white/[0.06] text-white/50 hover:border-white/[0.12] hover:text-white/70"
                                                }`}
                                        >
                                            {cam.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Soul Mode — Collapsible */}
                    <div className="bg-[#0a0a0a] border border-white/[0.08] border-t-2 border-t-cyan-500/60 rounded-sm">
                        <button
                            onClick={() => setSoulOpen(!soulOpen)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-white/80 uppercase tracking-[0.15em]">Soul Mode</span>
                                <span className={`text-[10px] px-2 py-0.5 border rounded-sm font-medium ${soulMode
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : "bg-white/[0.03] text-white/30 border-white/[0.06]"
                                    }`}>
                                    {soulMode ? "Active" : "Missing Image"}
                                </span>
                            </div>
                            {soulOpen ? (
                                <ChevronUp className="w-4 h-4 text-white/40" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-white/40" />
                            )}
                        </button>
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${soulOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                        >
                            <div className="overflow-hidden">
                                <div className="px-4 pb-4">
                                    <p className="text-[11px] text-white/40 mb-4 leading-relaxed">
                                        Upload a photo of a person. The AI will preserve their exact facial features and identity across the video.
                                    </p>

                                    {!referencePreview ? (
                                        <div
                                            className="border-2 border-dashed border-white/[0.08] rounded-sm p-8 text-center hover:border-cyan-500/40 hover:bg-cyan-500/[0.03] transition-all cursor-pointer group"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="w-7 h-7 text-white/30 mx-auto mb-3 group-hover:text-cyan-400 transition-colors" />
                                            <p className="text-xs text-white/50 font-medium uppercase tracking-wider">Click to upload face reference</p>
                                            <p className="text-[10px] text-white/30 mt-1">JPG, PNG up to 10MB</p>
                                        </div>
                                    ) : (
                                        <div className="relative rounded-sm overflow-hidden border border-white/[0.1] aspect-video group">
                                            <Image
                                                src={referencePreview}
                                                alt="Soul Anchor"
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
                                                Soul Anchor Active
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
                        Your Director&apos;s Cut
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
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3 py-1.5 bg-cyan-600 text-white text-[10px] font-bold rounded-sm hover:bg-cyan-500 transition-colors flex items-center gap-1 w-full justify-center uppercase tracking-wider"
                                        >
                                            <Play className="w-3 h-3" /> View Full
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
