import { NextResponse } from "next/server";
import { updateAgent, deleteAgent } from "@/lib/agents-store";
import { getAuthUserId, sanitizeInput } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthUserId();
    if ("error" in authResult) return authResult.error;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const updates: Record<string, string> = {};
    if (body.name !== undefined) updates.name = sanitizeInput(body.name, 100);
    if (body.description !== undefined) updates.description = sanitizeInput(body.description, 500);
    if (body.systemPrompt !== undefined) updates.systemPrompt = sanitizeInput(body.systemPrompt, 5000);
    if (body.userPromptTemplate !== undefined) updates.userPromptTemplate = sanitizeInput(body.userPromptTemplate, 2000);

    const agent = await updateAgent(params.id, authResult.userId, updates);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch {
    return NextResponse.json({ error: "Failed to update agent." }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthUserId();
    if ("error" in authResult) return authResult.error;

    const deleted = await deleteAgent(params.id, authResult.userId);
    if (!deleted) {
      return NextResponse.json({ error: "Agent not found or is built-in." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete agent." }, { status: 500 });
  }
}
