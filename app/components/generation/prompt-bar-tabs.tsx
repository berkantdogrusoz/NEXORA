"use client";

import Link from "next/link";
import { ImagePlus, Video, Film } from "lucide-react";

type ActiveTab = "image" | "video" | "blueprints";

interface PromptBarTabsProps {
  active: ActiveTab;
}

const tabs = [
  { id: "image" as const, href: "/generate", label: "Image", icon: ImagePlus },
  { id: "video" as const, href: "/studio", label: "Video", icon: Video },
  { id: "blueprints" as const, href: "/director", label: "Blueprints", icon: Film, hiddenOnMobile: true },
];

export default function PromptBarTabs({ active }: PromptBarTabsProps) {
  return (
    <div className="flex items-center gap-1 md:gap-2 overflow-x-auto hide-scrollbar">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`px-4 py-2 rounded-full font-bold text-[10px] md:text-xs flex items-center gap-2 uppercase tracking-wider flex-shrink-0 transition-colors ${
              isActive
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white hover:bg-white/5"
            } ${tab.hiddenOnMobile ? "hidden sm:flex" : ""}`}
          >
            <Icon
              className={`w-4 h-4 ${isActive ? "text-cyan-400" : ""}`}
            />
            <span className="hidden sm:inline">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
