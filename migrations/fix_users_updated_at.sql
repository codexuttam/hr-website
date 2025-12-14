-- Fix for "record new has no field updated_at" error
-- The users table has a trigger that tries to update 'updated_at', but the column is missing.

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- update existing rows
UPDATE public.users SET updated_at = NOW() WHERE updated_at IS NULL;
