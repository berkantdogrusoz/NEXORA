"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            // Small delay so it doesn't flash on load
            const timer = setTimeout(() => setShow(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const accept = () => {
        localStorage.setItem("cookie-consent", "accepted");
        setShow(false);
        // Enable GA after consent
        window.gtag?.("consent", "update", {
            analytics_storage: "granted",
        });
    };

    const decline = () => {
        localStorage.setItem("cookie-consent", "declined");
        setShow(false);
        window.gtag?.("consent", "update", {
            analytics_storage: "denied",
        });
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-fade-in-up">
            <div className="max-w-xl mx-auto bg-[#0a0a0a] border border-white/[0.08] border-t-2 border-t-cyan-500/60 rounded-sm p-5 shadow-2xl shadow-black/50">
                <p className="text-sm text-white/70 mb-4 leading-relaxed">
                    We use cookies to analyze site traffic and improve your experience. No personal data is sold to third parties.
                </p>
                <div className="flex items-center gap-3">
                    <button
                        onClick={accept}
                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
                    >
                        Accept
                    </button>
                    <button
                        onClick={decline}
                        className="px-6 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white/60 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
                    >
                        Decline
                    </button>
                    <a
                        href="/privacy"
                        className="text-xs text-white/30 hover:text-white/50 transition-colors ml-auto underline"
                    >
                        Privacy Policy
                    </a>
                </div>
            </div>
        </div>
    );
}

// Extend Window for gtag
declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}
