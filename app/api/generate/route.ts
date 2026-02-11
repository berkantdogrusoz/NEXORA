import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type NexoraResult = {
  brandNames: string[];
  description: string;
};

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing. Add it to .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    const idea = (body?.idea ?? "").toString().trim();

    if (idea.length < 10) {
      return NextResponse.json(
        { error: "Idea is required (min 10 characters)." },
        { status: 400 }
      );
    }

    const prompt = `
You are Nexora AI. Generate a product-ready mini package.

User idea:
${idea}

Return ONLY valid JSON with exactly this shape:
{
  "brandNames": ["...", "...", "..."],
  "description": "2–4 sentences"
}

Rules:
- brandNames must be exactly 3 items
- names must be short, brandable, not generic
- description must be clear and sellable
`.trim();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      // ✅ OpenAI SDK 6.x compatible structured JSON response
      text: {
        format: { type: "json_object" },
      },
    });

    const text = response.output_text?.trim();
    if (!text) {
      return NextResponse.json(
        { error: "Empty model response." },
        { status: 500 }
      );
    }

    let data: NexoraResult;
    try {
      data = JSON.parse(text) as NexoraResult;
    } catch {
      return NextResponse.json(
        { error: "Model returned invalid JSON. Try again." },
        { status: 500 }
      );
    }

    if (
      !Array.isArray(data.brandNames) ||
      data.brandNames.length !== 3 ||
      typeof data.description !== "string" ||
      data.description.trim().length < 10
    ) {
      return NextResponse.json(
        { error: "Invalid output format. Try again." },
        { status: 500 }
      );
    }

    // Clean strings (light sanitize)
    data.brandNames = data.brandNames.map((s) => String(s).trim()).slice(0, 3);
    data.description = data.description.trim();

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error. Please try again." },
      { status: 500 }
    );
  }
}
