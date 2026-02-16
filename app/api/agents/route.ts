import { NextResponse } from "next/server";
import { getAllAgents, createAgent } from "@/lib/agents-store";
import { getAuthUserId, sanitizeInput } from "@/lib/auth";

export async function GET() {
  try {
    const authResult = await getAuthUserId();
    if ("error" in authResult) return authResult.error;

    const agents = await getAllAgents(authResult.userId);
    return NextResponse.json(agents);
  } catch {
    return NextResponse.json({ error: "Failed to load agents." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await getAuthUserId();
    if ("error" in authResult) return authResult.error;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const name = sanitizeInput(body.name, 100);
    const description = sanitizeInput(body.description, 500);
    const systemPrompt = sanitizeInput(body.systemPrompt, 5000);
    const userPromptTemplate = sanitizeInput(body.userPromptTemplate, 2000);
    const outputSchema = sanitizeInput(body.outputSchema, 2000);

    if (name.length < 2) {
      return NextResponse.json({ error: "name is required (min 2 chars)." }, { status: 400 });
    }
    if (systemPrompt.length < 10) {
      return NextResponse.json({ error: "systemPrompt is required (min 10 chars)." }, { status: 400 });
    }
    if (!userPromptTemplate.includes("{{idea}}")) {
      return NextResponse.json({ error: "userPromptTemplate must include {{idea}}." }, { status: 400 });
    }

    const agent = await createAgent(authResult.userId, {
      name,
      description,
      systemPrompt,
      userPromptTemplate,
      outputSchema,
    });

    return NextResponse.json(agent, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create agent." }, { status: 500 });
  }
}
