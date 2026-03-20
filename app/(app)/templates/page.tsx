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

const TEMPLATE_COST = 20;

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
      "Both fists pull to chest, then punch right arm diagonally down-left at full extension while left arm hooks behind the head — sharp and on-beat, the body leans into the punch. Freeze for half a beat.",
      "Flow into a double arm wave — right arm extends out fully, rolls through the shoulder, transfers to left arm extending out — the torso sways side to side following each wave, big and smooth like a ripple moving through the whole body.",
      "Hit a deep body roll — chest pops forward, rolls down through the stomach, hips push back, knees bend on the drop — then pop back up with energy, both arms crossing at the wrists in front of the face. The body roll should be big and visible.",
      "Uncross arms outward with energy, step right foot forward with a confident stomp, swing both arms in a full windmill circle ending with a sharp clap at center chest — the clap is the accent beat, body reacts to it.",
      "Lean back with confidence, one hand points at camera with a locked arm, other hand rests on hip, head tilts with a smirk — hold this pose completely still for the final two beats. No movement at all on the freeze.",
    ],
    cameraDirection: "Vertical 9:16 full-body shot starting at waist height. On the arm wave (step 2), push in with a smooth zoom to mid-body. On the body roll drop (step 3), camera dips down slightly with the movement. On the windmill (step 4), pull back to full-body with a subtle handheld shake on the clap. On the final pose (step 5), dramatic slow zoom-in to chest-up framing — hold tight on the face and pointing hand.",
    styleDirection: "TikTok viral dance energy, punchy rhythm-synced movements, confident facial expressions, Gen-Z social media aesthetic, crisp motion clarity. Camera must feel alive — never static, always reacting to the biggest hits.",
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
      "Start with a deep rhythmic bounce — knees bending low, shoulders rolling loose to the beat. Then hit a sharp chest pop that ripples through the shoulders and upper body, arms swinging heavy at the sides. Head nods forward on the pop.",
      "Right arm shoots up into a strong flex pose while left arm drops to the side, then switch — left arm flexes up, right drops. Alternate with each beat, shoulders isolating sharply on every switch. Make each pose distinct and held for a moment.",
      "Drop into a wide power stance, roll the neck slowly from left to right with attitude, then thrust both arms forward at full extension — elbows locked, fingers spread wide. The whole upper body commits to the push.",
      "Pull both arms into a tight X at the chest, hold one beat, then open outward into a full T-pose with arms at maximum wingspan. Right foot stomps on the opening, head snaps to the right on the accent. Big and clean.",
      "Both fists pull to the chin, drop into a low squat and bounce twice with rhythm, then rise up tall with one fist raised overhead — hold this victory pose completely still. Zero movement on the freeze, full confidence.",
    ],
    cameraDirection: "Vertical full-body framing, low-angle looking up for power. On the chest pop (step 1), camera punches forward with a quick zoom-in then snaps back. On the arm thrusts (step 3), camera shakes on impact like a bass hit. On the T-pose stomp (step 4), quick whip-pan following the head snap direction. On the final fist raise (step 5), slow dramatic tilt upward from low squat to raised fist — ending on a hero angle close-up.",
    styleDirection: "Raw hip-hop street dance energy, powerful and aggressive movements, sweat-glistening skin, urban environment feel, every hit lands on the beat. Camera should feel like it's in the cypher — reactive and punchy.",
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
      "Start in a side stance with chin down and a fierce gaze at camera. On the beat drop, right hand snaps out to point directly at camera with a fully extended arm, left hand goes to waist, hip pops to the right creating a sharp body angle.",
      "Pull the pointing hand back through the hair in a dramatic flip motion with a head toss, then both hands snap to frame the face — palms open beside both cheeks, fingers together in a classic idol pose. Hold with confidence.",
      "Step-touch right with a sharp hip pop, step-touch left with another hip pop — arms doing a big synchronized wave from right to left at shoulder height, wrists flicking at each endpoint. Hips and arms perfectly on beat.",
      "Cross both arms over the chest in an X-shape, hold one beat, then burst them open while doing a quarter turn — end with one hand on hip and other arm extended showing a finger heart. The turn is smooth but the final pose snaps into place.",
      "Final killing part: knees slightly bent, one shoulder drops, head tilts, both hands form finger hearts at chin level — freeze with a confident idol expression. Complete stillness for the final beats, pure charisma.",
    ],
    cameraDirection: "Vertical 9:16 starting mid-body. On the point-at-camera (step 1), quick snap zoom to the pointing hand then pull back. On the hair flip (step 2), camera does a smooth arc upward following the hair motion. On the step-touch hip pops (step 3), camera sways side-to-side matching the rhythm. On the finger heart (step 4), push in tight to capture the hand detail. On the ending pose (step 5), cinematic slow zoom-in to face level with a slight tilt — idol fancam energy.",
    styleDirection: "Polished K-Pop music video aesthetic, razor-sharp timing on every move, fierce but cute expressions, stage-performance precision, every gesture is intentional and camera-aware. Camera moves like a professional fancam — smooth but dynamic.",
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
      "Start a deep body roll — chest pushes forward, the wave rolls smoothly down through the stomach, hips push back, then snap upright. The body roll should be big and visible, like a wave passing through the entire torso from top to bottom.",
      "Transition into a waist wine — hands resting on thighs, hips drawing a wide horizontal circle clockwise. Two full rotations with big hip range, upper body stays stable and relaxed creating a smooth contrast between upper and lower body.",
      "Add a shoulder shimmy — rapid alternating shoulder vibrations forward and back for four beats. Feet do a subtle heel-toe rock, head bobs to the rhythm with a playful expression. The shimmy should be fast and visible.",
      "Step forward into a dramatic hip dip — right hip drops low, left arm sweeps up overhead in a big arc, body creating an S-curve shape. Hold the S-curve briefly, then reverse it flowing smoothly back to center.",
      "Finish with three quick hip pops in succession with hands on knees, each one bigger than the last. Then rise up smoothly with arms spreading wide, chin lifted, eyes closed — hold this feeling-the-music pose still for the final beats.",
    ],
    cameraDirection: "Vertical full-body shot at hip level. On the body roll (step 1), camera slowly rises from hip to chest following the wave motion upward. On the waist wine (step 2), camera orbits slightly left-to-right in a subtle arc matching the hip circle. On the shoulder shimmy (step 3), quick gentle shake matching the shimmy vibration. On the hip dip S-curve (step 4), camera tilts to mirror the S-curve angle. On the final rise (step 5), smooth crane-up from low to high as arms spread wide — golden hour lens flare feel.",
    styleDirection: "Authentic Afrobeats dance energy, sensual but tasteful body isolations, warm vibrant mood, the movement should feel groovy and effortless — never stiff. Camera floats like it's vibing with the dancer.",
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
      "Start with the Running Man — right foot stomps forward flat while left foot slides backward, then switch. Repeat four times with increasing speed, arms pumping naturally at the sides. Each stomp should be confident and visible.",
      "Transition into the T-Step — pivot on the right heel while left foot taps out to the side, then pivot left heel while right taps out. Rapid side-to-side sliding motion, feet barely leaving the ground, arms flowing loose with the movement.",
      "Hit a quick 360-degree spin on the ball of the right foot, arms tucked close for speed, then land right back into the Running Man without missing a beat. The transition should be seamless and smooth.",
      "Drop into the Criss-Cross — feet crossing over each other alternately while moving forward. Right over left, then left over right. Upper body stays level and smooth while the feet do the complex work below.",
      "Finish with a power slide to the right, dropping into a wide low stance. Pause one beat, then pop back up with both arms thrown skyward and one foot kicked forward — hold this explosive final pose completely still.",
    ],
    cameraDirection: "Vertical full-body shot, wide enough for footwork travel. On the Running Man (step 1), camera bounces vertically with each stomp like it's on a spring. On the T-Step (step 2), camera tracks the lateral sliding motion smoothly. On the 360 spin (step 3), camera does a quick counter-rotation for dramatic effect. On the Criss-Cross (step 4), push in closer to highlight the foot crossing detail. On the power slide finale (step 5), camera drops low with the dancer then rockets up on the explosive pop — maximum impact.",
    styleDirection: "Melbourne shuffle / cutting shapes dance style, feet are the star — every slide and stomp must be crisp and visible, EDM festival energy, neon-glow aesthetic feel. Camera has festival-crowd energy — bouncing, reactive, hype.",
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
      "Start with salsa basic step — step forward with the right foot on beat 1, weight transfers back to left on beat 2, right foot returns on beat 3. Hips sway naturally with each weight change, arms bent at 90 degrees. Each step is rhythmic and grounded.",
      "Add Cuban hip motion — as the right foot steps, the right hip pushes out sharply to the side, then the left hip on the return. The hip action is big and visible, upper body stays tall with chest lifted, creating a clear contrast between upper and lower body.",
      "Step across the body to the left with the right foot, sweep the right arm overhead in a big dramatic arc, then unwind with a smooth half-turn. The turn has momentum and flow, not stiff. Hair and body follow the rotation naturally.",
      "Drop into a suzy-Q — twist both feet inward then outward in rapid succession, traveling sideways. Arms wave at shoulder height, fingers snapping on every other beat. The footwork is quick and precise with a playful groove.",
      "Finish with a dramatic dip — lean back with the upper body while one leg extends forward, one arm reaches back overhead. Then snap upright into a proud chest-out pose with both arms framing the face. Hold with a passionate expression, completely still.",
    ],
    cameraDirection: "Vertical full-body shot with warm amber lighting. On the basic step hip sway (step 1), camera gently rocks left-right matching the weight shifts. On the Cuban hip motion (step 2), push in to mid-body to capture the sharp hip pops. On the cross-body spin (step 3), camera follows the rotation with a smooth whip-pan then settles. On the suzy-Q (step 4), camera tracks the lateral travel. On the dramatic dip (step 5), camera swoops down following the lean-back then rises with the snap-upright — passionate and cinematic.",
    styleDirection: "Authentic Latin salsa energy, passionate and fiery expression, every hip movement sharp and intentional, the dance should radiate heat and confidence. Camera dances with the subject — never a passive observer.",
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
      "Walk forward with three dramatic runway steps — big hip sway on each step, landing heel-first with confidence. Chin up, fierce gaze at camera, one hand on hip, other arm swinging with attitude. Each step is deliberate and powerful.",
      "Stop and hit a hand performance — both arms extend forward with wrists rotating in circles, then snap into sharp geometric angles. Right arm straight up, left arm bent at 90 degrees, then switch instantly. Each angle is a clean pose held briefly.",
      "Drop into a deep squat for a duckwalk — knees out to the sides, waddle-step forward two steps while keeping the upper body perfectly upright. Arms frame the face in a glamorous pose throughout. Confident despite the low position.",
      "Rise up from the duckwalk into a smooth spin with arms extending outward like a flower blooming. Pull into a sharp vogue freeze — one hand behind the head, other arm framing the face, back arched. Hold the pose.",
      "Finish with a death drop — lean back dramatically with one arm reaching toward the sky, back arching toward the ground. Freeze mid-dip in a powerful reclined pose. Pure ballroom elegance and drama, held completely still.",
    ],
    cameraDirection: "Vertical full-body framing, below eye level for power. On the runway walk (step 1), camera slowly pulls backward as subject walks toward it — runway show tracking. On the hand performance (step 2), snap zoom to hands for the geometric angles, pull back on each pose switch. On the duckwalk (step 3), camera drops to floor level looking up — dramatic power angle. On the spin (step 4), camera circles opposite to the spin direction for double-speed visual effect. On the death drop (step 5), camera dramatically tilts and pushes in as the subject falls — freeze frame energy on the final pose.",
    styleDirection: "Ballroom vogue culture aesthetic, high fashion meets street dance, every pose is a magazine cover, fierce confidence, dramatic theatrical energy — serve face throughout. Camera is the audience at the ball — gasping at every serve.",
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
      "Start bouncing with loose knees and shoulders rolling to the beat. On the drop, hit THE WOAH — right arm swings from left to right in a smooth arc and freezes mid-air at the right side, palm down. Body leans slightly opposite. Everything stops for one beat, total stillness.",
      "Snap out of the freeze into HIT THE QUAN — squat down low, both fists pull to the right hip, then thrust them diagonally up-left with a head snap. Bounce twice in the squat with fist pumps on each bounce. Rhythmic and groovy.",
      "Rise up into a clean DAB — right arm extends straight forward while left arm tucks into the right elbow pit, face buried in the left elbow. Hold for one beat, then reverse-dab to the other side without pausing. Smooth transition.",
      "Transition into the SWAGG SURF — lean right with both arms sweeping right at chest level, then lean left and sweep left. Like riding a wave, knees bending with each lean. The movement is big, smooth, and controlled.",
      "Finish with a combo — quick Woah freeze, immediate dab, then stand tall with both arms crossed over the chest, chin up, one eyebrow raised. Hold this swag pose completely still for the final two beats. Zero movement, pure confidence.",
    ],
    cameraDirection: "Vertical 9:16 full-body with phone-camera handheld feel. On THE WOAH freeze (step 1), camera jolts to a stop matching the freeze — sudden stillness after movement. On HIT THE QUAN squat (step 2), camera drops down with the squat. On the DAB (step 3), quick whip-pan in the dab direction then snap back. On SWAGG SURF (step 4), camera sways side-to-side like it's riding the same wave. On the final combo (step 5), rapid zoom-in on each hit — Woah freeze, dab snap, then slow dramatic push-in on the crossed-arms final pose ending tight on the face.",
    styleDirection: "Pure TikTok viral energy, Gen-Z swag, every move is a recognizable trend dance, confident and fun facial expressions, the kind of clip that gets 10M views. Camera is your hype friend filming you — reactive, shaky on the hits, tight on the money shots.",
  },
];

function compileTemplatePrompt(template: TemplateCard) {
  const sequenceText = template.motionSequence
    .map((step, index) => `${index + 1}. ${step}`)
    .join(" ");

  return [
    `Template Name: ${template.name}.`,
    "MOTION STYLE: Perform like a professional music video choreography — every movement is confident, rhythmic, and well-timed to the beat. Movements should be big and clearly visible but always smooth and danceable. Use sharp accents on the beat drops — a quick freeze, a pop, or a direction change — then flow into the next move. Arms should extend fully, hips should swing wide, and every pose should be held just long enough to read on camera.",
    `STRICTLY FOLLOW THIS MOTION ORDER: ${sequenceText}`,
    `Camera Direction: ${template.cameraDirection}`,
    `Style Direction: ${template.styleDirection}`,
    "The subject must stay standing upright on two legs for the ENTIRE duration — bipedal stance throughout, never drop to all fours.",
    "Keep the uploaded subject identity, face, clothes, and body proportions consistent throughout.",
    "Do not change species/person identity; do not morph into another character.",
    "Maintain coherent background continuity and stable scene geometry.",
    "Output should be ad-ready, smooth, detailed, and realistic with CRISP motion clarity on every single frame.",
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
