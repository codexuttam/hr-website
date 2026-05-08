import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const USER_SELECT = 'user_id, user_uid, name, email, role, credits';

export async function POST(req: NextRequest) {
  try {
    const { uid, email, name } = await req.json();

    if (!uid || !email) {
      return NextResponse.json({ error: 'uid and email are required' }, { status: 400 });
    }

    // 1. Try to find existing user (by uid or email) — single server-side query, no RLS
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('users')
      .select(USER_SELECT)
      .or(`user_uid.eq.${uid},email.eq.${email}`)
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('[Profile API] Fetch error:', fetchError.message);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (existing) {
      // Back-fill user_uid if missing (legacy row matched by email only)
      if (!existing.user_uid) {
        await supabaseAdmin
          .from('users')
          .update({ user_uid: uid })
          .eq('user_id', existing.user_id);
        existing.user_uid = uid;
      }
      return NextResponse.json({ user: existing });
    }

    // 2. Profile doesn't exist — auto-create it
    const displayName = name || email.split('@')[0] || 'User';
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert([{ email, name: displayName, role: 'student', credits: 50, user_uid: uid }])
      .select(USER_SELECT)
      .single();

    if (insertError) {
      // Race condition: another request created it — fetch again
      if (insertError.code === '23505') {
        const { data: retry } = await supabaseAdmin
          .from('users')
          .select(USER_SELECT)
          .or(`user_uid.eq.${uid},email.eq.${email}`)
          .limit(1)
          .maybeSingle();
        if (retry) return NextResponse.json({ user: retry });
      }
      console.error('[Profile API] Insert error:', insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ user: newUser });
  } catch (err: any) {
    console.error('[Profile API] Unexpected error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
