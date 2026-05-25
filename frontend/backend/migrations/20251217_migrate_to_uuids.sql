-- Migration script to move from Integer User IDs to UUIDs (Supabase Auth compatible)

-- 1. Create Profiles Table (The new source of truth linked to Auth)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  role text default 'student',
  credits integer default 10,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. Migrate existing users to profiles
-- We assume public.users has 'user_uid' (uuid string) and 'email'
insert into public.profiles (id, email, full_name, role, credits, created_at)
select 
  u.user_uid::uuid, 
  u.email, 
  u.name, 
  u.role, 
  u.credits,
  u.created_at
from public.users u
where u.user_uid is not null
on conflict (id) do nothing;

-- 3. Add UUID FK columns to dependent tables
alter table public.resumes add column if not exists user_id_uuid uuid references public.profiles(id);
alter table public.quiz_assignments add column if not exists user_id_uuid uuid references public.profiles(id);
alter table public.mock_interviews add column if not exists student_id_uuid uuid references public.profiles(id);
alter table public.drive_applications add column if not exists user_id_uuid uuid references public.profiles(id);

-- 4. Populate new UUID columns by mapping through the old public.users table
update public.resumes r
set user_id_uuid = u.user_uid::uuid
from public.users u
where r.user_id = u.user_id and r.user_id_uuid is null;

update public.quiz_assignments qa
set user_id_uuid = u.user_uid::uuid
from public.users u
where qa.user_id = u.user_id and qa.user_id_uuid is null;

update public.mock_interviews mi
set student_id_uuid = u.user_uid::uuid
from public.users u
where mi.student_id = u.user_id and mi.student_id_uuid is null;

update public.drive_applications da
set user_id_uuid = u.user_uid::uuid
from public.users u
where da.user_id = u.user_id and da.user_id_uuid is null;
