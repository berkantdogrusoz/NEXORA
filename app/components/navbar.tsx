"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/assistant", label: "Assistant" },
  { href: "/pricing", label: "Pricing" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="w-full z-50 transition-all duration-300 py-4 px-6 fixed top-0 left-0 right-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all">
            N
          </div>
          <span className="font-bold text-xl tracking-tight text-white group-hover:text-violet-200 transition-colors">
            Nexora
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${isActive ? "text-white" : "text-slate-400 hover:text-white"
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
                    avatarBox: "w-9 h-9 border-2 border-white/20"
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Log in
                </button>
              </SignInButton>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-slate-200 transition-all shadow-lg shadow-white/10"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
