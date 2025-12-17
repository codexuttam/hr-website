import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { User, SupabaseClient } from '@supabase/supabase-js'

export async function getAuthenticatedUser(): Promise<{ user: User | null; supabase: SupabaseClient }> {
  // Retrieve the cookie store, waiting for the promise to resolve
  const cookieStore = await cookies()

  // Create the Supabase client with the cookie store
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  // Fetch the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { user, supabase }
}
