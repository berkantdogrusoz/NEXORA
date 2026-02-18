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

        const postsToGenerate = body.count || brand.schedule?.postsPerWeek || 7;
        const userMessage = `Create a weekly Instagram content plan for:
Brand: ${brand.name}
Industry: ${brand.niche}
Target Audience: ${brand.audience}
Tone: ${brand.tone}

Generate ${postsToGenerate} Instagram posts, one for each day of the week. 
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

        const posts = result.posts || [];

        // Generate DALL-E images for each post (in parallel, max 3 at a time)
        const generateImage = body.generateImages !== false;
        if (generateImage) {
            const imagePromises = posts.map(async (post: { imagePrompt?: string }) => {
                if (!post.imagePrompt) return null;
                try {
                    const imgResponse = await client.images.generate({
                        model: "dall-e-3",
                        prompt: `Instagram post image: ${post.imagePrompt}. Style: modern, clean, visually striking, professional social media. Square 1080x1080.`,
                        n: 1,
                        size: "1024x1024",
                        quality: "standard",
                    });
                    const tempUrl = imgResponse.data?.[0]?.url;

                    if (tempUrl) {
                        // Upload to Supabase to make it permanent
                        const permanentUrl = await uploadImageFromUrl(tempUrl, "autopilot");
                        return permanentUrl || tempUrl;
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

        // Calculate post dates (Start from THIS Monday to be visible in current calendar week)
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

        const currentMonday = new Date(now);
        currentMonday.setDate(now.getDate() + daysToMonday);
        currentMonday.setHours(0, 0, 0, 0);

        const dayMap: Record<string, number> = {
            monday: 0, tuesday: 1, wednesday: 2, thursday: 3,
            friday: 4, saturday: 5, sunday: 6,
        };

        // Save each post as a log entry with scheduled date
        const logEntries = posts.map((post: {
            type?: string;
            platform?: string;
            caption?: string;
            dayOfWeek?: string;
            bestTime?: string;
            imageUrl?: string | null;
        }) => {
            const dayOffset = dayMap[post.dayOfWeek?.toLowerCase() || "monday"] || 0;
            const scheduledDate = new Date(currentMonday);
            scheduledDate.setDate(currentMonday.getDate() + dayOffset);

            // Parse bestTime like "09:00"
            const timeParts = (post.bestTime || "12:00").split(":");
            scheduledDate.setHours(parseInt(timeParts[0]) || 12, parseInt(timeParts[1]) || 0);

            return {
                user_id: authResult.userId,
                brand_id: brand.id,
                type: post.type || "post",
                platform: post.platform || "instagram",
                content: post.caption || "",
                status: "draft",
                scheduled_at: scheduledDate.toISOString(),
                output: post,
            };
        });

        if (logEntries.length > 0) {
            await supabase.from("autopilot_logs").insert(logEntries);
        }

        return NextResponse.json({
            success: true,
            posts: posts.length,
            result,
            weekStart: currentMonday.toISOString(),
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Execution failed.";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
