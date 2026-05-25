import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('Fetching ATS result with ID:', id);

    // Validate ID
    const atsId = parseInt(id);
    if (isNaN(atsId)) {
      return NextResponse.json(
        { error: 'Invalid ATS result ID' },
        { status: 400 }
      );
    }

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
      console.error('Supabase error:', error);
      
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
          code: error.code 
        },
        { status: 500 }
      );
    }

    console.log('ATS result fetched successfully:', { 
      ats_id: data.ats_id, 
      overall_score: data.overall_score 
    });

    return NextResponse.json({
      success: true,
      atsResult: data
    });

  } catch (error) {
    console.error('Error fetching ATS result:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('ats_results')
      .delete()
      .eq('ats_id', parseInt(id));

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to delete ATS result from database',
          details: error.message,
          code: error.code 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ATS result deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting ATS result:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}