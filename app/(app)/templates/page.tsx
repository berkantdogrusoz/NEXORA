"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useCredits } from "@/app/providers/credit-provider";
import { Loader2, Upload, WandSparkles, Sparkles, Download, ListOrdered, Music, VolumeX } from "lucide-react";

type TemplateCard = {
  id: string;
  name: string;
  description: string;
  preview: string;
  duration: "5" | "10";
  aspectRatio: "16:9" | "9:16";
  motionSequence: string[];
  cameraDirection: string;
  styleDirection: string;
  audioTrack: string | null;
  audioVolume: number;
};

const TEMPLATE_COST = 20;

const MOTION_TEMPLATES: TemplateCard[] = [
  {
    id: "drunk-dance",
    name: "Drunk Dance",
    description: "Playful viral dance with wobble rhythm and smooth recovery beats.",
    preview: "/arts/styles/viral-social.png",
    duration: "10",
    aspectRatio: "9:16",
    audioTrack: "/audio/templates/drunk-dance.mp3",
    audioVolume: 0.8,
    motionSequence: [
      "Start in neutral stance with a tiny head nod and shoulder preload on beat.",
      "Lift one leg with playful imbalance, then recover into a centered bounce.",
      "Swing hips left-right for two counts while the upper body stays stable.",
      "Add alternating hand flicks at chest level with compact elbow motion.",
      "Finish with a quick half-turn and confident freeze pose while preserving identity.",
    ],
    cameraDirection: "Vertical full-body social framing, slightly handheld feel, keep subject centered.",
    styleDirection: "Cute viral dance aesthetic, realistic body mechanics, no body distortion.",
  },
  {
    id: "kitty-sway",
    name: "Kitty Sway",
    description: "Sweet side-to-side groove with clean paw and hip timing.",
    preview: "/arts/styles/ugc-creator.png",
    duration: "10",
    aspectRatio: "9:16",
    audioTrack: "/audio/templates/kitty-sway.mp3",
    audioVolume: 0.8,
    motionSequence: [
      "Start with a relaxed bounce and soft shoulder roll to the beat.",
      "Step right-left-right while hips sway in opposite direction.",
      "Lift one arm then the other in a smooth wave pattern.",
      "Add compact torso wiggle for two beats with stable foot contact.",
      "End with both hands up and a smiling freeze pose.",
    ],
    cameraDirection: "Vertical full-body framing with stable center composition.",
    styleDirection: "Cute and clean social dance energy with crisp rhythm timing.",
  },
  {
    id: "paw-pop",
    name: "Paw Pop",
    description: "Quick paw/hand pop choreography with upbeat tempo accents.",
    preview: "/arts/styles/viral-social.png",
    duration: "10",
    aspectRatio: "9:16",
    audioTrack: "/audio/templates/paw-pop.mp3",
    audioVolume: 0.8,
    motionSequence: [
      "Begin with two-count bounce and slight forward lean.",
      "Pop right hand forward, retract, then pop left hand forward.",
      "Lift one knee while both hands make a synchronized outward hit.",
      "Repeat hand-pop combo with faster tempo for two counts.",
      "Finish in centered stance with final chest pop and freeze.",
    ],
    cameraDirection: "Vertical medium full-body shot, fixed camera, no sudden reframing.",
    styleDirection: "Rhythm-forward dance clip with energetic but controlled motion.",
  },
  {
    id: "bubble-bounce",
    name: "Bubble Bounce",
    description: "Bouncy cheerful dance with shoulder hops and hip circles.",
    preview: "/arts/styles/dramatic-tv-teaser.jpg",
    duration: "10",
    aspectRatio: "9:16",
    audioTrack: "/audio/templates/bubble-bounce.mp3",
    audioVolume: 0.8,
    motionSequence: [
      "Start with two soft hops in place synced to the beat.",
      "Draw a small hip circle clockwise then counter-clockwise.",
      "Add alternating shoulder bounces while feet stay grounded.",
      "Lift one leg briefly and return to center with hand wave.",
      "Close with a cute side lean and still ending pose.",
    ],
    cameraDirection: "Vertical full-body framing, slight push-in near final beat.",
    styleDirection: "Sweet and playful dance style with stable facial consistency.",
  },
  {
    id: "street-groove",
    name: "Street Groove",
    description: "Urban groove combo with cleaner footwork and upper-body flow.",
    preview: "/arts/styles/street-interview.png",
    duration: "10",
    aspectRatio: "9:16",
    audioTrack: "/audio/templates/street-groove.mp3",
    audioVolume: 0.8,
    motionSequence: [
      "Start with head nod + shoulder isolation on beat.",
      "Add left-right step pattern with loose knee bounce and heel accents.",
      "Perform arm cross-and-open combo for two bars with clean timing.",
      "Transition into hip groove section with controlled torso roll.",
      "Finish with signature hand move and a sharp freeze-frame ending.",
    ],
    cameraDirection: "Vertical social framing, full-body visibility, steady center composition.",
    styleDirection: "Urban dance vibe, rhythm-accurate timing, natural human kinematics.",
  },
  {
    id: "twirl-fun",
    name: "Twirl Fun",
    description: "Light twirl choreography with gentle spins and beat pauses.",
    preview: "/arts/styles/anime-opening.jpg",
    duration: "10",
    aspectRatio: "9:16",
    audioTrack: "/audio/templates/twirl-fun.mp3",
    audioVolume: 0.8,
    motionSequence: [
      "Start with soft sway and one hand raised for timing cue.",
      "Perform a quarter twirl to the right and re-center.",
      "Add two-step foot pattern with arms opening outward.",
      "Do a compact full twirl with stable balance and identity.",
      "End with hands near chest and joyful final hold.",
    ],
    cameraDirection: "Vertical full-body framing, smooth camera lock, no abrupt cuts.",
    styleDirection: "Cheerful dance short with smooth transitions and clean motion arcs.",
  },
  {
    id: "bounce-shuffle",
    name: "Bounce Shuffle",
    description: "Fast shuffle steps with playful bounce and arm accents.",
    preview: "/arts/styles/product-ads.jpg",
    duration: "10",
    aspectRatio: "9:16",
    audioTrack: "/audio/templates/bounce-shuffle.mp3",
    audioVolume: 0.8,
    motionSequence: [
      "Start with small in-place bounce and toe-heel prep.",
      "Execute quick shuffle right then shuffle left with balance control.",
      "Add alternating forearm swings synced to each shuffle step.",
      "Repeat shuffle combo with slightly faster tempo for two beats.",
      "Finish centered with a final bounce and clean freeze.",
    ],
    cameraDirection: "Vertical medium full-body framing with fixed horizon.",
    styleDirection: "Trendy short-form dance energy, clean footwork readability.",
  },
  {
    id: "hip-hop-smile",
    name: "Hip-Hop Smile",
    description: "Friendly hip-hop combo made for viral short clips.",
    preview: "/arts/styles/faceless-broll.png",
    duration: "10",
    aspectRatio: "9:16",
    audioTrack: "/audio/templates/hip-hop-smile.mp3",
    audioVolume: 0.8,
    motionSequence: [
      "Open with shoulder drop and confident head nod on beat.",
      "Perform two-count side step with relaxed arm swing.",
      "Add chest hit followed by diagonal hand point sequence.",
      "Transition to hip-hop groove bounce with stable lower body.",
      "Close with smile-forward pose and short final nod.",
    ],
    cameraDirection: "Vertical social clip framing, full-body visible at all times.",
    styleDirection: "Friendly hip-hop dance style, punchy beats, natural body physics.",
  },
];

function compileTemplatePrompt(template: TemplateCard) {
  const sequenceText = template.motionSequence
    .map((step, index) => `${index + 1}. ${step}`)
    .join(" ");

  return [
    `Template Name: ${template.name}.`,
    `STRICTLY FOLLOW THIS MOTION ORDER: ${sequenceText}`,
    `Camera Direction: ${template.cameraDirection}`,
    `Style Direction: ${template.styleDirection}`,
    "Keep the uploaded subject identity, face, clothes, and body proportions consistent throughout.",
    "Do not change species/person identity; do not morph into another character.",
    "Maintain coherent background continuity and stable scene geometry.",
    "Output should be ad-ready, smooth, detailed, and realistic.",
  ].join(" ");
}

export default function TemplatesPage() {
  const { credits, deductCredits, refundCredits } = useCredits();
  const [selectedTemplateId, setSelectedTemplateId] = useState(MOTION_TEMPLATES[0].id);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestVideoUrl, setLatestVideoUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<{ url: string; prompt: string }[]>([]);
  const [useTemplateMusic, setUseTemplateMusic] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const selectedTemplate = useMemo(
    () => MOTION_TEMPLATES.find((t) => t.id === selectedTemplateId) || MOTION_TEMPLATES[0],
    [selectedTemplateId]
  );

  const syncAudio = useCallback(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    if (!useTemplateMusic || !selectedTemplate.audioTrack) {
      audio.pause();
      return;
    }

    const trackUrl = selectedTemplate.audioTrack;
    if (!audio.src || !audio.src.includes(trackUrl)) {
      audio.src = trackUrl;
      audio.volume = selectedTemplate.audioVolume;
      audio.load();
    }

    if (!video.paused) {
      audio.currentTime = video.currentTime;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [useTemplateMusic, selectedTemplate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => syncAudio();
    const onPause = () => { audioRef.current?.pause(); };
    const onEnded = () => { audioRef.current?.pause(); if (audioRef.current) audioRef.current.currentTime = 0; };
    const onSeeked = () => { if (audioRef.current && !video.paused) { audioRef.current.currentTime = video.currentTime; } };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("seeked", onSeeked);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [latestVideoUrl, syncAudio]);

  useEffect(() => {
    syncAudio();
  }, [useTemplateMusic, syncAudio]);

  useEffect(() => {
    fetch("/api/generations?type=video")
      .then((r) => r.json())
      .then((data) => {
        if (data.generations?.length) {
          setHistory(
            data.generations.slice(0, 8).map((g: any) => ({
              url: g.output_url,
              prompt: g.prompt,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const onImageUpload = (file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setReferenceImage(data);
      setPreviewImage(data);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const generateFromTemplate = async () => {
    if (!referenceImage) {
      setError("Upload a photo first.");
      return;
    }

    if (credits !== null && credits < TEMPLATE_COST) {
      setError("Insufficient credits. Please add more credits.");
      return;
    }

    setGenerating(true);
    setError(null);
    deductCredits(TEMPLATE_COST);

    try {
      const compiledPrompt = compileTemplatePrompt(selectedTemplate);

      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: compiledPrompt,
          model: "kling-3",
          duration: selectedTemplate.duration,
          aspectRatio: selectedTemplate.aspectRatio,
          quality: "hd",
          imageUrl: referenceImage,
          stylePreset: "none",
          enhancePrompt: true,
          intensity: 85,
          customDirection: `TemplateID=${selectedTemplate.id}; Keep motion order exact.`,
          cameraMovement: "auto",
          motionIntensity: 0.8,
        }),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Template video generation failed.");
      }
      if (!res.ok) {
        throw new Error(data?.error || "Template video generation failed.");
      }

      // Async queue flow (fal.ai models)
      if (data.status === "queued" && data.requestId) {
        const maxPolls = 200;
        const pollInterval = 3000;
        let consecutiveErrors = 0;
        for (let i = 0; i < maxPolls; i++) {
          await new Promise((r) => setTimeout(r, pollInterval));
          try {
            const params = new URLSearchParams({
              requestId: data.requestId,
              endpointId: data.endpointId,
              modelId: data.modelId || "kling-3",
              cost: String(data.cost || TEMPLATE_COST),
              prompt: compiledPrompt.slice(0, 500),
            });
            const pollRes = await fetch(`/api/video/status?${params}`);
            const pollText = await pollRes.text();
            let pollData: any;
            try { pollData = JSON.parse(pollText); } catch { consecutiveErrors++; if (consecutiveErrors > 10) throw new Error("Status check failed repeatedly."); continue; }
            consecutiveErrors = 0;

            if (pollData.status === "completed" && pollData.videoUrl) {
              setLatestVideoUrl(pollData.videoUrl);
              setHistory((prev) => [{ url: pollData.videoUrl, prompt: selectedTemplate.name }, ...prev].slice(0, 8));
              setGenerating(false);
              return;
            }
            if (pollData.status === "failed") {
              throw new Error(pollData.error || "Template video generation failed.");
            }
          } catch (pollErr: any) {
            if (pollErr?.message?.includes("failed") || pollErr?.message?.includes("repeatedly")) throw pollErr;
            consecutiveErrors++;
            if (consecutiveErrors > 10) throw new Error("Lost connection to server.");
          }
        }
        throw new Error("Video generation timed out (10 min). Please try again.");
      }

      // Sync flow fallback
      if (!data?.videoUrl) {
        throw new Error(data?.error || "Template video generation failed.");
      }
      setLatestVideoUrl(data.videoUrl);
      setHistory((prev) => [{ url: data.videoUrl, prompt: selectedTemplate.name }, ...prev].slice(0, 8));
    } catch (e: any) {
      setError(e?.message || "Template video generation failed.");
      refundCredits(TEMPLATE_COST);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto hide-scrollbar pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-10 md:pt-16">
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Template Motion Studio</h1>
          <p className="text-white/60 mt-2 text-sm md:text-base">
            Pick a dance template, upload one photo, and generate your video in one click. Auto model: <span className="text-cyan-400 font-semibold">Kling 3.0</span>
          </p>
        </div>

        {error && <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">{error}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
          <section className="rounded-3xl border border-white/10 bg-[#11141d]/80 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <WandSparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-white font-bold">Motion Templates</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MOTION_TEMPLATES.map((template) => {
                const active = selectedTemplateId === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`group rounded-2xl overflow-hidden border text-left transition-all ${
                      active
                        ? "border-cyan-500/70 shadow-[0_0_24px_rgba(6,182,212,0.25)]"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="relative h-24 md:h-28 w-full">
                      <Image src={template.preview} alt={template.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-[11px] md:text-xs font-bold leading-tight">{template.name}</p>
                      </div>
                    </div>
                    <div className="p-2.5 bg-black/30">
                      <p className="text-[11px] text-white/60 line-clamp-2">{template.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#11141d]/80 p-4 md:p-6 space-y-4">
            <div>
              <h2 className="text-white font-bold mb-1">1) Upload Photo</h2>
              <label className="block cursor-pointer rounded-2xl border border-dashed border-white/20 hover:border-cyan-400/60 transition-colors p-5 text-center">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => onImageUpload(e.target.files?.[0])}
                />
                <Upload className="w-5 h-5 mx-auto text-white/50 mb-2" />
                <p className="text-sm text-white/80">Upload image / drag & drop</p>
                <p className="text-xs text-white/40 mt-1">JPG, PNG, WEBP • max 10MB</p>
              </label>

              {previewImage && (
                <div className="relative mt-3 rounded-2xl overflow-hidden border border-white/10 h-44">
                  <Image src={previewImage} alt="Uploaded preview" fill className="object-cover" />
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Selected Template</p>
              <p className="text-white font-semibold text-sm">{selectedTemplate.name}</p>
              <p className="text-white/60 text-xs mt-1">{selectedTemplate.description}</p>
              <div className="mt-2 text-[11px] text-cyan-300/90 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                {selectedTemplate.duration}s · {selectedTemplate.aspectRatio} · {TEMPLATE_COST} credits
              </div>
              <p className="mt-2 text-[11px] text-white/60">Each template run uses a fixed {TEMPLATE_COST} credits.</p>
              <p className="text-[11px] text-white/70">Your balance: <span className="font-semibold text-cyan-300">{credits ?? 0} credits</span></p>
            </div>

            {/* Template Music Toggle */}
            {selectedTemplate.audioTrack && (
              <div className="flex items-center justify-between bg-black/30 border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  {useTemplateMusic ? (
                    <Music className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-white/40" />
                  )}
                  <div>
                    <p className="text-xs font-bold text-white">Template Music</p>
                    <p className="text-[10px] text-white/40">Play audio with generated video</p>
                  </div>
                </div>
                <button
                  onClick={() => setUseTemplateMusic(!useTemplateMusic)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${useTemplateMusic ? "bg-cyan-500" : "bg-white/10"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${useTemplateMusic ? "left-[18px]" : "left-0.5"}`} />
                </button>
              </div>
            )}

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <ListOrdered className="w-4 h-4 text-cyan-300" />
                <p className="text-cyan-200 text-xs font-semibold uppercase tracking-wider">Template Motion Order</p>
              </div>
              <ol className="list-decimal pl-4 space-y-1.5 text-xs text-white/75">
                {selectedTemplate.motionSequence.map((step, i) => (
                  <li key={`${selectedTemplate.id}-${i}`}>{step}</li>
                ))}
              </ol>
            </div>

            <button
              onClick={generateFromTemplate}
              disabled={generating || !referenceImage}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold"
            >
              {generating ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </span>
              ) : (
                "Generate Template Video"
              )}
            </button>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-white/10 bg-[#11141d]/80 p-4 md:p-6">
          <h3 className="text-white font-bold mb-4">Latest Output</h3>
          {latestVideoUrl ? (
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-4 items-start">
              <video ref={videoRef} src={latestVideoUrl} controls playsInline className="w-full rounded-2xl border border-white/10" />
              <audio ref={audioRef} preload="auto" className="hidden" />
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-white text-sm font-semibold">Output format: MP4 Video</p>
                <p className="text-white/60 text-xs mt-1">Output is generated as a normal MP4 video, ready for social and ad workflows.</p>
                <a
                  href={latestVideoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 transition-colors text-white text-sm"
                >
                  <Download className="w-4 h-4" /> Download MP4
                </a>
              </div>
            </div>
          ) : (
            <p className="text-white/50 text-sm">No template video generated yet.</p>
          )}

          {!!history.length && (
            <div className="mt-6">
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Generation History</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {history.map((h, i) => (
                  <div key={`${h.url}-${i}`} className="group relative rounded-xl overflow-hidden border border-white/10 bg-black/30">
                    <video
                      src={h.url}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full aspect-[9/16] object-cover"
                    />
                    {h.prompt && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pointer-events-none">
                        <p className="text-white text-[10px] font-medium truncate">{h.prompt}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
