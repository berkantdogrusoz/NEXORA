"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import AnimatedShaderBackground from "@/app/components/ui/animated-shader-background";
import {
    LayoutDashboard,
    Clapperboard,
    Film,
    ImagePlus,
    MessageSquare,
    Zap,
    Settings,
    ChevronRight,
    Menu,
    CreditCard,
} from "lucide-react";

const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/studio", label: "Video Studio", icon: Clapperboard },
    { href: "/director", label: "Director Studio", icon: Film },
    { href: "/generate", label: "Image Gen", icon: ImagePlus },
    { href: "/assistant", label: "Assistant", icon: MessageSquare },
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
    const { credits, planName } = useCredits();

    return (
        <div className="flex min-h-screen bg-black text-white font-sans">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ═══════════════════════════════════════════ */}
            {/*   SIDEBAR                                   */}
            {/* ═══════════════════════════════════════════ */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#060606] border-r border-white/[0.06] flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo */}
                <div className="px-5 py-5 border-b border-white/[0.06]">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-9 h-9 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-sm blur-md opacity-30 group-hover:opacity-70 transition-opacity duration-300" />
                            <div className="relative w-full h-full bg-[#0a0a0a] border border-cyan-500/30 rounded-sm flex items-center justify-center">
                                <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 to-blue-400">
                                    N
                                </span>
                            </div>
                        </div>
                        <span className="font-black text-xl tracking-tight text-white uppercase">
                            Nexora
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {/* CREATE section */}
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.25em] px-3 pt-2 pb-3">
                        Create
                    </p>
                    {menuItems.slice(0, 3).map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-sm text-[13px] font-semibold transition-all duration-200 relative overflow-hidden ${isActive
                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                    : "text-white/50 hover:text-white hover:bg-white/[0.04] border border-transparent"
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan-500 rounded-r-sm" />
                                )}
                                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-cyan-400" : "text-white/30 group-hover:text-white/60"} transition-colors`} />
                                <span className="uppercase tracking-wider">{item.label}</span>
                                {isActive && (
                                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-cyan-500/60" />
                                )}
                            </Link>
                        );
                    })}

                    {/* MANAGE section */}
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.25em] px-3 pt-6 pb-3">
                        Manage
                    </p>
                    {menuItems.slice(3).map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-sm text-[13px] font-semibold transition-all duration-200 relative overflow-hidden ${isActive
                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                    : "text-white/50 hover:text-white hover:bg-white/[0.04] border border-transparent"
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan-500 rounded-r-sm" />
                                )}
                                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-cyan-400" : "text-white/30 group-hover:text-white/60"} transition-colors`} />
                                <span className="uppercase tracking-wider">{item.label}</span>
                                {isActive && (
                                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-cyan-500/60" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Credits + Plan Section */}
                <div className="px-3 pb-2 space-y-2 border-t border-white/[0.06] pt-3">
                    {/* Credits Card */}
                    <Link
                        href="/subscription"
                        className="block bg-[#0a0a0a] rounded-sm p-3.5 border border-white/[0.06] border-t-2 border-t-cyan-500/40 hover:border-t-cyan-500/80 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-3.5 h-3.5 text-white/30 group-hover:text-cyan-400 transition-colors" />
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                                    Credits
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-black text-white tabular-nums">
                                    {credits ?? "..."}
                                </span>
                            </div>
                        </div>
                        {/* Mini credit bar */}
                        <div className="mt-2.5 w-full h-1 bg-white/[0.06] rounded-sm overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-sm transition-all duration-500"
                                style={{ width: `${Math.min(100, ((credits ?? 0) / 500) * 100)}%` }}
                            />
                        </div>
                    </Link>

                    {/* Upgrade / Manage Button */}
                    {planName === "Free" ? (
                        <Link
                            href="/pricing"
                            className="group flex items-center justify-center gap-2 w-full py-2.5 rounded-sm bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-xs font-bold uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/20"
                        >
                            <Zap className="w-3.5 h-3.5" />
                            Upgrade Plan
                        </Link>
                    ) : (
                        <Link
                            href="/subscription"
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-sm bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-xs font-bold uppercase tracking-[0.2em] transition-all hover:scale-[1.01] active:scale-95"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            Manage Plan
                        </Link>
                    )}
                </div>

                {/* User Profile */}
                <div className="px-3 py-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 px-2 py-1">
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox:
                                        "w-8 h-8 ring-2 ring-white/10 hover:ring-cyan-500/50 transition-all rounded-sm",
                                },
                            }}
                        />
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-semibold text-white/60 truncate uppercase tracking-wider">
                                My Workspace
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${planName !== "Free"
                                ? "text-amber-400"
                                : "text-white/25"
                                }`}>
                                {planName} Plan
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ═══════════════════════════════════════════ */}
            {/*   MAIN CONTENT AREA                         */}
            {/* ═══════════════════════════════════════════ */}
            <div className="flex-1 md:ml-[260px] relative min-h-screen">
                {/* Mobile header */}
                <div className="md:hidden sticky top-0 z-30 bg-[#060606]/90 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-sm hover:bg-white/10 transition-colors"
                    >
                        <Menu className="w-5 h-5 text-white" />
                    </button>
                    <Link href="/" className="font-black text-white uppercase tracking-wider text-sm">Nexora</Link>
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: { avatarBox: "w-8 h-8 rounded-sm" },
                        }}
                    />
                </div>

                <AnimatedShaderBackground />
                <div className="relative z-10 h-full">{children}</div>
            </div>
        </div>
    );
}
