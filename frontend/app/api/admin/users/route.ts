import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 30; // cache for 30s, revalidate in background

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role } = body;

    // Validate input
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['student', 'instructor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return NextResponse.json({ 
            error: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' 
        }, { status: 400 });
    }

    // CREATE USER in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
      },
    });

    if (authError) {
      console.error('Supabase Auth Error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const authUserId = authData.user?.id;

    if (!authUserId) {
      return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });
    }

    // INSERT INTO public.users
    // We try to store the Auth UUID in 'user_uid' if the schema allows/trigger respects it.
    // We do NOT set 'user_id' as it is SERIAL.
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .upsert([
        {
          user_uid: authUserId,
          email,
          name,
          role,
        },
      ])
      .select()
      .single();

    if (userError) {
      console.error('Error inserting public.users:', userError);
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        authUser: authData.user,
        user: userData,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error: Service Role Key missing' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') || '50'));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabaseAdmin
      .from('users')
      .select('user_id, user_uid, name, email, role', { count: 'exact' })
      .order('user_id', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Database error fetch users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { users: data, total: count, page, pageSize },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error: any) {
    console.error('API GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    // Update public.users
    const { data: updatedUser, error: dbError } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('user_id', userId)
      .select('user_uid') // Fetch user_uid to update auth
      .single();

    if (dbError) throw dbError;

    // Update auth.users metadata if we have a valid UUID in user_uid
    if (updatedUser?.user_uid) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        updatedUser.user_uid,
        { user_metadata: { role } }
        );
        if (authError) console.warn('Failed to update auth metadata:', authError);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('API PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Fetch user_uid before deleting
    const { data: userToDelete, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('user_uid')
        .eq('user_id', userId)
        .single();
    
    if (fetchError) {
        console.warn('User not found or fetch error:', fetchError);
        // We might continue to try deleting by ID anyway if it exists? 
    }

    // Delete from public.users
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('user_id', userId);
    
    if (dbError) throw dbError;

    // Delete from auth.users using user_uid if available
    if (userToDelete?.user_uid) {
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userToDelete.user_uid);
        if (authError) console.warn('Failed to delete auth user (likely invalid UUID or already deleted):', authError);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('API DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
