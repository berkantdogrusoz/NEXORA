"use client";

import Link from "next/link";
import { useState } from "react";
import { Code2, Zap, Shield, CreditCard, Copy, Check, ArrowRight } from "lucide-react";

const BASE = typeof window !== "undefined" ? window.location.origin : "https://getnexorai.com";

type Tab = "image" | "video" | "director";

const ENDPOINTS: Record<Tab, { method: string; path: string; desc: string; body: object; response: object }> = {
    image: {
        method: "POST",
        path: "/api/v1/image/generate",
        desc: "Generate an image from a text prompt.",
        body: {
            prompt: "A cinematic product photo of premium headphones on marble",
            model: "nano-banana-2",
            size: "1024x1024",
        },
        response: {
            url: "https://fal.media/files/…/generated.webp",
            model: "nano-banana-2",
            enhancedPrompt: "…",
        },
    },
    video: {
        method: "POST",
        path: "/api/v1/video/generate",
        desc: "Generate a short video from a text prompt.",
        body: {
            prompt: "A slow-motion cinematic shot of ocean waves at sunset",
            model: "google-veo-3",
            aspectRatio: "16:9",
            duration: "5",
        },
        response: {
            url: "https://cdn.nexora.ai/…/generated.mp4",
            model: "google-veo-3",
            duration: "5s",
        },
    },
    director: {
        method: "POST",
        path: "/api/v1/director/generate",
        desc: "Generate a directed video using Higgsfield blueprints.",
        body: {
            prompt: "Two people shaking hands in a modern office",
            model: "dop-preview",
            blueprint: "handshake",
        },
        response: {
            video_url: "https://cdn.nexora.ai/…/directed.mp4",
            model: "dop-preview",
        },
    },
};

const PRICING = [
    { model: "nano-banana-2", type: "Image", cost: "$0.30" },
    { model: "recraft-v3", type: "Image", cost: "$0.40" },
    { model: "dall-e-3", type: "Image", cost: "$0.50" },
    { model: "wan-2.1-turbo", type: "Video", cost: "$1.00" },
    { model: "google-veo-3", type: "Video", cost: "$2.50" },
    { model: "kling-3", type: "Video", cost: "$1.00" },
    { model: "seedance-2", type: "Video", cost: "$1.00" },
    { model: "sora-2", type: "Video", cost: "$1.00" },
    { model: "dop-lite", type: "Director", cost: "$1.00" },
    { model: "dop-preview", type: "Director", cost: "$1.00" },
    { model: "dop-turbo", type: "Director", cost: "$1.00" },
];

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/50" />}
        </button>
    );
}

export default function ApiDocsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("image");
    const ep = ENDPOINTS[activeTab];

    const curlExample = `curl -X ${ep.method} ${BASE}${ep.path} \\
  -H "Authorization: Bearer nx_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(ep.body, null, 2)}'`;

    const pythonExample = `import requests

response = requests.post(
    "${BASE}${ep.path}",
    headers={
        "Authorization": "Bearer nx_live_YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json=${JSON.stringify(ep.body, null, 4).replace(/"/g, '"')},
)

data = response.json()
print(data${activeTab === "director" ? '["video_url"]' : '["url"]'})`;

    const jsExample = `const response = await fetch("${BASE}${ep.path}", {
  method: "POST",
  headers: {
    "Authorization": "Bearer nx_live_YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify(${JSON.stringify(ep.body, null, 4)}),
});

const data = await response.json();
console.log(data.${activeTab === "director" ? "video_url" : "url"});`;

    return (
        <div className="relative min-h-screen bg-black text-white">
            {/* Hero */}
            <div className="relative pt-36 pb-16 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-600/8 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <Code2 className="w-3.5 h-3.5" />
                        Developer API
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                        Build with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Nexora API</span>
                    </h1>
                    <p className="text-lg text-white/50 max-w-2xl mx-auto mb-8">
                        Generate images, videos and directed scenes programmatically. Pay-per-use pricing starting at $1 per generation. No commitments.
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link
                            href="/sign-up"
                            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                        >
                            Get API Key <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/api-dashboard"
                            className="px-8 py-3.5 rounded-full border border-white/15 text-white font-bold text-sm hover:bg-white/5 transition-all"
                        >
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <section className="px-6 pb-16">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Zap, title: "Pay Per Use", desc: "No subscription required. Only pay for what you generate. Top up your wallet anytime." },
                        { icon: Shield, title: "Secure Keys", desc: "SHA-256 hashed API keys with scope control, monthly quotas, and instant revocation." },
                        { icon: CreditCard, title: "Simple Billing", desc: "Pre-paid wallet system. Buy credits, track usage in real-time from your dashboard." },
                    ].map((f, i) => (
                        <div key={i} className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                                <f.icon className="w-5 h-5 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                            <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Authentication */}
            <section className="px-6 pb-16">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black mb-6">Authentication</h2>
                    <div className="bg-[#0f1116] border border-white/[0.08] rounded-2xl p-6">
                        <p className="text-white/60 text-sm mb-4">
                            All API requests must include your API key in the <code className="text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded">Authorization</code> header as a Bearer token,
                            or in the <code className="text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded">x-api-key</code> header.
                        </p>
                        <div className="relative">
                            <pre className="text-xs text-white/75 bg-black/50 border border-white/[0.08] rounded-xl p-4 overflow-x-auto">
{`Authorization: Bearer nx_live_YOUR_API_KEY
# or
x-api-key: nx_live_YOUR_API_KEY`}
                            </pre>
                        </div>
                        <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                            <span className="text-amber-400 text-sm">⚠️</span>
                            <p className="text-xs text-amber-300/80">
                                Your API key is shown only once when created. Store it securely. If lost, revoke it and create a new one from the{" "}
                                <Link href="/api-dashboard" className="underline hover:text-white">API Dashboard</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Endpoints */}
            <section className="px-6 pb-16">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black mb-6">Endpoints</h2>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        {(["image", "video", "director"] as Tab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab
                                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                                    : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                {tab === "image" ? "🖼️ Image" : tab === "video" ? "🎬 Video" : "🎬 Director"}
                            </button>
                        ))}
                    </div>

                    {/* Endpoint Info */}
                    <div className="bg-[#0f1116] border border-white/[0.08] rounded-2xl p-6 space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold">{ep.method}</span>
                                <code className="text-sm text-white font-mono">{ep.path}</code>
                            </div>
                            <p className="text-white/50 text-sm">{ep.desc}</p>
                        </div>

                        {/* Request Body */}
                        <div>
                            <h4 className="text-white font-bold text-sm mb-3">Request Body</h4>
                            <div className="relative">
                                <pre className="text-xs text-white/75 bg-black/50 border border-white/[0.08] rounded-xl p-4 overflow-x-auto">
                                    {JSON.stringify(ep.body, null, 2)}
                                </pre>
                            </div>
                        </div>

                        {/* Response */}
                        <div>
                            <h4 className="text-white font-bold text-sm mb-3">Response (200 OK)</h4>
                            <div className="relative">
                                <pre className="text-xs text-emerald-300/80 bg-black/50 border border-white/[0.08] rounded-xl p-4 overflow-x-auto">
                                    {JSON.stringify(ep.response, null, 2)}
                                </pre>
                            </div>
                        </div>

                        {/* Error Codes */}
                        <div>
                            <h4 className="text-white font-bold text-sm mb-3">Error Codes</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {[
                                    ["401", "Missing or invalid API key"],
                                    ["402", "Insufficient API balance"],
                                    ["403", "API key scope not allowed"],
                                    ["429", "Monthly quota exceeded or rate limited"],
                                    ["500", "Server error"],
                                ].map(([code, desc]) => (
                                    <div key={code} className="flex items-center gap-2 p-2.5 rounded-lg bg-black/30 border border-white/[0.06]">
                                        <span className={`font-bold ${code === "401" || code === "403" ? "text-red-400" : code === "402" ? "text-amber-400" : code === "429" ? "text-orange-400" : "text-white/50"}`}>{code}</span>
                                        <span className="text-white/50">{desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Code Examples */}
            <section className="px-6 pb-16">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black mb-6">Code Examples</h2>
                    <div className="space-y-6">
                        {/* cURL */}
                        <div>
                            <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">cURL</h4>
                            <div className="relative">
                                <pre className="text-xs text-white/75 bg-[#0f1116] border border-white/[0.08] rounded-xl p-4 overflow-x-auto">{curlExample}</pre>
                                <CopyButton text={curlExample} />
                            </div>
                        </div>

                        {/* Python */}
                        <div>
                            <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Python</h4>
                            <div className="relative">
                                <pre className="text-xs text-white/75 bg-[#0f1116] border border-white/[0.08] rounded-xl p-4 overflow-x-auto">{pythonExample}</pre>
                                <CopyButton text={pythonExample} />
                            </div>
                        </div>

                        {/* JavaScript */}
                        <div>
                            <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">JavaScript / Node.js</h4>
                            <div className="relative">
                                <pre className="text-xs text-white/75 bg-[#0f1116] border border-white/[0.08] rounded-xl p-4 overflow-x-auto">{jsExample}</pre>
                                <CopyButton text={jsExample} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Table */}
            <section className="px-6 pb-16">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black mb-6">API Pricing</h2>
                    <p className="text-white/50 text-sm mb-6">Pay-per-use. Pre-pay wallet (minimum $10). All prices per generation call.</p>
                    <div className="bg-[#0f1116] border border-white/[0.08] rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.08]">
                                    <th className="text-left px-5 py-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Model</th>
                                    <th className="text-left px-5 py-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Type</th>
                                    <th className="text-right px-5 py-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Cost / Call</th>
                                </tr>
                            </thead>
                            <tbody>
                                {PRICING.map((row, i) => (
                                    <tr key={i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-3">
                                            <code className="text-cyan-400 text-xs">{row.model}</code>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${row.type === "Image" ? "bg-blue-500/10 text-blue-400" : row.type === "Video" ? "bg-purple-500/10 text-purple-400" : "bg-amber-500/10 text-amber-400"}`}>
                                                {row.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right text-white font-bold">{row.cost}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 pb-24">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border border-cyan-500/20 rounded-3xl p-10">
                        <h2 className="text-3xl font-black mb-4">Ready to build?</h2>
                        <p className="text-white/50 mb-8">Create your API key, top up your wallet, and start generating in minutes.</p>
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            <Link
                                href="/sign-up"
                                className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-sm hover:bg-slate-200 transition-all"
                            >
                                Sign Up Free
                            </Link>
                            <Link
                                href="/api-dashboard"
                                className="px-8 py-3.5 rounded-full border border-white/15 text-white font-bold text-sm hover:bg-white/5 transition-all"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/[0.06] px-6 py-8 bg-black">
                <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-white/30">
                    <span className="font-bold text-white/50">NEXORA.AI</span>
                    <span>© 2026 NEXORA INC.</span>
                </div>
            </footer>
        </div>
    );
}
