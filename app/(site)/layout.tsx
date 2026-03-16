"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
    ChevronDown,
    Video,
    Image as ImageIcon,
    Sparkles,
    BookOpen,
    GraduationCap,
    PlayCircle,
    Menu,
    X,
    Zap,
} from "lucide-react";
import { clerkUserButtonAppearance } from "@/lib/clerk-appearance";

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { isSignedIn, isLoaded } = useUser();
    const [scrolled, setScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const handleMouseEnter = (menu: string) => setActiveDropdown(menu);
    const handleMouseLeave = () => setActiveDropdown(null);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">
            {/* Navbar */}
            <nav
                className={`w-full z-[100] transition-all duration-300 py-4 px-6 fixed top-0 left-0 right-0 ${scrolled || mobileOpen
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
                                                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center shrink-0 group-hover:bg-cyan-600/20 group-hover:text-cyan-400 transition-colors">
                                                    <ImageIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">AI Image Generator</h4>
                                                    <p className="text-xs text-white/50 leading-relaxed">Create stunning images from text prompts or reference photos.</p>
                                                </div>
                                            </Link>
                                            <Link href="/studio" className="flex items-start gap-4 group mt-4 p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
                                                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center shrink-0 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                                                    <Video className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">AI Video Studio</h4>
                                                    <p className="text-xs text-white/50 leading-relaxed">Bring visuals to motion with cinematic video generation.</p>
                                                </div>
                                            </Link>
                                            <Link href="/templates" className="flex items-start gap-4 group mt-4 p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
                                                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-colors">
                                                    <Zap className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">Template Motion Studio</h4>
                                                    <p className="text-xs text-white/50 leading-relaxed">Viral dance templates — upload a photo, get a video.</p>
                                                </div>
                                            </Link>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Featured Models</p>
                                            <div className="space-y-3">
                                                <div className="p-3 rounded-xl bg-black border border-white/5 group hover:border-cyan-500/30 transition-colors cursor-pointer">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-bold text-white">Seedance 2.0</span>
                                                        <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-sm">New</span>
                                                    </div>
                                                    <p className="text-xs text-white/40">Next-gen cinematic video motion.</p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-black border border-white/5 group hover:border-cyan-500/30 transition-colors cursor-pointer">
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
                                        <Link href="/api-docs" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors mt-1">
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

                    {/* Right side: Auth + Mobile hamburger */}
                    <div className="flex items-center gap-4 shrink-0">
                        {/* Desktop Auth */}
                        <div className="hidden md:flex items-center gap-4">
                            {!isLoaded ? (
                                <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                            ) : isSignedIn ? (
                                <div className="flex items-center gap-4">
                                    <Link
                                        href="/dashboard"
                                        className="px-5 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                    <UserButton
                                        afterSignOutUrl="/"
                                        appearance={clerkUserButtonAppearance}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link href="/sign-in" className="text-sm font-bold text-white/90 hover:text-white transition-colors">
                                        Log in
                                    </Link>
                                    <Link
                                        href="/sign-up"
                                        className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                                    >
                                        Start Free
                                        <Sparkles className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile: CTA + Hamburger */}
                        <div className="flex md:hidden items-center gap-3">
                            {!isLoaded ? (
                                <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                            ) : isSignedIn ? (
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/sign-up"
                                    className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1.5"
                                >
                                    Start Free
                                    <Sparkles className="w-3 h-3" />
                                </Link>
                            )}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                {mobileOpen ? (
                                    <X className="w-6 h-6 text-white" />
                                ) : (
                                    <Menu className="w-6 h-6 text-white" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ═══════════════════════════════════════════ */}
            {/*   MOBILE MENU                               */}
            {/* ═══════════════════════════════════════════ */}
            {mobileOpen && (
                <div className="fixed inset-x-0 top-[65px] bottom-0 z-[99] bg-black/98 backdrop-blur-xl md:hidden overflow-y-auto">
                    <div className="px-6 py-6 space-y-2">
                        {/* Create Section */}
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.25em] px-3 pt-2 pb-3">
                            Create
                        </p>
                        <Link
                            href="/generate"
                            className="flex items-center gap-4 px-4 py-4 rounded-sm bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all"
                        >
                            <div className="w-10 h-10 rounded-sm bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">AI Image Generator</div>
                                <div className="text-[11px] text-white/40">DALL-E 3, Nano Banana 2, Recraft</div>
                            </div>
                        </Link>
                        <Link
                            href="/studio"
                            className="flex items-center gap-4 px-4 py-4 rounded-sm bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all"
                        >
                            <div className="w-10 h-10 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Video className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">AI Video Studio</div>
                                <div className="text-[11px] text-white/40">Kling 3.0, Seedance, Sora 2</div>
                            </div>
                        </Link>
                        <Link
                            href="/templates"
                            className="flex items-center gap-4 px-4 py-4 rounded-sm bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all"
                        >
                            <div className="w-10 h-10 rounded-sm bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">Template Motion Studio</div>
                                <div className="text-[11px] text-white/40">Viral dance templates, one-click</div>
                            </div>
                        </Link>

                        {/* Links Section */}
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.25em] px-3 pt-6 pb-3">
                            More
                        </p>
                        <Link href="/pricing" className="block px-4 py-3.5 text-sm font-bold text-white/70 hover:text-white rounded-sm hover:bg-white/[0.04] transition-all">
                            Pricing
                        </Link>
                        <Link href="/director" className="block px-4 py-3.5 text-sm font-bold text-white/70 hover:text-white rounded-sm hover:bg-white/[0.04] transition-all">
                            Director Studio
                        </Link>

                        {/* Auth Section */}
                        <div className="pt-6 border-t border-white/[0.06] mt-6 space-y-3">
                            {!isLoaded ? (
                                <div className="h-12 bg-white/5 rounded-sm animate-pulse" />
                            ) : isSignedIn ? (
                                <div className="flex items-center gap-4 px-4 py-3">
                                    <UserButton
                                        afterSignOutUrl="/"
                                        appearance={clerkUserButtonAppearance}
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-white">My Account</div>
                                        <Link href="/dashboard" className="text-xs text-cyan-400 font-medium">Go to Dashboard →</Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href="/sign-up"
                                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-sm bg-white text-black text-sm font-bold hover:bg-slate-200 transition-all"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Start Free — No Credit Card
                                    </Link>
                                    <Link
                                        href="/sign-in"
                                        className="block w-full py-3.5 rounded-sm border border-white/10 text-sm font-bold text-white/80 hover:bg-white/[0.04] transition-all text-center"
                                    >
                                        Already have an account? Log in
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <main>{children}</main>
        </div>
    );
}
