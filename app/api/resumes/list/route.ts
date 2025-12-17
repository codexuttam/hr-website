import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/backend/auth/getAuthenticatedUser';

export async function GET(request: NextRequest) {
  const { user, supabase } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('resumes')
      .select(`
        resume_id,
        resume_name,
        template_id,
        created_at,
        updated_at,
        resume_data,
        color_scheme
      `)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by user if userId is provided
    if (userId) {
      query = query.eq('user_id', parseInt(userId));
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch resumes from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      resumes: data || [],
      total: count || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}