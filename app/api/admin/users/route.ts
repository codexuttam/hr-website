import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
      return NextResponse.json({ error: 'Server configuration error: Missing service role key' }, { status: 500 });
    }

    // Create user in Supabase Auth using Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role
      }
    });

    if (authError) {
      console.error('Supabase Auth Error:', authError);
      return NextResponse.json({ error: `Auth Error: ${authError.message}` }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Insert into public.users table
    // We use upsert to handle cases where a trigger might have already created the record
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .upsert([
        {
          email,
          name,
          role,
        }
      ])
      .select()
      .single();

    if (userError) {
      console.error('Error inserting into public.users:', userError);
      // Attempt to clean up auth user if public profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: `Database error: ${userError.message}` }, { status: 400 });
    }

    return NextResponse.json({ user: userData }, { status: 200 });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
