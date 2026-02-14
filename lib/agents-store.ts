import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import type { Agent } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const AGENTS_FILE = path.join(DATA_DIR, "agents.json");

const DEFAULT_AGENTS: Agent[] = [
  {
    id: "brand-agent-001",
    name: "Brand Agent",
    description: "Generates brand names, tagline, and product description for your startup idea.",
    systemPrompt: `You are a world-class branding expert. Given a startup idea, generate exactly 3 short, memorable, brandable names, a punchy tagline, and a compelling product description. Return ONLY valid JSON with this shape:
{
  "brandNames": ["...", "...", "..."],
  "tagline": "...",
  "description": "..."
}
Rules:
- Brand names must be short (1-2 words), unique, and domain-friendly
- Tagline must be under 10 words, action-oriented
- Description must be 2-3 sentences, benefit-focused
- No markdown, no extra keys`,
    userPromptTemplate: "Create branding for this startup idea:\n\n{{idea}}",
    outputSchema: "",
    createdAt: Date.now(),
    builtIn: true,
  },
  {
    id: "positioning-agent-002",
    name: "Positioning Agent",
    description: "Defines target audience, market positioning, and value proposition.",
    systemPrompt: `You are a senior product strategist. Given a startup idea, define the target audience, positioning statement, and value proposition. Return ONLY valid JSON:
{
  "targetAudience": "...",
  "positioning": "...",
  "valueProposition": "..."
}
Rules:
- Target audience must be specific (demographics, pain points, behavior)
- Positioning must differentiate from competitors
- Value proposition must clearly state the unique benefit
- No markdown, no extra keys`,
    userPromptTemplate: "Define positioning for this startup idea:\n\n{{idea}}",
    outputSchema: "",
    createdAt: Date.now(),
    builtIn: true,
  },
  {
    id: "landing-agent-003",
    name: "Landing Page Agent",
    description: "Creates conversion-focused landing page copy with headline, subheadline, CTA, and feature bullets.",
    systemPrompt: `You are a conversion copywriting expert. Given a startup idea, write landing page copy that converts visitors into customers. Return ONLY valid JSON:
{
  "heroHeadline": "...",
  "heroSubheadline": "...",
  "primaryCta": "...",
  "featureBullets": ["...", "...", "..."]
}
Rules:
- Hero headline: bold, benefit-driven, under 12 words
- Subheadline: expands on the promise, 1-2 sentences
- CTA: action verb + benefit (e.g. "Start Building Free")
- Feature bullets: exactly 3, each highlighting a key benefit
- No markdown, no extra keys`,
    userPromptTemplate: "Write landing page copy for this startup idea:\n\n{{idea}}",
    outputSchema: "",
    createdAt: Date.now(),
    builtIn: true,
  },
  {
    id: "marketing-agent-004",
    name: "Marketing Agent",
    description: "Generates marketing hooks, email subject lines, and ad angles for growth campaigns.",
    systemPrompt: `You are a growth marketing strategist. Given a startup idea, create marketing messaging that drives clicks, opens, and conversions. Return ONLY valid JSON:
{
  "hooks": ["...", "...", "..."],
  "emailSubjectLines": ["...", "...", "..."],
  "adAngles": ["...", "...", "..."]
}
Rules:
- Hooks: exactly 3, attention-grabbing opening lines for social/ads
- Email subject lines: exactly 3, curiosity-driven, under 60 chars
- Ad angles: exactly 3, each a different persuasion approach
- No markdown, no extra keys`,
    userPromptTemplate: "Create marketing messaging for this startup idea:\n\n{{idea}}",
    outputSchema: "",
    createdAt: Date.now(),
    builtIn: true,
  },
];

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readAgents(): Promise<Agent[]> {
  await ensureDataDir();

  if (!existsSync(AGENTS_FILE)) {
    await writeFile(AGENTS_FILE, JSON.stringify(DEFAULT_AGENTS, null, 2), "utf-8");
    return [...DEFAULT_AGENTS];
  }

  const raw = await readFile(AGENTS_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...DEFAULT_AGENTS];
    }
    return parsed as Agent[];
  } catch {
    return [...DEFAULT_AGENTS];
  }
}

async function writeAgents(agents: Agent[]): Promise<void> {
  await ensureDataDir();
  await writeFile(AGENTS_FILE, JSON.stringify(agents, null, 2), "utf-8");
}

function enqueue(fn: () => Promise<void>): Promise<void> {
  writeQueue = writeQueue.then(fn, fn);
  return writeQueue;
}

export async function getAllAgents(): Promise<Agent[]> {
  return readAgents();
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const agents = await readAgents();
  return agents.find((a) => a.id === id) ?? null;
}

export async function createAgent(input: {
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  outputSchema?: string;
}): Promise<Agent> {
  const agent: Agent = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    description: input.description.trim(),
    systemPrompt: input.systemPrompt.trim(),
    userPromptTemplate: input.userPromptTemplate.trim(),
    outputSchema: input.outputSchema?.trim() ?? "",
    createdAt: Date.now(),
    builtIn: false,
  };

  await enqueue(async () => {
    const agents = await readAgents();
    agents.push(agent);
    await writeAgents(agents);
  });

  return agent;
}

export async function updateAgent(
  id: string,
  input: Partial<{
    name: string;
    description: string;
    systemPrompt: string;
    userPromptTemplate: string;
    outputSchema: string;
  }>
): Promise<Agent | null> {
  let updated: Agent | null = null;

  await enqueue(async () => {
    const agents = await readAgents();
    const idx = agents.findIndex((a) => a.id === id);
    if (idx === -1) return;

    const agent = agents[idx];
    if (input.name !== undefined) agent.name = input.name.trim();
    if (input.description !== undefined) agent.description = input.description.trim();
    if (input.systemPrompt !== undefined) agent.systemPrompt = input.systemPrompt.trim();
    if (input.userPromptTemplate !== undefined) agent.userPromptTemplate = input.userPromptTemplate.trim();
    if (input.outputSchema !== undefined) agent.outputSchema = input.outputSchema.trim();

    agents[idx] = agent;
    await writeAgents(agents);
    updated = agent;
  });

  return updated;
}

export async function deleteAgent(id: string): Promise<boolean> {
  let deleted = false;

  await enqueue(async () => {
    const agents = await readAgents();
    const idx = agents.findIndex((a) => a.id === id);
    if (idx === -1) return;

    agents.splice(idx, 1);
    await writeAgents(agents);
    deleted = true;
  });

  return deleted;
}
