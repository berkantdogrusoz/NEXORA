"use client";

import { useState, useEffect } from "react";
import { useCredits } from "@/app/providers/credit-provider";
import { Download, Loader2, ImageIcon, Settings2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { getDefaultStylePresetId, getStylePresetsForMode, STYLE_PRESET_CATEGORIES } from "@/lib/style-presets";

const IMAGE_STYLE_PRESETS = getStylePresetsForMode("image");

const SIZES = [
  { label: "1:1 (Square)", value: "1024x1024" },
  { label: "16:9 (Wide)", value: "1792x1024" },
  { label: "9:16 (Vertical)", value: "1024x1792" },
];

const IMAGE_MODELS = [
  { id: "flux-2-dev", name: "FLUX 2 Dev", tier: "Standard", cost: 15 },
  { id: "flux-schnell", name: "FLUX Schnell", tier: "Standard", cost: 15 },
  { id: "recraft-v3", name: "Recraft V3 (Design)", tier: "Pro", cost: 30 },
  { id: "nano-banana-2", name: "Nano Banana 2 🍌", tier: "Free", cost: 20 },
  { id: "dall-e-3", name: "DALL-E 3 (HD)", tier: "Pro", cost: 35 },
  { id: "flux-pro", name: "FLUX 1.1 Pro", tier: "Pro", cost: 45 },
];

export default function GeneratePage() {
  const { credits, deductCredits, refundCredits, planName } = useCredits();

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("flux-2-dev");
  const [stylePreset, setStylePreset] = useState(getDefaultStylePresetId("image"));
  const [presetCategory, setPresetCategory] = useState<"all" | (typeof STYLE_PRESET_CATEGORIES)[number]>("all");
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [intensity, setIntensity] = useState(70);
  const [customDirection, setCustomDirection] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gallery, setGallery] = useState<
    { url: string; prompt: string }[]
  >([]);

  // Collapsible panels
  const [styleOpen, setStyleOpen] = useState(true);
  const [modelOpen, setModelOpen] = useState(true);

  const selectedModelConfig = IMAGE_MODELS.find(m => m.id === model) || IMAGE_MODELS[0];
  const selectedPreset = IMAGE_STYLE_PRESETS.find((preset) => preset.id === stylePreset) || IMAGE_STYLE_PRESETS[0];
  const filteredPresets = IMAGE_STYLE_PRESETS.filter((preset) => presetCategory === "all" || preset.category === presetCategory);

  // Load history from database on mount
  useEffect(() => {
    fetch("/api/generations?type=image")
      .then(r => r.json())
      .then(data => {
        if (data.generations?.length) {
          setGallery(data.generations.map((g: any) => ({
            url: g.output_url,
            prompt: g.prompt,
          })));
        }
      })
      .catch(() => { });
  }, []);

  const generateImage = async () => {
    if (!prompt) return;

    if (selectedModelConfig.tier === "Pro" && (planName === "Free" || planName === "Standard")) {
      setError("You need a Premium plan to use Pro models.");
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
      const res = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          size,
          model,
          stylePreset,
          intensity,
          customDirection,
          enhancePrompt,
        }),
      });

      const data = await res.json();

      if (res.ok && data.imageUrl) {
        setImageUrl(data.imageUrl);
        setGallery((prev) => [{ url: data.imageUrl, prompt }, ...prev.slice(0, 9)]);
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

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tight">
          <ImageIcon className="w-8 h-8 text-cyan-500" />
          Image Studio
        </h1>
        <p className="text-white/50 mt-2 text-sm font-medium tracking-wide uppercase">
          AI-Powered Image Generation — DALL-E 3, FLUX 2, Recraft V3 & More
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
              placeholder="Describe your image... e.g., 'A neon-lit Tokyo street at night, cinematic rain reflections, 8k resolution'"
              className="w-full h-28 bg-transparent text-white placeholder-white/30 resize-none outline-none border-none text-sm leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  generateImage();
                }
              }}
            />

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
              <div className="text-xs text-white/40 uppercase tracking-wider font-medium">
                <span className="font-bold text-cyan-400">{selectedModelConfig.cost}</span> credits / image
              </div>

              <button
                onClick={generateImage}
                disabled={generating || !prompt}
                className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white px-8 py-3 rounded-sm font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-wider text-sm"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Image
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Area */}
          <div className="aspect-square bg-black/80 border border-white/[0.06] rounded-sm overflow-hidden relative flex items-center justify-center group">
            {generating ? (
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
                <div className="text-cyan-400 font-medium animate-pulse text-sm uppercase tracking-wider">
                  Synthesizing your image...
                </div>
                <div className="text-white/30 text-xs uppercase tracking-wider">This may take 10-20 seconds</div>
                <div className="w-48 h-0.5 bg-white/[0.06] rounded-sm overflow-hidden mx-auto">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-sm animate-pulse w-2/3" />
                </div>
              </div>
            ) : imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt="Generated"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <a
                    href={`/api/download?url=${encodeURIComponent(imageUrl)}`}
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
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm font-medium uppercase tracking-wider">Your generated image will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-4">
          {/* Settings Header */}
          <div className="flex items-center gap-2 px-1">
            <Settings2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-[0.2em]">Generation Settings</h3>
          </div>

          {/* Model Selection — Collapsible */}
          <div className="bg-[#0a0a0a] border border-white/[0.08] border-t-2 border-t-cyan-500/60 rounded-sm">
            <button
              onClick={() => setModelOpen(!modelOpen)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-white/80 uppercase tracking-[0.15em]">AI Model</span>
                <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-sm font-medium">
                  {selectedModelConfig.name}
                </span>
              </div>
              {modelOpen ? (
                <ChevronUp className="w-4 h-4 text-white/40" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/40" />
              )}
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${modelOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 space-y-2">
                  {IMAGE_MODELS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setModel(m.id)}
                      className={`w-full px-3 py-2.5 text-xs rounded-sm border text-left transition-all font-medium uppercase tracking-wider flex items-center justify-between ${model === m.id
                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 font-bold"
                        : "bg-black/40 border-white/[0.06] text-white/50 hover:border-white/[0.12] hover:text-white/70"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{m.name}</span>
                        {m.tier === "Pro" && (
                          <span className="text-[8px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-sm font-bold normal-case">
                            PRO
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-white/30 font-normal normal-case">{m.cost} cr</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Style Selection — Collapsible */}
          <div className="bg-[#0a0a0a] border border-white/[0.08] border-t-2 border-t-cyan-500/60 rounded-sm">
            <button
              onClick={() => setStyleOpen(!styleOpen)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-white/80 uppercase tracking-[0.15em]">Style</span>
                <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-sm font-medium capitalize">
                  {selectedPreset?.name || "Preset"}
                </span>
              </div>
              {styleOpen ? (
                <ChevronUp className="w-4 h-4 text-white/40" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/40" />
              )}
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${styleOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setPresetCategory("all")}
                      className={`px-2.5 py-1.5 text-[10px] rounded-sm border uppercase tracking-wider font-bold transition ${presetCategory === "all" ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400" : "bg-black/40 border-white/[0.06] text-white/40 hover:text-white/70"}`}
                    >
                      All
                    </button>
                    {STYLE_PRESET_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => setPresetCategory(category)}
                        className={`px-2.5 py-1.5 text-[10px] rounded-sm border uppercase tracking-wider font-bold transition ${presetCategory === category ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400" : "bg-black/40 border-white/[0.06] text-white/40 hover:text-white/70"}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-auto pr-1">
                    {filteredPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setStylePreset(preset.id)}
                      className={`px-3 py-2.5 text-left rounded-sm border transition-all ${stylePreset === preset.id
                        ? "bg-cyan-500/15 border-cyan-500/50"
                        : "bg-black/40 border-white/[0.06] text-white/50 hover:border-white/[0.12] hover:text-white/70"
                        }`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-white">{preset.name}</p>
                      <p className="text-[10px] text-white/45 mt-1 normal-case">{preset.description}</p>
                    </button>
                  ))}
                  </div>
                  <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">AI Enhance</p>
                      <button
                        onClick={() => setEnhancePrompt(!enhancePrompt)}
                        className={`w-9 h-5 rounded-sm transition-colors relative ${enhancePrompt ? "bg-cyan-500" : "bg-white/10"}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-sm shadow transition-transform ${enhancePrompt ? "left-[18px]" : "left-0.5"}`} />
                      </button>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Intensity</p>
                        <span className="text-[10px] font-bold text-cyan-400">{intensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={intensity}
                        onChange={(e) => setIntensity(Number(e.target.value))}
                        className="w-full h-1 bg-white/[0.06] rounded-sm appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Custom Direction</p>
                      <textarea
                        value={customDirection}
                        onChange={(e) => setCustomDirection(e.target.value.slice(0, 220))}
                        placeholder="Optional: add specific art direction"
                        className="w-full h-20 px-3 py-2 bg-black/40 border border-white/[0.06] rounded-sm text-xs text-white placeholder-white/20 outline-none focus:border-cyan-500/40 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="bg-[#0a0a0a] border border-white/[0.08] border-t-2 border-t-cyan-500/60 rounded-sm p-4">
            <p className="text-xs font-bold text-white/80 uppercase tracking-[0.15em] mb-3">Aspect Ratio</p>
            <div className="grid grid-cols-3 gap-2">
              {SIZES.map(sz => (
                <button
                  key={sz.value}
                  onClick={() => setSize(sz.value)}
                  className={`px-3 py-2.5 text-xs rounded-sm border text-center transition-all font-medium uppercase tracking-wider ${size === sz.value
                    ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 font-bold"
                    : "bg-black/40 border-white/[0.06] text-white/50 hover:border-white/[0.12] hover:text-white/70"
                    }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <div className="mt-16">
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            Your Gallery
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((item, i) => (
              <div key={i} className="group relative aspect-square bg-[#0a0a0a] rounded-sm overflow-hidden border border-white/[0.06]">
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                  <p className="text-white text-[11px] line-clamp-2 font-medium mb-3">{item.prompt}</p>
                  <div className="flex gap-2">
                    <a
                      href={`/api/download?url=${encodeURIComponent(item.url)}`}
                      download
                      className="px-3 py-1.5 bg-cyan-600 text-white text-[10px] font-bold rounded-sm hover:bg-cyan-500 transition-colors flex items-center gap-1 w-full justify-center uppercase tracking-wider"
                    >
                      <Download className="w-3 h-3" /> Download
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
