import { NextResponse } from "next/server";
import { getAgentById, updateAgent, deleteAgent } from "@/lib/agents-store";

type RouteContext = { params: { id: string } };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const agent = await getAgentById(context.params.id);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }
    return NextResponse.json(agent);
  } catch {
    return NextResponse.json({ error: "Failed to load agent." }, { status: 500 });
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { name, description, systemPrompt, userPromptTemplate, outputSchema } = body;

    if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
      return NextResponse.json({ error: "name must be at least 2 chars." }, { status: 400 });
    }
    if (systemPrompt !== undefined && (typeof systemPrompt !== "string" || systemPrompt.trim().length < 10)) {
      return NextResponse.json({ error: "systemPrompt must be at least 10 chars." }, { status: 400 });
    }
    if (userPromptTemplate !== undefined) {
      if (typeof userPromptTemplate !== "string" || !userPromptTemplate.includes("{{idea}}")) {
        return NextResponse.json(
          { error: "userPromptTemplate must include {{idea}} placeholder." },
          { status: 400 }
        );
      }
    }

    const updated = await updateAgent(context.params.id, {
      name,
      description,
      systemPrompt,
      userPromptTemplate,
      outputSchema,
    });

    if (!updated) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update agent." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const deleted = await deleteAgent(context.params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete agent." }, { status: 500 });
  }
}
