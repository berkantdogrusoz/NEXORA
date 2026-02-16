// Quick setup script to create Supabase tables
// Run: node scripts/setup-db.mjs

const SUPABASE_URL = "https://gdmzvxlsmzkihshbyyjz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbXp2eGxzbXpraWhzaGJ5eWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMjU0MDksImV4cCI6MjA4NjcwMTQwOX0.Dr13oDrLFulp6YAtZ650st0efoESc18ymZNtF_gj2mM";

async function checkTable(name) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${name}?select=id&limit=1`, {
        headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
    });
    const status = res.status;
    const text = await res.text();
    if (status === 200) {
        console.log(`  ✅ ${name} — exists`);
        return true;
    } else {
        console.log(`  ❌ ${name} — NOT FOUND (${status}: ${text.slice(0, 100)})`);
        return false;
    }
}

async function main() {
    console.log("🔍 Checking Supabase tables...\n");

    const tables = ["agents", "campaigns", "campaign_contents", "generations"];
    let allOk = true;

    for (const t of tables) {
        const ok = await checkTable(t);
        if (!ok) allOk = false;
    }

    console.log("");
    if (allOk) {
        console.log("✅ All tables exist! You're good to go.");
    } else {
        console.log("⚠️  Some tables are missing!");
        console.log("   Go to: Supabase Dashboard → SQL Editor");
        console.log("   Paste the contents of supabase-schema.sql");
        console.log("   Click 'Run'");
    }
}

main().catch(console.error);
