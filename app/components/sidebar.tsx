"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const menuItems = [
    { href: "/studio", label: "Studio", icon: "✨" },
    { href: "/calendar", label: "Calendar", icon: "📅" },
    { href: "/campaigns", label: "Campaigns", icon: "🚀" },
    { href: "/dashboard", label: "Analytics", icon: "📊" },
    { href: "/assistant", label: "Assistant", icon: "🤖" },
    { href: "/autopilot", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 bg-black/90 backdrop-blur-xl border-r border-white/10 flex flex-col z-50">
            {/* Logo Area */}
            <div className="p-6 border-b border-white/5">
                <Link href="/studio" className="flex items-center gap-3 group">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <div className="absolute inset-0 bg-violet-600 rounded-lg blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                            <span className="text-lg font-bold text-white">N</span>
                        </div>
                    </div>
                    <span className="font-bold text-xl text-white tracking-tight">Nexora</span>
                </Link>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-violet-600/10 text-violet-400 border border-violet-600/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User */}
            <div className="p-4 border-t border-white/5 bg-black/40">
                <div className="flex items-center gap-3 px-2">
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                avatarBox: "w-8 h-8 ring-2 ring-white/10 hover:ring-violet-500 transition-all"
                            }
                        }}
                    />
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-300">My Workspace</span>
                        <span className="text-[10px] text-slate-500">Pro Plan</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
