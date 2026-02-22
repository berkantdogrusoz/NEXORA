"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCredits } from "@/app/providers/credit-provider";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
};

const QUICK_ACTIONS = [
    { label: "📸 Generate Instagram post ideas", prompt: "Generate 5 creative Instagram post ideas for my brand this week" },
    { label: "📊 Marketing strategy tips", prompt: "Give me 5 actionable marketing strategy tips to grow my Instagram following" },
    { label: "📝 Write a caption", prompt: "Write an engaging Instagram caption for a product launch announcement" },
];

const ASSISTANT_MODELS = [
    { id: "gpt-4o-mini", label: "GPT-4o Mini", pro: false, cost: 0.5 },
    { id: "gpt-4o", label: "GPT-4o", pro: true, cost: 2.0 },
    { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", pro: true, cost: 2.0 },
];

export default function AssistantPage() {
    const { credits, deductCredits, refundCredits, planName } = useCredits();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [model, setModel] = useState("gpt-4o-mini");
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch("/api/assistant");
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
            }
        } catch { /* empty */ }
        finally { setInitialLoad(false); }
    }, []);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const sendMessage = async (text?: string) => {
        const msg = text || input.trim();
        if (!msg || loading) return;

        const selectedModelConfig = ASSISTANT_MODELS.find(m => m.id === model) || ASSISTANT_MODELS[0];

        if (selectedModelConfig.pro && planName === "Free") {
            const errorMsg: Message = {
                id: `e-${Date.now()}`,
                role: "assistant",
                content: "⚠️ You need a Premium plan to use GPT-4o or Gemini 1.5 Pro.",
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, errorMsg]);
            return;
        }

        if (credits !== null && credits < selectedModelConfig.cost) {
            const errorMsg: Message = {
                id: `e-${Date.now()}`,
                role: "assistant",
                content: "⚠️ Insufficient credits. Please upgrade your plan.",
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, errorMsg]);
            return;
        }

        const userMsg: Message = {
            id: `u-${Date.now()}`,
            role: "user",
            content: msg,
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);
        deductCredits(selectedModelConfig.cost);

        try {
            const res = await fetch("/api/assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msg, model }),
            });

            if (!res.ok) throw new Error("Failed");

            const data = await res.json();
            const assistantMsg: Message = {
                id: `a-${Date.now()}`,
                role: "assistant",
                content: data.reply || "Sorry, I couldn't generate a response.",
                timestamp: Date.now(),
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch {
            refundCredits(ASSISTANT_MODELS.find(m => m.id === model)?.cost || 0.5);
            const errorMsg: Message = {
                id: `e-${Date.now()}`,
                role: "assistant",
                content: "⚠️ Something went wrong. Please try again.",
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, errorMsg]);
        }
        finally { setLoading(false); }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <main className="relative min-h-screen flex flex-col font-sans">
            <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 pt-10 pb-4">
                {/* Header */}
                <div className="mb-6 animate-fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">AI Marketing Assistant</h1>
                        <p className="text-sm text-slate-400">Your personal marketing expert. Ask anything.</p>
                    </div>

                    {/* Model Selector */}
                    <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 self-center md:self-auto">
                        {ASSISTANT_MODELS.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setModel(m.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${model === m.id
                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {m.label}
                                {m.pro && (
                                    <span className="text-[8px] px-1 py-0.5 rounded-sm bg-amber-500/20 text-amber-500 border border-amber-500/20">
                                        PRO
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto pb-4 space-y-6 pt-4 h-[60vh] md:h-auto no-scrollbar">
                    {initialLoad ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse shrink-0" />
                                    <div className="glass-card p-4 flex-1 h-20 animate-pulse bg-white/5 border-white/5" />
                                </div>
                            ))}
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-20 animate-fade-in-up">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-3xl shadow-2xl shadow-violet-500/20 mx-auto mb-6">
                                🤖
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">How can I help you grow today?</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto mt-8">
                                {QUICK_ACTIONS.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(action.prompt)}
                                        className="glass-card p-4 text-xs text-left text-slate-300 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/10 transition-all group"
                                    >
                                        <span className="block mb-1 text-lg group-hover:scale-110 transition-transform origin-left">{action.label.split(" ")[0]}</span>
                                        {action.label.substring(2)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""} animate-fade-in-up`}>
                                    {msg.role === "assistant" && (
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg shadow-violet-500/20">
                                            N
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] md:max-w-[70%] ${msg.role === "user"
                                        ? "bg-violet-600 text-white rounded-2xl rounded-br-sm px-5 py-3 shadow-lg shadow-violet-500/10"
                                        : "glass-card px-5 py-4 border-white/10 bg-white/5"
                                        }`}>
                                        <div className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "assistant" ? "text-slate-200" : ""}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                    {msg.role === "user" && (
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">
                                            U
                                        </div>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div className="flex gap-4 animate-fade-in-up">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        N
                                    </div>
                                    <div className="glass-card px-4 py-3 bg-black/40">
                                        <div className="flex gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="sticky bottom-6 mt-4">
                    <div className="glass-card p-2 flex items-end gap-2 bg-black/60 shadow-2xl border-white/10 ring-1 ring-white/5">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about marketing, content ideas, or Instagram growth..."
                            rows={1}
                            className="flex-1 resize-none bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none p-3 max-h-32"
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                            className="btn-primary p-2.5 rounded-xl shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-transform"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 text-center mt-2">
                        Nexora AI can make mistakes. Check important info.
                    </p>
                </div>
            </div>
        </main>
    );
}
