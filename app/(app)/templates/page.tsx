"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useCredits } from "@/app/providers/credit-provider";
import { Loader2, Upload, WandSparkles, Sparkles, Download, ListOrdered } from "lucide-react";

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
};

const TEMPLATE_COST = 50;

const MOTION_TEMPLATES: TemplateCard[] = [
  {
    id: "drunk-dance",
    name: "Drunk Dance",
    description: "Viral ritimde komik ama kontrollü dans koreografisi.",
    preview: "/arts/styles/viral-social.png",
    duration: "10",
    aspectRatio: "9:16",
    motionSequence: [
      "Start in a neutral standing pose, slight beat anticipation in shoulders and head.",
      "Lift one leg with playful imbalance, hips swing left-right in sync with rhythm.",
      "Drop the leg, step diagonally and perform two-arm wave motion at chest level.",
      "Add quick hip twist + shoulder bounce combo for 2 beats.",
      "Finish with a confident bounce and small spin while preserving face identity.",
    ],
    cameraDirection: "Medium full-body framing, slight handheld social feel, keep subject centered.",
    styleDirection: "Fun, social-first, realistic body mechanics, no body distortion.",
  },
  {
    id: "hero-fly",
    name: "Hero Fly",
    description: "Sinematik yükseliş, havalanma ve ileri uçuş hareketi.",
    preview: "/arts/styles/epic-movie-scenes.jpg",
    duration: "5",
    aspectRatio: "16:9",
    motionSequence: [
      "Start with crouched power stance and subtle wind reaction in clothes/hair.",
      "Character pushes off the ground with visible body force transfer.",
      "Vertical rise with controlled acceleration, chest opens and arms stabilize.",
      "Transition to forward glide with cinematic momentum.",
      "End in a strong airborne hero pose with stable identity.",
    ],
    cameraDirection: "Cinematic medium-wide shot, upward tilt during takeoff, smooth parallax.",
    styleDirection: "Epic cinematic realism, dramatic light contrast, premium action mood.",
  },
  {
    id: "escape-run",
    name: "Escape Run",
    description: "Kaçış temposunda hızlı koşu aksiyonu.",
    preview: "/arts/styles/cinema-studio.jpg",
    duration: "5",
    aspectRatio: "16:9",
    motionSequence: [
      "Character glances back in fear while shifting body weight forward.",
      "Explosive first sprint step, arms pumping naturally.",
      "Sustain fast run with realistic leg extension and torso rotation.",
      "Quick side-step dodge while maintaining speed.",
      "Final acceleration burst away from camera.",
    ],
    cameraDirection: "Tracking shot with slight handheld shake, keep full-body readable.",
    styleDirection: "High tension, cinematic chase feel, physically plausible motion.",
  },
  {
    id: "power-pose",
    name: "Power Pose",
    description: "Karizmatik yürüyüş + finalde güçlü duruş.",
    preview: "/arts/styles/dramatic-tv-teaser.jpg",
    duration: "5",
    aspectRatio: "9:16",
    motionSequence: [
      "Begin with calm stand and subtle eye focus forward.",
      "Take two confident forward steps with shoulder control.",
      "Perform a sharp quarter turn with clean foot pivot.",
      "Raise one arm in a dominant gesture, pause for emphasis.",
      "Lock into final power pose for the last beat.",
    ],
    cameraDirection: "Vertical hero framing, smooth dolly-in toward final pose.",
    styleDirection: "Premium ad aesthetic, confident attitude, clean facial consistency.",
  },
  {
    id: "street-groove",
    name: "Street Groove",
    description: "Sokak stili beat’e uyumlu groove dans sekansı.",
    preview: "/arts/styles/street-interview.png",
    duration: "10",
    aspectRatio: "9:16",
    motionSequence: [
      "Start with head nod + shoulder isolation on beat.",
      "Add left-right step pattern with loose knee bounce.",
      "Perform arm cross-and-open combo for two bars.",
      "Hip groove section with controlled torso roll.",
      "Finish with signature hand move and freeze-frame ending.",
    ],
    cameraDirection: "Vertical social framing, full-body visibility, steady center composition.",
    styleDirection: "Urban dance vibe, rhythm-accurate timing, natural human kinematics.",
  },
  {
    id: "anime-burst",
    name: "Anime Burst",
    description: "Anime enerjisiyle hızlı dash ve aksiyon pozu.",
    preview: "/arts/styles/anime-opening.jpg",
    duration: "5",
    aspectRatio: "16:9",
    motionSequence: [
      "Character charges energy in a ready stance.",
      "Instant forward dash with speed-line style kinetic feel.",
      "Mid-motion directional pivot with dynamic arm extension.",
      "Short airborne action beat with controlled landing.",
      "End in iconic anime action pose.",
    ],
    cameraDirection: "Dynamic wide shot, quick push-in on dash, stable final framing.",
    styleDirection: "Stylized anime energy but preserve core subject identity.",
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

  const selectedTemplate = useMemo(
    () => MOTION_TEMPLATES.find((t) => t.id === selectedTemplateId) || MOTION_TEMPLATES[0],
    [selectedTemplateId]
  );

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
      setError("Önce bir fotoğraf yükle.");
      return;
    }

    if (credits !== null && credits < TEMPLATE_COST) {
      setError("Yetersiz kredi. Lütfen kredi ekleyin.");
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

      const data = await res.json();
      if (!res.ok || !data?.videoUrl) {
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
            Hazır hareket şablonunu seç, fotoğrafını yükle, tek tıkla videonu üret. Model otomatik: <span className="text-cyan-400 font-semibold">Kling 3.0</span>
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
                    <div className="relative h-28 w-full">
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
              <h2 className="text-white font-bold mb-1">1) Fotoğraf Yükle</h2>
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
            </div>

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
              <video src={latestVideoUrl} controls className="w-full rounded-2xl border border-white/10" />
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-white text-sm font-semibold">Çıktı formatı: MP4 Video</p>
                <p className="text-white/60 text-xs mt-1">Çıktı normal MP4 video olarak üretilir. Sosyal medya ve reklam akışları için doğrudan kullanılabilir.</p>
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
            <p className="text-white/50 text-sm">Henüz template video üretilmedi.</p>
          )}

          {!!history.length && (
            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              {history.map((h, i) => (
                <video key={`${h.url}-${i}`} src={h.url} controls className="w-full rounded-xl border border-white/10" />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
