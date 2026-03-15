import { NextResponse } from "next/server";
import {
    addApiBalanceCents,
    deductApiBalanceCents,
    estimateVideoCost,
    hasScope,
    isMonthlyQuotaExceeded,
    logApiRequest,
    parseApiKeyFromRequest,
    touchApiKeyUsage,
    verifyApiKey,
} from "@/lib/developer-api";

const SUPPORTED_VIDEO_MODELS = ["kling-3", "google-veo-3", "seedance-2", "sora-2"] as const;

export async function POST(req: Request) {
    const startedAt = Date.now();
    let apiKeyId = "";
    let userId = "";
    let estimatedCostCents = 0;
    let balanceDebited = false;

    try {
        const rawApiKey = parseApiKeyFromRequest(req);
        if (!rawApiKey) {
            return NextResponse.json({ error: "Missing API key" }, { status: 401 });
        }

        const keyRow = await verifyApiKey(rawApiKey);
        if (!keyRow) {
            return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
        }

        if (!hasScope(keyRow.scopes, "video:generate")) {
            return NextResponse.json({ error: "API key scope does not allow video generation" }, { status: 403 });
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
        const model = String(body?.model || "");

        if (!SUPPORTED_VIDEO_MODELS.includes(model as any)) {
            return NextResponse.json({
                error: `Unsupported video model: ${model || "(empty)"}`,
                supportedModels: SUPPORTED_VIDEO_MODELS,
            }, { status: 400 });
        }

        estimatedCostCents = estimateVideoCost(model);

        const debit = await deductApiBalanceCents({
            userId,
            amountCents: estimatedCostCents,
            reason: "api_v1_video_generate",
            apiKeyId,
            metadata: { model: body?.model || null },
        });

        if (!debit.ok) {
            return NextResponse.json(
                {
                    error: "Insufficient API balance. Please top up your API wallet.",
                    balanceUsd: Number((debit.balanceCents / 100).toFixed(2)),
                    requiredUsd: Number((estimatedCostCents / 100).toFixed(2)),
                },
                { status: 402 }
            );
        }
        balanceDebited = true;

        const targetUrl = new URL("/api/video/generate", req.url);
        const upstream = await fetch(targetUrl.toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-internal-user-id": userId,
                "x-internal-api-secret": process.env.INTERNAL_API_SECRET,
                "x-api-billing-mode": "usd",
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
            endpoint: "/api/v1/video/generate",
            method: "POST",
            statusCode: upstream.status,
            latencyMs: Date.now() - startedAt,
            costCredits: upstream.ok ? estimatedCostCents : 0,
        });

        if (!upstream.ok && balanceDebited) {
            await addApiBalanceCents({
                userId,
                amountCents: estimatedCostCents,
                reason: "api_v1_video_refund",
                apiKeyId,
                metadata: { statusCode: upstream.status },
            });
            balanceDebited = false;
        }

        return NextResponse.json(payload, { status: upstream.status });
    } catch (error: any) {
        if (balanceDebited && userId) {
            await addApiBalanceCents({
                userId,
                amountCents: estimatedCostCents,
                reason: "api_v1_video_refund_exception",
                apiKeyId: apiKeyId || null,
            });
        }

        if (apiKeyId && userId) {
            await logApiRequest({
                apiKeyId,
                userId,
                endpoint: "/api/v1/video/generate",
                method: "POST",
                statusCode: 500,
                latencyMs: Date.now() - startedAt,
                costCredits: 0,
            });
        }
        return NextResponse.json({ error: error?.message || "Failed to generate video" }, { status: 500 });
    }
}
