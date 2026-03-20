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
      "EXPLOSIVE START: snap both fists to chest then VIOLENTLY punch right arm diagonally down-left at full extension while left arm WHIPS behind the head — the punch should be fast and aggressive, whole body jolts with the impact, freeze for half a beat.",
      "SHARP ARM WAVE: right arm SNAPS out fully extended, the wave RIPPLES hard through the shoulder with visible body lean, TRANSFERS to left arm shooting out — each wave hits like a whip crack, torso lurching side to side with exaggerated momentum.",
      "HEAVY BODY ROLL: chest POPS forward hard, rolls DOWN through stomach, hips THRUST back, knees BUCKLE on the drop — then EXPLOSIVE pop back up with arms SLAMMING into an X-cross at the wrists in front of the face, whole body rebounds like a spring.",
      "BURST OPEN: arms EXPLODE outward from the X-cross at maximum speed, right foot STOMPS forward with visible floor impact, both arms WINDMILL in a huge full circle ending with a THUNDERCLAP at center chest — the clap sends a visible jolt through the body.",
      "POWER FINISH: sharp lean-back with attitude, one hand SNAPS to point directly at camera with locked elbow, other hand SLAMS on hip, head TILTS with a confident smirk — FREEZE completely, zero movement, total stillness for the final two beats.",
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
      "HEAVY BOUNCE START: deep aggressive bounce with knees slamming down, shoulders ROLLING hard — then VIOLENT chest pop that RIPPLES through the entire upper body, arms SWINGING heavy like wrecking balls at the sides, head SNAPPING forward on the pop.",
      "POWER FLEX: right arm ROCKETS up into a hard flex pose with visible muscle tension while left arm DROPS like dead weight, then SNAP reverse — left arm SHOOTS up, right DROPS — each switch is INSTANT, shoulders ISOLATING with visible jolts on every beat.",
      "WIDE STANCE DROP: feet SLAM out wide, neck ROLLS slow and menacing from left to right, then EXPLOSIVE double arm THRUST forward like PUNCHING through a wall — elbows LOCKED, fingers SPREAD wide, whole body LURCHES forward with the thrust.",
      "CRISS-CROSS EXPLOSION: both arms WHIP into a tight X at the chest, pause one beat, then BURST outward into a full T-pose wingspan at MAXIMUM extension with a THUNDEROUS right foot stomp — head SNAPS right so hard the whole body follows the accent.",
      "VICTORY FREEZE: both fists SLAM to chin guard position, DROP into a deep squat with TWO aggressive bounces shaking the ground, then ROCKET upward with one fist PUNCHING the sky overhead — FREEZE in victory stance, zero movement, pure power.",
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
      "FIERCE START: side stance, chin DOWN with killer gaze — on the drop, right hand SNAPS out to point at camera with LOCKED elbow and visible arm tension, left hand SLAMS on waist, hip POPS sharply to the right creating a dramatic body angle.",
      "DRAMATIC HAIR WHIP: pointing hand WHIPS back through hair with an exaggerated head-toss that sends hair flying, then BOTH hands SNAP to frame the face — palms flat beside cheeks, fingers pressed together, hold the idol pose with INTENSITY.",
      "SHARP HIP ATTACKS: step-touch right with a VIOLENT hip pop that shakes the whole body, step-touch left with an equally AGGRESSIVE hip pop — arms SLICING through the air in a synchronized wave from right to left, wrists FLICKING hard at each endpoint like cracking a whip.",
      "X-BURST: both arms SLAM into an X over the chest with force, hold one beat, then EXPLODE open while SPINNING a quarter turn — end with one hand SNAPPING to hip, other arm SHOOTING out with a finger heart at FULL arm extension, sharp and precise.",
      "KILLING PART FINALE: knees bend, one shoulder DROPS dramatically, head TILTS hard, both hands form finger hearts and SNAP to chin level — FREEZE with the most confident, camera-eating K-Pop expression, absolute zero movement, pure charisma.",
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
      "DEEP WAVE START: chest PUSHES forward hard, the wave ROLLS down through the stomach with visible ripple, hips THRUST back dramatically, then body SNAPS upright like a whiplash — the body roll should be HUGE and EXAGGERATED, filling the entire frame with movement.",
      "WIDE WAIST WINE: hands press firm on thighs, hips draw a MASSIVE horizontal circle — WIDE and SLOW clockwise, the circle so big the whole body shifts, TWO full rotations with MAXIMUM hip range, upper body stays locked creating dramatic contrast.",
      "AGGRESSIVE SHIMMY: shoulders VIBRATE forward-back at HIGH speed for four beats — visible blur of shoulder movement, feet doing heel-toe ROCKS, head bobbing with ATTITUDE, face showing pure groove enjoyment.",
      "DRAMATIC HIP DIP: step forward and right hip DROPS hard like it hit the floor, left arm SWEEPS overhead in a huge arc, body creating an EXTREME S-curve — hold the S-curve, then REVERSE it with equal force flowing back to center.",
      "POWER FINISH: THREE rapid-fire booty pops — each one SHARPER and BIGGER than the last, hands GRIPPING knees, then RISE up with arms SPREADING wide to maximum wingspan, chin LIFTED to the sky, eyes closed — FREEZE in this feeling-the-music pose.",
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
      "RUNNING MAN BLAST: right foot STOMPS down hard with visible impact while left foot ROCKETS backward — SWITCH instantly, left STOMPS, right SLIDES — FOUR reps with ACCELERATING speed, each stomp HARDER than the last, arms PUMPING aggressively like sprinting.",
      "T-STEP FURY: pivot on right heel, left foot KICKS out to the side, pivot left heel, right foot KICKS out — RAPID side-to-side sliding at MAXIMUM speed, feet BARELY off the ground creating a blur of footwork, arms whipping loose with the momentum.",
      "EXPLOSIVE 360 SPIN: LAUNCH into a lightning-fast full rotation on the ball of the right foot, arms TUCKED tight for maximum spin speed, then SLAM back into Running Man on the landing without ANY pause — the transition must be seamless and AGGRESSIVE.",
      "CRISS-CROSS ATTACK: feet CROSSING over each other at high speed while CHARGING forward — right OVER left, left OVER right — upper body LOCKED perfectly level while feet do INSANE complex footwork below, creating a mesmerizing contrast.",
      "POWER SLIDE FINALE: EXPLOSIVE slide to the right dropping into a DEEP wide stance, pause one beat, then ROCKET back up with BOTH arms THROWN to the sky and one foot KICKED forward — maximum energy, maximum height, FREEZE at the peak.",
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
      "SALSA ATTACK: right foot STRIKES forward on beat 1 with a sharp step, weight SNAPS back to left on beat 2, right foot RETURNS on beat 3 — hips SWINGING dramatically with each transfer, arms LOCKED at 90 degrees with tight fists, every step has VISIBLE impact.",
      "CUBAN HIP FIRE: EXAGGERATED hip action — right foot steps and right hip SHOOTS out sharply to the side, then left hip FIRES on the return — the hip pops are HUGE and AGGRESSIVE, upper body stays TALL and PROUD, chest LIFTED, creating dramatic upper-lower body contrast.",
      "CROSS-BODY WHIP: step ACROSS the body to the left, right arm SWEEPS overhead in a HUGE dramatic arc cutting through the air, then UNWIND with a fast half-turn — hair and body WHIPPING with the rotation momentum, the turn is SHARP not gentle.",
      "SUZY-Q ATTACK: feet TWIST inward pigeon-toed then SNAP outward duck-footed in RAPID succession, TRAVELING sideways at speed — arms SLICING at shoulder height, fingers SNAPPING loud on every other beat, the footwork is FAST and PRECISE.",
      "DRAMATIC DEATH DIP: LEAN back with the upper body going nearly horizontal, one leg KICKS forward, one arm REACHES back overhead creating a dramatic arch — then SNAP upright like a rubber band into a proud chest-out pose, both arms FRAMING the face — PASSIONATE expression, total FREEZE.",
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
      "RUNWAY ATTACK: three AGGRESSIVE steps forward with MAXIMUM hip sway — each step SLAMS heel-first with visible impact, chin UP, eyes BURNING into camera, one hand LOCKED on hip, other arm SWINGING with FIERCE attitude — pure runway predator energy.",
      "HAND PERFORMANCE EXPLOSION: both arms SHOOT forward, wrists SPINNING in rapid circles, then SNAP into sharp geometric angles — right arm STRAIGHT up, left BENT at 90 degrees, INSTANT switch — each pose is a SHARP FREEZE like a fashion photograph coming alive, transitions are VIOLENT and PRECISE.",
      "POWER DUCKWALK: DROP into a deep squat with knees SPREAD wide, then waddle-step forward with EXAGGERATED swagger — upper body PERFECTLY upright, arms FRAMING the face in a glamorous pose, each step deliberate and POWERFUL despite the low position.",
      "SPIN BLOOM: ROCKET up from the duckwalk into a dramatic fast spin, arms EXTENDING outward like an EXPLOSION of petals, then SNAP into a vogue freeze — one hand SLAMMED behind the head, other arm creating a SHARP frame around the face, back ARCHED hard.",
      "DEATH DROP FINALE: LEAN back dramatically with one arm REACHING toward the sky, back ARCHING toward the ground in slow motion — then FREEZE mid-dip in a powerful reclined pose, every muscle LOCKED, pure ballroom drama and elegance — hold with INTENSITY.",
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
      "BOUNCE EXPLOSION: aggressive bouncing with knees SLAMMING down, shoulders ROLLING hard — on the drop, THE WOAH: right arm WHIPS from left to right in a fast arc and FREEZES mid-air at the right side, palm DOWN, body JOLTS in the opposite direction — EVERYTHING stops DEAD for one beat, total stillness.",
      "QUAN ATTACK: SNAP out of the freeze, DROP into a deep squat, both fists SLAM to the right hip, then THRUST them diagonally up-left with a VIOLENT head snap — BOUNCE twice in the squat with AGGRESSIVE fist pumps, each pump HARDER than the last.",
      "POWER DAB: RISE up and right arm SHOOTS straight forward at full extension while left arm LOCKS into the right elbow pit, face BURIED in the left elbow — HOLD one beat, then WHIP reverse-dab to the other side with ZERO pause, instant direction change.",
      "SWAGG SURF WAVE: LEAN right hard with full body commitment, both arms SWEEPING right at chest level, then LEAN left with equal force and SWEEP left — knees BENDING deep with each lean, the wave motion is BIG and EXAGGERATED like riding a massive wave.",
      "ULTIMATE COMBO FINISH: SNAP Woah freeze — INSTANT dab — then STAND tall with both arms SLAMMING into a cross over the chest, chin SNAPPING up, one eyebrow RAISED — the ULTIMATE swag pose, ZERO movement for the final two beats, pure ice-cold confidence.",
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
    "IMPORTANT MOTION RULES: Every movement must be EXPLOSIVE, EXAGGERATED, and MAXIMUM RANGE OF MOTION. No subtle or gentle movements — every hit is a SHARP SNAP, every pose is HELD with TENSION. Arms extend FULLY, legs kick WIDE, body pops are VIOLENT and PUNCHY. Think music video choreography, not casual dancing. Each beat transition must have a visible ACCENT — a freeze, a jolt, or a sharp direction change.",
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
