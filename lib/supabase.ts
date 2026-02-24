import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (used in API routes)
export function createSupabaseServer() {
    // Next.js can sometimes aggressively inline NEXT_PUBLIC vars at build time. 
    // To ensure we get the latest Vercel runtime env vars, we check them dynamically.
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

    // DO NOT use placeholder in production if we can avoid it. If it throws fetch failed, it's better to log the exact missing var.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.error("CRITICAL: NEXT_PUBLIC_SUPABASE_URL is not set in process.env!");
    }

    return createClient(url, key);
}

// Singleton instance for convenience
export const supabase = createSupabaseServer();

