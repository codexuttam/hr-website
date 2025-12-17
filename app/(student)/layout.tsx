import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export default async function StudentLayout({ children }: { children: ReactNode }) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
        redirect('/login?redirect_to=/dashboard')
    }

    const role = session.user.user_metadata?.role

    if (role !== 'student' && role !== 'admin') {
        // If not student/admin, redirect to their potential dashboard or unauthorized
        if (role === 'teacher') redirect('/coach')
        redirect('/login')
    }

    return <>{children}</>
}
