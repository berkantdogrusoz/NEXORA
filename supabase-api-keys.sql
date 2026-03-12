-- Developer API tables for Nexora
-- Run in Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists api_keys (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    name text not null,
    key_prefix text not null,
    key_hash text not null,
    scopes text[] not null default '{image:generate,video:generate,director:generate}',
    monthly_quota integer,
    is_active boolean not null default true,
    last_used_at timestamptz,
    created_at timestamptz not null default now()
);

create unique index if not exists idx_api_keys_hash on api_keys(key_hash);
create index if not exists idx_api_keys_user on api_keys(user_id, created_at desc);
create index if not exists idx_api_keys_prefix on api_keys(key_prefix);

create table if not exists api_requests (
    id uuid primary key default gen_random_uuid(),
    api_key_id uuid references api_keys(id) on delete set null,
    user_id text not null,
    endpoint text not null,
    method text not null,
    status_code integer not null,
    latency_ms integer not null default 0,
    cost_credits integer not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists idx_api_requests_user on api_requests(user_id, created_at desc);
create index if not exists idx_api_requests_key on api_requests(api_key_id, created_at desc);
create index if not exists idx_api_requests_endpoint on api_requests(endpoint, created_at desc);

alter table api_keys disable row level security;
alter table api_requests disable row level security;
