import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('resumes')
      .select('resume_id')
      .limit(1);

    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError.message
      });
    }

    // Test column existence
    const { data: columnTest, error: columnError } = await supabase
      .from('resumes')
      .select('resume_id, resume_name, resume_data, template_id, color_scheme')
      .limit(1);

    const availableColumns = [];
    const missingColumns = [];

    // Check which columns are available
    if (!columnError) {
      availableColumns.push('resume_id', 'resume_name', 'resume_data', 'template_id', 'color_scheme');
    } else {
      // If there's an error, it might be due to missing columns
      if (columnError.code === '42703') {
        // Try each column individually
        const columnsToTest = ['resume_id', 'resume_name', 'resume_data', 'template_id', 'color_scheme'];
        
        for (const column of columnsToTest) {
          try {
            const { error } = await supabase
              .from('resumes')
              .select(column)
              .limit(1);
            
            if (!error) {
              availableColumns.push(column);
            } else {
              missingColumns.push(column);
            }
          } catch (e) {
            missingColumns.push(column);
          }
        }
      }
    }

    // Get table info
    let tableInfo = null;
    let tableError = null;
    
    try {
      const result = await supabase.rpc('get_table_columns', { table_name: 'resumes' });
      tableInfo = result.data;
      tableError = result.error;
    } catch (e) {
      tableError = { message: 'RPC not available' };
    }

    // Check if there are any resumes in the database
    const { data: resumeCount, error: countError } = await supabase
      .from('resumes')
      .select('resume_id', { count: 'exact' })
      .limit(1);

    const totalResumes = resumeCount?.length || 0;

    // Try to get a sample resume if any exist
    let sampleResume = null;
    if (totalResumes > 0) {
      const { data: sample } = await supabase
        .from('resumes')
        .select('resume_id, resume_name, created_at')
        .limit(1)
        .single();
      sampleResume = sample;
    }

    return NextResponse.json({
      success: true,
      connection: 'OK',
      availableColumns,
      missingColumns,
      tableInfo: tableInfo || 'Not available',
      tableError: tableError?.message || null,
      totalResumes,
      sampleResume,
      countError: countError?.message || null,
      message: 'Database test completed'
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}