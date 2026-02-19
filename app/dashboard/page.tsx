"use client";

import { ArrowRight, Video, Image as ImageIcon, Music, Code } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const tools = [
        {
            label: "Video Generation",
            icon: Video,
            href: "/studio",
            color: "text-pink-700",
            bgColor: "bg-pink-700/10",
        },
        {
            label: "Image Generation",
            icon: ImageIcon,
            href: "/image-generation",
            color: "text-violet-500",
            bgColor: "bg-violet-500/10",
        },
        {
            label: "Music Generation",
            icon: Music,
            href: "/music",
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
        }
    ];

    return (
        <div className="p-4 md:p-8 lg:p-12">
            <div className="mb-8 space-y-4">
                <h2 className="text-2xl md:text-4xl font-bold text-center text-white">
                    Explore the Power of AI
                </h2>
                <p className="text-muted-foreground font-light text-sm md:text-lg text-center text-zinc-400">
                    Chat with the smartest AI - Experience the power of AI
                </p>
            </div>

            <div className="px-4 md:px-20 lg:px-32 space-y-4">
                {tools.map((tool) => (
                    <Link
                        key={tool.href}
                        href={tool.href}
                        className="p-4 border-white/5 border flex items-center justify-between hover:shadow-md transition cursor-pointer rounded-lg hover:bg-white/5 group"
                    >
                        <div className="flex items-center gap-x-4">
                            <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                                <tool.icon className={cn("w-8 h-8", tool.color)} />
                            </div>
                            <div className="font-semibold text-white">
                                {tool.label}
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:translate-x-1 transition" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
