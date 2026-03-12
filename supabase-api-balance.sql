-- API dollar-balance tables
-- Run this after supabase-api-keys.sql

create extension if not exists pgcrypto;

create table if not exists api_balances (
    user_id text primary key,
    balance_cents integer not null default 0,
    updated_at timestamptz not null default now()
);

create table if not exists api_balance_transactions (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    api_key_id uuid,
    amount_cents integer not null,
    direction text not null check (direction in ('credit', 'debit')),
    reason text not null,
    metadata jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_api_balance_tx_user on api_balance_transactions(user_id, created_at desc);
create index if not exists idx_api_balance_tx_key on api_balance_transactions(api_key_id, created_at desc);

alter table api_balances disable row level security;
alter table api_balance_transactions disable row level security;
