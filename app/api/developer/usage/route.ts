import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase";

export async function GET() {
    try {
        const auth = await getAuthUserId();
        if ("error" in auth) return auth.error;

        const supabase = createSupabaseServer();

        const now = new Date();
        const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

        const { data: rows, error } = await supabase
            .from("api_requests")
            .select("endpoint, status_code, latency_ms, cost_credits, created_at")
            .eq("user_id", auth.userId)
            .gte("created_at", monthStart)
            .order("created_at", { ascending: false })
            .limit(5000);

        if (error) {
            return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
        }

        const totalRequests = rows?.length || 0;
        const successRequests = (rows || []).filter((r) => Number(r.status_code) < 400).length;
        const totalCredits = (rows || []).reduce((sum, r) => sum + Number(r.cost_credits || 0), 0);
        const avgLatency = totalRequests
            ? Math.round((rows || []).reduce((sum, r) => sum + Number(r.latency_ms || 0), 0) / totalRequests)
            : 0;

        const byEndpoint: Record<string, { requests: number; credits: number }> = {};
        for (const row of rows || []) {
            const endpoint = row.endpoint || "unknown";
            if (!byEndpoint[endpoint]) byEndpoint[endpoint] = { requests: 0, credits: 0 };
            byEndpoint[endpoint].requests += 1;
            byEndpoint[endpoint].credits += Number(row.cost_credits || 0);
        }

        return NextResponse.json({
            summary: {
                totalRequests,
                successRequests,
                failedRequests: totalRequests - successRequests,
                totalCredits,
                avgLatency,
                monthStart,
            },
            byEndpoint,
            recent: (rows || []).slice(0, 40),
        });
    } catch {
        return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
    }
}
