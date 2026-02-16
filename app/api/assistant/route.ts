import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuthUserId, checkRateLimit } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const ASSISTANT_SYSTEM_PROMPT = `You are Nexora AI — an expert Instagram marketing assistant. You help small businesses and creators grow their Instagram presence.

Your capabilities:
- Create engaging Instagram captions, hashtags, and content plans
- Provide marketing strategy advice tailored to their niche
- Suggest content calendar ideas and posting schedules
- Help with Instagram growth tactics (organic reach, engagement, Reels strategy)
- Analyze what type of content works best for different industries

Rules:
- Be specific and actionable — no generic advice
- Format responses clearly with bullet points, numbers, and emojis
- If you know the user's brand info, customize your advice for their specific niche
- Keep responses focused on Instagram marketing
- Be encouraging and practical
- When suggesting captions, include relevant hashtags
- Always speak as a marketing expert, not a general AI`;

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
