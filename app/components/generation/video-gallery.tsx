"use client";

import { Play, Download } from "lucide-react";

export interface VideoHistoryItem {
  url: string;
  prompt: string;
  createdAt: number;
}

interface VideoGalleryProps {
  history: VideoHistoryItem[];
  title?: string;
  onSelectVideo: (url: string) => void;
}

export default function VideoGallery({
  history,
  title = "Recent Videos",
  onSelectVideo,
}: VideoGalleryProps) {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-7xl px-4 mt-16 md:mt-24 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-white/80 font-black tracking-[0.15em] uppercase text-xs md:text-sm">
          {title}
        </h2>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {history.map((item, i) => (
          <div
            key={i}
            className="group relative bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/5 aspect-video transition-transform hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            <video
              src={item.url}
              muted
              loop
              playsInline
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 md:p-5">
              <p className="text-white text-[10px] md:text-xs line-clamp-2 font-medium mb-4 leading-relaxed opacity-90">
                {item.prompt}
              </p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => onSelectVideo(item.url)}
                  className="py-2 flex-1 bg-cyan-600 backdrop-blur-md text-white border border-cyan-500/20 text-[10px] font-bold rounded-xl hover:bg-cyan-500 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Play
                </button>
                <a
                  href={`/api/download?url=${encodeURIComponent(item.url)}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/10 text-[10px] font-bold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
