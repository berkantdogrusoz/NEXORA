"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import AnimatedShaderBackground from "@/app/components/ui/animated-shader-background";

const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊", color: "text-sky-400" },
    { href: "/studio", label: "Video Studio", icon: "🎬", color: "text-pink-400" },
    { href: "/generate", label: "Image Gen", icon: "🖼️", color: "text-violet-400" },
    { href: "/calendar", label: "Calendar", icon: "📅", color: "text-emerald-400" },
    { href: "/assistant", label: "Assistant", icon: "🤖", color: "text-amber-400" },
    { href: "/autopilot", label: "Autopilot", icon: "⚡", color: "text-orange-400" },
    { href: "/store", label: "Store", icon: "🛒", color: "text-cyan-400" },
];

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [credits, setCredits] = useState<number | null>(null);

    const fetchCredits = async () => {
        try {
            const res = await fetch("/api/credits");
            if (res.ok) {
                const data = await res.json();
                setCredits(data.credits);
            }
        } catch {
            // fallback to placeholder or keep null
        }
    };

    useEffect(() => {
        fetchCredits();
    }, []);

    return (
        <div className="flex min-h-screen bg-black text-white font-sans">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo */}
                <div className="p-5 border-b border-white/[0.06]">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="relative w-9 h-9 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl blur-md opacity-40 group-hover:opacity-80 transition-opacity" />
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
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 pt-3 pb-2">
                        Create
                    </p>
                    {menuItems.slice(0, 3).map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-white/[0.08] text-white"
                                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                                    }`}
                            >
                                <span className="text-base">{item.icon}</span>
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />
                                )}
                            </Link>
                        );
                    })}

                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 pt-5 pb-2">
                        Manage
                    </p>
                    {menuItems.slice(3).map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-white/[0.08] text-white"
                                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                                    }`}
                            >
                                <span className="text-base">{item.icon}</span>
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Credits + Upgrade */}
                <div className="p-3 space-y-3 border-t border-white/[0.06]">
                    <div className="bg-white/[0.04] rounded-xl p-3.5 border border-white/[0.06]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-300">
                                Credits
                            </span>
                            <span className="text-xs font-bold text-white">
                                {credits ?? "..."} <span className="text-slate-500 font-normal">/ 50</span>
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000"
                                style={{ width: `${((credits ?? 0) / 50) * 100}%` }}
                            />
                        </div>
                    </div>

                    <Link
                        href="/pricing"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-violet-500/20"
                    >
                        ⚡ Upgrade Plan
                    </Link>
                </div>

                {/* User */}
                <div className="p-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 px-2 py-1.5">
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox:
                                        "w-8 h-8 ring-2 ring-white/10 hover:ring-violet-500 transition-all",
                                },
                            }}
                        />
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-slate-300 truncate">
                                My Workspace
                            </span>
                            <span className="text-[10px] text-slate-500">Free Plan</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 md:ml-64 relative min-h-screen">
                {/* Mobile header */}
                <div className="md:hidden sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                    <span className="font-bold text-white">Nexora</span>
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: { avatarBox: "w-8 h-8" },
                        }}
                    />
                </div>

                <AnimatedShaderBackground />
                <div className="relative z-10 h-full">{children}</div>
            </div>
        </div>
    );
}
