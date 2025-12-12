import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log environment for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  // Validate environment variables
  if (!supabaseUrl) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  if (!supabaseAnonKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
  console.log('Supabase Configuration:', {
    url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET',
    hasAnonKey: !!supabaseAnonKey
  });
}

export const supabase = (globalThis as any).supabase ?? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'x-client-info': 'eduai-platform',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).supabase = supabase;
}

// Admin client with service role key for server-side operations ONLY
// This should only be used in API routes, not in client components
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Only create admin client if we have a service role key (server-side only)
// Otherwise fallback to the main instance to avoid duplicate GoTrue instances on the client
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase;
