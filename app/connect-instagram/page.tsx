"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

interface ConnectionStatus {
    connected: boolean;
    expired?: boolean;
    username?: string;
    profilePicture?: string;
    connectedAt?: string;
    expiresAt?: string;
}

function ConnectInstagramContent() {
    const { isSignedIn } = useUser();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<ConnectionStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [disconnecting, setDisconnecting] = useState(false);

    const error = searchParams.get("error");
    const errorDetails = searchParams.get("details");
    const success = searchParams.get("success");
    const username = searchParams.get("username");

    useEffect(() => {
        if (isSignedIn) {
            fetchStatus();
        }
    }, [isSignedIn]);

    async function fetchStatus() {
        try {
            const res = await fetch("/api/instagram/status");
            const data = await res.json();
            setStatus(data);
        } catch {
            setStatus({ connected: false });
        } finally {
            setLoading(false);
        }
    }

    async function handleDisconnect() {
        setDisconnecting(true);
        try {
            await fetch("/api/instagram/status", { method: "DELETE" });
            setStatus({ connected: false });
        } finally {
            setDisconnecting(false);
        }
    }

    function handleConnect() {
        window.location.href = "/api/instagram/auth";
    }

    const errorMessages: Record<string, string> = {
        oauth_denied: "You denied access to Instagram. Please try again.",
        no_code: "No authorization code received. Please try again.",
        no_pages: "No Facebook Pages found. Your Instagram must be linked to a Facebook Page.",
        no_instagram: "No Instagram Business account found. Switch to an Instagram Business or Creator account first.",
        db_error: "Failed to save connection. Please try again.",
        unknown: "An unexpected error occurred. Please try again.",
    };

    if (!isSignedIn) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
                <div style={{ textAlign: "center", color: "#fff" }}>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Sign in to connect Instagram</h2>
                    <Link href="/sign-in" style={{ color: "#7c5cfc", textDecoration: "underline" }}>Sign In</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0a0a0a 0%, #1a1025 50%, #0a0a0a 100%)",
            padding: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}>
            <div style={{
                maxWidth: 520,
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "2.5rem",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1rem",
                        fontSize: 32,
                    }}>
                        📸
                    </div>
                    <h1 style={{ color: "#fff", fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>
                        Connect Instagram
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "0.5rem", fontSize: "0.95rem" }}>
                        Link your Instagram Business account to auto-publish posts
                    </p>
                </div>

                {/* Success message */}
                {success && (
                    <div style={{
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: 12,
                        padding: "1rem",
                        marginBottom: "1.5rem",
                        color: "#10b981",
                        textAlign: "center",
                    }}>
                        ✅ Successfully connected @{username}!
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: 12,
                        padding: "1rem",
                        marginBottom: "1.5rem",
                        color: "#ef4444",
                        textAlign: "center",
                    }}>
                        ❌ {errorMessages[error] || "Something went wrong."}
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.5)" }}>
                        Checking connection status...
                    </div>
                )}

                {/* Connected state */}
                {!loading && status?.connected && (
                    <div>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            background: "rgba(255,255,255,0.06)",
                            borderRadius: 14,
                            padding: "1.25rem",
                            marginBottom: "1.5rem",
                        }}>
                            {status.profilePicture ? (
                                <img
                                    src={status.profilePicture}
                                    alt={status.username || ""}
                                    style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }}
                                />
                            ) : (
                                <div style={{
                                    width: 52, height: 52, borderRadius: "50%",
                                    background: "linear-gradient(135deg, #f09433, #dc2743)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 24, color: "#fff",
                                }}>📷</div>
                            )}
                            <div>
                                <div style={{ color: "#fff", fontWeight: 600, fontSize: "1.1rem" }}>
                                    @{status.username}
                                </div>
                                <div style={{ color: "#10b981", fontSize: "0.85rem", marginTop: 2 }}>
                                    ● Connected
                                </div>
                            </div>
                        </div>

                        {status.expiresAt && (
                            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", textAlign: "center", marginBottom: "1rem" }}>
                                Token expires: {new Date(status.expiresAt).toLocaleDateString()}
                            </p>
                        )}

                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <Link
                                href="/dashboard"
                                style={{
                                    flex: 1,
                                    display: "block",
                                    textAlign: "center",
                                    padding: "0.85rem",
                                    borderRadius: 12,
                                    background: "linear-gradient(135deg, #7c5cfc, #6c47ff)",
                                    color: "#fff",
                                    fontWeight: 600,
                                    textDecoration: "none",
                                    fontSize: "0.95rem",
                                }}
                            >
                                Go to Dashboard
                            </Link>
                            <button
                                onClick={handleDisconnect}
                                disabled={disconnecting}
                                style={{
                                    padding: "0.85rem 1.25rem",
                                    borderRadius: 12,
                                    background: "rgba(239, 68, 68, 0.1)",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                    color: "#ef4444",
                                    fontWeight: 600,
                                    cursor: disconnecting ? "not-allowed" : "pointer",
                                    opacity: disconnecting ? 0.5 : 1,
                                    fontSize: "0.95rem",
                                }}
                            >
                                {disconnecting ? "..." : "Disconnect"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Disconnected state */}
                {!loading && !status?.connected && (
                    <div>
                        {error && (
                            <div style={{
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                color: "#ef4444",
                                padding: "1rem",
                                borderRadius: 12,
                                marginBottom: "1.5rem",
                                display: "flex", alignItems: "center", gap: "0.75rem"
                            }}>
                                <div style={{ fontSize: "1.2rem" }}>⚠️</div>
                                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                                    {error === "no_business_account"
                                        ? "No Instagram Business account found. Please make sure your account is a Business Account and linked to a Facebook Page."
                                        : errorDetails
                                            ? `Error: ${decodeURIComponent(errorDetails)}`
                                            : "An unexpected error occurred. Please try again."}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleConnect}
                            style={{
                                width: "100%",
                                padding: "1rem",
                                borderRadius: 14,
                                background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "1.05rem",
                                border: "none",
                                cursor: "pointer",
                                marginBottom: "1.5rem",
                                transition: "transform 0.2s, box-shadow 0.2s",
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 8px 24px rgba(220,39,67,0.4)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            🔗 Connect Instagram Account
                        </button>

                        {/* Requirements */}
                        <div style={{
                            background: "rgba(255,255,255,0.03)",
                            borderRadius: 12,
                            padding: "1.25rem",
                        }}>
                            <h3 style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", fontWeight: 600, margin: "0 0 0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Requirements
                            </h3>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {[
                                    "Instagram Business or Creator account",
                                    "Connected to a Facebook Page",
                                    "Admin access to the Facebook Page",
                                ].map((item, i) => (
                                    <li key={i} style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <span style={{ color: "#7c5cfc" }}>•</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Back link */}
                <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                    <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", textDecoration: "none" }}>
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ConnectInstagramPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>Loading...</div>
            </div>
        }>
            <ConnectInstagramContent />
        </Suspense>
    );
}
