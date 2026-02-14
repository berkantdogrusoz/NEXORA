import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAgentById } from "@/lib/agents-store";
import type { AgentRunResult, RunResponse } from "@/lib/types";

const MAX_AGENTS_PER_RUN = 8;

async function runSingleAgent(
  client: OpenAI,
  agentId: string,
  idea: string,
  contextSoFar: string
): Promise<AgentRunResult> {
  const agent = await getAgentById(agentId);
  if (!agent) {
    return { agentId, name: "Unknown", error: "Agent not found.", ok: false };
  }

  try {
    const filledPrompt = agent.userPromptTemplate.replace(/\{\{idea\}\}/g, idea);

    let input = filledPrompt;
    if (contextSoFar) {
      input = `Context so far:\n${contextSoFar}\n\n---\n\n${filledPrompt}`;
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: agent.systemPrompt },
        { role: "user", content: input },
      ],
    });

    const text = response.output_text?.trim();
    if (!text) {
      return { agentId, name: agent.name, error: "Empty model response.", ok: false };
    }

    return { agentId, name: agent.name, outputText: text, ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Agent execution failed.";
    return { agentId, name: agent.name, error: msg, ok: false };
  }
}

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

    const idea = (body.idea ?? "").toString().trim();
    if (idea.length < 10) {
      return NextResponse.json(
        { error: "Idea is required (min 10 characters)." },
        { status: 400 }
      );
    }

    const agentIds: string[] = body.agentIds;
    if (!Array.isArray(agentIds) || agentIds.length === 0) {
      return NextResponse.json(
        { error: "agentIds must be a non-empty array." },
        { status: 400 }
      );
    }

    if (agentIds.length > MAX_AGENTS_PER_RUN) {
      return NextResponse.json(
        { error: `Maximum ${MAX_AGENTS_PER_RUN} agents per run.` },
        { status: 400 }
      );
    }

    const mode = body.mode === "sequential" ? "sequential" : "parallel";
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const results: AgentRunResult[] = [];

    if (mode === "parallel") {
      const promises = agentIds.map((id) => runSingleAgent(client, id, idea, ""));
      const settled = await Promise.allSettled(promises);

      for (const s of settled) {
        if (s.status === "fulfilled") {
          results.push(s.value);
        } else {
          results.push({
            agentId: "unknown",
            name: "Unknown",
            error: "Unexpected failure.",
            ok: false,
          });
        }
      }
    } else {
      let contextSoFar = "";

      for (const id of agentIds) {
        const result = await runSingleAgent(client, id, idea, contextSoFar);
        results.push(result);

        if (result.ok && result.outputText) {
          const entry = { agent: result.name, output: result.outputText };
          contextSoFar = contextSoFar
            ? `${contextSoFar}\n${JSON.stringify(entry)}`
            : JSON.stringify(entry);
        }
      }
    }

    const response: RunResponse = { idea, mode, results };
    return NextResponse.json(response);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
