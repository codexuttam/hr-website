-- Add credits column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 50;

-- Optional: Create a log table for credit usage history
CREATE TABLE IF NOT EXISTS public.credit_logs (
  log_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.users(user_id),
  amount INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
