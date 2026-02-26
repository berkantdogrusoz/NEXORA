import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (used in API routes)
export function createSupabaseServer() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    // IMPORTANT: Only use JWT-format keys (eyJhbGci...). 
    // The new sb_secret_/sb_publishable_ format is NOT compatible with @supabase/supabase-js
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || url === "https://placeholder.supabase.co") {
        console.error("CRITICAL: NEXT_PUBLIC_SUPABASE_URL is not set!");
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || key === "placeholder") {
        console.error("CRITICAL: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set!");
    }

    return createClient(url, key);
}

// Singleton instance for convenience — do NOT use at module level in serverless
// because NEXT_PUBLIC_ vars get inlined at build time. Always call createSupabaseServer() instead.
export const supabase = createSupabaseServer();

