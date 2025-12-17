import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/backend/auth/getAuthenticatedUser';

export async function POST(request: NextRequest) {
  const { user, supabase } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      resumeData, 
      templateId, 
      colorScheme, 
      userId, 
      title = 'Untitled Resume' 
    } = body;

    console.log('Saving resume with data:', { 
      userId, 
      title, 
      templateId, 
      hasColorScheme: !!colorScheme,
      hasResumeData: !!resumeData 
    });

    // Validate required fields
    if (!resumeData || templateId === undefined) {
      return NextResponse.json(
        { error: 'Resume data and template ID are required' },
        { status: 400 }
      );
    }

    // Create resume record with required fields
    const resumeRecord: any = {
      user_id: userId ? parseInt(userId) : null,
      resume_name: title,
      resume_data: resumeData,
    };

    // Try to add optional fields - if they fail, we'll catch and continue
    try {
      // First, let's try a simple insert with just the basic fields
      const { data: testData, error: testError } = await supabase
        .from('resumes')
        .select('resume_id, template_id, color_scheme')
        .limit(1);

      if (!testError) {
        // If we can select these columns, they exist, so we can use them
        resumeRecord.template_id = templateId;
        if (colorScheme) {
          resumeRecord.color_scheme = colorScheme;
        }
      }
    } catch (e) {
      console.warn('Optional columns may not exist, proceeding with basic fields only');
    }

    const { data, error } = await supabase
      .from('resumes')
      .insert([resumeRecord])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      // If it's a column doesn't exist error, try without optional columns
      if (error.code === '42703') {
        console.log('Retrying without optional columns...');
        const basicRecord = {
          user_id: userId ? parseInt(userId) : null,
          resume_name: title,
          resume_data: resumeData,
        };

        const { data: retryData, error: retryError } = await supabase
          .from('resumes')
          .insert([basicRecord])
          .select()
          .single();

        if (retryError) {
          console.error('Retry failed:', retryError);
          return NextResponse.json(
            { 
              error: 'Failed to save resume to database',
              details: retryError.message,
              code: retryError.code 
            },
            { status: 500 }
          );
        }

        // Add the missing fields to the response for consistency
        const responseData = {
          ...retryData,
          template_id: templateId,
          color_scheme: colorScheme
        };

        return NextResponse.json({
          success: true,
          resume: responseData,
          message: 'Resume saved successfully (basic mode)'
        });
      }

      return NextResponse.json(
        { 
          error: 'Failed to save resume to database',
          details: error.message,
          code: error.code 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      resume: data,
      message: 'Resume saved successfully'
    });

  } catch (error) {
    console.error('Error saving resume:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { user, supabase } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      resumeId,
      resumeData, 
      templateId, 
      colorScheme, 
      title 
    } = body;

    console.log('Updating resume with data:', { 
      resumeId, 
      title, 
      templateId, 
      hasColorScheme: !!colorScheme,
      hasResumeData: !!resumeData 
    });

    // Validate required fields
    if (!resumeId || !resumeData || templateId === undefined) {
      return NextResponse.json(
        { error: 'Resume ID, data, and template ID are required' },
        { status: 400 }
      );
    }

    // Update resume record with basic fields
    const updateData: any = {
      resume_data: resumeData,
      updated_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    };

    if (title) updateData.resume_name = title;

    // Try to add optional fields
    try {
      updateData.template_id = templateId;
      if (colorScheme) {
        updateData.color_scheme = colorScheme;
      }
    } catch (e) {
      console.warn('Optional columns may not exist for update');
    }

    const { data, error } = await supabase
      .from('resumes')
      .update(updateData)
      .eq('resume_id', parseInt(resumeId))
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      // If it's a column doesn't exist error, try without optional columns
      if (error.code === '42703') {
        console.log('Retrying update without optional columns...');
        const basicUpdateData: any = {
          resume_data: resumeData,
          updated_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        };

        if (title) basicUpdateData.resume_name = title;

        const { data: retryData, error: retryError } = await supabase
          .from('resumes')
          .update(basicUpdateData)
          .eq('resume_id', parseInt(resumeId))
          .select()
          .single();

        if (retryError) {
          console.error('Retry update failed:', retryError);
          return NextResponse.json(
            { 
              error: 'Failed to update resume in database',
              details: retryError.message,
              code: retryError.code 
            },
            { status: 500 }
          );
        }

        // Add the missing fields to the response for consistency
        const responseData = {
          ...retryData,
          template_id: templateId,
          color_scheme: colorScheme
        };

        return NextResponse.json({
          success: true,
          resume: responseData,
          message: 'Resume updated successfully (basic mode)'
        });
      }

      return NextResponse.json(
        { 
          error: 'Failed to update resume in database',
          details: error.message,
          code: error.code 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      resume: data,
      message: 'Resume updated successfully'
    });

  } catch (error) {
    console.error('Error updating resume:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}