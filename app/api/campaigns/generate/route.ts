import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getCampaignById, addContentToCampaign } from "@/lib/campaigns-store";
import { getAuthUserId, checkRateLimit } from "@/lib/auth";

const INSTAGRAM_SYSTEM_PROMPT = `You are a world-class Instagram marketing strategist. Given a product and target audience, create a comprehensive Instagram marketing package.

Return ONLY valid JSON with this exact shape:
{
  "posts": [
    {
      "caption": "Full Instagram caption with line breaks",
      "hashtags": ["hashtag1", "hashtag2", "...up to 15"],
      "imagePrompt": "Detailed image description",
      "bestTime": "Best time to post"
    }
  ],
  "storyIdeas": ["Idea 1", "Idea 2", "Idea 3"],
  "bioSuggestion": "Optimized Instagram bio (150 chars max)"
}

Rules:
- Generate exactly 3 posts with different angles
- Captions must include hooks, emojis, and clear CTAs
- Hashtags: mix of popular, medium, and niche
- Match the requested tone
- No markdown in JSON values`;

const GOOGLE_ADS_SYSTEM_PROMPT = `You are a Google Ads specialist. Given product and audience, create a Google Ads campaign package.

Return ONLY valid JSON:
{
  "headlines": ["max 30 chars each, up to 10"],
  "descriptions": ["max 90 chars each, up to 5"],
  "keywords": ["up to 20, with match types"],
  "callToActions": ["3 CTAs"],
  "adExtensions": ["5 sitelink/callout texts"]
}

Rules:
- Headlines: 10 unique, benefit-driven
- Descriptions: 5 unique, with CTAs
- Keywords: 20 mixed match types
- Focus on high CTR and Quality Score
- Match the requested tone
- No markdown in JSON values`;

export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const rateError = checkRateLimit(authResult.userId, "campaign-generate");
        if (rateError) return rateError;

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "OPENAI_API_KEY is missing." }, { status: 500 });
        }

        const body = await req.json().catch(() => null);
        if (!body?.campaignId) {
            return NextResponse.json({ error: "campaignId is required." }, { status: 400 });
        }

        const campaign = await getCampaignById(body.campaignId, authResult.userId);
        if (!campaign) {
            return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
        }

        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const systemPrompt = campaign.platform === "instagram" ? INSTAGRAM_SYSTEM_PROMPT : GOOGLE_ADS_SYSTEM_PROMPT;

        const language = body.language || "English";

        const userMessage = `Create ${campaign.platform === "instagram" ? "Instagram" : "Google Ads"} marketing for:
Product: ${campaign.productName}
Description: ${campaign.productDescription}
Target Audience: ${campaign.targetAudience}
Tone: ${campaign.tone}

IMPORTANT: Generate ALL content in ${language} language.`;

        const response = await client.responses.create({
            model: "gpt-4.1-mini",
            input: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
            ],
            text: { format: { type: "json_object" } },
        });

        const text = response.output_text?.trim();
        if (!text) {
            return NextResponse.json({ error: "Empty AI response." }, { status: 500 });
        }

        let output;
        try { output = JSON.parse(text); }
        catch { return NextResponse.json({ error: "Invalid JSON from AI." }, { status: 500 }); }

        const content = await addContentToCampaign(
            campaign.id,
            authResult.userId,
            campaign.platform,
            output
        );

        return NextResponse.json({ campaign: { ...campaign, contents: [...campaign.contents, content] }, content });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Server error.";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
