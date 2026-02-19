import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (used in API routes)
export function createSupabaseServer() {
    // During build, env vars might be missing. Use placeholders to prevent build failure.
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

    if ((!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && process.env.NODE_ENV !== "production") {
        console.warn("⚠️ Supabase env vars missing! Using placeholders.");
    }

    return createClient(url, key);
}

// Singleton instance for convenience
export const supabase = createSupabaseServer();

