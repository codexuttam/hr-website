import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('Fetching resume with ID:', id);

    // Validate ID
    const resumeId = parseInt(id);
    if (isNaN(resumeId)) {
      return NextResponse.json(
        { error: 'Invalid resume ID' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('resume_id', resumeId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch resume from database',
          details: error.message,
          code: error.code 
        },
        { status: 500 }
      );
    }

    console.log('Resume fetched successfully:', { 
      resume_id: data.resume_id, 
      resume_name: data.resume_name 
    });

    return NextResponse.json({
      success: true,
      resume: data
    });

  } catch (error) {
    console.error('Error fetching resume:', error);
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
      .from('resumes')
      .delete()
      .eq('resume_id', parseInt(id));

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to delete resume from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}