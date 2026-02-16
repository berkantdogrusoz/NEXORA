import { NextResponse } from "next/server";
import { getAllCampaigns, createCampaign } from "@/lib/campaigns-store";
import { getAuthUserId, sanitizeInput } from "@/lib/auth";

export async function GET() {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const campaigns = await getAllCampaigns(authResult.userId);
        return NextResponse.json(campaigns);
    } catch {
        return NextResponse.json({ error: "Failed to load campaigns." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        const productName = sanitizeInput(body.productName, 200);
        const productDescription = sanitizeInput(body.productDescription, 2000);
        const targetAudience = sanitizeInput(body.targetAudience, 500);
        const tone = sanitizeInput(body.tone, 50) || "professional";
        const platform = body.platform;

        if (productName.length < 2) {
            return NextResponse.json({ error: "Product name required (min 2 chars)." }, { status: 400 });
        }
        if (productDescription.length < 10) {
            return NextResponse.json({ error: "Description required (min 10 chars)." }, { status: 400 });
        }
        if (!targetAudience) {
            return NextResponse.json({ error: "Target audience required." }, { status: 400 });
        }
        if (!["instagram", "google-ads"].includes(platform)) {
            return NextResponse.json({ error: "Platform must be 'instagram' or 'google-ads'." }, { status: 400 });
        }

        const campaign = await createCampaign(authResult.userId, {
            productName,
            productDescription,
            targetAudience,
            platform,
            tone,
        });

        return NextResponse.json(campaign, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create campaign." }, { status: 500 });
    }
}
