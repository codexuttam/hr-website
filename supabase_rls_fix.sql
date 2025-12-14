-- Run this in your Supabase SQL Editor to fix permission & logout issues

-- 1. Enable RLS on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drive_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_drives ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to read/update their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = user_uid);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = user_uid);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = user_uid);

-- 3. Allow users to read/create their own drive applications
-- Note: checks if the application's user_id matches the user's profile
DROP POLICY IF EXISTS "Users can view own applications" ON public.drive_applications;
CREATE POLICY "Users can view own applications" ON public.drive_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.user_id = drive_applications.user_id 
            AND users.user_uid = auth.uid()::text
        )
    );

DROP POLICY IF EXISTS "Users can create applications" ON public.drive_applications;
CREATE POLICY "Users can create applications" ON public.drive_applications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.user_id = drive_applications.user_id 
            AND users.user_uid = auth.uid()::text
        )
    );

-- 4. Allow public read access to placement drives
DROP POLICY IF EXISTS "Public read access" ON public.placement_drives;
CREATE POLICY "Public read access" ON public.placement_drives
    FOR SELECT USING (true);

-- 5. (Optional) Allow admins to view everything
-- CREATE POLICY "Admins can view all" ON public.users FOR ALL USING (
--   EXISTS (SELECT 1 FROM public.users WHERE user_uid = auth.uid()::text AND role = 'admin')
-- );
