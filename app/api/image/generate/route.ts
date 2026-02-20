import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

export const maxDuration = 60;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { prompt, size = "1024x1024" } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        // Validate size
        const validSizes = ["1024x1024", "1792x1024", "1024x1792"];
        const finalSize = validSizes.includes(size) ? size : "1024x1024";

        const response = await client.images.generate({
            model: "dall-e-3",
            prompt,
            n: 1,
            size: finalSize as "1024x1024" | "1792x1024" | "1024x1792",
            quality: "hd",
        });

        const imageUrl = response.data[0]?.url;

        if (!imageUrl) {
            return NextResponse.json(
                { error: "No image generated" },
                { status: 500 }
            );
        }

        // Upload to Supabase for permanent storage
        try {
            const { uploadImageFromUrl } = await import("@/lib/storage");
            const permanentUrl = await uploadImageFromUrl(imageUrl);
            return NextResponse.json({ imageUrl: permanentUrl });
        } catch {
            // Fallback to OpenAI URL if storage fails
            return NextResponse.json({ imageUrl });
        }
    } catch (error: any) {
        console.error("Image generation error:", error);

        if (error?.code === "billing_hard_limit_reached") {
            return NextResponse.json(
                { error: "API billing limit reached. Please check your OpenAI account." },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: error?.message || "Failed to generate image" },
            { status: 500 }
        );
    }
}
