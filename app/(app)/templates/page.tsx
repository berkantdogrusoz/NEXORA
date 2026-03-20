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
      "[Seconds 0–2] Stand on two legs facing camera. Both arms punch outward to the sides at full stretch, then snap back to the chest — repeat twice fast. On the second snap-back, the whole body bounces downward with bent knees and pops right back up. Head bobs forward sharply on each punch-out.",
      "[Seconds 2–4] Right arm swings in a huge arc from low-left to high-right overhead while the torso twists to follow it, then left arm mirrors the same arc from low-right to high-left. Hips swing wide in the opposite direction of each arm swing. The whole body sways like a pendulum — big, loose, rhythmic.",
      "[Seconds 4–5.5] Both arms cross over the chest in an X, then burst open wide to full wingspan. Immediately do a full body roll — chest pushes forward first, then stomach, then hips thrust back, knees dip. Spring back upright with arms raised overhead, fingers spread. Every body part moves in sequence top-to-bottom.",
      "[Seconds 5.5–7] Step right foot forward with a heavy stomp, swing both arms in a complete circle like a windmill, ending with a loud clap at chest level. The whole body reacts to the clap — shoulders jump, head snaps back. Then step left foot forward with another stomp and repeat the arm circle and clap.",
      "[Seconds 7–8] Strike a final pose — lean the upper body back at an angle, one arm points straight at the camera with a locked elbow, other hand on hip, chin tilted up. Hold this pose with absolutely zero movement for the remaining time. Total freeze.",
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
      "[Seconds 0–2] Standing upright on two legs, bounce deep with knees bending low and popping back up four times. On the fourth bounce, the chest pops forward making the shoulders and head jolt — arms swing at the sides like pendulums. The bounce is big and visible, whole body goes up and down rhythmically.",
      "[Seconds 2–3.5] Right arm rises straight up into a bold pose, left arm hangs down. Hold half a beat. Then switch instantly — left arm up, right drops. Switch four times total, each switch faster than the last. The shoulders pop on every switch, head turns to face the raised arm each time.",
      "[Seconds 3.5–5] Feet step into a wide stance. The neck rolls slowly in a full circle — left, back, right, forward — with attitude. Then both arms extend straight forward at full reach, palms open, pressing an invisible wall. The whole torso leans into the press, then snaps back upright. Repeat the press-and-snap twice.",
      "[Seconds 5–6.5] Both arms pull tight into an X across the chest. Hold one beat. Then open them wide into a full T-pose — arms stretched to maximum wingspan, fingers spread. Right foot steps down firmly on the opening. Head turns sharply to the right. Then pull back to X and open again to the left side with a left foot step.",
      "[Seconds 6.5–8] Both hands pull up to chin level, drop into a deep squat bouncing twice with rhythm — the whole body compresses down and springs up on each bounce. Then rise up tall and strong with one arm raised straight up overhead. Hold this victory pose completely frozen — zero movement, full confidence, for the remaining time.",
    ],
    cameraDirection: "Vertical full-body framing, low-angle looking up. On the chest pop (step 1), camera zooms in quickly then snaps back. On the arm thrusts (step 3), camera shakes gently on the beat. On the T-pose stomp (step 4), quick whip-pan following the head snap direction. On the final fist raise (step 5), slow dramatic tilt upward from low squat to raised fist — ending on a close-up.",
    styleDirection: "Energetic hip-hop street dance vibes, bold and confident movements, vibrant urban environment feel, every hit lands on the beat. Camera should feel dynamic and reactive — matching the rhythm.",
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
      "[Seconds 0–2] Stand on two legs facing camera at a slight side angle, chin down, eyes locked on camera. On the beat, the right arm snaps out pointing straight at the camera with full arm extension — the left hand slaps onto the waist, and the right hip pops out sharply to the right creating a dramatic body angle. The point-and-pop is sudden and sharp against the stillness before it.",
      "[Seconds 2–3.5] The pointing hand pulls back and sweeps through the hair with a big dramatic head toss — hair and head whip to the side. Then both hands snap up to frame the face — palms open flat beside both cheeks, fingers together. Hold this face-frame pose for a full beat with a fierce expression. The transition from hair toss to pose is instant.",
      "[Seconds 3.5–5.5] Step right foot out to the side with a sharp hip pop right, arms sweep right at shoulder height. Then step left foot out with a sharp hip pop left, arms sweep left. Repeat: right pop, left pop — four total hip pops, each one snapping the hip out as far as possible. Arms wave from side to side in big arcs matching each hip pop. The body bounces with each step.",
      "[Seconds 5.5–7] Both arms cross into an X over the chest, hold half a beat, then burst open while the body spins a quarter turn to the right. Land the turn with one hand planted on hip and the other arm fully extended outward showing a finger heart. The spin is smooth but the landing pose snaps into place like hitting a wall. Head whips to face camera on the landing.",
      "[Seconds 7–8] Final pose — knees bend slightly, one shoulder drops low, head tilts to the side, both hands rise to chin level making finger hearts. Hold completely frozen with a confident expression. Absolute stillness — not a single movement for the remaining time. Pure charisma freeze.",
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
      "[Seconds 0–2] Standing upright on two legs, the chest pushes forward hard, then the wave rolls down — stomach pushes out, then hips thrust backward, knees bend deep. Spring back upright with a snap. Do this full body wave twice — each one bigger than the last. The wave must travel visibly through the entire torso like a slow-motion ripple. Arms hang loose and swing with the momentum.",
      "[Seconds 2–4] Both hands press onto the thighs. The hips draw a huge horizontal circle clockwise — pushing far right, far back, far left, far forward. Two complete rotations, each circle as wide as possible. The upper body stays upright and almost still while the hips do all the work below, creating a dramatic contrast. Head stays level, expression playful.",
      "[Seconds 4–5.5] Both shoulders vibrate rapidly — right shoulder pops forward while left pulls back, then switch. Fast alternating shimmy for eight counts. The feet rock heel-to-toe subtly, and the head bobs forward on every other shimmy. The shimmy must be fast enough to look like vibration but each pop still visible and distinct.",
      "[Seconds 5.5–7] Step forward on the right foot. The right hip drops down low while the left arm sweeps up overhead in a big arc — the body bends into a deep S-curve shape, like a wave frozen mid-flow. Hold the S-curve for one beat. Then reverse it smoothly — left hip drops, right arm sweeps up, S-curve bends the other way. The transitions are fluid like water.",
      "[Seconds 7–8] Three rapid hip pops in succession — pop right, pop left, pop right — each one sharper and bigger than the last, hands pressing on the knees. Then rise up smoothly with both arms spreading wide open to full wingspan, chin lifted high, eyes closed. Hold this feeling-the-music pose with total stillness for the remaining time.",
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
      "[Seconds 0–2] Standing on two legs — right foot stomps forward flat on the ground while left foot slides backward, then switch: left stomps forward, right slides back. Repeat this marching-slide pattern four times with increasing speed. Arms pump up and down naturally like running. Each stomp hits the ground hard enough that the whole body bounces with it. Knees lift high on each stomp.",
      "[Seconds 2–3.5] Pivot on the right heel — the right foot twists inward while the left foot taps far out to the left side. Then pivot on the left heel and right foot taps far out to the right. Alternate rapidly side-to-side six times — feet sliding across the ground in a zigzag pattern. Arms swing loose and wide in the opposite direction of the feet. The whole body shifts left-right with each pivot.",
      "[Seconds 3.5–5] Tuck both arms tight against the body, spin a full 360 degrees on one foot — fast and clean. Land facing camera and immediately stomp back into the marching-slide pattern from step one without any pause. The spin is quick — under one second — and the re-entry is seamless. Arms pump out again the instant the spin lands.",
      "[Seconds 5–6.5] Feet start crossing over each other while moving forward — right foot crosses over left, then left crosses over right. Four crossover steps total, each one covering ground forward. The upper body stays level and smooth, arms held out slightly to the sides for balance, while the legs do fast criss-cross work below. The contrast between still upper body and busy legs is the key.",
      "[Seconds 6.5–8] Slide the right foot far out to the right into a wide power stance, dropping low with bent knees. Pause one full beat in this low wide stance — total stillness. Then spring upward explosively with both arms thrown straight up to the sky and one foot kicked forward off the ground. Hold this explosive airborne pose frozen for the remaining time. Maximum energy in the freeze.",
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
      "[Seconds 0–2] Standing on two legs — step the right foot forward, shift body weight onto it making the whole body lean forward, then rock back onto the left foot and bring the right foot back to center. Repeat this forward-back-center pattern three times. The hips sway side to side with every weight shift — big visible swaying. Arms are bent at the elbows and swing gently opposite to the hips. Each step is grounded and rhythmic.",
      "[Seconds 2–3.5] On each forward step now, the hip on the stepping side pushes out sharply to the side — right step means right hip pops far right, left step means left hip pops far left. Four sharp hip pops total, each one pushing the hip out as far as it can go. The upper body stays tall and almost still — chest lifted high — while the hips do dramatic work below. The contrast makes the hip pops look even bigger.",
      "[Seconds 3.5–5.5] The right foot steps across the body to the left side, the right arm sweeps up in a huge overhead arc, and the body unwinds into a smooth half-turn spinning to face the opposite direction. Then immediately step across again and spin back to face camera. Two full cross-step-and-spin combos — the arms arc dramatically overhead during each spin, the body has flowing momentum throughout.",
      "[Seconds 5.5–7] Both feet twist inward pigeon-toed, then twist outward duck-footed — rapidly alternating inward-outward six times while sliding sideways to the right. Arms wave at shoulder height, hands flicking at each direction change. Then slide back to the left with six more twists. The footwork is fast and playful, the whole body grooves with it.",
      "[Seconds 7–8] Lean the upper body far backward with one leg extending forward and one arm reaching back behind the head — a dramatic dip shape. Hold for half a beat. Then snap upright explosively into a proud pose — chest pushed forward, both hands framing the face, chin up, expression passionate. Hold this final pose completely frozen with zero movement for the remaining time.",
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
      "[Seconds 0–2] Walk forward toward the camera with three dramatic steps — each step lands heel-first with the hip swinging far out to the stepping side. The hip swing is exaggerated and visible on every single step. One hand stays planted on the hip, the other arm swings wide with each step. Chin is up, eyes locked fiercely on camera. Each step is slow, deliberate, and powerful — like owning a runway.",
      "[Seconds 2–3.5] Stop walking. Both arms extend straight forward, wrists rotate in smooth circles three times. Then snap into sharp angular poses — right arm shoots straight up while left arm bends at a perfect 90-degree angle, hold half a beat. Switch instantly: left arm up, right bent. Switch again. Four sharp geometric arm poses in rapid succession. Each pose is crisp and held just long enough to read clearly.",
      "[Seconds 3.5–5.5] Drop down into a deep squat with knees pointing outward to the sides. Waddle-step forward three steps while squatting — the body bobs up and down slightly with each waddle step but the upper body stays upright and elegant. Both hands frame the face in a glamorous pose throughout the squat-walk. The contrast between the low squat and the elegant upper body is dramatic.",
      "[Seconds 5.5–7] Rise up from the squat smoothly while spinning — arms extend outward gradually during the rise like a flower blooming open. Complete one full spin with arms at full wingspan. Then snap into a sharp freeze pose — one hand behind the head, other arm extended outward framing the face, back arched, chest forward. The spin is graceful but the freeze-pose landing is sudden and sharp.",
      "[Seconds 7–8] Lean the upper body dramatically backward — back arching, one arm reaching straight up toward the sky, the other arm sweeping behind. One leg extends forward for balance. Freeze in this deep dramatic lean-back position. Hold with total stillness — every muscle locked, pure theatrical elegance and power. Not a single movement for the remaining time.",
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
      "[Seconds 0–2] Standing on two legs, bounce with loose knees — the whole body goes up and down rhythmically, shoulders rolling forward and back. On the second bounce, the right arm swings in a big arc from the left side across the body to the right side and FREEZES mid-air — palm facing down, arm fully extended at the right. The entire body stops instantly. Total stillness for one full beat. The sudden freeze after movement is the key moment.",
      "[Seconds 2–3.5] Break out of the freeze — squat down low with bent knees. Both fists pull to the right hip, then thrust diagonally up to the left with a sharp head snap in the same direction. Bounce twice in the low squat with fists pumping upward on each bounce. The whole body compresses and springs on each squat-bounce. Head snaps on each thrust direction.",
      "[Seconds 3.5–5] Stand up and extend the right arm straight forward while tucking the face into the left elbow — classic dab shape, hold one beat. Then flip to the other side without pausing — left arm forward, face into right elbow. Then flip back again. Three dabs total alternating sides, each one snapping into place. Arms fully extend on every dab — big and visible.",
      "[Seconds 5–6.5] Lean the entire body to the right — both arms sweep right at chest level, knees bend right. Then lean the entire body to the left — arms sweep left, knees bend left. Four full side-to-side leans like riding a wave. The movement is big and smooth — the whole body travels from one side to the other each time. Arms sweep at the same time as the lean.",
      "[Seconds 6.5–8] Quick combo finish — right arm swings and freezes mid-air (one beat), then snap into a dab to the left (one beat), then stand up tall with both arms crossed firmly over the chest, chin lifted, expression confident. Hold this final crossed-arms power pose with absolute zero movement for the remaining time. Complete freeze, total swagger.",
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
    "MOTION STYLE: The subject must perform EXAGGERATED DANCE CHOREOGRAPHY — every single movement must be big, bold, and impossible to miss. Arms must extend to their FULL reach on every gesture. Hips must swing to their WIDEST range on every sway. Body bends and rolls must travel through the entire torso visibly. When the body bounces, the entire figure moves up and down noticeably. When arms swing, they cover maximum distance. When the body freezes, it is ABSOLUTE STILLNESS with zero micro-movements. Think of a professional dancer performing for a camera 20 meters away — every move must read clearly even at that distance. The choreography spans exactly 8 seconds with precise timing as described in each step.",
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
