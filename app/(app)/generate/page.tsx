"use client";

import { useState } from "react";
import { useCredits } from "@/app/providers/credit-provider";

const STYLES = [
  { label: "Photographic", value: "photographic" },
  { label: "Cinematic", value: "cinematic" },
  { label: "Illustration", value: "illustration" },
  { label: "3D Render", value: "3d-render" },
  { label: "Minimal", value: "minimal" },
  { label: "Abstract", value: "abstract" },
];

const SIZES = [
  { label: "1:1", value: "1024x1024" },
  { label: "16:9", value: "1792x1024" },
  { label: "9:16", value: "1024x1792" },
];

const IMAGE_MODELS = [
  { id: "dall-e-2", name: "DALL-E 2", tier: "Standard", cost: 5 },
  { id: "dall-e-3", name: "DALL-E 3", tier: "Pro", cost: 15 },
];

export default function GeneratePage() {
  const { credits, deductCredits, refundCredits, planName } = useCredits();

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("dall-e-2");
  const [style, setStyle] = useState("photographic");
  const [size, setSize] = useState("1024x1024");
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gallery, setGallery] = useState<
    { url: string; prompt: string }[]
  >([]);

  const selectedModelConfig = IMAGE_MODELS.find(m => m.id === model) || IMAGE_MODELS[0];

  const generateImage = async () => {
    if (!prompt) return;

    if (selectedModelConfig.tier === "Pro" && planName === "Free") {
      setError("You need a Premium plan to use DALL-E 3 high-quality generation.");
      return;
    }

    if (credits !== null && credits < selectedModelConfig.cost) {
      setError("Insufficient credits. Please upgrade your plan.");
      return;
    }

    setGenerating(true);
    setError(null);

    // Instantly deduct from UI
    deductCredits(selectedModelConfig.cost);

    try {
      const fullPrompt = `${style === "photographic" ? "Professional high-end advertising photography, " : style === "cinematic" ? "Cinematic scene, award-winning cinematography, " : style === "illustration" ? "Beautiful artistic illustration, " : style === "3d-render" ? "Stunning 3D render, photorealistic, " : style === "minimal" ? "Minimalist clean design, " : "Abstract artistic, "}${prompt}. High quality, 8k resolution, sharp focus.`;

      const res = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt, size, model }),
      });

      const data = await res.json();

      if (res.ok && data.imageUrl) {
        setImageUrl(data.imageUrl);
        setGallery((prev) => [{ url: data.imageUrl, prompt }, ...prev]);
      } else {
        setError(data.error || "Failed to generate image.");
        refundCredits(selectedModelConfig.cost);
      }
    } catch {
      setError("Something went wrong.");
      refundCredits(selectedModelConfig.cost);
    } finally {
      setGenerating(false);
    }
  };

  const sendToCalendar = async () => {
    if (!imageUrl) return;
    try {
      const res = await fetch("/api/calendar/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: prompt, imageUrl }),
      });
      if (res.ok) alert("Image sent to Calendar! 📅");
      else alert("Failed to schedule.");
    } catch {
      alert("Error scheduling.");
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            Image Generation
          </h1>
          <p className="text-sm text-slate-500">
            Create stunning images with DALL-E models
          </p>
        </div>

        <div className="flex gap-6">
          {/* Left — Gallery */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Gallery
              </h3>
              <div className="space-y-2">
                {gallery.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-xs text-slate-600">
                      Generated images will appear here
                    </p>
                  </div>
                ) : (
                  gallery.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setImageUrl(item.url);
                        setPrompt(item.prompt);
                      }}
                      className="w-full rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all group"
                    >
                      <img
                        src={item.url}
                        alt=""
                        className="w-full aspect-square object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 flex flex-col items-center">
            {/* Image Display */}
            <div className="w-full max-w-2xl mb-8">
              {imageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl group">
                  <img
                    src={imageUrl}
                    alt="Generated"
                    className="w-full object-contain"
                  />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <a
                      href={imageUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-white text-xs font-medium border border-white/10 hover:bg-black/80 transition"
                    >
                      ↓ Download
                    </a>
                    <button
                      onClick={sendToCalendar}
                      className="px-3 py-1.5 rounded-lg bg-violet-600/80 backdrop-blur text-white text-xs font-medium border border-violet-500/30 hover:bg-violet-600 transition"
                    >
                      📅 Calendar
                    </button>
                  </div>
                </div>
              ) : generating ? (
                <div className="w-full aspect-square max-w-lg mx-auto rounded-2xl border border-white/[0.06] bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-600 to-violet-600 animate-pulse flex items-center justify-center text-3xl">
                    🖼️
                  </div>
                  <p className="text-sm font-medium text-white">
                    Generating image...
                  </p>
                  <p className="text-xs text-slate-500">
                    This takes about 10-20 seconds
                  </p>
                </div>
              ) : (
                <div className="w-full aspect-square max-w-lg mx-auto rounded-2xl border border-white/[0.06] bg-[#0a0a0a] flex flex-col items-center justify-center">
                  <div className="text-6xl mb-4 opacity-20">🖼️</div>
                  <p className="text-sm text-slate-600">
                    Enter a prompt to generate an image
                  </p>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="w-full max-w-2xl mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            {/* Controls */}
            <div className="w-full max-w-2xl">
              <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-4">
                {/* Prompt */}
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your image... (e.g., 'A neon-lit Tokyo street at night, rain reflection')"
                  rows={2}
                  className="w-full bg-transparent resize-none text-white text-sm placeholder:text-slate-600 focus:outline-none mb-4"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      generateImage();
                    }
                  }}
                />

                {/* Model Dropdown and Config Row */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    {IMAGE_MODELS.map((m) => (
                      <option key={m.id} value={m.id} className="bg-black text-white">
                        {m.name} ({m.tier})
                      </option>
                    ))}
                  </select>

                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    {selectedModelConfig.tier === "Pro" && (
                      <span className="px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-500 border border-amber-500/20 font-medium">
                        PRO
                      </span>
                    )}
                    <span>Cost: {selectedModelConfig.cost} credits</span>
                  </div>
                </div>

                {/* Style Chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {STYLES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStyle(s.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${style === s.value
                        ? "bg-violet-600/20 border-violet-500/30 text-violet-300"
                        : "bg-white/[0.04] border-white/[0.06] text-slate-500 hover:text-slate-300"
                        }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between">
                  {/* Size */}
                  <div className="flex items-center bg-white/[0.04] rounded-lg border border-white/[0.06] overflow-hidden">
                    {SIZES.map((sz) => (
                      <button
                        key={sz.value}
                        onClick={() => setSize(sz.value)}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${size === sz.value
                          ? "bg-white/10 text-white"
                          : "text-slate-500 hover:text-slate-300"
                          }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>

                  {/* Generate */}
                  <button
                    onClick={generateImage}
                    disabled={generating || !prompt}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 shadow-lg shadow-pink-500/20"
                  >
                    {generating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Generate
                        <span className="text-xs opacity-70">
                          ⚡ {selectedModelConfig.cost}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
