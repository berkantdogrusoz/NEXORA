import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const authResult = await getAuthUserId();
        if ("error" in authResult) return authResult.error;

        // Fetch brands
        const { data: brands } = await supabase
            .from("autopilot_brands")
            .select("*")
            .eq("user_id", authResult.userId);

        // Fetch this week's posts
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(now);
        monday.setDate(now.getDate() + daysToMonday);
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 7);

        const { data: weekPosts } = await supabase
            .from("autopilot_logs")
            .select("*")
            .eq("user_id", authResult.userId)
            .gte("scheduled_at", monday.toISOString())
            .lt("scheduled_at", sunday.toISOString())
            .order("scheduled_at", { ascending: true });

        // Fetch total posts ever
        const { count: totalPosts } = await supabase
            .from("autopilot_logs")
            .select("*", { count: "exact", head: true })
            .eq("user_id", authResult.userId);

        // Fetch recent activity (last 5)
        const { data: recentActivity } = await supabase
            .from("autopilot_logs")
            .select("id, type, platform, content, status, created_at, output")
            .eq("user_id", authResult.userId)
            .order("created_at", { ascending: false })
            .limit(5);

        // Fetch assistant message count today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: todayMessages } = await supabase
            .from("assistant_messages")
            .select("*", { count: "exact", head: true })
            .eq("user_id", authResult.userId)
            .eq("role", "user")
            .gte("created_at", today.toISOString());

        const posts = weekPosts || [];
        const stats = {
            totalBrands: (brands || []).length,
            totalPosts: totalPosts || 0,
            weekPosts: posts.length,
            weekApproved: posts.filter(p => p.status === "approved").length,
            weekPosted: posts.filter(p => p.status === "posted").length,
            weekDraft: posts.filter(p => p.status === "draft").length,
            todayMessages: todayMessages || 0,
        };

        return NextResponse.json({
            stats,
            brands: brands || [],
            recentActivity: recentActivity || [],
        });
    } catch {
        return NextResponse.json({
            stats: { totalBrands: 0, totalPosts: 0, weekPosts: 0, weekApproved: 0, weekPosted: 0, weekDraft: 0, todayMessages: 0 },
            brands: [],
            recentActivity: [],
        });
    }
}
