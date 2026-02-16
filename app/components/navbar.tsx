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
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
            N
          </div>
          <span className="text-sm font-semibold tracking-tight group-hover:text-violet-600 transition-colors">
            Nexora
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-0.5 mr-3">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${isActive
                    ? "bg-violet-50 text-violet-700 font-medium"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {!isLoaded ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
          ) : isSignedIn ? (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <button className="btn-primary text-sm py-1.5 px-4">
                Sign In
              </button>
            </SignInButton>
          )
          }
        </div>
      </div>
    </header>
  );
}
