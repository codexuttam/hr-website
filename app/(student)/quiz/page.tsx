'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  BookOpen, CheckCircle2, Clock, Trophy, 
  ArrowRight, Play, LayoutDashboard, Sparkles,
  Target, GraduationCap, BarChart3
} from 'lucide-react';

type Quiz = {
  quiz_id: number;
  title: string;
  description?: string;
  assigned_at?: string;
  status?: string;
  completed_at?: string;
};

type QuizAttempt = {
  attempt_id: number;
  score: number;
  max_score: number;
  created_at: string;
};

export default function QuizListPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [assignedQuizzes, setAssignedQuizzes] = useState<Quiz[]>([]);
  const [completedQuizzes, setCompletedQuizzes] = useState<{ [key: number]: QuizAttempt }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    if (user) {
      loadQuizzes();
    }
  }, [user, isAuthenticated]);

  async function loadQuizzes() {
    if (!user) return;

    try {
      const { data: assignments, error: assignError } = await supabase
        .from('quiz_assignments')
        .select(`
          quiz_id,
          assigned_at,
          status,
          completed_at,
          quizzes (
            quiz_id,
            title,
            description
          )
        `)
        .eq('user_id', user.user_id)
        .order('assigned_at', { ascending: false });

      if (assignError) throw assignError;

      const quizzes = (assignments || []).map((a: any) => ({
        quiz_id: a.quiz_id,
        title: a.quizzes?.title || 'Untitled Quiz',
        description: a.quizzes?.description,
        assigned_at: a.assigned_at,
        status: a.status,
        completed_at: a.completed_at,
      }));

      setAssignedQuizzes(quizzes);

      const quizIds = quizzes.map((q: Quiz) => q.quiz_id);
      if (quizIds.length > 0) {
        const { data: attempts, error: attemptsError } = await supabase
          .from('attempts')
          .select('*')
          .eq('user_id', user.user_id)
          .in('quiz_id', quizIds)
          .order('score', { ascending: false });

        if (!attemptsError && attempts) {
          const bestAttempts: { [key: number]: QuizAttempt } = {};
          attempts.forEach((attempt: any) => {
            if (!bestAttempts[attempt.quiz_id] ||
              attempt.score > bestAttempts[attempt.quiz_id].score) {
              bestAttempts[attempt.quiz_id] = attempt;
            }
          });
          setCompletedQuizzes(bestAttempts);
        }
      }
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleStartQuiz(quizId: number) {
    router.push(`/quiz/${quizId}`);
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading assessments...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const completedCount = Object.keys(completedQuizzes).length;
  const pendingCount = assignedQuizzes.length - completedCount;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* ── Quiz Hero Banner ──────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 md:p-12 shadow-2xl shadow-indigo-500/20 border border-white/10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-indigo-100 text-xs font-bold tracking-widest uppercase border border-white/20">
                  <GraduationCap className="h-4 w-4" />
                  Knowledge Assessment
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  Skills Challenge
                </h1>
                <p className="max-w-xl text-indigo-100/80 text-lg">
                  Test your technical proficiency and identify learning gaps. Each quiz is designed to simulate real-world coding and problem-solving scenarios.
                </p>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center min-w-[140px]">
                  <div className="text-indigo-200 text-xs font-bold uppercase mb-1">Assigned</div>
                  <div className="text-3xl font-black text-white">{assignedQuizzes.length}</div>
                </div>
                <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-5 border border-emerald-400/20 text-center min-w-[140px]">
                  <div className="text-emerald-200 text-xs font-bold uppercase mb-1">Completed</div>
                  <div className="text-3xl font-black text-white">{completedCount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Quiz List Section ─────────────────────────────────── */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Active Assessments</h2>
                <p className="text-sm text-slate-500 mt-1">Quizzes assigned to you by instructors</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full uppercase tracking-tighter">
                <BarChart3 className="h-3.5 w-3.5" />
                Performance Tracking
              </div>
            </div>

            {assignedQuizzes.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 border border-gray-100 dark:border-slate-800 shadow-sm text-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-10 w-10 text-slate-300" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  No Quizzes Assigned
                </h2>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Your instructor hasn't assigned any technical quizzes to you yet. Check back later or explore our learning games.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedQuizzes.map((quiz) => {
                  const attempt = completedQuizzes[quiz.quiz_id];
                  const isCompleted = !!attempt;
                  const percentage = attempt
                    ? Math.round((attempt.score / attempt.max_score) * 100)
                    : 0;

                  return (
                    <div
                      key={quiz.quiz_id}
                      className={`group relative bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-300 ${
                        isCompleted 
                          ? 'border-emerald-100 dark:border-emerald-900/50 hover:shadow-emerald-500/5' 
                          : 'border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 shadow-sm hover:shadow-xl hover:-translate-y-1'
                      }`}
                    >
                      {/* Status Icon */}
                      <div className="absolute top-6 right-6">
                        {isCompleted ? (
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="h-5 w-5 text-indigo-600 dark:text-indigo-400 fill-current" />
                          </div>
                        )}
                      </div>

                      <div className="p-6 pt-16 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {quiz.title}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {quiz.description || 'No description provided for this technical assessment.'}
                          </p>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              Assigned
                            </span>
                            <span className="text-slate-600 dark:text-slate-300">
                              {new Date(quiz.assigned_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>

                          {isCompleted && (
                            <>
                              <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                  <Target className="h-3 w-3" />
                                  Best Score
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  {attempt.score} / {attempt.max_score} ({percentage}%)
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  className={`h-full rounded-full ${
                                    percentage >= 80 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`} 
                                />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="pt-4">
                          <button
                            onClick={() => {
                              if (isCompleted) {
                                router.push(`/quiz/${quiz.quiz_id}/result`);
                              } else {
                                handleStartQuiz(quiz.quiz_id);
                              }
                            }}
                            className={`w-full py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                              isCompleted
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-gray-100 dark:border-slate-700 hover:bg-slate-50'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <BarChart3 className="h-4 w-4" />
                                Performance Stats
                              </>
                            ) : (
                              <>
                                Start Assessment
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Knowledge Section ─────────────────────────────────── */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-left border border-white/5">
             <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
             </div>
             <div className="flex-1">
                <h3 className="text-xl font-bold text-white">Continuous Learning</h3>
                <p className="text-slate-400 mt-1">Completed all assigned quizzes? Check out our learning games to keep sharpening your skills.</p>
             </div>
             <button 
                onClick={() => router.push('/games')}
                className="px-8 py-3 bg-white text-slate-900 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-xl hover:-translate-y-1"
             >
                Explore Games
             </button>
          </div>

        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
