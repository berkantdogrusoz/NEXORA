"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "@/app/components/navbar";

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
    { label: "🎯 Content calendar plan", prompt: "Create a 7-day Instagram content calendar plan for my brand" },
    { label: "#️⃣ Hashtag research", prompt: "Research and suggest 20 high-performing Instagram hashtags for my niche" },
    { label: "📈 Growth tactics", prompt: "What are the best organic growth tactics for Instagram in 2025?" },
];

export default function AssistantPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
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

        const userMsg: Message = {
            id: `u-${Date.now()}`,
            role: "user",
            content: msg,
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msg }),
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
        <main className="relative min-h-screen overflow-hidden flex flex-col">
            <div className="orb-bg" aria-hidden="true"><div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" /></div>
            <Navbar />

            <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full px-6">
                {/* Header */}
                <div className="py-6 animate-fade-in-up">
                    <h1 className="text-2xl font-bold tracking-tight">🤖 AI Marketing Assistant</h1>
                    <p className="text-sm text-slate-500">Your personal marketing expert. Ask anything about growing your business on Instagram.</p>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto pb-4 space-y-4">
                    {initialLoad ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full skeleton shrink-0" />
                                    <div className="glass-card p-4 flex-1"><div className="h-4 skeleton w-2/3" /></div>
                                </div>
                            ))}
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12 animate-fade-in-up">
                            <div className="text-5xl mb-4">🤖</div>
                            <h3 className="text-lg font-semibold mb-2">Hi! I&apos;m your AI Marketing Assistant</h3>
                            <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto">
                                I know your brand and can help you create content, plan strategy, and grow your Instagram. Ask me anything!
                            </p>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-xl mx-auto">
                                {QUICK_ACTIONS.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(action.prompt)}
                                        className="glass-card p-3 text-xs text-left text-slate-600 hover:text-violet-700 hover:border-violet-200 hover:bg-violet-50/50 transition-all"
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""} animate-fade-in-up`}>
                                    {msg.role === "assistant" && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            N
                                        </div>
                                    )}
                                    <div className={`max-w-[75%] ${msg.role === "user"
                                        ? "bg-violet-600 text-white rounded-2xl rounded-br-md px-4 py-3"
                                        : "glass-card px-4 py-3"
                                        }`}>
                                        <div className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "assistant" ? "text-slate-700" : ""}`}>
                                            {msg.content}
                                        </div>
                                        <div className={`text-[9px] mt-1.5 ${msg.role === "user" ? "text-white/50" : "text-slate-300"}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                    </div>
                                    {msg.role === "user" && (
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                                            U
                                        </div>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div className="flex gap-3 animate-fade-in-up">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        N
                                    </div>
                                    <div className="glass-card px-4 py-3">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="sticky bottom-0 py-4 bg-gradient-to-t from-white via-white to-transparent">
                    <div className="glass-card p-2 flex items-end gap-2">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about marketing, content ideas, or Instagram growth..."
                            rows={1}
                            className="flex-1 resize-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none p-2 max-h-32"
                        />
                        <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="btn-primary text-sm py-2 px-4 shrink-0 disabled:opacity-40">
                            {loading ? "..." : "Send →"}
                        </button>
                    </div>
                    <p className="text-[9px] text-slate-300 text-center mt-1.5">
                        Nexora AI knows your brand. Responses are customized for your business.
                    </p>
                </div>
            </div>
        </main>
    );
}
