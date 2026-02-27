-- Nexora MVP Schema — Instagram Auto-Poster
-- Run this in Supabase SQL Editor (replaces previous schema)

-- ═══════════════════════════════════════
-- AUTOPILOT TABLES
-- ═══════════════════════════════════════

create table if not exists autopilot_brands (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    name text not null,
    niche text not null default '',
    audience text not null default '',
    tone text not null default 'professional',
    platforms jsonb not null default '["instagram"]',
    schedule jsonb not null default '{"postsPerWeek": 7, "preferredTimes": ["09:00","12:00","18:00"]}',
    status text not null default 'setup',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists autopilot_logs (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    brand_id uuid references autopilot_brands(id) on delete cascade,
    type text not null default 'post',
    platform text not null default 'instagram',
    content text not null default '',
    status text not null default 'draft',
    scheduled_at timestamptz,
    posted_at timestamptz,
    output jsonb,
    created_at timestamptz not null default now()
);

-- Add scheduled_at and posted_at if table already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'autopilot_logs' AND column_name = 'scheduled_at') THEN
        ALTER TABLE autopilot_logs ADD COLUMN scheduled_at timestamptz;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'autopilot_logs' AND column_name = 'posted_at') THEN
        ALTER TABLE autopilot_logs ADD COLUMN posted_at timestamptz;
    END IF;
END
$$;

-- ═══════════════════════════════════════
-- CONNECTIONS TABLES
-- ═══════════════════════════════════════

create table if not exists social_connections (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    platform text not null,
    account_name text not null,
    account_url text default '',
    status text not null default 'connected',
    access_token text,
    refresh_token text,
    token_expires_at timestamptz,
    metrics jsonb default '{}',
    created_at timestamptz not null default now()
);

create table if not exists store_integrations (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    platform text not null,
    store_name text not null,
    store_url text default '',
    status text not null default 'connected',
    products integer default 0,
    created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════
-- AI ASSISTANT CONVERSATIONS
-- ═══════════════════════════════════════

create table if not exists assistant_messages (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    role text not null default 'user',
    content text not null,
    created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════
-- GENERATION HISTORY
-- ═══════════════════════════════════════

create table if not exists generations (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    type text not null default 'video',
    prompt text not null default '',
    model text not null default '',
    output_url text not null,
    created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════

create index if not exists idx_autopilot_brands_user on autopilot_brands(user_id);
create index if not exists idx_autopilot_logs_user on autopilot_logs(user_id);
create index if not exists idx_autopilot_logs_brand on autopilot_logs(brand_id);
create index if not exists idx_autopilot_logs_scheduled on autopilot_logs(scheduled_at);
create index if not exists idx_social_connections_user on social_connections(user_id);
create index if not exists idx_store_integrations_user on store_integrations(user_id);
create index if not exists idx_assistant_messages_user on assistant_messages(user_id);
create index if not exists idx_generations_user on generations(user_id);
create index if not exists idx_generations_type on generations(user_id, type);

-- ═══════════════════════════════════════
-- DISABLE RLS
-- ═══════════════════════════════════════

alter table autopilot_brands disable row level security;
alter table autopilot_logs disable row level security;
alter table social_connections disable row level security;
alter table store_integrations disable row level security;
alter table assistant_messages disable row level security;
alter table generations disable row level security;
