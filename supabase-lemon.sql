-- Add user_subscriptions table for Lemon Squeezy

create table if not exists user_subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    lemon_customer_id text,
    lemon_subscription_id text,
    lemon_variant_id text,
    status text not null default 'inactive', -- active, past_due, unpaid, cancelled, expired, on_trial
    plan_name text not null default 'Starter', -- Starter, Growth, Pro
    renews_at timestamptz,
    ends_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Index for fast lookups
create index if not exists idx_user_subscriptions_user on user_subscriptions(user_id);
create index if not exists idx_user_subscriptions_lemon on user_subscriptions(lemon_subscription_id);

-- Disable RLS
alter table user_subscriptions disable row level security;
