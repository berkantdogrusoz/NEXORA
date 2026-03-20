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
  duration: "5" | "8" | "10";
  aspectRatio: "16:9" | "9:16";
  motionSequence: string[];
  cameraDirection: string;
  styleDirection: string;
  audioTrack: string | null;
  audioVolume: number;
};

const TEMPLATE_COST = 50;

const MOTION_TEMPLATES: TemplateCard[] = [
  {
    id: "tiktok-renegade",
    name: "TikTok Renegade",
    description: "The iconic viral Renegade choreography — arm swings, body rolls, and fist pumps on beat.",
    preview: "/arts/styles/viral-social.png",
    duration: "8",
    aspectRatio: "9:16",
    audioTrack: "/audio/templates/drunk-dance.mp3",
    audioVolume: 0.8,
    motionSequence: [
      "[00:00–00:02] Standing upright on two legs. Both arms swing outward to full stretch then snap back to chest, twice. Whole body bounces down and up on the second snap.",
      "[00:02–00:04] Right arm swings a wide arc overhead while torso twists to follow. Left arm mirrors. Hips sway opposite to each swing like a pendulum.",
      "[00:04–00:06] Arms cross into X at chest, burst open to full wingspan. Body rolls top-to-bottom — chest forward, stomach out, hips back, knees dip. Spring upright with arms overhead.",
      "[00:06–00:07] Step forward, both arms windmill a full circle ending in a clap at chest. Shoulders and head react to the clap. Repeat with other foot.",
      "[00:07–00:08] Final pose — lean back, one arm points at camera, other hand on hip, chin up. Complete freeze.",
    ],
    cameraDirection: "9:16 full-body on 35mm lens. Slow zoom-in during arm swings. Camera dips with body roll. Subtle shake on clap. Slow push-in to chest-up on final pose.",
    styleDirection: "TikTok viral dance energy, rhythm-synced movements, confident expression, crisp motion clarity.",
  },
  {
    id: "hip-hop-krump",
    name: "Hip-Hop Hits",
    description: "Hard-hitting hip-hop with chest pops, arm isolations, and neck rolls — real street style.",
    preview: "/arts/styles/street-interview.png",
    duration: "8",
    aspectRatio: "9:16",
    audioTrack: "/audio/templates/street-groove.mp3",
    audioVolume: 0.8,
    motionSequence: [
      "[00:00–00:02] Standing upright on two legs, deep rhythmic bounce — knees bend low, pop back up, four times. On the last bounce chest pops forward, shoulders jolt. Whole body visibly moves up and down.",
      "[00:02–00:04] Right arm rises straight up, hold. Switch — left arm up, right drops. Alternate four times, each faster. Shoulders pop on every switch.",
      "[00:04–00:06] Wide stance. Neck rolls a full slow circle with attitude. Both arms extend forward at full reach pressing an invisible wall, torso leans in then snaps back. Twice.",
      "[00:06–00:07] Arms pull into X at chest, burst open to T-pose at max wingspan. Right foot steps firm, head turns right. Repeat to the left.",
      "[00:07–00:08] Drop into squat, bounce twice, rise tall with one arm raised overhead. Hold victory pose frozen.",
    ],
    cameraDirection: "9:16 full-body on 35mm lens, low angle. Quick zoom-in on chest pop. Gentle shake on arm extensions. Slow tilt upward on final pose to close-up.",
    styleDirection: "Energetic hip-hop dance vibes, bold confident movements, vibrant urban feel, every move lands on the beat.",
  },
  {
    id: "kpop-point",
    name: "K-Pop Point Dance",
    description: "Sharp K-Pop choreography with synchronized point moves, hair flips, and killing parts.",
    preview: "/arts/styles/ugc-creator.png",
    duration: "8",
    aspectRatio: "9:16",
    audioTrack: "/audio/templates/kitty-sway.mp3",
    audioVolume: 0.8,
    motionSequence: [
      "[00:00–00:02] Standing on two legs, slight side angle. Right arm snaps out pointing at camera with full extension, left hand to waist, right hip pops out sharply. Sudden and sharp against stillness.",
      "[00:02–00:04] Pointing hand sweeps through hair with a head toss. Both hands snap up to frame the face — palms beside cheeks. Hold with fierce expression.",
      "[00:04–00:06] Step right with sharp hip pop right, arms sweep right. Step left with hip pop left, arms sweep left. Four hip pops total, each as wide as possible. Body bounces with each step.",
      "[00:06–00:07] Arms cross into X, burst open with quarter-turn spin. Land with one hand on hip, other arm extended outward. Head whips to face camera.",
      "[00:07–00:08] Final pose — knees bent, shoulder drops, head tilts, both hands make finger hearts at chin. Complete freeze.",
    ],
    cameraDirection: "9:16 mid-body on 50mm lens. Snap zoom to pointing hand. Smooth arc upward on hair flip. Sway side-to-side on hip pops. Slow cinematic zoom-in on final pose.",
    styleDirection: "Polished K-Pop music video aesthetic, sharp timing, fierce but cute expressions, stage precision, fancam energy.",
  },
  {
    id: "afro-body-roll",
    name: "Afrobeats Wave",
    description: "Smooth Afrobeats vibes — deep body rolls, waist wines, and shoulder shimmies on Afro rhythm.",
    preview: "/arts/styles/dramatic-tv-teaser.jpg",
    duration: "8",
    aspectRatio: "9:16",
    audioTrack: "/audio/templates/bubble-bounce.mp3",
    audioVolume: 0.8,
    motionSequence: [
      "[00:00–00:02] Standing upright on two legs. Full body wave — chest forward, stomach out, hips back, knees dip, spring upright. Repeat twice, each bigger. Visible ripple through entire torso.",
      "[00:02–00:04] Hands on thighs. Hips draw wide horizontal circles clockwise — two full rotations. Upper body stays still while hips circle below. Playful expression.",
      "[00:04–00:06] Rapid shoulder shimmy — right forward, left back, alternating fast. Head bobs on every other beat. Feet rock heel-to-toe subtly.",
      "[00:06–00:07] Step forward, right hip drops low, left arm sweeps overhead — body bends into S-curve. Hold one beat. Reverse smoothly to other side.",
      "[00:07–00:08] Three quick hip pops — right, left, right — each bigger. Rise up with arms spreading wide, chin lifted, eyes closed. Hold still.",
    ],
    cameraDirection: "9:16 full-body on 35mm lens at hip level. Camera rises following body wave. Subtle orbit on hip circles. Gentle shake on shimmy. Smooth crane-up on final rise.",
    styleDirection: "Afrobeats dance energy, smooth body isolations, warm vibrant mood, groovy and effortless movement.",
  },
  {
    id: "shuffle-king",
    name: "Melbourne Shuffle",
    description: "Lightning-fast cutting shapes — running man, T-step, and spins with electronic music energy.",
    preview: "/arts/styles/product-ads.jpg",
    duration: "8",
    aspectRatio: "9:16",
    audioTrack: "/audio/templates/bounce-shuffle.mp3",
    audioVolume: 0.8,
    motionSequence: [
      "[00:00–00:02] Standing on two legs. Right foot steps forward while left slides back, then switch. Four times with increasing speed. Arms pump like running. Whole body bounces with each step.",
      "[00:02–00:04] Feet pivot side-to-side — right heel twists in while left taps out, then switch. Six rapid alternations. Arms swing opposite to feet. Whole body shifts left-right.",
      "[00:04–00:05] Arms tuck in, full 360 spin on one foot. Land facing camera, immediately resume stepping pattern without pause.",
      "[00:05–00:07] Feet cross over each other moving forward — right over left, left over right. Four crossover steps. Upper body stays level while legs do fast work below.",
      "[00:07–00:08] Slide into wide low stance. Pause one beat. Spring upward with both arms raised high, one foot kicked forward. Hold frozen.",
    ],
    cameraDirection: "9:16 wide full-body on 24mm lens for footwork travel. Camera bounces with steps. Tracks lateral sliding. Counter-rotates on spin. Drops low then rockets up on finale.",
    styleDirection: "Shuffle dance style, crisp footwork, EDM festival energy, neon-glow aesthetic, every slide visible.",
  },
  {
    id: "latin-salsa",
    name: "Salsa Fire",
    description: "Fiery solo salsa with quick footwork, hip action, and dramatic arm styling.",
    preview: "/arts/styles/anime-opening.jpg",
    duration: "8",
    aspectRatio: "9:16",
    audioTrack: "/audio/templates/twirl-fun.mp3",
    audioVolume: 0.8,
    motionSequence: [
      "[00:00–00:02] Standing on two legs. Step right foot forward, rock weight onto it, rock back to left, return to center. Three times. Hips sway wide with each weight shift. Arms swing opposite.",
      "[00:02–00:04] On each step, hip pops sharply to the stepping side — four big hip pops. Upper body stays tall and still while hips work below. Maximum contrast.",
      "[00:04–00:06] Right foot crosses left, right arm sweeps overhead, body unwinds into half-turn. Repeat back to face camera. Two cross-step spins with flowing arm arcs.",
      "[00:06–00:07] Feet twist inward then outward rapidly, sliding sideways. Six twists right, six twists left. Arms wave at shoulder height, hands flick at each change.",
      "[00:07–00:08] Lean back into dramatic dip — one arm overhead, one leg forward. Snap upright into proud pose, hands framing face, chin up. Freeze.",
    ],
    cameraDirection: "9:16 full-body on 50mm lens, warm amber lighting. Gentle rock matching weight shifts. Push-in on hip pops. Whip-pan on spins. Swoop down on dip, rise on snap-up.",
    styleDirection: "Latin salsa energy, passionate expression, sharp intentional hip movements, confident and warm.",
  },
  {
    id: "vogue-serve",
    name: "Vogue Serve",
    description: "Ballroom voguing — dramatic hand performance, duckwalk, dips, and fierce runway energy.",
    preview: "/arts/styles/faceless-broll.png",
    duration: "8",
    aspectRatio: "9:16",
    audioTrack: "/audio/templates/hip-hop-smile.mp3",
    audioVolume: 0.8,
    motionSequence: [
      "[00:00–00:02] Walking forward on two legs toward camera, three dramatic steps. Each step lands heel-first with hip swinging far to the stepping side. One hand on hip, other arm swings wide. Chin up, eyes on camera.",
      "[00:02–00:04] Both arms extend forward, wrists rotate three times. Snap into sharp angular poses — right arm up, left bent 90 degrees. Switch instantly. Four geometric arm poses in succession.",
      "[00:04–00:06] Drop into deep squat, knees out. Waddle forward three steps while squatting. Upper body stays upright and elegant. Hands frame the face throughout.",
      "[00:06–00:07] Rise while spinning, arms extend outward gradually. Full spin, then snap into freeze — one hand behind head, other arm framing face, back arched.",
      "[00:07–00:08] Lean dramatically backward — back arching, one arm reaching up, one leg extended forward. Hold frozen with total stillness.",
    ],
    cameraDirection: "9:16 full-body on 35mm lens, below eye level. Camera pulls back as subject walks forward. Snap zoom on hand poses. Floor-level on squat walk. Tilt and push-in on final lean.",
    styleDirection: "High fashion meets dance, every pose is a magazine cover, fierce confidence, theatrical elegance.",
  },
  {
    id: "tiktok-woah",
    name: "TikTok Woah Combo",
    description: "Viral TikTok combo — the Woah, Hit the Quan, dab transitions, and swagged-out hits.",
    preview: "/arts/styles/viral-social.png",
    duration: "8",
    aspectRatio: "9:16",
    audioTrack: "/audio/templates/paw-pop.mp3",
    audioVolume: 0.8,
    motionSequence: [
      "[00:00–00:02] Standing on two legs, bouncing with loose knees. Right arm swings a big arc left-to-right and freezes mid-air — palm down, full extension. Entire body stops instantly. Total stillness one beat.",
      "[00:02–00:04] Break freeze — squat low. Both hands pull to right hip, push diagonally up-left with head snap. Bounce twice in squat. Body compresses and springs on each bounce.",
      "[00:04–00:06] Stand up, right arm forward, face tucks into left elbow — dab shape. Flip to other side. Three dabs alternating, each snapping into place. Arms fully extend each time.",
      "[00:06–00:07] Lean entire body right, arms sweep right. Lean left, arms sweep left. Four side-to-side leans like riding a wave. Whole body travels each way.",
      "[00:07–00:08] Quick arm freeze, snap into dab, then stand tall with arms crossed over chest, chin up. Hold final pose with zero movement.",
    ],
    cameraDirection: "9:16 full-body on 35mm lens, handheld feel. Camera jolts to stop on freeze. Drops with squat. Whip-pan on dabs. Sways on wave. Slow push-in on final pose to face.",
    styleDirection: "TikTok viral energy, confident fun expressions, rhythm-synced movements, social media aesthetic.",
  },
];

function compileTemplatePrompt(template: TemplateCard) {
  const sequenceText = template.motionSequence.join(" ");

  return [
    `The subject performs exaggerated dance choreography, standing upright on two legs for the entire 8-second duration. Every movement is big and clearly visible — arms at full extension, hips at widest range, freezes with absolute stillness.`,
    sequenceText,
    `The camera: ${template.cameraDirection}`,
    `Style: ${template.styleDirection}`,
    `Subject identity, face, and proportions stay consistent throughout. Bipedal stance only — never drop to all fours.`,
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
          model: "google-veo-3",
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
              modelId: data.modelId || "google-veo-3",
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

      // Sync flow (Veo 3 returns videoUrl directly)
      if (data?.success && data?.videoUrl) {
        setLatestVideoUrl(data.videoUrl);
        setHistory((prev) => [{ url: data.videoUrl, prompt: selectedTemplate.name }, ...prev].slice(0, 8));
      } else if (!data?.videoUrl) {
        throw new Error(data?.error || "Template video generation failed.");
      }
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
            Pick a dance template, upload one photo, and generate your video in one click. Auto model: <span className="text-cyan-400 font-semibold">Google Veo 3.1</span>
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
