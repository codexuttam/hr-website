import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      resumeId,
      jobDescription,
      matchingKeywords,
      missingKeywords,
      overallScore,
      suggestions,
      analysisData,
    } = body;

    console.log('Saving ATS result with data:', {
      resumeId,
      overallScore,
      matchingKeywordsCount: matchingKeywords?.length,
      missingKeywordsCount: missingKeywords?.length,
    });

    // Validate required fields
    if (overallScore === undefined || overallScore === null) {
      return NextResponse.json(
        { error: 'Overall score is required' },
        { status: 400 }
      );
    }

    if (!resumeId) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    // Create client inside the handler — safe at runtime
    const supabase = createSupabaseClient();

    const atsRecord = {
      resume_id: parseInt(resumeId, 10),
      job_description: jobDescription || '',
      matching_keywords: matchingKeywords || [],
      missing_keywords: missingKeywords || [],
      overall_score: parseFloat(overallScore),
      suggestions: suggestions || '',
      analysis_data: analysisData || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('ats_results')
      .insert([atsRecord])
      .select()
      .single();

    if (error) {
      console.error('Supabase error saving ATS result:', error);
      return NextResponse.json(
        {
          error: 'Failed to save ATS result to database',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    console.log('ATS result saved successfully:', data.ats_id);

    return NextResponse.json({
      success: true,
      atsResult: data,
      message: 'ATS result saved successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/ats-results/save:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      atsId,
      jobDescription,
      matchingKeywords,
      missingKeywords,
      overallScore,
      suggestions,
      analysisData,
    } = body;

    console.log('Updating ATS result:', atsId);

    if (!atsId || overallScore === undefined) {
      return NextResponse.json(
        { error: 'ATS ID and overall score are required' },
        { status: 400 }
      );
    }

    // Create client inside the handler — safe at runtime
    const supabase = createSupabaseClient();

    const updateData = {
      job_description: jobDescription,
      matching_keywords: matchingKeywords,
      missing_keywords: missingKeywords,
      overall_score: parseFloat(overallScore),
      suggestions: suggestions,
      analysis_data: analysisData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('ats_results')
      .update(updateData)
      .eq('ats_id', parseInt(atsId, 10))
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating ATS result:', error);
      return NextResponse.json(
        {
          error: 'Failed to update ATS result in database',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      atsResult: data,
      message: 'ATS result updated successfully',
    });
  } catch (error) {
    console.error('Error in PUT /api/ats-results/save:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}