import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Type definitions for ranking data
interface StudentRankData {
  currentRank: number;
  totalStudents: number;
  percentile: number;
  totalScore: number;
  quizScore: number;
  interviewScore: number;
  participationScore: number;
  quizAttempts: number;
  interviewAttempts: number;
  leaderboard: LeaderboardEntry[];
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  totalScore: number;
  isCurrentUser: boolean;
}

// Note: For future optimization, consider creating a Supabase RPC function
// `get_student_quiz_rankings` that uses SQL window functions (RANK() or DENSE_RANK())
// for more efficient server-side ranking calculation.


// Manual calculation - server-side, efficient queries using users table
async function calculateRankingsManually(currentUserUuid: string): Promise<StudentRankData> {
  // Get all students from users table (user_id is integer, user_uid is auth UUID)
  const { data: allStudents, error: studentsError } = await supabaseAdmin
    .from('users')
    .select('user_id, user_uid, name')
    .eq('role', 'student');

  if (studentsError) {
    console.error('Error fetching students:', studentsError);
    throw new Error('Failed to fetch student data');
  }

  // Get all quiz attempts
  const { data: allAttempts, error: attemptsError } = await supabaseAdmin
    .from('attempts')
    .select('user_id, score, max_score');

  if (attemptsError) {
    console.error('Error fetching attempts:', attemptsError);
    throw new Error('Failed to fetch quiz data');
  }

  // Get all interview scores
  const { data: allInterviews, error: interviewsError } = await supabaseAdmin
    .from('mock_interviews')
    .select('student_id, rating, analysis');

  if (interviewsError) {
    console.error('Error fetching interviews:', interviewsError);
    // Continue without interview data
  }

  // Build mappings: user_id (int) -> user_uid (UUID) and vice versa
  const userIdToUuid = new Map<number, string>();
  const uuidToUserId = new Map<string, number>();
  
  (allStudents || []).forEach((student: any) => {
    if (student.user_uid) {
      userIdToUuid.set(student.user_id, student.user_uid);
      uuidToUserId.set(student.user_uid, student.user_id);
    }
  });

  // Find current user's numeric ID
  const currentUserId = uuidToUserId.get(currentUserUuid);

  // Calculate aggregated scores per student (using numeric user_id as key)
  const studentScores = new Map<number, {
    id: number;
    name: string;
    quizScore: number;
    quizAttempts: number;
    interviewScore: number;
    interviewAttempts: number;
    participationScore: number;
  }>();

  // Initialize all students
  (allStudents || []).forEach((student: any) => {
    studentScores.set(student.user_id, {
      id: student.user_id,
      name: student.name || 'Unknown',
      quizScore: 0,
      quizAttempts: 0,
      interviewScore: 0,
      interviewAttempts: 0,
      participationScore: 0,
    });
  });

  // Aggregate quiz scores (attempts.user_id is numeric)
  (allAttempts || []).forEach((attempt: any) => {
    const userId = attempt.user_id;
    if (studentScores.has(userId)) {
      const student = studentScores.get(userId)!;
      const score = attempt.score || 0;
      const maxScore = attempt.max_score || 1;
      // Accumulate for average calculation
      student.quizScore += (score / maxScore) * 100;
      student.quizAttempts += 1;
    }
  });

  // Calculate average quiz score and participation bonus
  studentScores.forEach((student) => {
    if (student.quizAttempts > 0) {
      student.quizScore = Math.round((student.quizScore / student.quizAttempts) * 10) / 10;
      student.participationScore = Math.min(student.quizAttempts * 1, 10);
    }
  });

  // Aggregate interview scores (mock_interviews.student_id could be numeric OR UUID)
  (allInterviews || []).forEach((interview: any) => {
    let studentNumericId: number | undefined;
    const rawStudentId = interview.student_id;
    
    // Try to find the numeric user_id
    if (typeof rawStudentId === 'number') {
      studentNumericId = rawStudentId;
    } else if (typeof rawStudentId === 'string') {
      // Could be a numeric string or a UUID
      const parsed = parseInt(rawStudentId);
      if (!isNaN(parsed) && studentScores.has(parsed)) {
        studentNumericId = parsed;
      } else {
        // Might be a UUID - look it up
        studentNumericId = uuidToUserId.get(rawStudentId);
      }
    }

    if (studentNumericId && studentScores.has(studentNumericId)) {
      const student = studentScores.get(studentNumericId)!;
      
      let rating = interview.rating || 0;
      if (!rating && interview.analysis?.detailed_scores) {
        const tech = interview.analysis.detailed_scores.technical || 0;
        const comm = interview.analysis.detailed_scores.communication || 0;
        rating = (tech + comm) / 4; // Convert 0-10 scale to 0-5
      }
      
      // Accumulate for average
      student.interviewScore += rating * 20; // Convert 0-5 to 0-100 scale
      student.interviewAttempts += 1;
    }
  });

  // Calculate average interview score and add participation bonus
  studentScores.forEach((student) => {
    if (student.interviewAttempts > 0) {
      student.interviewScore = Math.round((student.interviewScore / student.interviewAttempts) * 10) / 10;
      student.participationScore += Math.min(student.interviewAttempts * 2, 10);
    }
  });

  // Calculate total score for each student
  // Weights: Quiz 50%, Interview 40%, Participation 10%
  const rankedStudents = Array.from(studentScores.values())
    .map((student) => ({
      ...student,
      totalScore: Math.round(
        (student.quizScore * 0.5 + student.interviewScore * 0.4 + student.participationScore) * 10
      ) / 10,
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  // Assign ranks using DENSE_RANK logic (same score = same rank)
  let currentRank = 1;
  let previousScore = -1;
  const rankedWithPosition = rankedStudents.map((student, index) => {
    if (index > 0 && student.totalScore < previousScore) {
      currentRank = index + 1;
    }
    previousScore = student.totalScore;
    return { ...student, rank: currentRank };
  });

  // Find current user's data
  const currentUserData = rankedWithPosition.find((s) => s.id === currentUserId);
  const totalStudents = rankedWithPosition.length;

  if (!currentUserData) {
    // User not found - might be new or not a student
    return {
      currentRank: 0,
      totalStudents,
      percentile: 0,
      totalScore: 0,
      quizScore: 0,
      interviewScore: 0,
      participationScore: 0,
      quizAttempts: 0,
      interviewAttempts: 0,
      leaderboard: rankedWithPosition.slice(0, 10).map((s) => ({
        rank: s.rank,
        name: s.name,
        totalScore: s.totalScore,
        isCurrentUser: false,
      })),
    };
  }

  // Calculate percentile (what percentage of students rank below this student)
  const studentsBelow = rankedWithPosition.filter((s) => s.totalScore < currentUserData.totalScore).length;
  const percentile = totalStudents > 1 ? Math.round((studentsBelow / (totalStudents - 1)) * 100) : 100;

  // Build leaderboard (top 10 + current user if not in top 10)
  const top10 = rankedWithPosition.slice(0, 10);
  const isInTop10 = top10.some((s) => s.id === currentUserId);
  
  let leaderboard = top10.map((s) => ({
    rank: s.rank,
    name: s.name,
    totalScore: s.totalScore,
    isCurrentUser: s.id === currentUserId,
  }));

  // If current user not in top 10, add them at the end with separator indicator
  if (!isInTop10 && currentUserData) {
    leaderboard.push({
      rank: currentUserData.rank,
      name: currentUserData.name,
      totalScore: currentUserData.totalScore,
      isCurrentUser: true,
    });
  }

  return {
    currentRank: currentUserData.rank,
    totalStudents,
    percentile,
    totalScore: currentUserData.totalScore,
    quizScore: currentUserData.quizScore,
    interviewScore: currentUserData.interviewScore,
    participationScore: currentUserData.participationScore,
    quizAttempts: currentUserData.quizAttempts,
    interviewAttempts: currentUserData.interviewAttempts,
    leaderboard,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Server-side authentication
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Can be ignored in Server Component
            }
          },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Verify user is a student (using users table)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('user_uid', user.id)
      .single();

    if (userData?.role && userData.role !== 'student') {
      return NextResponse.json(
        { error: 'This endpoint is only for students.' },
        { status: 403 }
      );
    }

    // Calculate rankings
    const rankData = await calculateRankingsManually(user.id);

    // Add cache headers
    return NextResponse.json(rankData, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    console.error('Rank API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ranking data' },
      { status: 500 }
    );
  }
}
