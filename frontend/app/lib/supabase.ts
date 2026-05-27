import { createBrowserClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ─── Browser / Client-side ────────────────────────────────────────────────────

let _supabase: SupabaseClient | null = null;

/**
 * Returns a browser Supabase client (anon key).
 * Returns null (and logs a warning) if env vars are missing instead of throwing,
 * so the AuthErrorBoundary is never triggered by a missing config.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — auth will not work.');
    return null;
  }

  _supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

/**
 * Backward-compatible named export — all existing `import { supabase }` imports still work.
 * Uses a Proxy so the client is only created on first property access (runtime, not build time).
 * If keys are missing, operations will no-op gracefully rather than throwing.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      // Return a no-op function for any method call so the UI degrades gracefully
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
          signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
          signOut: async () => ({ error: null }),
        };
      }
      return () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } });
    }
    const value = (client as unknown as Record<string | symbol, unknown>)[prop as string | symbol];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

// ─── Server-side Admin client (service role key) ──────────────────────────────

/**
 * Creates a new Supabase admin client using the service role key.
 * Call this INSIDE your API route handler, never at the top of the module.
 */
export function createSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseServiceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

let _supabaseAdmin: SupabaseClient | null = null;
function getCachedSupabaseAdmin() {
  if (_supabaseAdmin) return _supabaseAdmin;
  _supabaseAdmin = createSupabaseAdmin();
  return _supabaseAdmin;
}

/**
 * Backward-compatible named export — all existing `import { supabaseAdmin }` imports still work.
 * Admin client is only instantiated on first property access (runtime, inside API handlers).
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getCachedSupabaseAdmin();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop as string | symbol];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
