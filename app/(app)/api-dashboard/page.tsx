"use client";

import { useEffect, useMemo, useState } from "react";
import { KeyRound, BarChart3, Shield, Copy, Trash2, Plus, Coins } from "lucide-react";

type ApiKeyItem = {
    id: string;
    name: string;
    key_prefix: string;
    scopes: string[];
    monthly_quota: number | null;
    is_active: boolean;
    last_used_at: string | null;
    created_at: string;
};

type UsageResponse = {
    summary: {
        totalRequests: number;
        successRequests: number;
        failedRequests: number;
        spentCents: number;
        balanceCents: number;
        avgLatency: number;
        monthStart: string;
    };
    byEndpoint: Record<string, { requests: number; spentCents: number }>;
    recent: Array<{
        endpoint: string;
        status_code: number;
        latency_ms: number;
        cost_credits: number; // stored as cents for API billing
        created_at: string;
    }>;
};

export default function ApiDashboardPage() {
    const [keys, setKeys] = useState<ApiKeyItem[]>([]);
    const [usage, setUsage] = useState<UsageResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState("Primary Key");
    const [revealedToken, setRevealedToken] = useState<string | null>(null);

    const packs = useMemo(
        () => [
            {
                id: "api-10",
                name: "API Pack - $10",
                credits: 1000,
                variantId:
                    process.env.NEXT_PUBLIC_LEMON_CREDIT_10 ||
                    process.env.NEXT_PUBLIC_LEMON_CREDIT_300 ||
                    "1396788",
            },
            {
                id: "api-20",
                name: "API Pack - $20",
                credits: 2000,
                variantId:
                    process.env.NEXT_PUBLIC_LEMON_CREDIT_20 ||
                    process.env.NEXT_PUBLIC_LEMON_CREDIT_750 ||
                    "1396794",
            },
            {
                id: "api-30",
                name: "API Pack - $30",
                credits: 3000,
                variantId: process.env.NEXT_PUBLIC_LEMON_CREDIT_30 || "1396795",
            },
            {
                id: "api-50",
                name: "API Pack - $50",
                credits: 5000,
                variantId: process.env.NEXT_PUBLIC_LEMON_CREDIT_50 || "1396796",
            },
            {
                id: "api-100",
                name: "API Pack - $100",
                credits: 10000,
                variantId: process.env.NEXT_PUBLIC_LEMON_CREDIT_100 || "1396797",
            },
        ],
        []
    );

    const load = async () => {
        setLoading(true);
        try {
            const [keysRes, usageRes] = await Promise.all([
                fetch("/api/developer/keys"),
                fetch("/api/developer/usage"),
            ]);

            if (keysRes.ok) {
                const k = await keysRes.json();
                setKeys(k.keys || []);
            }

            if (usageRes.ok) {
                const u = await usageRes.json();
                setUsage(u);
            }
        } catch {
            // noop
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const createKey = async () => {
        setCreating(true);
        try {
            const res = await fetch("/api/developer/keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newKeyName }),
            });
            const data = await res.json();
            if (!res.ok) {
                window.alert(data.error || "Failed to create API key");
                return;
            }
            setRevealedToken(data.token || null);
            setNewKeyName("Primary Key");
            window.alert("API key created. Copy and store it now.");
            await load();
        } catch {
            window.alert("Failed to create API key");
        } finally {
            setCreating(false);
        }
    };

    const revokeKey = async (id: string) => {
        try {
            const res = await fetch(`/api/developer/keys/${id}/revoke`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) {
                window.alert(data.error || "Failed to revoke key");
                return;
            }
            window.alert("API key revoked");
            await load();
        } catch {
            window.alert("Failed to revoke key");
        }
    };

    const buyPack = async (variantId: string) => {
        try {
            const res = await fetch("/api/lemon/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ variantId }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
                return;
            }
            window.alert(data.error || "Checkout could not be started");
        } catch {
            window.alert("Checkout could not be started");
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                        <KeyRound className="w-7 h-7 text-cyan-400" />
                        Developer API
                    </h1>
                    <p className="text-white/45 mt-2 text-sm">Create keys, track usage, and buy API credits without changing your current studio workflow.</p>
                </div>
            </div>

            {revealedToken && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
                    <p className="text-emerald-300 text-sm font-semibold mb-2">New API Key (shown once)</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-xs md:text-sm bg-black/50 border border-white/10 px-3 py-2 rounded-xl text-white break-all">{revealedToken}</code>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(revealedToken);
                                window.alert("Token copied");
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs"
                        >
                            <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr,1fr] gap-6">
                <section className="bg-[#0f1116] border border-white/[0.08] rounded-2xl p-4 md:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-white font-bold text-lg flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-400" /> API Keys</h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="Key name"
                            className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-sm text-white outline-none focus:border-cyan-500/40"
                        />
                        <button
                            onClick={createKey}
                            disabled={creating}
                            className="h-10 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-semibold inline-flex items-center gap-2 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" /> {creating ? "Creating..." : "Create Key"}
                        </button>
                    </div>

                    <div className="space-y-2 max-h-[420px] overflow-auto no-scrollbar">
                        {loading ? (
                            <div className="text-white/40 text-sm">Loading keys...</div>
                        ) : keys.length === 0 ? (
                            <div className="text-white/40 text-sm">No keys yet. Create your first API key.</div>
                        ) : (
                            keys.map((key) => (
                                <div key={key.id} className="border border-white/[0.08] bg-black/30 rounded-xl p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <p className="text-white text-sm font-semibold">{key.name}</p>
                                            <p className="text-white/45 text-xs mt-0.5">{key.key_prefix}••••••••</p>
                                        </div>
                                        <button
                                            onClick={() => revokeKey(key.id)}
                                            className="h-8 px-2.5 rounded-lg border border-red-500/25 text-red-300 hover:bg-red-500/10 text-xs inline-flex items-center gap-1.5"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Revoke
                                        </button>
                                    </div>
                                    <div className="mt-2 text-[11px] text-white/45 flex flex-wrap gap-2">
                                        <span>Scopes: {key.scopes?.join(", ") || "-"}</span>
                                        <span>Last used: {key.last_used_at ? new Date(key.last_used_at).toLocaleString() : "Never"}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="bg-[#0f1116] border border-white/[0.08] rounded-2xl p-4 md:p-5">
                        <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-4"><BarChart3 className="w-4 h-4 text-cyan-400" /> Usage (This Month)</h2>
                        {usage ? (
                            <div className="grid grid-cols-2 gap-3">
                                <Metric label="Balance" value={`$${(usage.summary.balanceCents / 100).toFixed(2)}`} />
                                <Metric label="Requests" value={String(usage.summary.totalRequests)} />
                                <Metric label="Success" value={String(usage.summary.successRequests)} />
                                <Metric label="Failures" value={String(usage.summary.failedRequests)} />
                                <Metric label="Spent" value={`$${(usage.summary.spentCents / 100).toFixed(2)}`} />
                                <Metric label="Avg Latency" value={`${usage.summary.avgLatency}ms`} />
                            </div>
                        ) : (
                            <p className="text-white/40 text-sm">No usage yet.</p>
                        )}
                    </div>

                    <div className="bg-[#0f1116] border border-white/[0.08] rounded-2xl p-4 md:p-5">
                        <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-3"><Coins className="w-4 h-4 text-amber-400" /> Buy API Balance</h2>
                        <div className="space-y-2">
                            {packs.map((pack) => (
                                <button
                                    key={pack.id}
                                    onClick={() => buyPack(pack.variantId)}
                                    className="w-full p-3 rounded-xl border border-white/[0.08] bg-black/30 hover:bg-white/[0.06] text-left"
                                >
                                    <p className="text-white text-sm font-semibold">{pack.name}</p>
                                    <p className="text-white/45 text-xs mt-0.5">Adds ${(pack.credits / 100).toFixed(2)} API balance</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#0f1116] border border-white/[0.08] rounded-2xl p-4 md:p-5">
                        <h2 className="text-white font-bold text-lg mb-3">Quick Start</h2>
                        <pre className="text-[11px] md:text-xs text-white/75 bg-black/40 border border-white/[0.08] rounded-xl p-3 overflow-x-auto">
{`curl -X POST ${typeof window !== "undefined" ? window.location.origin : "https://getnexorai.com"}/api/v1/image/generate \\
  -H "Authorization: Bearer nx_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"cinematic product photo","model":"nano-banana-2","aspectRatio":"1:1"}'`}
                        </pre>
                    </div>
                </section>
            </div>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-white/[0.08] bg-black/30 p-3">
            <p className="text-white/45 text-[11px] uppercase tracking-wider">{label}</p>
            <p className="text-white text-xl font-black mt-1">{value}</p>
        </div>
    );
}
