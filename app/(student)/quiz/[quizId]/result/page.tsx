'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface LeaderboardEntry {
    user_id: number;
    name: string;
    score: number;
    max_score: number;
    duration_sec: number;
    rank: number;
    created_at: string;
}

interface QuizStats {
    participantCount: number;
    averageScore: number;
}

export default function QuizResultPage({ params }: { params: Promise<{ quizId: string }> }) {
    const { quizId } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [quizTitle, setQuizTitle] = useState('');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
    const [stats, setStats] = useState<QuizStats>({ participantCount: 0, averageScore: 0 });

    useEffect(() => {
        if (user && quizId) {
            loadResultData();
        }
    }, [user, quizId]);

    async function loadResultData() {
        try {
            // 1. Get Quiz Details
            const { data: quizData, error: qErr } = await supabase
                .from('quizzes')
                .select('title')
                .eq('quiz_id', quizId)
                .single();

            if (qErr) throw qErr;
            setQuizTitle(quizData.title);

            // 2. Get All Attempts for leaderboard calculation
            // We join with users to get names
            const { data: attempts, error: aErr } = await supabase
                .from('attempts')
                .select(`
          user_id,
          score,
          max_score,
          duration_sec,
          created_at,
          users (
            name
          )
        `)
                .eq('quiz_id', quizId)
                .order('score', { ascending: false })
                .order('duration_sec', { ascending: true }); // Secondary sort by time (lower is better, assuming duration_sec tracks time taken)

            if (aErr) throw aErr;

            // Process attempts to keep only best attempt per user or just latest? 
            // Usually leaderboards take best score.
            const bestAttemptsMap = new Map<number, LeaderboardEntry>();

            attempts?.forEach((attempt: any) => {
                const existing = bestAttemptsMap.get(attempt.user_id);
                if (!existing || attempt.score > existing.score) {
                    bestAttemptsMap.set(attempt.user_id, {
                        user_id: attempt.user_id,
                        name: attempt.users?.name || 'Anonymous',
                        score: attempt.score,
                        max_score: attempt.max_score,
                        duration_sec: attempt.duration_sec,
                        created_at: attempt.created_at,
                        rank: 0 // placeholder
                    });
                }
            });

            // Convert to array and sort
            let sortedLeaderboard = Array.from(bestAttemptsMap.values())
                .sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    return a.duration_sec - b.duration_sec; // lower time is better
                });

            // Assign ranks
            sortedLeaderboard = sortedLeaderboard.map((entry, index) => ({
                ...entry,
                rank: index + 1
            }));

            // Stats
            const totalParticipants = sortedLeaderboard.length;
            const totalScore = sortedLeaderboard.reduce((acc, curr) => acc + curr.score, 0);
            const avgScore = totalParticipants > 0 ? (totalScore / totalParticipants) : 0;

            setStats({
                participantCount: totalParticipants,
                averageScore: avgScore
            });

            setLeaderboard(sortedLeaderboard.slice(0, 10)); // Top 10

            // Find current user's entry
            if (user) {
                const myEntry = sortedLeaderboard.find(e => e.user_id === user.user_id);
                setUserRank(myEntry || null);
            }

        } catch (error) {
            console.error("Error loading result data:", error);
        } finally {
            setLoading(false);
        }
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                    <div className="animate-spin h-12 w-12 border-b-4 border-blue-600 rounded-full"></div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                <Header />

                <main className="max-w-5xl mx-auto px-4 py-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{quizTitle} Results</h1>
                        <p className="text-gray-600 dark:text-gray-300">See how you performed compared to others</p>
                    </div>

                    {/* User Stats Card */}
                    {userRank ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8 border border-blue-100 dark:border-blue-900/30">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Rank</div>
                                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                        #{userRank.rank}
                                        <span className="text-lg text-gray-400 font-normal ml-2">/ {stats.participantCount}</span>
                                    </div>
                                </div>
                                <div className="pt-4 md:pt-0">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Score</div>
                                    <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                                        {userRank.score}
                                        <span className="text-lg text-gray-400 font-normal ml-1">/ {userRank.max_score}</span>
                                    </div>
                                </div>
                                <div className="pt-4 md:pt-0">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Time Taken</div>
                                    <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                                        {formatTime(userRank.duration_sec)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                            <p className="text-yellow-700">You haven't taken this quiz yet.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Stats Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quiz Statistics</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                        <span className="text-gray-600 dark:text-gray-300">Total Participants</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{stats.participantCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                        <span className="text-gray-600 dark:text-gray-300">Average Score</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{stats.averageScore.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/quiz')}
                                className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl transition-colors shadow-lg"
                            >
                                ← Back to Quiz List
                            </button>
                        </div>

                        {/* Leaderboard Column */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">🏆 Leaderboard</h3>
                                    <span className="text-sm text-gray-500">Top 10</span>
                                </div>

                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {leaderboard.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">No attempts yet. Be the first!</div>
                                    ) : (
                                        leaderboard.map((entry) => (
                                            <div key={entry.user_id} className={`flex items-center p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${entry.user_id === user?.user_id ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                                                <div className={`
                                            flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm mr-4
                                            ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                        entry.rank === 2 ? 'bg-gray-200 text-gray-700' :
                                                            entry.rank === 3 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-500'}
                                        `}>
                                                    {entry.rank}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${entry.user_id === user?.user_id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                                        {entry.name} {entry.user_id === user?.user_id && '(You)'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {new Date(entry.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <div className="text-right ml-4">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {entry.score} <span className="text-gray-400 font-normal">/ {entry.max_score}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatTime(entry.duration_sec)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </main>
                <Footer />
            </div>
        </ProtectedRoute>
    );
}
