import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resumeId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('ats_results')
      .select(`
        ats_id,
        resume_id,
        job_description,
        matching_keywords,
        missing_keywords,
        overall_score,
        suggestions,
        analysis_data,
        created_at,
        updated_at,
        resumes (
          resume_id,
          resume_name,
          user_id
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by resume ID if provided
    if (resumeId) {
      query = query.eq('resume_id', parseInt(resumeId));
    }

    // Filter by user ID — fetch their resume IDs first, then filter directly
    if (userId && !resumeId) {
      const { data: userResumes } = await supabase
        .from('resumes')
        .select('resume_id')
        .eq('user_id', parseInt(userId));

      const resumeIds = (userResumes || []).map((r: any) => r.resume_id);

      if (resumeIds.length === 0) {
        return NextResponse.json({ success: true, atsResults: [], total: 0, limit, offset });
      }

      query = query.in('resume_id', resumeIds);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch ATS results from database',
          details: error.message,
          code: error.code 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      atsResults: data || [],
      total: count || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching ATS results:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}