import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing. Add it to .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const goal = (body.goal ?? "").toString().trim();
    if (goal.length < 10) {
      return NextResponse.json(
        { error: "Goal is required (min 10 characters)." },
        { status: 400 }
      );
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
  "description": "1-2 sentence description of what this agent does",
  "systemPrompt": "The full system prompt that instructs the AI how to behave and what to output",
  "userPromptTemplate": "The user prompt template that includes {{idea}} placeholder"
}

Rules:
- name: short, descriptive, 2-5 words
- description: clear, actionable, explains the agent's purpose
- systemPrompt: detailed instructions for the AI model, including output format expectations
- userPromptTemplate: MUST contain {{idea}} exactly as written — this gets replaced with the user's actual input
- The systemPrompt should instruct the model to return structured, useful output
- No markdown in the JSON values
- Make the agent genuinely useful and specific to the goal`,
        },
        {
          role: "user",
          content: `Create an AI agent for this goal:\n\n${goal}`,
        },
      ],
      text: {
        format: { type: "json_object" },
      },
    });

    const text = response.output_text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Empty model response." }, { status: 500 });
    }

    let suggestedAgent;
    try {
      suggestedAgent = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Model returned invalid JSON. Try again." },
        { status: 500 }
      );
    }

    if (
      !suggestedAgent.name ||
      !suggestedAgent.systemPrompt ||
      !suggestedAgent.userPromptTemplate
    ) {
      return NextResponse.json(
        { error: "Model output missing required fields. Try again." },
        { status: 500 }
      );
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
