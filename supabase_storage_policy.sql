-- Enable RLS on the "objects" table (required for policies to work)
alter table storage.objects enable row level security;

-- Create the bucket if it doesn't exist (idempotent-ish)
insert into storage.buckets (id, name, public)
values ('instagram-images', 'instagram-images', true)
on conflict (id) do nothing;

-- POLICY 1: Allow public read access (SELECT) to instagram-images bucket
-- This enables users (and your app) to view the images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'instagram-images' );

-- POLICY 2: Allow public upload access (INSERT) to instagram-images bucket
-- This allows the app (authenticated or anon) to upload generated images
create policy "Public Upload"
on storage.objects for insert
with check ( bucket_id = 'instagram-images' );

-- POLICY 3: Allow public update access (UPDATE) - Optional, for overwriting
create policy "Public Update"
on storage.objects for update
using ( bucket_id = 'instagram-images' );
