import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuthUserId, checkRateLimit } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const ASSISTANT_SYSTEM_PROMPT = `You are Nexora AI — a high-level Digital Marketing Agency Director. You don't just give advice; you build brands.
Your goal is to maximize the user's ROI (Return on Investment) and Brand Authority.

Your personality:
- Professional, confident, and results-driven.
- Teach the user *how* to use you (e.g., "Tell me your sales goal for this week").
- Use marketing terminology (conversion rate, funnel, CTA, engagement loop) but explain it simply.

Your capabilities:
- Create viral-worthy content ideas and captions.
- Analyze brand positioning and suggest improvements.
- Guide the user to use the Calendar and Autopilot features effectively.

Rules:
- If a user asks for content, ask for their specific goal first (Sales? Followers? Engagement?).
- Be proactive. If they ask for a caption, ask if they need image ideas too.
- Structure your answers like a strategy document: "Here is the Strategy:", "Action Plan:", "Pro Tip:".`;

export async function GET() {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const { data } = await supabase
            .from("assistant_messages")
            .select("*")
            .eq("user_id", authResult.userId)
            .order("created_at", { ascending: true })
            .limit(50);

        const messages = (data || []).map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at).getTime(),
        }));

        return NextResponse.json({ messages });
    } catch {
        return NextResponse.json({ messages: [] });
    }
}

export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const rateError = checkRateLimit(authResult.userId, "assistant");
        if (rateError) return rateError;

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "OPENAI_API_KEY missing." }, { status: 500 });
        }

        const body = await req.json().catch(() => null);
        if (!body?.message) {
            return NextResponse.json({ error: "Message required." }, { status: 400 });
        }

        // Fetch user's brand context
        const { data: brands } = await supabase
            .from("autopilot_brands")
            .select("name, niche, audience, tone")
            .eq("user_id", authResult.userId)
            .limit(3);

        let brandContext = "";
        if (brands && brands.length > 0) {
            const b = brands[0];
            brandContext = `\n\nUser's brand info:\n- Business: ${b.name}\n- Industry: ${b.niche}\n- Target Audience: ${b.audience}\n- Brand Tone: ${b.tone}\n\nCustomize your advice for this specific business.`;
        }

        // Fetch recent conversation (last 10 messages for context)
        const { data: recentMsgs } = await supabase
            .from("assistant_messages")
            .select("role, content")
            .eq("user_id", authResult.userId)
            .order("created_at", { ascending: false })
            .limit(10);

        const conversationHistory = (recentMsgs || [])
            .reverse()
            .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

        // Save user message
        await supabase.from("assistant_messages").insert({
            user_id: authResult.userId,
            role: "user",
            content: body.message,
        });

        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const response = await client.responses.create({
            model: "gpt-4.1-mini",
            input: [
                { role: "system", content: ASSISTANT_SYSTEM_PROMPT + brandContext },
                ...conversationHistory.map(m => ({
                    role: m.role as "user" | "assistant",
                    content: m.content,
                })),
                { role: "user", content: body.message },
            ],
        });

        const reply = response.output_text?.trim() || "Sorry, I couldn't generate a response.";

        // Save assistant message
        await supabase.from("assistant_messages").insert({
            user_id: authResult.userId,
            role: "assistant",
            content: reply,
        });

        return NextResponse.json({ reply });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Assistant failed.";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
