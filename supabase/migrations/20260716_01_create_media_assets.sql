-- =====================================================================
-- CLOUDINARY MEDIA ASSETS TABLE
-- Created: $(date +%Y%m%d_%H%M%S)
-- =====================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create media_assets table for tracking Cloudinary uploads
create table if not exists public.media_assets (
    id uuid primary key default uuid_generate_v4(),
    public_id text not null unique,
    resource_type text not null check (resource_type in ('image', 'video', 'raw')),
    format text not null,
    width integer,
    height integer,
    duration double precision,
    bytes bigint not null,
    secure_url text not null,
    folder text,
    tags text[],
    uploaded_by uuid references public.profiles(id) on delete set null,
    entity_type text, -- 'profile', 'submission', 'lesson', 'announcement', etc.
    entity_id uuid,
    is_private boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists idx_media_assets_entity on media_assets(entity_type, entity_id);
create index if not exists idx_media_assets_uploaded_by on media_assets(uploaded_by);
create index if not exists idx_media_assets_public_id on media_assets(public_id);
create index if not exists idx_media_assets_folder on media_assets(folder);
create index if not exists idx_media_assets_created_at on media_assets(created_at);

-- Enable Row Level Security (RLS)
alter table public.media_assets enable row level security;

-- =====================================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================================

-- Policy: Users can view non-private media or their own private media
create policy "Users can view media" on public.media_assets
    for select using (
        is_private = false or 
        uploaded_by = auth.uid() or
        exists (
            select 1 from public.profiles 
            where id = auth.uid() and role in ('admin', 'instructor')
        )
    );

-- Policy: Users can insert their own media
create policy "Users can upload media" on public.media_assets
    for insert with check (
        uploaded_by = auth.uid()
    );

-- Policy: Users can update their own media
create policy "Users can update their media" on public.media_assets
    for update using (uploaded_by = auth.uid())
    with check (uploaded_by = auth.uid());

-- Policy: Admins and instructors can delete any media
create policy "Admins can delete media" on public.media_assets
    for delete using (
        uploaded_by = auth.uid() or
        exists (
            select 1 from public.profiles 
            where id = auth.uid() and role in ('admin', 'instructor')
        )
    );

-- =====================================================================
-- TRIGGERS
-- =====================================================================

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
   new.updated_at = now();
   return new;
end;
$$ language 'plpgsql';

create trigger update_media_assets_updated_at
    before update on public.media_assets
    for each row
    execute procedure update_updated_at_column();

-- =====================================================================
-- COMMENTS
-- =====================================================================

comment on table public.media_assets is 'Stores metadata for media assets stored in Cloudinary';
comment on column public.media_assets.public_id is 'Cloudinary public ID for the asset';
comment on column public.media_assets.resource_type is 'Type of resource: image, video, or raw';
comment on column public.media_assets.secure_url is 'Secure URL to access the asset on Cloudinary';
comment on column public.media_assets.is_private is 'Whether the asset requires authentication to access';
comment on column public.media_assets.entity_type is 'Type of entity this media belongs to (profile, submission, etc.)';
comment on column public.media_assets.entity_id is 'ID of the entity this media belongs to';