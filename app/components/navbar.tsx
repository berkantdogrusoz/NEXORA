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

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`w-full z-50 transition-all duration-300 py-4 px-6 fixed top-0 left-0 right-0 ${scrolled ? "bg-black/60 backdrop-blur-xl border-b border-white/5" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Premium Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-violet-600 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Main Logo Box */}
            <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl flex items-center justify-center overflow-hidden shadow-xl group-hover:scale-105 transition-transform duration-300">
              {/* Shine effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* N Character */}
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-violet-400 to-indigo-400">
                N
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-tight text-white leading-none">
              Nexora
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                  ? "text-white bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {!isLoaded ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : isSignedIn ? (
            <div className="flex items-center gap-4">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 border-2 border-white/20 hover:border-violet-500 transition-colors"
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/studio" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Studio
              </Link>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Log in
                </button>
              </SignInButton>
              <Link
                href="/dashboard"
                className="group relative px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-200 to-pink-200 opacity-0 group-hover:opacity-50 transition-opacity" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
