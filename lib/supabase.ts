import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (used in API routes)
// IMPORTANT: This project has been migrated to Supabase's new API key format.
// The old JWT-format anon key (eyJhb...) is INVALID.
// We use the new sb_secret_ or sb_publishable_ keys instead.
export function createSupabaseServer() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";

    // Priority: service_role key > publishable key > anon key (legacy, likely invalid)
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
        || process.env.SUPABASE_PUBLISHABLE_KEY
        || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        || "placeholder";

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || url === "https://placeholder.supabase.co") {
        console.error("CRITICAL: NEXT_PUBLIC_SUPABASE_URL is not set!");
    }

    return createClient(url, key);
}

// Do NOT use this singleton in API routes — call createSupabaseServer() directly instead.
export const supabase = createSupabaseServer();

