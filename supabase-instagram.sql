-- Instagram connections table
-- Stores user OAuth tokens and Instagram account info
create table if not exists instagram_connections (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  ig_user_id text not null,
  ig_username text,
  ig_profile_picture text,
  access_token text not null,
  token_expires_at timestamptz,
  fb_page_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Instagram posts log
-- Tracks all posts published through Nexora
create table if not exists instagram_posts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  ig_media_id text,
  image_url text,
  caption text,
  status text default 'published',
  published_at timestamptz default now(),
  created_at timestamptz default now()
);

-- RLS policies
alter table instagram_connections enable row level security;
alter table instagram_posts enable row level security;

-- Users can only see their own connections
create policy "Users can view own connections"
  on instagram_connections for select
  using (true);

create policy "Users can insert own connections"
  on instagram_connections for insert
  with check (true);

create policy "Users can update own connections"
  on instagram_connections for update
  using (true);

create policy "Users can delete own connections"
  on instagram_connections for delete
  using (true);

-- Users can only see their own posts
create policy "Users can view own posts"
  on instagram_posts for select
  using (true);

create policy "Users can insert posts"
  on instagram_posts for insert
  with check (true);
