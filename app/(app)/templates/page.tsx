"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useCredits } from "@/app/providers/credit-provider";
import { Loader2, Upload, WandSparkles, Sparkles, Download } from "lucide-react";

type TemplateCard = {
  id: string;
  name: string;
  description: string;
  preview: string;
  motionPrompt: string;
  duration: "5" | "10";
  aspectRatio: "16:9" | "9:16";
};

const TEMPLATE_COST = 50;

const MOTION_TEMPLATES: TemplateCard[] = [
  {
    id: "drunk-dance",
    name: "Drunk Dance",
    description: "Enerjik, komik ve viral dans hareketi.",
    preview: "/arts/styles/viral-social.png",
    motionPrompt:
      "Animate the uploaded character with funny off-balance drunk dance moves, rhythmic steps, expressive arms, playful body sway, smooth camera, clean background consistency, highly realistic motion.",
    duration: "5",
    aspectRatio: "9:16",
  },
  {
    id: "hero-fly",
    name: "Hero Fly",
    description: "Sinematik yükseliş ve havalanma efekti.",
    preview: "/arts/styles/epic-movie-scenes.jpg",
    motionPrompt:
      "Animate the uploaded character rising from the ground and flying forward like a cinematic hero, dramatic wind on clothes and hair, dynamic camera parallax, realistic lighting and motion blur.",
    duration: "5",
    aspectRatio: "16:9",
  },
  {
    id: "escape-run",
    name: "Escape Run",
    description: "Kaçış temposunda hızlı koşu aksiyonu.",
    preview: "/arts/styles/cinema-studio.jpg",
    motionPrompt:
      "Animate the uploaded character sprinting in panic through a cinematic environment, fast footwork, natural body momentum, slight handheld camera shake, intense pace and realistic motion.",
    duration: "5",
    aspectRatio: "16:9",
  },
  {
    id: "power-pose",
    name: "Power Pose",
    description: "Karizmatik dönüş + güçlü final pozu.",
    preview: "/arts/styles/dramatic-tv-teaser.jpg",
    motionPrompt:
      "Animate the uploaded character with a stylish turn, confident walk-in, then strong power pose with subtle dramatic effects, premium cinematic camera language and clean identity preservation.",
    duration: "5",
    aspectRatio: "9:16",
  },
  {
    id: "street-groove",
    name: "Street Groove",
    description: "Sokak stili beat'e uyumlu groove dans.",
    preview: "/arts/styles/street-interview.png",
    motionPrompt:
      "Animate the uploaded character doing smooth urban groove dance with head nods, shoulder rolls and clean foot transitions, social-media style framing, natural human motion.",
    duration: "10",
    aspectRatio: "9:16",
  },
  {
    id: "anime-burst",
    name: "Anime Burst",
    description: "Anime açılış enerjisi + patlayıcı aksiyon.",
    preview: "/arts/styles/anime-opening.jpg",
    motionPrompt:
      "Animate the uploaded character with anime-inspired explosive movement, quick dash and dynamic pose transitions, stylized kinetic energy, but keep subject identity recognizable.",
    duration: "5",
    aspectRatio: "16:9",
  },
];

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
      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: selectedTemplate.motionPrompt,
          model: "kling-3",
          duration: selectedTemplate.duration,
          aspectRatio: selectedTemplate.aspectRatio,
          quality: "hd",
          imageUrl: referenceImage,
          stylePreset: "none",
          enhancePrompt: true,
          intensity: 75,
          customDirection: `Template: ${selectedTemplate.name}`,
          cameraMovement: "auto",
          motionIntensity: 0.75,
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
              <video src={latestVideoUrl} controls loop className="w-full rounded-2xl border border-white/10" />
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-white text-sm font-semibold">Çıktı formatı: MP4</p>
                <p className="text-white/60 text-xs mt-1">MP4 loop sosyal platformlar için daha kaliteli ve daha hafif çalışır. İstersen sonra GIF'e çevrilebilir.</p>
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
