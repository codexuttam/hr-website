import { createBrowserClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ─── Browser / Client-side ────────────────────────────────────────────────────
// createBrowserClient is safe to call in a browser context at module level,
// but to avoid any module-level side effects during Next.js SSR/build, we
// lazily initialise it on first access via a getter.

let _supabase: SupabaseClient | null = null;

/**
 * Returns a browser Supabase client (anon key).
 * Safe for use in Client Components.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');

    _supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

/**
 * Backward-compatible named export — routes that `import { supabase }` still work.
 * Uses a Proxy so the client is only created on first property access (i.e. at runtime,
 * never during the Next.js build's static import analysis phase).
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as unknown as Record<string | symbol, unknown>)[prop as string | symbol];
  },
});

// ─── Server-side Admin client (service role key) ──────────────────────────────
// Never initialised at module level — always created fresh inside API handlers.

/**
 * Creates a new Supabase admin client using the service role key.
 * Call this INSIDE your API route handler, never at the top of the module.
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   const supabase = createSupabaseAdmin();
 *   ...
 * }
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

/**
 * Backward-compatible named export — routes that `import { supabaseAdmin }` still work.
 * Uses a Proxy so the admin client is only instantiated on first property access (runtime).
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (createSupabaseAdmin() as unknown as Record<string | symbol, unknown>)[prop as string | symbol];
  },
});
