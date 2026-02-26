import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Nexora AI – Create Stunning Videos & Images with AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#000000",
                    fontFamily: "Inter, system-ui, sans-serif",
                    position: "relative",
                }}
            >
                {/* Gradient glow */}
                <div
                    style={{
                        position: "absolute",
                        width: 600,
                        height: 600,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)",
                        top: -100,
                        left: 200,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        width: 400,
                        height: 400,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(217,70,239,0.25) 0%, transparent 70%)",
                        bottom: -50,
                        right: 150,
                    }}
                />

                {/* Logo */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                        marginBottom: 24,
                    }}
                >
                    <div
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: 18,
                            background: "linear-gradient(135deg, #7c3aed, #d946ef)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 40,
                            fontWeight: 900,
                            color: "white",
                        }}
                    >
                        N
                    </div>
                    <span
                        style={{
                            fontSize: 56,
                            fontWeight: 800,
                            color: "white",
                            letterSpacing: -2,
                        }}
                    >
                        NEXORA.AI
                    </span>
                </div>

                {/* Tagline */}
                <p
                    style={{
                        fontSize: 28,
                        color: "rgba(255,255,255,0.6)",
                        fontWeight: 500,
                        margin: 0,
                        textAlign: "center",
                        maxWidth: 700,
                    }}
                >
                    Create Stunning Videos & Images with AI
                </p>

                {/* Feature chips */}
                <div
                    style={{
                        display: "flex",
                        gap: 16,
                        marginTop: 40,
                    }}
                >
                    {["AI Video Studio", "Image Generator", "10+ AI Models"].map((label) => (
                        <div
                            key={label}
                            style={{
                                padding: "10px 24px",
                                borderRadius: 999,
                                border: "1px solid rgba(255,255,255,0.15)",
                                fontSize: 16,
                                color: "rgba(255,255,255,0.7)",
                                fontWeight: 600,
                            }}
                        >
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        ),
        { ...size }
    );
}
