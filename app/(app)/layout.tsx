"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import AnimatedShaderBackground from "@/app/components/ui/animated-shader-background";

const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊", color: "text-sky-400" },
    { href: "/studio", label: "Video Studio", icon: "🎬", color: "text-pink-400" },
    { href: "/director", label: "Director Studio", icon: "🎥", color: "text-cyan-500" },
    { href: "/generate", label: "Image Gen", icon: "🖼️", color: "text-cyan-400" },
    { href: "/assistant", label: "Assistant", icon: "🤖", color: "text-amber-400" },
];

import { useCredits, CreditProvider } from "@/app/providers/credit-provider";

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <CreditProvider>
            <AppLayout>{children}</AppLayout>
        </CreditProvider>
    );
}

function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { credits, maxCredits, planName } = useCredits();

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
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-9 h-9 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl blur-md opacity-40 group-hover:opacity-80 transition-opacity" />
                            <div className="relative w-full h-full bg-black border border-white/10 rounded-xl flex items-center justify-center">
                                <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 to-blue-400">
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
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500" />
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
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Credits + Plan */}
                <div className="p-3 space-y-3 border-t border-white/[0.06]">
                    <Link href="/subscription" className="block bg-white/[0.04] rounded-xl p-3.5 border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-300">
                                Credits
                            </span>
                            <span className="text-sm font-bold text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/5">
                                {credits ?? "..."}
                            </span>
                        </div>
                    </Link>

                    {planName === "Free" ? (
                        <Link
                            href="/pricing"
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/20"
                        >
                            ⚡ Upgrade Plan
                        </Link>
                    ) : (
                        <Link
                            href="/subscription"
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-sm font-semibold transition-all hover:scale-[1.01] active:scale-95"
                        >
                            ⚙️ Manage Plan
                        </Link>
                    )}
                </div>

                {/* User */}
                <div className="p-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 px-2 py-1.5">
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox:
                                        "w-8 h-8 ring-2 ring-white/10 hover:ring-cyan-500 transition-all",
                                },
                            }}
                        />
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-slate-300 truncate">
                                My Workspace
                            </span>
                            <span className={`text-[10px] font-bold ${planName !== "Free" ? "text-amber-400" : "text-slate-500"} uppercase`}>
                                {planName} Plan
                            </span>
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
                    <Link href="/" className="font-bold text-white">Nexora</Link>
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
