"use client";

export default function AnimatedShaderBackground({
    className,
}: {
    className?: string;
}) {
    return (
        <div className={`fixed inset-0 z-[-1] pointer-events-none overflow-hidden ${className || ""}`}>
            {/* Base dark gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#000005] via-[#020008] to-[#050010]" />

            {/* Subtle nebula glow - top right */}
            <div
                className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full opacity-[0.04]"
                style={{
                    background: "radial-gradient(circle, rgba(100,149,237,0.4) 0%, transparent 70%)",
                }}
            />

            {/* Subtle nebula glow - bottom left */}
            <div
                className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.03]"
                style={{
                    background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
                }}
            />

            {/* Static star dots using CSS */}
            <div className="absolute inset-0" style={{
                backgroundImage: `
                    radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.15) 50%, transparent 100%),
                    radial-gradient(1px 1px at 25% 35%, rgba(255,255,255,0.12) 50%, transparent 100%),
                    radial-gradient(1px 1px at 45% 8%, rgba(255,255,255,0.18) 50%, transparent 100%),
                    radial-gradient(1px 1px at 60% 55%, rgba(255,255,255,0.1) 50%, transparent 100%),
                    radial-gradient(1px 1px at 75% 20%, rgba(255,255,255,0.14) 50%, transparent 100%),
                    radial-gradient(1px 1px at 85% 70%, rgba(255,255,255,0.09) 50%, transparent 100%),
                    radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,0.11) 50%, transparent 100%),
                    radial-gradient(1px 1px at 55% 40%, rgba(255,255,255,0.16) 50%, transparent 100%),
                    radial-gradient(1px 1px at 90% 45%, rgba(255,255,255,0.13) 50%, transparent 100%),
                    radial-gradient(1px 1px at 15% 60%, rgba(255,255,255,0.08) 50%, transparent 100%),
                    radial-gradient(1px 1px at 40% 90%, rgba(255,255,255,0.12) 50%, transparent 100%),
                    radial-gradient(1px 1px at 70% 85%, rgba(255,255,255,0.1) 50%, transparent 100%),
                    radial-gradient(1.5px 1.5px at 5% 45%, rgba(200,220,255,0.2) 50%, transparent 100%),
                    radial-gradient(1.5px 1.5px at 50% 25%, rgba(200,220,255,0.18) 50%, transparent 100%),
                    radial-gradient(1.5px 1.5px at 95% 5%, rgba(200,220,255,0.15) 50%, transparent 100%)
                `,
            }} />
        </div>
    );
}
