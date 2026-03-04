import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuthUserId, checkRateLimit } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase";

const ASSISTANT_SYSTEM_PROMPT = `You are Nexora AI — a high-level Creative Studio Assistant.
Your goal is to help the user create better videos and images for their online channels (social, ads, website, etc.) while keeping things simple and fast.

Your personality:
- Calm, clear, and practical.
- Guide the user on how to get the best results from the Studio (e.g., "Tell me which format you need: vertical short video, square post, or wide trailer").
- Avoid heavy marketing jargon. If you must use terms (hook, CTA, funnel), explain them briefly.

Your capabilities:
- Generate content ideas, hooks, and caption drafts for short-form video and static creatives.
- Suggest how to turn a raw idea into prompts for the Image and Video Studio.
- Help the user plan simple content sequences (e.g., a 3-part short video series).

Rules:
- If a user asks for content, ask what format they are targeting first (e.g., vertical short video, square image, carousel).
- Be proactive. If they ask for a caption, ask if they also want hook ideas or visual directions.
- Structure your answers in clear sections like: "Idea", "How to Use in Studio", "Optional Caption".`;

export async function GET() {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const supabase = createSupabaseServer();
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

        const validModels = ["gpt-4o-mini", "gpt-4o", "gemini-2.5-flash"];
        const finalModel = validModels.includes(model) ? model : "gpt-4o-mini";
        const isProModel = finalModel !== "gpt-4o-mini";
        const cost = isProModel ? 5 : 2;

        // Check user plan and credits
        const { createSupabaseServer } = await import("@/lib/supabase");
        const serverSupabase = createSupabaseServer();
        const { data: subData } = await serverSupabase
            .from("user_subscriptions")
            .select("plan_name, status, ends_at")
            .eq("user_id", userId)
            .single();

        let planName = "Free";
        if (subData) {
            const isActive = subData.status === "active" || subData.status === "past_due" || subData.status === "on_trial";
            const isCancelledButValid = subData.status === "cancelled" && subData.ends_at && new Date(subData.ends_at) > new Date();
            if (isActive || isCancelledButValid) {
                planName = subData.plan_name;
            }
        }
        if (process.env.NODE_ENV === "development") planName = "Pro";

        // Block Pro models for Free users
        if (isProModel && planName === "Free") {
            return NextResponse.json({ error: "You need a Premium plan to use GPT-4o or Gemini 2.5 Flash." }, { status: 403 });
        }

        // Check balance
        const { data: creditData } = await serverSupabase
            .from("user_credits")
            .select("credits")
            .eq("user_id", userId)
            .single();

        const currentCredits = Number(creditData?.credits || 0);
        const isDev = process.env.NODE_ENV === "development";

        if (!isDev && (!creditData || currentCredits < cost)) {
            return NextResponse.json({ error: "Insufficient credits. Please upgrade your plan." }, { status: 402 });
        }

        // Deduct
        let deductError = null;
        if (!isDev) {
            const { error } = await serverSupabase
                .from("user_credits")
                .update({ credits: currentCredits - cost })
                .eq("user_id", userId);
            deductError = error;
        }

        if (deductError) {
            return NextResponse.json({ error: "Failed to process credits" }, { status: 500 });
        }

        creditDeducted = !isDev;
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
                        role: m.role as "user" | "assistant",
                        content: m.content,
                    })),
                    { role: "user", content: message },
                ],
            });
            reply = response.choices[0].message?.content || "";
        } else if (finalModel.includes("gemini")) {
            const { GoogleGenAI } = await import("@google/genai");
            if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
                return NextResponse.json({ error: "GOOGLE_GENERATIVE_AI_API_KEY missing." }, { status: 500 });
            }
            const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

            const chat = await ai.chats.create({
                model: finalModel,
                config: { systemInstruction: fullSystemPrompt },
                history: conversationHistory.map(m => ({
                    role: m.role === "user" ? ("user" as const) : ("model" as const),
                    parts: [{ text: m.content }],
                })),
            });

            const result = await chat.sendMessage({ message });
            reply = result.text ?? "";
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
