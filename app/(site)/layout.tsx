"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const links = [
    { href: "/", label: "Home" },
    { href: "/studio", label: "Video Studio" },
    { href: "/generate", label: "Image Gen" },
    { href: "/assistant", label: "Assistant" },
    { href: "/pricing", label: "Pricing" },
];

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { isSignedIn, isLoaded } = useUser();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-violet-500/30">
            {/* Navbar — always visible */}
            <nav
                className={`w-full z-[100] transition-all duration-300 py-3 px-6 fixed top-0 left-0 right-0 ${scrolled
                    ? "bg-black/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-xl shadow-black/50"
                    : "bg-black/50 backdrop-blur-xl"
                    }`}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <div className="absolute inset-0 bg-violet-600 rounded-lg blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
                            <div className="relative w-full h-full bg-black border border-white/10 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-black bg-clip-text text-transparent bg-gradient-to-br from-violet-400 to-fuchsia-400">
                                    N
                                </span>
                            </div>
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white">
                            Nexora
                        </span>
                    </Link>

                    {/* Center Links */}
                    <div className="hidden md:flex items-center bg-white/[0.04] rounded-full px-1 py-1 border border-white/[0.06]">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${isActive
                                        ? "text-white bg-white/[0.12] shadow-sm"
                                        : "text-slate-400 hover:text-white"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Auth */}
                    <div className="flex items-center gap-3 shrink-0">
                        {!isLoaded ? (
                            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                        ) : isSignedIn ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 rounded-full bg-white/[0.08] text-white text-sm font-medium hover:bg-white/[0.12] transition-colors border border-white/[0.06]"
                                >
                                    Dashboard
                                </Link>
                                <UserButton
                                    afterSignOutUrl="/"
                                    appearance={{
                                        elements: {
                                            avatarBox:
                                                "w-8 h-8 border-2 border-white/20 hover:border-violet-500 transition-colors",
                                        },
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <SignInButton mode="modal">
                                    <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2">
                                        Log in
                                    </button>
                                </SignInButton>
                                <Link
                                    href="/sign-up"
                                    className="px-5 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-slate-100 transition-all"
                                >
                                    Get Started
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
