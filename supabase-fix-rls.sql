-- ═══════════════════════════════════════════════
-- NEXORA AI — Fix: Disable RLS 
-- (Auth is handled by Clerk at the API layer)
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Drop all existing RLS policies
drop policy if exists "Users see own agents" on agents;
drop policy if exists "Users insert own agents" on agents;
drop policy if exists "Users update own agents" on agents;
drop policy if exists "Users delete own agents" on agents;

drop policy if exists "Users see own campaigns" on campaigns;
drop policy if exists "Users insert own campaigns" on campaigns;
drop policy if exists "Users delete own campaigns" on campaigns;

drop policy if exists "Users see own campaign contents" on campaign_contents;
drop policy if exists "Users insert own campaign contents" on campaign_contents;

drop policy if exists "Users see own generations" on generations;
drop policy if exists "Users insert own generations" on generations;

-- Disable RLS on all tables
alter table agents disable row level security;
alter table campaigns disable row level security;
alter table campaign_contents disable row level security;
alter table generations disable row level security;
