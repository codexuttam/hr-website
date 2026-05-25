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

    // Get leaderboard - best attempts for each user
    const { data: attempts, error } = await supabase
      .from('attempts')
      .select(`
        attempt_id,
        user_id,
        score,
        max_score,
        duration_sec,
        created_at,
        users (
          name,
          email
        )
      `)
      .eq('quiz_id', quizId)
      .order('score', { ascending: false })
      .order('duration_sec', { ascending: true })
      .limit(50);

    if (error) {
      throw error;
    }

    // Group by user and get best attempt
    const userBestAttempts = new Map();
    
    (attempts || []).forEach((attempt: any) => {
      const userId = attempt.user_id;
      const existing = userBestAttempts.get(userId);
      
      if (!existing || 
          attempt.score > existing.score || 
          (attempt.score === existing.score && attempt.duration_sec < existing.duration_sec)) {
        userBestAttempts.set(userId, {
          user_id: userId,
          name: attempt.users?.name || 'Unknown',
          email: attempt.users?.email || '',
          score: attempt.score,
          max_score: attempt.max_score,
          duration_sec: attempt.duration_sec,
          created_at: attempt.created_at,
          percentage: Math.round((attempt.score / attempt.max_score) * 100),
        });
      }
    });

    // Convert to array and sort
    const leaderboard = Array.from(userBestAttempts.values())
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.duration_sec - b.duration_sec;
      })
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

    return NextResponse.json(leaderboard);

  } catch (error: any) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load leaderboard' },
      { status: 500 }
    );
  }
}
