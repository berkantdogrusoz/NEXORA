"use client";

import { useUser } from "@clerk/nextjs";

export default function ImageGenerationPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-violet-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-black border border-white/10 rounded-full w-full h-full flex items-center justify-center">
                    <span className="text-4xl">🎨</span>
                </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Image Generation</h1>
            <p className="text-zinc-400 max-w-md mb-8">
                Create stunning images from text descriptions. This feature is coming soon with the new Prototipal engine.
            </p>
            <button className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition border border-white/10">
                Join Waitlist
            </button>
        </div>
    );
}
