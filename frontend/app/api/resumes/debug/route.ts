import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'create-test-resume') {
      // Create a simple test resume
      const testResume = {
        user_id: 1, // Assuming user ID 1 exists
        resume_name: 'Test Resume',
        resume_data: {
          contact: {
            name: 'Test User',
            position: 'Software Developer',
            email: 'test@example.com',
            phone: '+1234567890'
          },
          objective: 'This is a test resume created for debugging purposes.',
          skills: ['JavaScript', 'React', 'Node.js'],
          experience: [],
          education: []
        }
      };

      // Try with optional columns first
      try {
        const { data, error } = await supabase
          .from('resumes')
          .insert([{
            ...testResume,
            template_id: 0,
            color_scheme: { primary: '#667eea', background: '#764ba2', skills: '#9f7aea' }
          }])
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          message: 'Test resume created with all columns',
          resume: data
        });
      } catch (error: any) {
        // If that fails, try with basic columns only
        if (error.code === '42703') {
          const { data, error: basicError } = await supabase
            .from('resumes')
            .insert([testResume])
            .select()
            .single();

          if (basicError) throw basicError;

          return NextResponse.json({
            success: true,
            message: 'Test resume created with basic columns only',
            resume: data
          });
        }
        throw error;
      }
    }

    if (action === 'list-resumes') {
      const { data, error } = await supabase
        .from('resumes')
        .select('resume_id, resume_name, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        resumes: data || [],
        count: data?.length || 0
      });
    }

    if (action === 'delete-test-resumes') {
      const { data, error } = await supabase
        .from('resumes')
        .delete()
        .eq('resume_name', 'Test Resume')
        .select();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: `Deleted ${data?.length || 0} test resumes`,
        deleted: data
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use: create-test-resume, list-resumes, or delete-test-resumes'
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}