import { createSupabaseServer } from "./supabase";
import type { Agent } from "./types";

const DEFAULT_AGENTS: Omit<Agent, "id" | "createdAt">[] = [
  {
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
    builtIn: true,
  },
  {
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
    builtIn: true,
  },
  {
    name: "Landing Page Agent",
    description: "Creates conversion-focused landing page copy.",
    systemPrompt: `You are a conversion copywriting expert. Given a startup idea, write landing page copy. Return ONLY valid JSON:
{
  "heroHeadline": "...",
  "heroSubheadline": "...",
  "primaryCta": "...",
  "featureBullets": ["...", "...", "..."]
}
Rules:
- Hero headline: bold, benefit-driven, under 12 words
- Subheadline: expands on the promise, 1-2 sentences
- CTA: action verb + benefit
- Feature bullets: exactly 3
- No markdown, no extra keys`,
    userPromptTemplate: "Write landing page copy for this startup idea:\n\n{{idea}}",
    outputSchema: "",
    builtIn: true,
  },
  {
    name: "Marketing Agent",
    description: "Generates marketing hooks, email subjects, and ad angles.",
    systemPrompt: `You are a growth marketing strategist. Given a startup idea, create marketing messaging. Return ONLY valid JSON:
{
  "hooks": ["...", "...", "..."],
  "emailSubjectLines": ["...", "...", "..."],
  "adAngles": ["...", "...", "..."]
}
Rules:
- Hooks: exactly 3, attention-grabbing
- Email subject lines: exactly 3, under 60 chars
- Ad angles: exactly 3, different persuasion approaches
- No markdown, no extra keys`,
    userPromptTemplate: "Create marketing messaging for this startup idea:\n\n{{idea}}",
    outputSchema: "",
    builtIn: true,
  },
];

async function ensureDefaultAgents(userId: string) {
  const supabase = createSupabaseServer();
  const { data: existing } = await supabase
    .from("agents")
    .select("id")
    .eq("user_id", userId)
    .eq("built_in", true)
    .limit(1);

  if (existing && existing.length > 0) return;

  const rows = DEFAULT_AGENTS.map((a) => ({
    user_id: userId,
    name: a.name,
    description: a.description,
    system_prompt: a.systemPrompt,
    user_prompt_template: a.userPromptTemplate,
    output_schema: a.outputSchema,
    built_in: true,
  }));

  await supabase.from("agents").insert(rows);
}

function rowToAgent(row: Record<string, unknown>): Agent {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || "",
    systemPrompt: row.system_prompt as string,
    userPromptTemplate: row.user_prompt_template as string,
    outputSchema: (row.output_schema as string) || "",
    createdAt: new Date(row.created_at as string).getTime(),
    builtIn: row.built_in as boolean,
  };
}

export async function getAllAgents(userId: string): Promise<Agent[]> {
  await ensureDefaultAgents(userId);
  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []).map(rowToAgent);
}

export async function getAgentById(agentId: string): Promise<Agent | null> {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", agentId)
    .single();

  if (error || !data) return null;
  return rowToAgent(data);
}

export async function createAgent(
  userId: string,
  input: {
    name: string;
    description: string;
    systemPrompt: string;
    userPromptTemplate: string;
    outputSchema?: string;
  }
): Promise<Agent> {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("agents")
    .insert({
      user_id: userId,
      name: input.name.trim(),
      description: input.description.trim(),
      system_prompt: input.systemPrompt.trim(),
      user_prompt_template: input.userPromptTemplate.trim(),
      output_schema: input.outputSchema?.trim() || "",
      built_in: false,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Failed to create agent");
  return rowToAgent(data);
}

export async function updateAgent(
  id: string,
  userId: string,
  input: Partial<{
    name: string;
    description: string;
    systemPrompt: string;
    userPromptTemplate: string;
    outputSchema: string;
  }>
): Promise<Agent | null> {
  const supabase = createSupabaseServer();
  const updates: Record<string, string> = {};
  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.description !== undefined) updates.description = input.description.trim();
  if (input.systemPrompt !== undefined) updates.system_prompt = input.systemPrompt.trim();
  if (input.userPromptTemplate !== undefined) updates.user_prompt_template = input.userPromptTemplate.trim();
  if (input.outputSchema !== undefined) updates.output_schema = input.outputSchema.trim();

  const { data, error } = await supabase
    .from("agents")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !data) return null;
  return rowToAgent(data);
}

export async function deleteAgent(id: string, userId: string): Promise<boolean> {
  const supabase = createSupabaseServer();
  const { error } = await supabase
    .from("agents")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .eq("built_in", false);

  return !error;
}
