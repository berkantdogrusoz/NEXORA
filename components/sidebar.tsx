"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Image as ImageIcon,
    Video,
    Settings,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Image Generation",
        icon: ImageIcon,
        href: "/image-generation",
        color: "text-violet-500",
    },
    {
        label: "Video Generation",
        icon: Video,
        href: "/studio",
        color: "text-pink-700",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/settings",
    },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white border-r border-white/10 w-64 fixed left-0 top-0 bottom-0 z-50">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg blur-sm opacity-75"></div>
                        <div className="relative bg-black rounded-lg w-full h-full flex items-center justify-center border border-white/10">
                            <span className="text-lg font-bold">N</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        NEXORA
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3">
                <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/5">
                    <div className="flex items-center gap-x-2 mb-2">
                        <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <h3 className="font-semibold text-sm">Pro Plan</h3>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
                        <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-1.5 rounded-full w-[70%]"></div>
                    </div>
                    <p className="text-xs text-zinc-400">350/500 Credits Used</p>
                </div>
            </div>
        </div>
    );
};
