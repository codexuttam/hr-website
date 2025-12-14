-- CLEANUP SCRIPT: Remove all duplicate policies and apply a clean set

-- 1. CLEANUP: Drop ALL known variations of policies on the 'users' table
DROP POLICY IF EXISTS "Allow admin read users" ON public.users;
DROP POLICY IF EXISTS "Allow read users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view profile by email" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

-- 2. APPLY: Fresh, correct policies for 'users'
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = user_uid);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = user_uid);

-- Allow users to insert their own profile (Critical for registration)
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = user_uid);


-- 3. ENSURE: Policies for 'drive_applications' (Required for "Register for Drive")
ALTER TABLE public.drive_applications ENABLE ROW LEVEL SECURITY;

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

-- 4. ENSURE: Public read for 'placement_drives'
ALTER TABLE public.placement_drives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON public.placement_drives;
CREATE POLICY "Public read access" ON public.placement_drives
    FOR SELECT USING (true);
