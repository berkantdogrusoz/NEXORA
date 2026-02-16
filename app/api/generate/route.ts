import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuthUserId, checkRateLimit, sanitizeInput } from "@/lib/auth";
import type { GenerationMode, NexoraResult } from "@/lib/types";

const ALLOWED_MODES: GenerationMode[] = ["full", "brand", "positioning", "landing", "marketing"];

function getPrompt(idea: string, mode: GenerationMode, language = "English") {
  const modeInstruction: Record<GenerationMode, string> = {
    full: "Focus on producing a complete launch-ready package.",
    brand: "Prioritize stronger brand names, tagline quality, and description clarity.",
    positioning: "Prioritize target audience precision, positioning, and value proposition sharpness.",
    landing: "Prioritize conversion-focused landing page copy with clear CTA and benefits.",
    marketing: "Prioritize high-performing hooks, ad angles, and email subject lines.",
  };

  return `
You are Nexora AI, a product creation studio that helps founders create revenue-ready digital products.
Generate high-quality startup content from the user idea.
${modeInstruction[mode]}

User idea:
${idea}

Return ONLY valid JSON with exactly this shape:
{
  "brandNames": ["...", "...", "..."],
  "tagline": "...",
  "description": "...",
  "targetAudience": "...",
  "positioning": "...",
  "valueProposition": "...",
  "landingPageCopy": {
    "heroHeadline": "...",
    "heroSubheadline": "...",
    "primaryCta": "...",
    "featureBullets": ["...", "...", "..."]
  },
  "marketingMessaging": {
    "hooks": ["...", "...", "..."],
    "emailSubjectLines": ["...", "...", "..."],
    "adAngles": ["...", "...", "..."]
  }
}

Rules:
- All text must be specific, commercial, and actionable
- brandNames must be exactly 3 short brandable names
- featureBullets, hooks, emailSubjectLines, and adAngles must each contain exactly 3 items
- Keep wording concise and conversion-oriented
- Avoid generic filler and avoid markdown
- IMPORTANT: Generate ALL content in ${language} language
`.trim();
}

function isValidString(value: unknown, min = 6) {
  return typeof value === "string" && value.trim().length >= min;
}

function isValidArray(value: unknown, expectedLength: number) {
  return Array.isArray(value) && value.length === expectedLength && value.every((item) => isValidString(item, 3));
}

export async function POST(req: Request) {
  try {
    const authResult = await getAuthUserId();
    if ("error" in authResult) return authResult.error;

    const rateError = checkRateLimit(authResult.userId, "generate");
    if (rateError) return rateError;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is missing." }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    const idea = sanitizeInput(body?.idea, 5000);
    const modeRaw = (body?.mode ?? "full").toString().trim().toLowerCase() as GenerationMode;
    const mode: GenerationMode = ALLOWED_MODES.includes(modeRaw) ? modeRaw : "full";

    if (idea.length < 10) {
      return NextResponse.json({ error: "Idea is required (min 10 characters)." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const language = body?.language || "English";

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: getPrompt(idea, mode, language),
      text: { format: { type: "json_object" } },
    });

    const text = response.output_text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Empty model response." }, { status: 500 });
    }

    let data: NexoraResult;
    try { data = JSON.parse(text) as NexoraResult; }
    catch { return NextResponse.json({ error: "Invalid JSON from model." }, { status: 500 }); }

    if (
      !isValidArray(data.brandNames, 3) ||
      !isValidString(data.tagline, 6) ||
      !isValidString(data.description, 20) ||
      !isValidString(data.targetAudience, 10) ||
      !isValidString(data.positioning, 10) ||
      !isValidString(data.valueProposition, 10) ||
      !data.landingPageCopy ||
      !isValidString(data.landingPageCopy.heroHeadline, 8) ||
      !isValidString(data.landingPageCopy.heroSubheadline, 10) ||
      !isValidString(data.landingPageCopy.primaryCta, 3) ||
      !isValidArray(data.landingPageCopy.featureBullets, 3) ||
      !data.marketingMessaging ||
      !isValidArray(data.marketingMessaging.hooks, 3) ||
      !isValidArray(data.marketingMessaging.emailSubjectLines, 3) ||
      !isValidArray(data.marketingMessaging.adAngles, 3)
    ) {
      return NextResponse.json({ error: "Invalid output format. Try again." }, { status: 500 });
    }

    // Trim all fields
    data.brandNames = data.brandNames.map((n) => n.trim());
    data.tagline = data.tagline.trim();
    data.description = data.description.trim();
    data.targetAudience = data.targetAudience.trim();
    data.positioning = data.positioning.trim();
    data.valueProposition = data.valueProposition.trim();
    data.landingPageCopy.heroHeadline = data.landingPageCopy.heroHeadline.trim();
    data.landingPageCopy.heroSubheadline = data.landingPageCopy.heroSubheadline.trim();
    data.landingPageCopy.primaryCta = data.landingPageCopy.primaryCta.trim();
    data.landingPageCopy.featureBullets = data.landingPageCopy.featureBullets.map((i) => i.trim());
    data.marketingMessaging.hooks = data.marketingMessaging.hooks.map((i) => i.trim());
    data.marketingMessaging.emailSubjectLines = data.marketingMessaging.emailSubjectLines.map((i) => i.trim());
    data.marketingMessaging.adAngles = data.marketingMessaging.adAngles.map((i) => i.trim());

    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
