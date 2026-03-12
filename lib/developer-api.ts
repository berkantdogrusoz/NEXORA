import crypto from "crypto";
import { createSupabaseServer } from "@/lib/supabase";

export type ApiScope = "image:generate" | "video:generate" | "director:generate";

export const DEFAULT_API_SCOPES: ApiScope[] = [
    "image:generate",
    "video:generate",
    "director:generate",
];

type ApiKeyRow = {
    id: string;
    user_id: string;
    name: string;
    key_prefix: string;
    key_hash: string;
    scopes: string[];
    monthly_quota: number | null;
    is_active: boolean;
    created_at: string;
    last_used_at: string | null;
};

function getKeySalt() {
    return process.env.API_KEY_SALT || process.env.INTERNAL_API_SECRET || "nexora-api-salt";
}

export function hashApiKey(rawKey: string) {
    return crypto.createHash("sha256").update(`${getKeySalt()}:${rawKey}`).digest("hex");
}

export function generateApiKey() {
    const raw = crypto.randomBytes(24).toString("hex");
    const token = `nx_live_${raw}`;
    const keyPrefix = token.slice(0, 14);
    const keyHash = hashApiKey(token);
    return { token, keyPrefix, keyHash };
}

export function parseApiKeyFromRequest(req: Request) {
    const xApiKey = req.headers.get("x-api-key")?.trim();
    if (xApiKey) return xApiKey;

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (authHeader?.toLowerCase().startsWith("bearer ")) {
        return authHeader.slice(7).trim();
    }

    return null;
}

export async function verifyApiKey(rawApiKey: string): Promise<ApiKeyRow | null> {
    if (!rawApiKey.startsWith("nx_live_")) return null;

    const supabase = createSupabaseServer();
    const keyPrefix = rawApiKey.slice(0, 14);
    const keyHash = hashApiKey(rawApiKey);

    const { data, error } = await supabase
        .from("api_keys")
        .select("id, user_id, name, key_prefix, key_hash, scopes, monthly_quota, is_active, created_at, last_used_at")
        .eq("key_prefix", keyPrefix)
        .eq("is_active", true)
        .limit(20);

    if (error || !data?.length) return null;

    const found = (data as ApiKeyRow[]).find((row) => row.key_hash === keyHash);
    return found || null;
}

export async function touchApiKeyUsage(apiKeyId: string) {
    const supabase = createSupabaseServer();
    await supabase
        .from("api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", apiKeyId);
}

export async function isMonthlyQuotaExceeded(apiKeyId: string, monthlyQuota: number | null | undefined) {
    if (!monthlyQuota || monthlyQuota <= 0) return false;

    const supabase = createSupabaseServer();
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

    const { count } = await supabase
        .from("api_requests")
        .select("id", { count: "exact", head: true })
        .eq("api_key_id", apiKeyId)
        .gte("created_at", monthStart);

    return Number(count || 0) >= monthlyQuota;
}

export async function logApiRequest(params: {
    apiKeyId: string;
    userId: string;
    endpoint: string;
    method: string;
    statusCode: number;
    latencyMs: number;
    costCredits?: number;
}) {
    const supabase = createSupabaseServer();
    await supabase.from("api_requests").insert({
        api_key_id: params.apiKeyId,
        user_id: params.userId,
        endpoint: params.endpoint,
        method: params.method,
        status_code: params.statusCode,
        latency_ms: params.latencyMs,
        cost_credits: params.costCredits ?? 0,
    });
}

export function hasScope(scopes: string[] | null | undefined, scope: ApiScope) {
    if (!scopes || !Array.isArray(scopes)) return false;
    return scopes.includes(scope);
}

export function estimateImageCost(model: string) {
    const costs: Record<string, number> = {
        "dall-e-2": 5,
        "flux-schnell": 8,
        "dall-e-3": 15,
        "nano-banana-2": 15,
    };
    return costs[model] ?? 10;
}

export function estimateVideoCost(model: string) {
    const costs: Record<string, number> = {
        "wan-2.1-turbo": 8,
        "kling-3": 15,
        "luma-ray-2": 25,
        "runway-gen-4.5": 45,
        "gwm-1": 35,
        "seedance-2": 50,
        "sora-2": 55,
    };
    return costs[model] ?? 20;
}

export function estimateDirectorCost(model: string) {
    const costs: Record<string, number> = {
        "dop-lite": 100,
        "dop-preview": 150,
        "dop-turbo": 200,
    };
    return costs[model] ?? 150;
}
