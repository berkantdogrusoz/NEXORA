"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const links = [
    { href: "/", label: "Home" },
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
            {/* Navbar */}
            <nav
                className={`w-full z-50 transition-all duration-300 py-4 px-6 fixed top-0 left-0 right-0 ${scrolled
                        ? "bg-black/80 backdrop-blur-xl border-b border-white/[0.06]"
                        : "bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-9 h-9 flex items-center justify-center">
                            <div className="absolute inset-0 bg-violet-600 rounded-xl blur-lg opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
                            <div className="relative w-full h-full bg-black border border-white/10 rounded-xl flex items-center justify-center">
                                <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-br from-violet-400 to-fuchsia-400">
                                    N
                                </span>
                            </div>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">
                            Nexora
                        </span>
                    </Link>

                    {/* Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                            ? "text-white bg-white/10"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Auth */}
                    <div className="flex items-center gap-3">
                        {!isLoaded ? (
                            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                        ) : isSignedIn ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/dashboard"
                                    className="px-5 py-2 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <UserButton
                                    afterSignOutUrl="/"
                                    appearance={{
                                        elements: {
                                            avatarBox:
                                                "w-9 h-9 border-2 border-white/20 hover:border-violet-500 transition-colors",
                                        },
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <SignInButton mode="modal">
                                    <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2">
                                        Log in
                                    </button>
                                </SignInButton>
                                <Link
                                    href="/sign-up"
                                    className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
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
