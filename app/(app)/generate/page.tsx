"use client";

import { useState, useEffect } from "react";
import { useCredits } from "@/app/providers/credit-provider";
import { Download, Loader2, Image as ImageIcon, Settings2, ChevronDown, Sparkles, X, Cpu } from "lucide-react";
import { getDefaultStylePresetId, getStylePresetsForMode } from "@/lib/style-presets";
import GenerationLoadingOverlay from "@/app/components/generation/generation-loading-overlay";
import PromptBarTabs from "@/app/components/generation/prompt-bar-tabs";

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
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [intensity, setIntensity] = useState(70);
  const [customDirection, setCustomDirection] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [gallery, setGallery] = useState<
    { url: string; prompt: string }[]
  >([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Settings dropdown
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const selectedModelConfig = IMAGE_MODELS.find(m => m.id === model) || IMAGE_MODELS[0];
  const selectedPreset = IMAGE_STYLE_PRESETS.find((preset) => preset.id === stylePreset) || IMAGE_STYLE_PRESETS[0];

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
    setSettingsOpen(false); // close settings when generating

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
        setPreviewImage(data.imageUrl);
        setGallery((prev) => [{ url: data.imageUrl, prompt }, ...prev]);
        setPrompt(""); // Clear prompt after success
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
    <div className="flex-1 w-full h-full relative overflow-y-auto hide-scrollbar flex flex-col items-center pb-20">
      
      {/* Hero Header */}
      <div className="w-full pt-14 pb-8 md:pt-24 md:pb-12 px-4 flex flex-col items-center z-10 transition-all">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white text-center uppercase tracking-[0.1em] drop-shadow-2xl">
          Yours to Create
        </h1>
        <p className="text-cyan-400 text-xs md:text-sm font-bold tracking-[0.2em] uppercase mt-4 text-center">
          Image Studio
        </p>
      </div>

      {/* Main Prompt Bar Container */}
      <div className="w-full max-w-[800px] px-4 z-20 relative transition-all">
        
        {/* Error Alert */}
        {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-center animate-in fade-in slide-in-from-bottom-2">
                {error}
            </div>
        )}

        <div className="bg-[#121419]/90 backdrop-blur-3xl border border-white/10 hover:border-white/20 rounded-[32px] md:rounded-[40px] p-2 md:p-3 shadow-2xl transition-all relative">
          
          {/* Top Half: Input Area */}
          <div className={`bg-black/40 rounded-[24px] md:rounded-[32px] p-4 flex flex-col border border-transparent focus-within:border-white/[0.08] transition-all relative z-20 ${generating ? 'opacity-50 pointer-events-none' : ''}`}>
             <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your vision... e.g., 'A cyberpunk neon city, cinematic lighting'"
                className="w-full h-20 md:h-28 bg-transparent text-white placeholder-white/25 resize-none outline-none border-none text-sm leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    generateImage();
                  }
                }}
             />
             
             {/* Quick Actions inside Textarea Bottom */}
             <div className="flex items-center gap-2 mt-2">
                 {/* Model Selector Dropdown */}
                 <div className="relative">
                     <button 
                         onClick={() => { setIsModelDropdownOpen(!isModelDropdownOpen); setSettingsOpen(false); }}
                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${isModelDropdownOpen ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'}`}
                     >
                         <Cpu className="w-3.5 h-3.5" />
                         <span className="hidden sm:inline">{selectedModelConfig.name}</span>
                         <ChevronDown className={`w-3 h-3 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                     </button>
                     
                     {isModelDropdownOpen && (
                         <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#121419] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                             <div className="p-1.5 max-h-[300px] overflow-y-auto hide-scrollbar">
                                 {IMAGE_MODELS.map(m => (
                                     <button
                                         key={m.id}
                                         onClick={() => { setModel(m.id); setIsModelDropdownOpen(false); }}
                                         className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${model === m.id
                                            ? 'bg-cyan-500/10 text-cyan-400'
                                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                                         }`}
                                     >
                                         <div className="flex flex-col">
                                             <span className="text-xs font-bold">{m.name}</span>
                                             <span className={`text-[10px] ${model === m.id ? 'text-cyan-400/60' : 'text-white/30'}`}>{m.cost} credits</span>
                                         </div>
                                         <div className="flex items-center gap-2">
                                             {m.tier === 'Pro' && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full uppercase font-black">Pro</span>}
                                             {model === m.id && <div className="w-2 h-2 bg-cyan-400 rounded-full" />}
                                         </div>
                                     </button>
                                 ))}
                             </div>
                         </div>
                     )}
                 </div>

                 <button 
                     onClick={() => { setSettingsOpen(!settingsOpen); setIsModelDropdownOpen(false); }}
                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${settingsOpen ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'}`}
                 >
                     <Settings2 className="w-3.5 h-3.5" />
                     <span className="hidden sm:inline">Options</span>
                 </button>
                 
                 {size && (
                     <div className="px-3 py-1.5 rounded-full bg-white/5 text-white/50 text-[10px] font-bold uppercase tracking-wider hidden sm:block">
                         {SIZES.find(s => s.value === size)?.label || size}
                     </div>
                 )}
             </div>
          </div>

          {/* Settings Drawer (Expanded) */}
          <div 
             className={`overflow-hidden transition-all duration-300 ease-in-out ${settingsOpen ? 'max-h-[800px] opacity-100 border-t border-white/5 mt-2' : 'max-h-0 opacity-0'}`}
          >
             <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Left Col: Model & Size */}
                 <div className="space-y-5">
                    {/* Model */}
                    <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Model</label>
                        <div className="grid grid-cols-2 gap-2">
                           {IMAGE_MODELS.map(m => (
                              <button
                                 key={m.id}
                                 onClick={() => setModel(m.id)}
                                 className={`px-3 py-2 text-[10px] rounded-xl border text-left transition-all font-medium flex flex-col gap-1 ${model === m.id
                                    ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                    : "bg-black/40 border-white/5 text-white/50 hover:border-white/10 hover:text-white"
                                 }`}
                              >
                                 <span className="font-bold flex items-center justify-between w-full">
                                    {m.name}
                                    {m.tier === 'Pro' && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded uppercase font-black">Pro</span>}
                                 </span>
                                 <span className="text-[9px] text-white/30">{m.cost} cr</span>
                              </button>
                           ))}
                        </div>
                    </div>
                    {/* Size */}
                    <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Aspect Ratio</label>
                        <div className="flex gap-2">
                           {SIZES.map(sz => (
                              <button
                                 key={sz.value}
                                 onClick={() => setSize(sz.value)}
                                 className={`flex-1 py-2 text-[10px] rounded-xl border text-center transition-all font-bold ${size === sz.value
                                    ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                                    : "bg-black/40 border-white/5 text-white/50 hover:border-white/10 hover:text-white"
                                 }`}
                              >
                                 {sz.label.split(' ')[0]}
                              </button>
                           ))}
                        </div>
                    </div>
                 </div>

                 {/* Right Col: Style & Details */}
                 <div className="space-y-5">
                    {/* Style */}
                    <div className="flex flex-col">
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Style Preset</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
                                className="w-full bg-black/40 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none flex items-center justify-between transition-colors z-10 relative"
                            >
                                <span className="truncate pr-2">
                                    {selectedPreset ? `${selectedPreset.name} - ${selectedPreset.description}` : "Select Style"}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform ${isStyleDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                            
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isStyleDropdownOpen ? "max-h-[300px] mt-2 opacity-100" : "max-h-0 opacity-0"}`}>
                                <div className="bg-[#121419] border border-white/10 rounded-xl overflow-hidden shadow-inner max-h-[250px] overflow-y-auto w-full flex flex-col hide-scrollbar">
                                    {IMAGE_STYLE_PRESETS.map(preset => (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => {
                                                setStylePreset(preset.id);
                                                setIsStyleDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2.5 text-xs hover:bg-white/5 transition-colors flex flex-col gap-0.5 ${stylePreset === preset.id ? 'bg-cyan-500/10 text-cyan-400' : 'text-white/80'}`}
                                        >
                                            <span className="font-bold truncate">{preset.name}</span>
                                            <span className={`text-[10px] truncate w-full ${stylePreset === preset.id ? 'text-cyan-400/70' : 'text-white/40'}`}>{preset.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhance */}
                    <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl px-4 py-3">
                        <div>
                            <p className="text-[10px] font-bold text-white uppercase tracking-wider">AI Enhance</p>
                            <p className="text-[9px] text-white/40 mt-0.5">Auto-optimizes prompt for quality</p>
                        </div>
                        <button
                            onClick={() => setEnhancePrompt(!enhancePrompt)}
                            className={`w-9 h-5 rounded-full transition-colors relative ${enhancePrompt ? "bg-cyan-500" : "bg-white/10"}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${enhancePrompt ? "left-[18px]" : "left-0.5"}`} />
                        </button>
                    </div>

                    {/* Intensity */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Intensity</label>
                            <span className="text-[10px] text-cyan-400 font-bold">{intensity}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100"
                            value={intensity}
                            onChange={(e) => setIntensity(Number(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full"
                        />
                    </div>
                 </div>
             </div>
          </div>

          {/* Bottom Nav / Submit Row */}
          <div className="flex items-center justify-between px-2 md:px-4 py-2 mt-1 relative z-20">
              <PromptBarTabs active="image" />
              
              {/* Generate Button */}
              <div className="flex items-center gap-3 flex-shrink-0 pl-3 md:pl-4 border-l border-white/5">
                  <div className="hidden md:block text-right">
                      <div className="text-[10px] text-white/40 uppercase font-bold tracking-[0.2em]">{selectedModelConfig.cost} cr</div>
                  </div>
                  <button 
                      onClick={generateImage}
                      disabled={generating || !prompt}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full h-10 md:h-11 px-5 md:px-8 flex items-center justify-center gap-2 font-black text-[10px] md:text-xs text-white uppercase tracking-wider shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02] active:scale-95"
                  >
                      {generating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                          <Sparkles className="w-4 h-4" />
                      )}
                      <span>{generating ? 'Generating' : 'Generate'}</span>
                  </button>
              </div>
          </div>
        </div>

      </div>

      {/* Image Preview Overlay (When an image is recently generated) */}
      {previewImage && !generating && (
          <div className="w-full max-w-4xl px-4 z-20 relative mt-8 animate-in slide-in-from-top-4 fade-in duration-500">
              <div className="bg-[#121419]/90 backdrop-blur-3xl border border-cyan-500/20 rounded-3xl p-2 shadow-[0_20px_50px_rgba(6,182,212,0.1)] relative">
                  <button 
                      onClick={() => setPreviewImage(null)}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-black border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white z-30"
                  >
                      <X className="w-4 h-4" />
                  </button>
                  <div className="bg-black rounded-[20px] overflow-hidden relative flex items-center justify-center min-h-[50vh] max-h-[75vh]">
                      <img
                          src={previewImage}
                          alt="Generated"
                          className="w-auto h-full max-h-[75vh] object-contain"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                          <a
                              href={`/api/download?url=${encodeURIComponent(previewImage)}`}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 bg-black/60 hover:bg-cyan-600 text-white rounded-xl backdrop-blur-md transition-colors border border-white/10 shadow-xl"
                          >
                              <Download className="w-5 h-5" />
                          </a>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Full Screen Loading Overlay while generating */}
      {generating && (
          <GenerationLoadingOverlay
              title="Synthesizing Image"
              subtitle="This takes about 10-20 seconds"
              icon={Sparkles}
          />
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
         <div className="w-full max-w-7xl px-4 mt-16 md:mt-24 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="flex items-center gap-4 mb-8">
                 <h2 className="text-white/80 font-black tracking-[0.15em] uppercase text-xs md:text-sm">Recent Creations</h2>
                 <div className="h-px bg-white/10 flex-1" />
             </div>
             
             {/* Grid */}
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                 {gallery.map((item, i) => (
                    <div key={i} className="group relative bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/5 aspect-square transition-transform hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        <img
                          src={item.url}
                          alt={item.prompt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 md:p-5">
                          <p className="text-white text-[10px] md:text-xs line-clamp-3 font-medium mb-4 leading-relaxed opacity-90">{item.prompt}</p>
                          <div className="flex gap-2 w-full">
                            <button
                                onClick={() => setPreviewImage(item.url)}
                                className="py-2 flex-1 bg-cyan-600 backdrop-blur-md text-white border border-cyan-500/20 text-[10px] font-bold rounded-xl hover:bg-cyan-500 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                            >
                                VIEW
                            </button>
                            <a
                              href={`/api/download?url=${encodeURIComponent(item.url)}`}
                              download
                              className="py-2 px-4 bg-white/10 backdrop-blur-md text-white border border-white/10 text-[10px] font-bold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center"
                            >
                              <Download className="w-3.5 h-3.5" />
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
