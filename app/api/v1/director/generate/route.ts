import { NextResponse } from "next/server";
import {
    estimateDirectorCost,
    hasScope,
    isMonthlyQuotaExceeded,
    logApiRequest,
    parseApiKeyFromRequest,
    touchApiKeyUsage,
    verifyApiKey,
} from "@/lib/developer-api";

export async function POST(req: Request) {
    const startedAt = Date.now();
    let apiKeyId = "";
    let userId = "";
    let estimatedCost = 0;

    try {
        const rawApiKey = parseApiKeyFromRequest(req);
        if (!rawApiKey) {
            return NextResponse.json({ error: "Missing API key" }, { status: 401 });
        }

        const keyRow = await verifyApiKey(rawApiKey);
        if (!keyRow) {
            return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
        }

        if (!hasScope(keyRow.scopes, "director:generate")) {
            return NextResponse.json({ error: "API key scope does not allow director generation" }, { status: 403 });
        }

        if (await isMonthlyQuotaExceeded(keyRow.id, keyRow.monthly_quota)) {
            return NextResponse.json({ error: "Monthly API quota exceeded for this key" }, { status: 429 });
        }

        if (!process.env.INTERNAL_API_SECRET) {
            return NextResponse.json({ error: "Server misconfiguration: INTERNAL_API_SECRET missing" }, { status: 500 });
        }

        apiKeyId = keyRow.id;
        userId = keyRow.user_id;
        await touchApiKeyUsage(apiKeyId);

        const body = await req.json();
        estimatedCost = estimateDirectorCost(String(body?.model || ""));

        const targetUrl = new URL("/api/video/director", req.url);
        const upstream = await fetch(targetUrl.toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-internal-user-id": userId,
                "x-internal-api-secret": process.env.INTERNAL_API_SECRET,
            },
            body: JSON.stringify(body),
        });

        const text = await upstream.text();
        let payload: unknown = {};
        try {
            payload = text ? JSON.parse(text) : {};
        } catch {
            payload = { raw: text };
        }

        await logApiRequest({
            apiKeyId,
            userId,
            endpoint: "/api/v1/director/generate",
            method: "POST",
            statusCode: upstream.status,
            latencyMs: Date.now() - startedAt,
            costCredits: upstream.ok ? estimatedCost : 0,
        });

        return NextResponse.json(payload, { status: upstream.status });
    } catch (error: any) {
        if (apiKeyId && userId) {
            await logApiRequest({
                apiKeyId,
                userId,
                endpoint: "/api/v1/director/generate",
                method: "POST",
                statusCode: 500,
                latencyMs: Date.now() - startedAt,
                costCredits: 0,
            });
        }
        return NextResponse.json({ error: error?.message || "Failed to generate director video" }, { status: 500 });
    }
}
