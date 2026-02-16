import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuthUserId, checkRateLimit, sanitizeInput } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const authResult = await getAuthUserId();
    if ("error" in authResult) return authResult.error;

    const rateError = checkRateLimit(authResult.userId, "agent-builder");
    if (rateError) return rateError;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is missing." }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const goal = sanitizeInput(body.goal, 2000);
    if (goal.length < 10) {
      return NextResponse.json({ error: "Goal is required (min 10 characters)." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `You are an AI Agent Architect. Given a user's goal, design a reusable AI agent definition.
Return ONLY valid JSON with exactly this shape:
{
  "name": "Short Agent Name",
  "description": "1-2 sentence description",
  "systemPrompt": "The full system prompt",
  "userPromptTemplate": "Template with {{idea}} placeholder"
}
Rules:
- name: 2-5 words
- systemPrompt: detailed instructions
- userPromptTemplate: MUST contain {{idea}}
- No markdown in JSON values`,
        },
        { role: "user", content: `Create an AI agent for: ${goal}` },
      ],
      text: { format: { type: "json_object" } },
    });

    const text = response.output_text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Empty model response." }, { status: 500 });
    }

    let suggestedAgent;
    try { suggestedAgent = JSON.parse(text); }
    catch { return NextResponse.json({ error: "Invalid JSON from model." }, { status: 500 }); }

    if (!suggestedAgent.name || !suggestedAgent.systemPrompt || !suggestedAgent.userPromptTemplate) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 500 });
    }

    if (!suggestedAgent.userPromptTemplate.includes("{{idea}}")) {
      suggestedAgent.userPromptTemplate += "\n\n{{idea}}";
    }

    return NextResponse.json({ suggestedAgent });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
