import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAuthUserId, checkRateLimit } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { uploadImageFromUrl } from "@/lib/storage";

const CONTENT_SYSTEM_PROMPT = `You are an expert Instagram content creator. Given a brand's details, generate engaging Instagram content.

Return ONLY valid JSON with this shape:
{
  "posts": [
    {
      "platform": "instagram",
      "type": "post",
      "caption": "Full caption with emojis and line breaks",
      "hashtags": ["hashtag1", "hashtag2"],
      "imagePrompt": "Detailed, specific image description for AI image generation. Describe the scene, colors, style, composition. Be very detailed and visual.",
      "bestTime": "Best posting time like '09:00' or '18:00'",
      "dayOfWeek": "monday"
    }
  ]
}

Rules:
- Generate exactly 7 posts, one for each day of the week (monday through sunday)
- Each post should have a unique angle and topic
- Use Instagram best practices (hooks, CTAs, engagement questions)
- Include 15-20 relevant hashtags per post
- imagePrompt should be highly detailed for AI image generation
- Match the brand's tone exactly
- dayOfWeek must be lowercase: monday, tuesday, wednesday, thursday, friday, saturday, sunday
- No markdown in JSON values`;

export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const rateError = checkRateLimit(authResult.userId, "autopilot-execute");
        if (rateError) return rateError;

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "OPENAI_API_KEY missing." }, { status: 500 });
        }

        const body = await req.json().catch(() => null);
        if (!body?.brandId) {
            return NextResponse.json({ error: "brandId required." }, { status: 400 });
        }

        // Fetch brand
        const { data: brand } = await supabase
            .from("autopilot_brands")
            .select("*")
            .eq("id", body.brandId)
            .eq("user_id", authResult.userId)
            .single();

        if (!brand) {
            return NextResponse.json({ error: "Brand not found." }, { status: 404 });
        }

        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const weekOffset = body.weekOffset || 0;

        // Calculate Schedule Range
        const now = new Date();
        let startDate: Date;
        let daysToGenerate: number;

        if (weekOffset === 0) {
            // Current Week: Start from TODAY to avoid past days
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);

            // Calculate days remaining until Sunday (0=Sun, 1=Mon... 6=Sat)
            // Fix: In JS getDay(), Sunday is 0. We want Monday-Sunday cycle.
            // Let's standardise: Mon=0 ... Sun=6
            const currentDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
            const daysRemaining = 7 - currentDayIndex;

            daysToGenerate = daysRemaining;
        } else {
            // Next Week (or future): Start from next Monday
            const dayOfWeek = now.getDay(); // 0(Sun) - 6(Sat)
            const daysToMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
            startDate = new Date(now);
            startDate.setDate(now.getDate() + daysToMonday + (weekOffset - 1) * 7);
            startDate.setHours(0, 0, 0, 0);

            daysToGenerate = 7;
        }

        // Just in case
        if (daysToGenerate < 1) daysToGenerate = 1;

        const userMessage = `Create a weekly Instagram content plan for:
Brand: ${brand.name}
Industry: ${brand.niche}
Target Audience: ${brand.audience}
Tone: ${brand.tone}

Generate exactly ${daysToGenerate} Instagram posts.
These posts will be scheduled sequentially starting from ${startDate.toLocaleDateString('en-US', { weekday: 'long' })}.
Make each post unique — mix educational, entertaining, promotional, and engagement content.
Include detailed image prompts that would create stunning Instagram visuals.`;

        const response = await client.responses.create({
            model: "gpt-4.1-mini",
            input: [
                { role: "system", content: CONTENT_SYSTEM_PROMPT },
                { role: "user", content: userMessage },
            ],
            text: { format: { type: "json_object" } },
        });

        const text = response.output_text?.trim();
        if (!text) {
            return NextResponse.json({ error: "Empty AI response." }, { status: 500 });
        }

        let result;
        try { result = JSON.parse(text); }
        catch { return NextResponse.json({ error: "Invalid JSON from AI." }, { status: 500 }); }

        let posts = result.posts || [];

        // Safety: Ensure we have enough posts, loop if necessary
        if (posts.length < daysToGenerate) {
            // If AI returned fewer posts, duplicate nicely or accept partial
            // Let's just adhere to what is returned
            daysToGenerate = posts.length;
        }

        // Generate DALL-E images (unchanged logic)
        const generateImage = body.generateImages !== false;
        if (generateImage) {
            const imagePromises = posts.map(async (post: { imagePrompt?: string }) => {
                if (!post.imagePrompt) return null;
                try {
                    const imgResponse = await client.images.generate({
                        model: "dall-e-3",
                        prompt: `Professional high-end advertising photography for Instagram. ${post.imagePrompt}. 
Style: Award-winning product photography, Adobe Photoshop composite, ultra-realistic, 8k resolution, cinematic lighting, commercial look. 
NO TEXT, NO LOGOS. Clean, modern, premium aesthetic suitable for a top-tier brand.`,
                        n: 1,
                        size: "1024x1024",
                        quality: "hd", // Upgrade to HD for better details
                    });
                    const tempUrl = imgResponse.data?.[0]?.url;

                    if (tempUrl) {
                        const permanentUrl = await uploadImageFromUrl(tempUrl, "autopilot");
                        return permanentUrl; // NEVER fall back to tempUrl, it expires!
                    }
                    return null;
                } catch {
                    return null;
                }
            });

            const imageUrls = await Promise.all(imagePromises);
            posts.forEach((post: { imageUrl?: string | null }, i: number) => {
                post.imageUrl = imageUrls[i] || null;
            });
        }

        // SEQUENTIAL SCHEDULING (Fixes "Missing Days" and "Past Days")
        // We ignore 'dayOfWeek' from AI and assign strictly by index
        const logEntries = posts.map((post: {
            type?: string;
            platform?: string;
            caption?: string;
            bestTime?: string;
            imageUrl?: string | null;
            hashtags?: string[];
            imagePrompt?: string;
        }, index: number) => {
            const scheduledDate = new Date(startDate);
            scheduledDate.setDate(startDate.getDate() + index);

            // Parse bestTime
            const timeParts = (post.bestTime || "12:00").split(":");
            scheduledDate.setHours(parseInt(timeParts[0]) || 12, parseInt(timeParts[1]) || 0);

            // Backfill dayOfWeek for UI consistency if needed
            const dayName = scheduledDate.toLocaleDateString('en-US', { weekday: 'long' });

            return {
                user_id: authResult.userId,
                brand_id: brand.id,
                type: post.type || "post",
                platform: post.platform || "instagram",
                content: post.caption || "",
                status: "draft",
                scheduled_at: scheduledDate.toISOString(),
                output: {
                    ...post,
                    dayOfWeek: dayName.toLowerCase() // Ensure UI sees correct day
                },
            };
        });

        if (logEntries.length > 0) {
            await supabase.from("autopilot_logs").insert(logEntries);
        }

        return NextResponse.json({
            success: true,
            posts: posts.length,
            result,
            weekStart: startDate.toISOString(),
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Execution failed.";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
