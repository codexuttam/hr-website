import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId: quizIdParam } = await params;
    const quizId = parseInt(quizIdParam);

    if (isNaN(quizId)) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }

    // Get questions for this quiz
    const { data: mappings, error: mappingError } = await supabase
      .from('quiz_questions')
      .select('question_id')
      .eq('quiz_id', quizId);

    if (mappingError) {
      throw mappingError;
    }

    if (!mappings || mappings.length === 0) {
      return NextResponse.json([]);
    }

    const questionIds = mappings.map((m: any) => m.question_id);

    // Get question details
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .in('question_id', questionIds)
      .order('question_id');

    if (questionsError) {
      throw questionsError;
    }

    return NextResponse.json(questions || []);

  } catch (error: any) {
    console.error('Questions fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load questions' },
      { status: 500 }
    );
  }
}
