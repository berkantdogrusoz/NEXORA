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
    X,
} from "lucide-react";

const menuItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/generate", label: "Image", icon: ImagePlus },
    { href: "/studio", label: "Video", icon: Clapperboard },
    { href: "/director", label: "Blueprints", icon: Film },
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
        <div className="flex h-screen bg-[#0A0A0B] text-white font-sans overflow-hidden">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ═══════════════════════════════════════════ */}
            {/*   SIDEBAR                                   */}
            {/* ═══════════════════════════════════════════ */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[260px] md:w-[88px] bg-[#0E1015] flex flex-col transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo & Close Button */}
                <div className="flex items-center justify-between md:justify-center p-4 h-[72px] flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2 group md:justify-center">
                        <div className="w-9 h-9 flex items-center justify-center">
                            {/* Simple minimal icon */}
                            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span className="font-bold text-lg tracking-wide md:hidden">NEXORA</span>
                    </Link>
                    <button 
                        className="md:hidden text-white/50 hover:text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`group flex items-center md:flex-col md:justify-center gap-3 md:gap-1.5 px-3 py-3 md:py-3.5 rounded-2xl transition-all duration-200 relative ${isActive
                                    ? "bg-white/[0.08] text-white"
                                    : "text-white/40 hover:text-white hover:bg-white/[0.04]"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-white/50 group-hover:text-white"}`} />
                                <span className="text-[14px] md:text-[10px] font-medium md:font-semibold uppercase tracking-wider">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-3 mb-2 space-y-2 flex-shrink-0">
                    {/* Settings (Mobile only views it as a row, desktop uses the icon stack) */}
                    <Link
                        href="/subscription"
                        className="group flex items-center md:flex-col md:justify-center gap-3 md:gap-1.5 px-3 py-3 rounded-2xl transition-all duration-200 text-white/40 hover:text-white hover:bg-white/[0.04]"
                    >
                        <Settings className="w-5 h-5 md:w-5 md:h-5 text-white/50 group-hover:text-white transition-colors" />
                        <span className="text-[14px] md:text-[10px] font-medium md:font-semibold uppercase tracking-wider md:hidden">Settings</span>
                        <span className="hidden md:block text-[10px] font-semibold uppercase tracking-wider">Settings</span>
                    </Link>

                    {/* Pro Banner / Credits */}
                    <div className="bg-gradient-to-br from-[#1E2128] to-[#121419] rounded-2xl p-3 md:p-2 border border-white/[0.04]">
                        <div className="flex items-center justify-between md:flex-col md:gap-2">
                             <div className="flex items-center gap-2 md:w-full md:justify-center">
                                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                    <span className="text-cyan-400 text-[10px] font-bold">CR</span>
                                </div>
                                <span className="text-sm md:hidden font-bold text-white tabular-nums">{credits ?? "0"}</span>
                            </div>
                            <span className="hidden md:block text-[10px] font-bold text-white tabular-nums mt-1">{credits ?? "0"}</span>
                            
                            {planName === "Free" ? (
                                <Link
                                    href="/pricing"
                                    className="md:w-full md:mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-[11px] md:text-[9px] font-bold px-3 py-1.5 md:p-1.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                                >
                                    <Zap className="w-3 h-3 md:hidden" />
                                    <span>Upgrade</span>
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="mt-2 flex items-center justify-center">
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10 md:w-9 md:h-9 hover:scale-105 transition-all rounded-full border border-white/10",
                                },
                            }}
                        />
                    </div>
                </div>
            </aside>

            {/* ═══════════════════════════════════════════ */}
            {/*   MAIN CONTENT AREA                         */}
            {/* ═══════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0B] relative">
                {/* Mobile Header (Only visible on mobile) */}
                <header className="md:hidden h-14 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/[0.04] px-4 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <Menu className="w-6 h-6 text-white" />
                        </button>
                        <span className="font-bold text-sm tracking-widest text-white uppercase">NEXORA</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto relative z-10 w-full h-full">
                    <AnimatedShaderBackground />
                    <div className="relative z-10 h-full">{children}</div>
                </main>
            </div>
        </div>
    );
}
