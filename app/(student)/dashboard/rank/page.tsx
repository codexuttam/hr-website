import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAuthenticatedUser } from '@/backend/auth/getAuthenticatedUser';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Type definitions
interface LeaderboardEntry {
    rank: number;
    name: string;
    totalScore: number;
    isCurrentUser: boolean;
}

interface RankData {
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

// Server-side calculation function using users table (integer-based schema)
// currentUserUuid is the auth.users UUID, currentUserNumericId is the users.user_id if known
async function calculateRankings(currentUserUuid: string, currentUserNumericId?: number): Promise<RankData> {
    console.log('[Rank] Starting calculation for user:', currentUserUuid, 'numericId:', currentUserNumericId);

    // Get ALL users to find the current user's numeric ID (not just students)
    const { data: allUsers, error: usersError } = await supabaseAdmin
        .from('users')
        .select('user_id, user_uid, name, role');

    if (usersError) {
        console.error('Error fetching users:', usersError);
    }

    console.log('[Rank] Found users:', allUsers?.length);

    // Get all quiz attempts
    const { data: allAttempts, error: attemptsError } = await supabaseAdmin
        .from('attempts')
        .select('user_id, score, max_score');

    if (attemptsError) {
        console.error('Error fetching attempts:', attemptsError);
    }

    console.log('[Rank] Found attempts:', allAttempts?.length);

    // Get all interview scores
    const { data: allInterviews, error: interviewsError } = await supabaseAdmin
        .from('mock_interviews')
        .select('student_id, rating, analysis');

    if (interviewsError) {
        console.error('Error fetching interviews:', interviewsError);
    }

    console.log('[Rank] Found interviews:', allInterviews?.length);

    // Build mappings: user_id (int) -> user_uid (UUID) and vice versa
    const userIdToUuid = new Map<number, string>();
    const uuidToUserId = new Map<string, number>();
    const userIdToName = new Map<number, string>();

    (allUsers || []).forEach((user: any) => {
        if (user.user_uid) {
            userIdToUuid.set(user.user_id, user.user_uid);
            uuidToUserId.set(user.user_uid, user.user_id);
        }
        userIdToName.set(user.user_id, user.name || 'Unknown');
    });

    // Find current user's numeric ID - use the one passed in if available
    let currentUserId = currentUserNumericId || uuidToUserId.get(currentUserUuid);

    console.log('[Rank] Current user ID resolved:', currentUserId);

    // If not found by user_uid, try to find by checking if any interview has this UUID as student_id
    if (!currentUserId) {
        console.log('[Rank] User not found in mapping, checking interviews for UUID match...');
        const interviewWithUuid = allInterviews?.find((i: any) => String(i.student_id) === currentUserUuid);
        if (interviewWithUuid) {
            console.log('[Rank] Found interview with UUID student_id');
        }
    }

    // Get only students for the leaderboard
    const studentUsers = (allUsers || []).filter((u: any) => u.role === 'student');
    console.log('[Rank] Student users for leaderboard:', studentUsers.length);

    // If current user has a numeric ID but isn't in student list, add them
    if (currentUserId && !studentUsers.find((s: any) => s.user_id === currentUserId)) {
        const currentUserRecord = allUsers?.find((u: any) => u.user_id === currentUserId);
        if (currentUserRecord) {
            console.log('[Rank] Adding current user to student list for ranking');
            studentUsers.push(currentUserRecord);
        }
    }

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
    studentUsers.forEach((student: any) => {
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

    // Calculate total scores and rank
    const rankedStudents = Array.from(studentScores.values())
        .map((student) => ({
            ...student,
            totalScore: Math.round(
                (student.quizScore * 0.5 + student.interviewScore * 0.4 + student.participationScore) * 10
            ) / 10,
        }))
        .sort((a, b) => b.totalScore - a.totalScore);

    // DENSE_RANK logic
    let currentRank = 1;
    let previousScore = -1;
    const rankedWithPosition = rankedStudents.map((student, index) => {
        if (index > 0 && student.totalScore < previousScore) {
            currentRank = index + 1;
        }
        previousScore = student.totalScore;
        return { ...student, rank: currentRank };
    });

    const currentUserData = rankedWithPosition.find((s) => s.id === currentUserId);
    const totalStudents = rankedWithPosition.length;

    // If user not found in rankings, try to get their activity directly by UUID
    if (!currentUserData) {
        console.log('[Rank] Current user not in rankings, checking direct activity by UUID...');

        // Count interviews for this user by UUID
        let directInterviewCount = 0;
        let directInterviewScore = 0;

        (allInterviews || []).forEach((interview: any) => {
            if (String(interview.student_id) === currentUserUuid) {
                directInterviewCount++;
                let rating = interview.rating || 0;
                if (!rating && interview.analysis?.detailed_scores) {
                    const tech = interview.analysis.detailed_scores.technical || 0;
                    const comm = interview.analysis.detailed_scores.communication || 0;
                    rating = (tech + comm) / 4;
                }
                directInterviewScore += rating * 20;
            }
        });

        if (directInterviewCount > 0) {
            directInterviewScore = Math.round((directInterviewScore / directInterviewCount) * 10) / 10;
        }

        // Count quiz attempts for this user (would need numeric ID, so likely 0 if not mapped)
        let directQuizAttempts = 0;
        let directQuizScore = 0;

        console.log('[Rank] Direct activity - interviews:', directInterviewCount, 'quizzes:', directQuizAttempts);

        // If we found any activity, return with that data
        if (directInterviewCount > 0 || directQuizAttempts > 0) {
            const participationScore = Math.min(directQuizAttempts * 1, 10) + Math.min(directInterviewCount * 2, 10);
            const totalScore = Math.round(
                (directQuizScore * 0.5 + directInterviewScore * 0.4 + participationScore) * 10
            ) / 10;

            return {
                currentRank: 0, // Unranked since not in proper student list
                totalStudents,
                percentile: 0,
                totalScore,
                quizScore: directQuizScore,
                interviewScore: directInterviewScore,
                participationScore,
                quizAttempts: directQuizAttempts,
                interviewAttempts: directInterviewCount,
                leaderboard: rankedWithPosition.slice(0, 10).map((s) => ({
                    rank: s.rank,
                    name: s.name,
                    totalScore: s.totalScore,
                    isCurrentUser: false,
                })),
            };
        }

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

    const studentsBelow = rankedWithPosition.filter((s) => s.totalScore < currentUserData.totalScore).length;
    const percentile = totalStudents > 1 ? Math.round((studentsBelow / (totalStudents - 1)) * 100) : 100;

    const top10 = rankedWithPosition.slice(0, 10);
    const isInTop10 = top10.some((s) => s.id === currentUserId);

    let leaderboard = top10.map((s) => ({
        rank: s.rank,
        name: s.name,
        totalScore: s.totalScore,
        isCurrentUser: s.id === currentUserId,
    }));

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

// Helper to get medal emoji or position
function getRankDisplay(rank: number): string {
    switch (rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return `#${rank}`;
    }
}

// Helper to get percentile badge color
function getPercentileColor(percentile: number): string {
    if (percentile >= 90) return 'from-yellow-400 to-amber-500';
    if (percentile >= 75) return 'from-purple-400 to-purple-600';
    if (percentile >= 50) return 'from-blue-400 to-blue-600';
    if (percentile >= 25) return 'from-green-400 to-green-600';
    return 'from-gray-400 to-gray-600';
}

// Helper to get percentile tier name
function getPercentileTier(percentile: number): string {
    if (percentile >= 90) return 'Elite Performer';
    if (percentile >= 75) return 'Top Quartile';
    if (percentile >= 50) return 'Above Average';
    if (percentile >= 25) return 'Rising Star';
    return 'Getting Started';
}

export default async function StudentRankPage() {
    const { user, supabase } = await getAuthenticatedUser();

    if (!user) {
        redirect('/login?redirect_to=/dashboard/rank');
    }

    // Get user data from users table - try by user_uid first, then by email
    let userData = null;
    let userError = null;

    // First try by user_uid
    const { data: userByUid, error: uidError } = await supabase
        .from('users')
        .select('user_id, name, role, email')
        .eq('user_uid', user.id)
        .maybeSingle();

    if (userByUid) {
        userData = userByUid;
    } else if (user.email) {
        // Fallback: try to find by email
        console.log('[RankPage] User not found by user_uid, trying email lookup:', user.email);
        const { data: userByEmail, error: emailError } = await supabase
            .from('users')
            .select('user_id, name, role, email')
            .eq('email', user.email)
            .maybeSingle();

        userData = userByEmail;
        userError = emailError;

        if (userByEmail) {
            console.log('[RankPage] Found user by email:', userByEmail.user_id);
        }
    } else {
        userError = uidError;
    }

    console.log('[RankPage] User lookup result:', {
        uuid: user.id,
        email: user.email,
        foundUserId: userData?.user_id,
        error: userError?.message
    });

    // Calculate rankings server-side - pass both UUID and numeric ID
    let rankData: RankData;
    try {
        rankData = await calculateRankings(user.id, userData?.user_id);
    } catch (error) {
        console.error('Error calculating rankings:', error);
        rankData = {
            currentRank: 0,
            totalStudents: 0,
            percentile: 0,
            totalScore: 0,
            quizScore: 0,
            interviewScore: 0,
            participationScore: 0,
            quizAttempts: 0,
            interviewAttempts: 0,
            leaderboard: [],
        };
    }

    const userName = userData?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Student';
    const hasActivity = rankData.quizAttempts > 0 || rankData.interviewAttempts > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <nav className="flex mb-4" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li>
                                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <span className="mx-2 text-gray-500">/</span>
                                    <span className="text-white font-medium">Rankings</span>
                                </div>
                            </li>
                        </ol>
                    </nav>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                            <span className="text-2xl">🏆</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Student Rankings
                            </h1>
                            <p className="text-gray-400">Track your progress and compete with peers</p>
                        </div>
                    </div>
                </div>

                {!hasActivity ? (
                    /* Empty State */
                    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                        <CardContent className="p-12 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-5xl">📊</span>
                            </div>
                            <CardTitle className="text-2xl text-white mb-3">No Activity Yet</CardTitle>
                            <CardDescription className="text-gray-400 max-w-md mx-auto mb-8">
                                Complete quizzes and mock interviews to see your ranking among other students.
                                Your performance shapes your position on the leaderboard!
                            </CardDescription>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/quiz">
                                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                                        <span className="mr-2">📝</span> Take a Quiz
                                    </Button>
                                </Link>
                                <Link href="/interview">
                                    <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                                        <span className="mr-2">🎤</span> Practice Interview
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Rank Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Current Rank Card */}
                            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border-yellow-500/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <CardContent className="p-6 relative">
                                    <CardDescription className="text-yellow-400 mb-2 flex items-center gap-2">
                                        <span>🏅</span> Your Rank
                                    </CardDescription>
                                    <div className="text-5xl font-bold text-white mb-1">
                                        {rankData.currentRank > 0 ? getRankDisplay(rankData.currentRank) : '-'}
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        out of {rankData.totalStudents} students
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Percentile Card */}
                            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border-purple-500/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <CardContent className="p-6 relative">
                                    <CardDescription className="text-purple-400 mb-2 flex items-center gap-2">
                                        <span>📈</span> Percentile
                                    </CardDescription>
                                    <div className="text-5xl font-bold text-white mb-1">
                                        {rankData.percentile}%
                                    </div>
                                    <Badge className={`bg-gradient-to-r ${getPercentileColor(rankData.percentile)} text-white border-0`}>
                                        {getPercentileTier(rankData.percentile)}
                                    </Badge>
                                </CardContent>
                            </Card>

                            {/* Total Score Card */}
                            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border-blue-500/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <CardContent className="p-6 relative">
                                    <CardDescription className="text-blue-400 mb-2 flex items-center gap-2">
                                        <span>⭐</span> Total Score
                                    </CardDescription>
                                    <div className="text-5xl font-bold text-white mb-1">
                                        {rankData.totalScore.toFixed(1)}
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        composite points
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Activity Card */}
                            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border-green-500/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <CardContent className="p-6 relative">
                                    <CardDescription className="text-green-400 mb-2 flex items-center gap-2">
                                        <span>🎯</span> Activity
                                    </CardDescription>
                                    <div className="flex items-end gap-4">
                                        <div>
                                            <div className="text-3xl font-bold text-white">{rankData.quizAttempts}</div>
                                            <p className="text-gray-400 text-xs">Quizzes</p>
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold text-white">{rankData.interviewAttempts}</div>
                                            <p className="text-gray-400 text-xs">Interviews</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Quiz Score */}
                            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10 bg-blue-500/20">
                                                <AvatarFallback className="bg-blue-500/20 text-xl">📝</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-white text-base">Quiz Performance</CardTitle>
                                                <CardDescription className="text-xs">50% weight</CardDescription>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-bold text-blue-400">{rankData.quizScore.toFixed(1)}</span>
                                    </div>
                                    <Progress
                                        value={rankData.quizScore}
                                        max={100}
                                        className="bg-slate-700/50"
                                        indicatorClassName="bg-gradient-to-r from-blue-400 to-blue-600"
                                    />
                                </CardContent>
                            </Card>

                            {/* Interview Score */}
                            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10 bg-purple-500/20">
                                                <AvatarFallback className="bg-purple-500/20 text-xl">🎤</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-white text-base">Interview Score</CardTitle>
                                                <CardDescription className="text-xs">40% weight</CardDescription>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-bold text-purple-400">{rankData.interviewScore.toFixed(1)}</span>
                                    </div>
                                    <Progress
                                        value={rankData.interviewScore}
                                        max={100}
                                        className="bg-slate-700/50"
                                        indicatorClassName="bg-gradient-to-r from-purple-400 to-purple-600"
                                    />
                                </CardContent>
                            </Card>

                            {/* Participation */}
                            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10 bg-green-500/20">
                                                <AvatarFallback className="bg-green-500/20 text-xl">🏃</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-white text-base">Participation</CardTitle>
                                                <CardDescription className="text-xs">10% bonus</CardDescription>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-bold text-green-400">{rankData.participationScore.toFixed(1)}</span>
                                    </div>
                                    <Progress
                                        value={rankData.participationScore * 5}
                                        max={100}
                                        className="bg-slate-700/50"
                                        indicatorClassName="bg-gradient-to-r from-green-400 to-green-600"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Leaderboard */}
                        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 overflow-hidden">
                            <CardHeader className="border-b border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 bg-gradient-to-br from-yellow-400/20 to-orange-500/20">
                                        <AvatarFallback className="bg-transparent text-xl">🏆</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-white">Leaderboard</CardTitle>
                                        <CardDescription>Top performers this month</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-700/50">
                                    {rankData.leaderboard.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400">
                                            No rankings available yet. Be the first to complete activities!
                                        </div>
                                    ) : (
                                        rankData.leaderboard.map((entry, index) => {
                                            const isCurrentUser = entry.isCurrentUser;
                                            const showSeparator = index > 0 && entry.rank > 10 && rankData.leaderboard[index - 1].rank <= 10;

                                            return (
                                                <React.Fragment key={`${entry.rank}-${index}`}>
                                                    {showSeparator && (
                                                        <div className="px-6 py-2 bg-slate-700/30 text-center text-gray-500 text-sm">
                                                            • • •
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`flex items-center gap-4 p-4 transition-colors ${isCurrentUser
                                                            ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-l-4 border-blue-500'
                                                            : 'hover:bg-slate-700/30'
                                                            }`}
                                                    >
                                                        {/* Rank */}
                                                        <div className="w-14 text-center">
                                                            {entry.rank <= 3 ? (
                                                                <span className="text-3xl">{getRankDisplay(entry.rank)}</span>
                                                            ) : (
                                                                <span className="text-xl font-bold text-gray-400">#{entry.rank}</span>
                                                            )}
                                                        </div>

                                                        {/* Avatar & Name */}
                                                        <div className="flex-1 flex items-center gap-3">
                                                            <Avatar className={`w-10 h-10 ${entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                                                entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                                                    entry.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                                                        'bg-gradient-to-br from-slate-500 to-slate-600'
                                                                }`}>
                                                                <AvatarFallback className="bg-transparent text-white font-bold">
                                                                    {entry.name.charAt(0).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className={`font-semibold ${isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
                                                                    {entry.name}
                                                                    {isCurrentUser && (
                                                                        <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-0">
                                                                            You
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Score */}
                                                        <div className="text-right">
                                                            <div className={`text-lg font-bold ${entry.rank === 1 ? 'text-yellow-400' :
                                                                entry.rank === 2 ? 'text-gray-300' :
                                                                    entry.rank === 3 ? 'text-orange-400' :
                                                                        'text-white'
                                                                }`}>
                                                                {entry.totalScore.toFixed(1)}
                                                            </div>
                                                            <p className="text-xs text-gray-500">points</p>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Motivational Footer */}
                        <div className="mt-8 text-center">
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/50 rounded-full border border-slate-700/50">
                                <span className="text-xl">💡</span>
                                <span className="text-gray-400">
                                    Keep improving! Complete more quizzes and interviews to climb the ranks.
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
