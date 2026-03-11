"use client";

import { X, Download } from "lucide-react";

interface VideoPreviewOverlayProps {
  videoUrl: string;
  onClose: () => void;
}

export default function VideoPreviewOverlay({
  videoUrl,
  onClose,
}: VideoPreviewOverlayProps) {
  return (
    <div className="w-full max-w-4xl px-4 z-20 relative mt-8 animate-in slide-in-from-top-4 fade-in duration-500">
      <div className="bg-[#121419]/90 backdrop-blur-3xl border border-cyan-500/20 rounded-3xl p-2 shadow-[0_20px_50px_rgba(6,182,212,0.1)] relative">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-black border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white z-30"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="aspect-video bg-black rounded-[20px] overflow-hidden relative">
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-contain"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <a
              href={`/api/download?url=${encodeURIComponent(videoUrl)}`}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-black/60 hover:bg-cyan-600 text-white rounded-xl backdrop-blur-md transition-colors border border-white/10"
            >
              <Download className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
