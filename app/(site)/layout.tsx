"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { ChevronDown, Video, Image as ImageIcon, Sparkles, BookOpen, GraduationCap, PlayCircle } from "lucide-react";

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { isSignedIn, isLoaded } = useUser();
    const [scrolled, setScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleMouseEnter = (menu: string) => setActiveDropdown(menu);
    const handleMouseLeave = () => setActiveDropdown(null);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-violet-500/30">
            {/* Navbar */}
            <nav
                className={`w-full z-[100] transition-all duration-300 py-4 px-6 fixed top-0 left-0 right-0 ${scrolled
                    ? "bg-black/95 backdrop-blur-2xl border-b border-white/[0.06] shadow-xl shadow-black/50"
                    : "bg-transparent"
                    }`}
            >
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    {/* Logo & Links Group */}
                    <div className="flex items-center gap-12">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group shrink-0">
                            <span className="font-extrabold text-2xl tracking-tighter text-white">
                                NEXORA.AI
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6">
                            {/* Create Dropdown */}
                            <div
                                className="relative py-2"
                                onMouseEnter={() => handleMouseEnter('create')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button className="flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white transition-colors">
                                    Create <ChevronDown className="w-4 h-4 text-white/50" />
                                </button>

                                {/* Dropdown Panel */}
                                <div className={`absolute top-full left-0 pt-4 transition-all duration-200 origin-top-left ${activeDropdown === 'create' ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                                    <div className="w-[600px] bg-[#111111] border border-white/10 rounded-2xl shadow-2xl p-6 grid grid-cols-2 gap-x-8 gap-y-6">
                                        <div>
                                            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Media</p>
                                            <Link href="/generate" className="flex items-start gap-4 group p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
                                                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center shrink-0 group-hover:bg-violet-600/20 group-hover:text-violet-400 transition-colors">
                                                    <ImageIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-violet-300 transition-colors">AI Image Generator</h4>
                                                    <p className="text-xs text-white/50 leading-relaxed">Create stunning images from text prompts or reference photos.</p>
                                                </div>
                                            </Link>
                                            <Link href="/studio" className="flex items-start gap-4 group mt-4 p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
                                                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center shrink-0 group-hover:bg-fuchsia-600/20 group-hover:text-fuchsia-400 transition-colors">
                                                    <Video className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-fuchsia-300 transition-colors">AI Video Studio</h4>
                                                    <p className="text-xs text-white/50 leading-relaxed">Bring visuals to motion with cinematic video generation.</p>
                                                </div>
                                            </Link>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Featured Models</p>
                                            <div className="space-y-3">
                                                <div className="p-3 rounded-xl bg-black border border-white/5 group hover:border-violet-500/30 transition-colors cursor-pointer">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-bold text-white">Seedance 2.0</span>
                                                        <span className="text-[10px] uppercase font-bold text-fuchsia-400 bg-fuchsia-400/10 px-2 py-0.5 rounded-sm">New</span>
                                                    </div>
                                                    <p className="text-xs text-white/40">Next-gen cinematic video motion.</p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-black border border-white/5 group hover:border-violet-500/30 transition-colors cursor-pointer">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-bold text-white">DALL-E 3</span>
                                                    </div>
                                                    <p className="text-xs text-white/40">Flawless prompt adherence.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Learn Dropdown */}
                            <div
                                className="relative py-2"
                                onMouseEnter={() => handleMouseEnter('learn')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button className="flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white transition-colors">
                                    Learn <ChevronDown className="w-4 h-4 text-white/50" />
                                </button>

                                <div className={`absolute top-full left-0 pt-4 transition-all duration-200 origin-top-left ${activeDropdown === 'learn' ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                                    <div className="w-[300px] bg-[#111111] border border-white/10 rounded-2xl shadow-2xl p-4">
                                        <Link href="#" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors">
                                            <GraduationCap className="w-5 h-5" />
                                            <div className="text-sm font-semibold">User Guide</div>
                                        </Link>
                                        <Link href="#" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors mt-1">
                                            <PlayCircle className="w-5 h-5" />
                                            <div className="text-sm font-semibold">Video Tutorials</div>
                                        </Link>
                                        <Link href="#" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors mt-1">
                                            <BookOpen className="w-5 h-5" />
                                            <div className="text-sm font-semibold">API Documentation</div>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Static Links */}
                            <Link href="/pricing" className="text-sm font-semibold text-white/90 hover:text-white transition-colors py-2">
                                Pricing
                            </Link>
                        </div>
                    </div>

                    {/* Auth */}
                    <div className="flex items-center gap-4 shrink-0">
                        {!isLoaded ? (
                            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                        ) : isSignedIn ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/generate"
                                    className="px-5 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-slate-200 transition-colors"
                                >
                                    App
                                </Link>
                                <UserButton
                                    afterSignOutUrl="/"
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-9 h-9 border-2 border-white/20 hover:border-violet-500 transition-colors",
                                        },
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <SignInButton mode="modal">
                                    <button className="text-sm font-bold text-white/90 hover:text-white transition-colors">
                                        Log in
                                    </button>
                                </SignInButton>
                                <Link
                                    href="/sign-up"
                                    className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                                >
                                    Start now
                                    <Sparkles className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main>{children}</main>
        </div>
    );
}
