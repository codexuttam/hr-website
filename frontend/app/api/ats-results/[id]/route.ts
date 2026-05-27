import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force Node.js runtime — required for Supabase server-side usage and Docker builds
export const runtime = 'nodejs';

/**
 * Creates a Supabase admin client with the service role key.
 * Called INSIDE each handler so no Supabase initialization happens at import/build time.
 */
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ─── GET /api/ats-results/[id] ────────────────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('Fetching ATS result with ID:', id);

    // Validate ID
    const atsId = parseInt(id, 10);
    if (isNaN(atsId)) {
      return NextResponse.json(
        { error: 'Invalid ATS result ID — must be a numeric value' },
        { status: 400 }
      );
    }

    // Create client inside the handler — safe at runtime
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('ats_results')
      .select(`
        *,
        resumes (
          resume_id,
          resume_name,
          user_id,
          resume_data
        )
      `)
      .eq('ats_id', atsId)
      .single();

    if (error) {
      console.error('Supabase error fetching ATS result:', error);

      // PGRST116 = "row not found" from PostgREST
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'ATS result not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to fetch ATS result from database',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    console.log('ATS result fetched successfully:', {
      ats_id: data.ats_id,
      overall_score: data.overall_score,
    });

    return NextResponse.json({
      success: true,
      atsResult: data,
    });
  } catch (error) {
    console.error('Error in GET /api/ats-results/[id]:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/ats-results/[id] ────────────────────────────────────────────

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const atsId = parseInt(id, 10);
    if (isNaN(atsId)) {
      return NextResponse.json(
        { error: 'Invalid ATS result ID — must be a numeric value' },
        { status: 400 }
      );
    }

    // Create client inside the handler — safe at runtime
    const supabase = createSupabaseClient();

    const { error } = await supabase
      .from('ats_results')
      .delete()
      .eq('ats_id', atsId);

    if (error) {
      console.error('Supabase error deleting ATS result:', error);
      return NextResponse.json(
        {
          error: 'Failed to delete ATS result from database',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ATS result deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/ats-results/[id]:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}