-- ═══════════════════════════════════════════════
-- NEXORA AI — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── AGENTS TABLE ───
create table if not exists agents (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  name text not null,
  description text default '',
  system_prompt text not null,
  user_prompt_template text not null,
  output_schema text default '',
  built_in boolean default false,
  created_at timestamptz default now()
);

-- Index for user queries
create index if not exists idx_agents_user_id on agents(user_id);

-- ─── CAMPAIGNS TABLE ───
create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  product_name text not null,
  product_description text not null,
  target_audience text not null,
  platform text not null check (platform in ('instagram', 'google-ads')),
  tone text default 'professional',
  created_at timestamptz default now()
);

create index if not exists idx_campaigns_user_id on campaigns(user_id);

-- ─── CAMPAIGN CONTENTS TABLE ───
create table if not exists campaign_contents (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'google-ads')),
  output jsonb not null,
  generated_at timestamptz default now()
);

create index if not exists idx_campaign_contents_campaign_id on campaign_contents(campaign_id);

-- ─── GENERATIONS TABLE (track usage) ───
create table if not exists generations (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  mode text not null,
  idea text not null,
  result jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_generations_user_id on generations(user_id);

-- ─── ROW LEVEL SECURITY ───
alter table agents enable row level security;
alter table campaigns enable row level security;
alter table campaign_contents enable row level security;
alter table generations enable row level security;

-- Agents: users see only their own + built-in
create policy "Users see own agents" on agents
  for select using (user_id = current_setting('request.jwt.claims', true)::json->>'sub' or built_in = true);

create policy "Users insert own agents" on agents
  for insert with check (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users update own agents" on agents
  for update using (user_id = current_setting('request.jwt.claims', true)::json->>'sub' and built_in = false);

create policy "Users delete own agents" on agents
  for delete using (user_id = current_setting('request.jwt.claims', true)::json->>'sub' and built_in = false);

-- Campaigns: users see only their own
create policy "Users see own campaigns" on campaigns
  for select using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users insert own campaigns" on campaigns
  for insert with check (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users delete own campaigns" on campaigns
  for delete using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Campaign contents: cascade through campaign ownership
create policy "Users see own campaign contents" on campaign_contents
  for select using (
    exists (select 1 from campaigns where campaigns.id = campaign_contents.campaign_id
      and campaigns.user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  );

create policy "Users insert own campaign contents" on campaign_contents
  for insert with check (
    exists (select 1 from campaigns where campaigns.id = campaign_contents.campaign_id
      and campaigns.user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  );

-- Generations: users see only their own
create policy "Users see own generations" on generations
  for select using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users insert own generations" on generations
  for insert with check (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
