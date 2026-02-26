import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
    const results: Record<string, any> = {};

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

    // Test 1: Try with the current ANON KEY  
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    results.test_anon_key = { key_preview: anonKey ? anonKey.substring(0, 20) + "..." : "NOT SET" };

    if (url && anonKey) {
        try {
            const client1 = createClient(url, anonKey);
            const { data, error } = await client1.from("user_subscriptions").select("*").limit(1);
            results.test_anon_key.success = !error;
            results.test_anon_key.error = error?.message || null;
            results.test_anon_key.data = data;
        } catch (e: any) {
            results.test_anon_key.error = e.message;
        }
    }

    // Test 2: Try with SUPABASE_SERVICE_ROLE_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    results.test_service_key = { key_preview: serviceKey ? serviceKey.substring(0, 20) + "..." : "NOT SET" };

    if (url && serviceKey) {
        try {
            const client2 = createClient(url, serviceKey);
            const { data, error } = await client2.from("user_subscriptions").select("*").limit(1);
            results.test_service_key.success = !error;
            results.test_service_key.error = error?.message || null;
            results.test_service_key.data = data;
        } catch (e: any) {
            results.test_service_key.error = e.message;
        }
    }

    // Test 3: Try with a PUBLISHABLE key if set
    const pubKey = process.env.SUPABASE_PUBLISHABLE_KEY || "";
    results.test_publishable_key = { key_preview: pubKey ? pubKey.substring(0, 20) + "..." : "NOT SET" };

    if (url && pubKey) {
        try {
            const client3 = createClient(url, pubKey);
            const { data, error } = await client3.from("user_subscriptions").select("*").limit(1);
            results.test_publishable_key.success = !error;
            results.test_publishable_key.error = error?.message || null;
            results.test_publishable_key.data = data;
        } catch (e: any) {
            results.test_publishable_key.error = e.message;
        }
    }

    results.url_preview = url ? url.substring(0, 35) + "..." : "NOT SET";
    results.supabase_js_note = "Testing which key format works with @supabase/supabase-js v2.95.3";

    return NextResponse.json(results, { status: 200 });
}
