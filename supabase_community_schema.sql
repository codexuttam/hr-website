-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.community_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  user_name text NOT NULL,
  user_avatar text,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  status character varying DEFAULT 'open'::character varying
    CHECK (status IN ('open', 'resolved')),
  tags text[],
  CONSTRAINT community_posts_pkey PRIMARY KEY (id)
);

CREATE TABLE public.community_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id text,
  user_name text NOT NULL,
  user_avatar text,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  source character varying DEFAULT 'web'::character varying
    CHECK (source IN ('web', 'whatsapp')),
  is_alumni boolean DEFAULT false,
  CONSTRAINT community_replies_pkey PRIMARY KEY (id),
  CONSTRAINT community_replies_post_id_fkey FOREIGN KEY (post_id)
    REFERENCES public.community_posts(id)
    ON DELETE CASCADE
);

-- Enable Row Level Security (RLS) - informational only
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;

-- Policies (for reference only)
-- CREATE POLICY "Public posts are viewable by everyone" ON public.community_posts FOR SELECT USING (true);
-- CREATE POLICY "Public replies are viewable by everyone" ON public.community_replies FOR SELECT USING (true);
-- CREATE POLICY "Anyone can insert posts" ON public.community_posts FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Anyone can insert replies" ON public.community_replies FOR INSERT WITH CHECK (true);
