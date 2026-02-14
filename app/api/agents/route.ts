import { NextResponse } from "next/server";
import { getAllAgents, createAgent } from "@/lib/agents-store";

export async function GET() {
  try {
    const agents = await getAllAgents();
    return NextResponse.json(agents);
  } catch {
    return NextResponse.json({ error: "Failed to load agents." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { name, description, systemPrompt, userPromptTemplate, outputSchema } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "name is required (min 2 chars)." }, { status: 400 });
    }
    if (!systemPrompt || typeof systemPrompt !== "string" || systemPrompt.trim().length < 10) {
      return NextResponse.json({ error: "systemPrompt is required (min 10 chars)." }, { status: 400 });
    }
    if (!userPromptTemplate || typeof userPromptTemplate !== "string") {
      return NextResponse.json({ error: "userPromptTemplate is required." }, { status: 400 });
    }
    if (!userPromptTemplate.includes("{{idea}}")) {
      return NextResponse.json(
        { error: "userPromptTemplate must include {{idea}} placeholder." },
        { status: 400 }
      );
    }

    const agent = await createAgent({
      name,
      description: description || "",
      systemPrompt,
      userPromptTemplate,
      outputSchema: outputSchema || "",
    });

    return NextResponse.json(agent, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create agent." }, { status: 500 });
  }
}
