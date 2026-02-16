import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (used in API routes)
export function createSupabaseServer() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!url || !key) {
        throw new Error("Missing Supabase env vars. Check .env.local");
    }

    return createClient(url, key);
}

// Singleton instance for convenience
export const supabase = createSupabaseServer();

