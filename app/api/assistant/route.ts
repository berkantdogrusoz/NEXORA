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
    let creditDeducted = false;
    let deductedCost = 0;
    let userId = "";

    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;
        userId = authResult.userId;

        const rateError = checkRateLimit(userId, "assistant");
        if (rateError) return rateError;

        const body = await req.json().catch(() => null);
        const { message, model = "gpt-4o-mini" } = body || {};

        if (!message) {
            return NextResponse.json({ error: "Message required." }, { status: 400 });
        }

        const validModels = ["gpt-4o-mini", "gpt-4o", "gemini-1.5-pro"];
        const finalModel = validModels.includes(model) ? model : "gpt-4o-mini";
        const isProModel = finalModel !== "gpt-4o-mini";
        const cost = isProModel ? 2.0 : 0.5;

        // Check user plan and credits
        const { createSupabaseServer } = await import("@/lib/supabase");
        const serverSupabase = createSupabaseServer();
        const { data: subData } = await serverSupabase
            .from("user_subscriptions")
            .select("plan_name, status")
            .eq("user_id", userId)
            .single();

        let planName = "Free";
        if (subData && (subData.status === "active" || subData.status === "past_due" || subData.status === "trialing")) {
            planName = subData.plan_name;
        }

        // Block Pro models for Free users
        if (isProModel && planName === "Free") {
            return NextResponse.json({ error: "You need a Premium plan to use GPT-4o or Gemini 1.5 Pro." }, { status: 403 });
        }

        // Check balance
        const { data: creditData } = await serverSupabase
            .from("user_credits")
            .select("credits")
            .eq("user_id", userId)
            .single();

        const currentCredits = Number(creditData?.credits || 0);

        if (!creditData || currentCredits < cost) {
            return NextResponse.json({ error: "Insufficient credits. Please upgrade your plan." }, { status: 402 });
        }

        // Deduct
        const { error: deductError } = await serverSupabase
            .from("user_credits")
            .update({ credits: currentCredits - cost })
            .eq("user_id", userId);

        if (deductError) {
            return NextResponse.json({ error: "Failed to process credits" }, { status: 500 });
        }

        creditDeducted = true;
        deductedCost = cost;

        // Fetch user's brand context
        const { data: brands } = await serverSupabase
            .from("autopilot_brands")
            .select("name, niche, audience, tone")
            .eq("user_id", userId)
            .limit(1);

        let brandContext = "";
        if (brands && brands.length > 0) {
            const b = brands[0];
            brandContext = `\n\nUser's brand info:\n- Business: ${b.name}\n- Industry: ${b.niche}\n- Target Audience: ${b.audience}\n- Brand Tone: ${b.tone}\n\nCustomize your advice for this specific business.`;
        }

        const fullSystemPrompt = ASSISTANT_SYSTEM_PROMPT + brandContext;

        // Fetch recent conversation
        const { data: recentMsgs } = await serverSupabase
            .from("assistant_messages")
            .select("role, content")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(10);

        const conversationHistory = (recentMsgs || [])
            .reverse()
            .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

        // Save user message
        await serverSupabase.from("assistant_messages").insert({
            user_id: userId,
            role: "user",
            content: message,
        });

        let reply = "";

        if (finalModel.includes("gpt")) {
            if (!process.env.OPENAI_API_KEY) {
                return NextResponse.json({ error: "OPENAI_API_KEY missing." }, { status: 500 });
            }
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const response = await openai.chat.completions.create({
                model: finalModel,
                messages: [
                    { role: "system", content: fullSystemPrompt },
                    ...conversationHistory.map(m => ({
                        role: m.role as "user" | "system",
                        content: m.content,
                    })),
                    { role: "user", content: message },
                ],
            });
            reply = response.choices[0].message?.content || "";
        } else if (finalModel.includes("gemini")) {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
                return NextResponse.json({ error: "GOOGLE_GENERATIVE_AI_API_KEY missing." }, { status: 500 });
            }
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
            const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

            const chat = geminiModel.startChat({
                history: [
                    { role: "user", parts: [{ text: fullSystemPrompt + "\n\nUnderstood?" }] },
                    { role: "model", parts: [{ text: "Yes, I am Nexora AI. How can I help?" }] },
                    ...conversationHistory.map(m => ({
                        role: m.role === "user" ? "user" : "model",
                        parts: [{ text: m.content }],
                    })),
                ],
            });

            const result = await chat.sendMessage(message);
            reply = result.response.text();
        }

        if (!reply) throw new Error("AI failed to reply.");

        // Save assistant message
        await serverSupabase.from("assistant_messages").insert({
            user_id: userId,
            role: "assistant",
            content: reply,
        });

        return NextResponse.json({ reply });
    } catch (e: unknown) {
        console.error("Assistant Error:", e);

        if (creditDeducted && userId) {
            try {
                const { createSupabaseServer } = await import("@/lib/supabase");
                const serverSupabase = createSupabaseServer();

                const { data: currentCreditData } = await serverSupabase
                    .from("user_credits")
                    .select("credits")
                    .eq("user_id", userId)
                    .single();

                if (currentCreditData) {
                    await serverSupabase
                        .from("user_credits")
                        .update({ credits: Number(currentCreditData.credits) + deductedCost })
                        .eq("user_id", userId);
                }
            } catch (refundError) {
                console.error("Failed to refund credits after assistant error:", refundError);
            }
        }

        const msg = e instanceof Error ? e.message : "Assistant failed.";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
