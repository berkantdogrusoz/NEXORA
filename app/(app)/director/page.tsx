"use client";

import { useState, useRef, useEffect } from "react";
import { useCredits } from "@/app/providers/credit-provider";
import { Upload, X, Loader2, Play, Download, Settings2, Video, Lock, Camera } from "lucide-react";
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

    // Redirect Free users to pricing
    useEffect(() => {
        if (planName === "Free") {
            router.push("/pricing");
        }
    }, [planName, router]);

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
            setSoulMode(true); // Automatically enable Soul Mode when image is uploaded
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

        const cost = 120; // Higgsfield API cost

        if (credits !== null && credits < cost) {
            setError(`Insufficient credits. You need ${cost} credits.`);
            return;
        }

        setGenerating(true);
        setError(null);
        setVideoUrl(null);

        // Optimistically deduct credits
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
                // Refund if API fails
                refundCredits(cost);
                throw new Error(data.error || "Failed to generate video");
            }

            setVideoUrl(data.url);

            // Add to history
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

    if (planName === "Free") {
        return (
            <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-cyan-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-cyan-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Premium Feature</h1>
                    <p className="text-white/60">
                        The Director Studio (Powered by Higgsfield AI) is exclusively available for Premium members. Upgrade to get access to advanced camera controls and Soul Mode.
                    </p>
                    <button onClick={() => router.push("/pricing")} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white mt-4 font-bold rounded-xl py-6 transition-colors">
                        View Premium Plans
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-white flex items-center gap-3">
                    <Camera className="w-8 h-8 text-cyan-500" />
                    Director Studio <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 align-top uppercase tracking-widest border border-cyan-500/30">Premium</span>
                </h1>
                <p className="text-white/60 mt-2 text-lg font-medium">
                    Powered by Higgsfield AI. Unmatched character consistency and advanced camera controls.
                </p>
            </div>

            <div className="grid lg:grid-cols-[1fr,400px] gap-8">
                {/* Main Content Area */}
                <div className="space-y-6">
                    {/* Prompt Box */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your cinematic scene... e.g., 'A cyberpunk bounty hunter walking through rain-slicked neon streets, cinematic lighting, 8k resolution'"
                            className="w-full h-32 bg-transparent text-white placeholder-white/40 resize-none outline-none border-none text-lg"
                        />

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-white/40">
                                    <span className="font-bold text-cyan-400">120</span> credits / run
                                </div>
                            </div>

                            <button
                                onClick={generateVideo}
                                disabled={generating || (!prompt && !referenceImage)}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-cyan-900/20 disabled:opacity-50 flex items-center transition-colors"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Directing Scene...
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
                    <div className="aspect-[16/9] bg-black/50 border border-white/10 rounded-2xl overflow-hidden relative flex items-center justify-center group">
                        {generating ? (
                            <div className="text-center space-y-4">
                                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
                                <div className="text-cyan-400 font-medium animate-pulse">
                                    AI is synthesizing camera motion & characters...
                                </div>
                                <div className="text-white/40 text-sm">This may take 1-2 minutes</div>
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
                                        className="p-3 bg-black/50 hover:bg-cyan-600 text-white rounded-full backdrop-blur-md transition-colors"
                                    >
                                        <Download className="w-5 h-5" />
                                    </a>
                                </div>
                            </>
                        ) : error ? (
                            <div className="text-red-400 text-center px-4">
                                <p className="font-bold mb-2">Generation Failed</p>
                                <p className="text-sm opacity-80">{error}</p>
                            </div>
                        ) : (
                            <div className="text-white/20 text-center">
                                <Camera className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-medium">Your cinematic output will appear here</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-cyan-400" />
                            Director Settings
                        </h3>

                        {/* Camera Controls */}
                        <div className="space-y-3 mb-8">
                            <label className="text-sm font-bold text-white/80 uppercase tracking-wider">Camera Motion</label>
                            <div className="grid grid-cols-2 gap-2">
                                {CAMERA_TYPES.map(cam => (
                                    <button
                                        key={cam.value}
                                        onClick={() => setCameraMode(cam.value)}
                                        className={`px-3 py-2 text-sm rounded-xl border text-center transition-all ${cameraMode === cam.value
                                            ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 font-bold"
                                            : "bg-black/20 border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                                            }`}
                                    >
                                        {cam.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Soul Mode (Character Consistency) */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-white/80 uppercase tracking-wider">Soul Mode (Character)</label>
                                <div className={`text-xs px-2 py-1 rounded px border ${soulMode ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 text-white/40 border-white/10'}`}>
                                    {soulMode ? 'Active' : 'Missing Image'}
                                </div>
                            </div>
                            <p className="text-xs text-white/50 mb-4">
                                Upload a photo of a person. The AI will preserve their exact facial features and identity across the video.
                            </p>

                            {!referencePreview ? (
                                <div
                                    className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer group"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="w-8 h-8 text-white/40 mx-auto mb-3 group-hover:text-cyan-400 transition-colors" />
                                    <p className="text-sm text-white/60 font-medium">Click to upload face reference</p>
                                    <p className="text-xs text-white/40 mt-1">JPG, PNG up to 10MB</p>
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden border border-white/20 aspect-video group">
                                    <Image
                                        src={referencePreview}
                                        alt="Soul Anchor"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <button
                                            onClick={removeImage}
                                            className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-[10px] uppercase font-bold rounded backdrop-blur border border-white/20">
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

            {/* History Section */}
            {history.length > 0 && (
                <div className="mt-16">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Video className="w-5 h-5 text-cyan-400" />
                        Your Director's Cut
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {history.map((item, i) => (
                            <div key={i} className="group relative aspect-video bg-white/5 rounded-xl overflow-hidden border border-white/10">
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
                                    <p className="text-white text-xs line-clamp-2 font-medium mb-3">{item.prompt}</p>
                                    <div className="flex gap-2">
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3 py-1.5 bg-cyan-600 text-white text-xs font-bold rounded hover:bg-cyan-500 transition-colors flex items-center gap-1 w-full justify-center"
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
