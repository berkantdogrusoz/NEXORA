"use client";

import { useCallback, useEffect, useState, Suspense } from "react";

import { useSearchParams } from "next/navigation";

// Only Instagram Platform
const INSTAGRAM_PLATFORM = {
    id: "instagram",
    label: "Instagram Business",
    icon: "📸",
    color: "from-pink-500 to-violet-600",
    desc: "Connect your Instagram Business account to auto-post content, analyze performance, and manage your brand."
};

function StoreContent() {
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [accountName, setAccountName] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const errorParam = searchParams.get("error");
    const successParam = searchParams.get("success");

    const fetchStatus = useCallback(async () => {
        setLoading(true);
        try {
            // Check connection status
            const res = await fetch("/api/instagram/status");
            if (res.ok) {
                const data = await res.json();
                setIsConnected(data.connected);
                if (data.username) setAccountName(data.username);
            }
        } catch { /* empty */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchStatus(); }, [fetchStatus]);

    const handleConnect = () => {
        // Direct redirect to Instagram/Facebook OAuth
        window.location.href = "/api/instagram/auth";
    };

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect Instagram?")) return;
        try {
            await fetch("/api/instagram/status", { method: "DELETE" });
            setIsConnected(false);
            setAccountName(null);
        } catch (e) {
            alert("Failed to disconnect.");
        }
    };

    return (
        <div className="pt-10 px-6 max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-4">
                    Connect Your Instagram
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                    Link your Instagram Business account to unlock auto-posting, analytics, and AI content generation.
                </p>
            </div>

            <div className="glass-card p-8 md:p-12 max-w-2xl mx-auto animate-fade-in-up stagger-1 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${INSTAGRAM_PLATFORM.color} flex items-center justify-center text-5xl shadow-2xl shadow-pink-500/20 mb-6`}>
                        {INSTAGRAM_PLATFORM.icon}
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">{INSTAGRAM_PLATFORM.label}</h2>
                    <p className="text-slate-400 mb-8 max-w-md">
                        {INSTAGRAM_PLATFORM.desc}
                    </p>

                    {/* Status Messages */}
                    {errorParam && (
                        <div className="mb-6 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                            ⚠️ Connection failed. Please try again.
                        </div>
                    )}
                    {successParam && (
                        <div className="mb-6 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                            🎉 Connected successfully!
                        </div>
                    )}

                    {loading ? (
                        <div className="h-12 w-48 bg-white/5 rounded-xl animate-pulse" />
                    ) : isConnected ? (
                        <div className="w-full">
                            <div className="flex items-center justify-center gap-3 mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-emerald-400 font-medium text-sm">Active</span>
                                {accountName && <span className="text-white font-bold text-sm">@{accountName}</span>}
                            </div>
                            <button
                                onClick={handleDisconnect}
                                className="px-6 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                            >
                                Disconnect Account
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleConnect}
                            className="group relative px-8 py-4 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-violet-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-200" />
                            <div className="relative bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl px-8 py-4 flex items-center gap-3">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                                Connect with Instagram
                            </div>
                        </button>
                    )}

                    <p className="mt-6 text-xs text-slate-500 max-w-sm">
                        We use the official Facebook & Instagram API. Your data is secure and we never post without your permission or schedule.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function StorePage() {
    return (
        <main className="relative min-h-screen text-slate-100 font-sans pb-20">
            <Suspense fallback={<div className="pt-10 text-center text-slate-500">Loading...</div>}>
                <StoreContent />
            </Suspense>
        </main>
    );
}
