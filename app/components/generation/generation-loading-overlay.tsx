"use client";

import { Loader2, type LucideIcon } from "lucide-react";

interface GenerationLoadingOverlayProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
}

export default function GenerationLoadingOverlay({
  title,
  subtitle = "This takes about 30-60 seconds",
  icon: Icon,
}: GenerationLoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#121419] border border-white/10 rounded-3xl p-8 flex flex-col items-center max-w-sm w-full shadow-2xl">
        <div className="relative w-16 h-16 mb-6">
          <Loader2 className="w-16 h-16 text-cyan-500 animate-spin absolute inset-0" />
          <Icon className="w-8 h-8 text-white absolute inset-0 m-auto animate-pulse" />
        </div>
        <h3 className="text-white font-black uppercase tracking-wider text-sm mb-2">
          {title}
        </h3>
        <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest text-center mb-6">
          {subtitle}
        </p>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-2/3 animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}
