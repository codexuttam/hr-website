-- Migration to add Parent Role and Parent-Student Links

-- 1. Ensure 'parent' is a valid role (If using check constraint, which we likely aren't based on previous SQL, but good to note)
-- ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
-- ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'teacher', 'admin', 'parent'));

-- 2. Create Parent-Student Links Table
create table if not exists public.parent_student_links (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(parent_id, student_id)
);

-- 3. Enable RLS
alter table public.parent_student_links enable row level security;

-- 4. RLS Policies

-- IDs matching the parent can view/manage their links
create policy "Parents can view their student links"
  on public.parent_student_links for select
  using ( auth.uid() = parent_id );

create policy "Parents can create student links"
  on public.parent_student_links for insert
  with check ( auth.uid() = parent_id );

create policy "Parents can delete their student links"
  on public.parent_student_links for delete
  using ( auth.uid() = parent_id );

-- Students can see who is their parent (optional, but good for transparency)
create policy "Students can view their parent links"
  on public.parent_student_links for select
  using ( auth.uid() = student_id );

-- Admins can view/manage all
-- Assuming we might have an admin check function later, for now let's skip complex admin policies
-- or add a simple one if we knew how admins are identified in RLS (usually auth.jwt() -> role)

-- 5. Helper function to get linked students for a parent (Optional but useful)
create or replace function get_linked_students(p_id uuid)
returns setof public.profiles
language sql
security definer
as $$
  select p.*
  from public.profiles p
  join public.parent_student_links psl on p.id = psl.student_id
  where psl.parent_id = p_id;
$$;
