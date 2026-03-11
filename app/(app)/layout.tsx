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
    Menu,
    CreditCard,
} from "lucide-react";

const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/studio", label: "Video", icon: Clapperboard },
    { href: "/director", label: "Director", icon: Film },
    { href: "/generate", label: "Image", icon: ImagePlus },
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
                className={`fixed inset-y-0 left-0 z-50 w-[240px] md:w-[96px] bg-[#070809] border-r border-white/[0.08] flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo */}
                <div className="px-3 py-4 border-b border-white/[0.08]">
                    <Link href="/" className="flex items-center gap-3 md:justify-center group">
                        <div className="w-10 h-10 rounded-2xl bg-[#0e1014] border border-white/10 flex items-center justify-center">
                            <span className="text-white font-black text-lg">N</span>
                        </div>
                        <span className="font-black text-lg tracking-tight text-white uppercase md:hidden">Nexora</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-3 space-y-1.5 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`group flex items-center md:flex-col md:justify-center gap-2 md:gap-1 px-3 py-2.5 rounded-2xl text-[12px] font-semibold transition-all duration-200 relative overflow-hidden border ${isActive
                                    ? "bg-white/[0.1] text-white border-white/20"
                                    : "text-white/55 hover:text-white hover:bg-white/[0.04] border-transparent"
                                    }`}
                            >
                                <Icon className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${isActive ? "text-white" : "text-white/45 group-hover:text-white/80"} transition-colors`} />
                                <span className="tracking-wide md:text-[10px] md:leading-none uppercase text-center">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Credits + Plan Section */}
                <div className="px-2 pb-2 space-y-2 border-t border-white/[0.08] pt-3">
                    {/* Credits Card */}
                    <Link
                        href="/subscription"
                        className="block bg-[#0f1013] rounded-2xl p-3 border border-white/[0.08] hover:border-white/20 transition-all group"
                    >
                        <div className="flex items-center justify-between md:flex-col md:gap-1">
                            <div className="flex items-center gap-2 md:gap-1">
                                <CreditCard className="w-3.5 h-3.5 text-white/35 group-hover:text-white transition-colors" />
                                <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] md:tracking-normal">
                                    CR
                                </span>
                            </div>
                            <span className="text-sm font-black text-white tabular-nums">{credits ?? "..."}</span>
                        </div>
                        <div className="mt-2 w-full h-1 bg-white/[0.06] rounded-sm overflow-hidden md:hidden">
                            <div
                                className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-sm transition-all duration-500"
                                style={{ width: `${Math.min(100, ((credits ?? 0) / 500) * 100)}%` }}
                            />
                        </div>
                    </Link>

                    {/* Upgrade / Manage Button */}
                    {planName === "Free" ? (
                        <Link
                            href="/pricing"
                            className="group flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-xs font-bold uppercase tracking-[0.2em] transition-all"
                        >
                            <Zap className="w-3.5 h-3.5" />
                            <span className="md:hidden">Upgrade Plan</span>
                            <span className="hidden md:inline">Go Pro</span>
                        </Link>
                    ) : (
                        <Link
                            href="/subscription"
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-xs font-bold uppercase tracking-[0.2em] transition-all"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            <span className="md:hidden">Manage Plan</span>
                            <span className="hidden md:inline">Plan</span>
                        </Link>
                    )}
                </div>

                {/* User Profile */}
                <div className="px-2 py-3 border-t border-white/[0.08]">
                    <div className="flex items-center gap-3 px-2 py-1 md:flex-col md:gap-1">
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox:
                                        "w-8 h-8 ring-2 ring-white/10 hover:ring-white/30 transition-all rounded-xl",
                                },
                            }}
                        />
                        <div className="flex flex-col min-w-0 md:items-center">
                            <span className="text-[11px] font-semibold text-white/60 truncate uppercase tracking-wider">
                                <span className="md:hidden">My Workspace</span>
                                <span className="hidden md:inline">Me</span>
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
            <div className="flex-1 md:ml-[96px] relative min-h-screen">
                {/* Mobile header */}
                <div className="md:hidden sticky top-0 z-30 bg-[#070809]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <Menu className="w-5 h-5 text-white" />
                    </button>
                    <Link href="/" className="font-black text-white uppercase tracking-wider text-sm">Nexora</Link>
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: { avatarBox: "w-8 h-8 rounded-xl" },
                        }}
                    />
                </div>

                <AnimatedShaderBackground />
                <div className="relative z-10 h-full">{children}</div>
            </div>
        </div>
    );
}
