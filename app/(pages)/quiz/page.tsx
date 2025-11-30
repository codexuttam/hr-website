'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

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
      // Load assigned quizzes for this student
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

      if (assignError) {
        console.error('Error loading assignments:', assignError);
        throw assignError;
      }

      // Transform the data
      const quizzes = (assignments || []).map((a: any) => ({
        quiz_id: a.quiz_id,
        title: a.quizzes?.title || 'Untitled Quiz',
        description: a.quizzes?.description,
        assigned_at: a.assigned_at,
        status: a.status,
        completed_at: a.completed_at,
      }));

      setAssignedQuizzes(quizzes);

      // Load best attempts for each quiz
      const quizIds = quizzes.map((q: Quiz) => q.quiz_id);
      if (quizIds.length > 0) {
        const { data: attempts, error: attemptsError } = await supabase
          .from('attempts')
          .select('*')
          .eq('user_id', user.user_id)
          .in('quiz_id', quizIds)
          .order('score', { ascending: false });

        if (!attemptsError && attempts) {
          // Get best attempt for each quiz
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
      alert('Failed to load quizzes');
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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading quizzes...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📚 My Quizzes
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Complete your assigned quizzes and track your progress
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📝</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {assignedQuizzes.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Assigned Quizzes
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">✅</div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Object.keys(completedQuizzes).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Completed
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">⏳</div>
                <div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {assignedQuizzes.length - Object.keys(completedQuizzes).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Pending
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quizzes List */}
          {assignedQuizzes.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Quizzes Assigned Yet
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Your instructor hasn't assigned any quizzes to you yet. Check back later!
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
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Quiz Header */}
                    <div className={`p-4 ${
                      isCompleted 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-blue-50 dark:bg-blue-900/20'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {quiz.title}
                          </h3>
                          {quiz.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {quiz.description}
                            </p>
                          )}
                        </div>
                        <div className="text-3xl ml-2">
                          {isCompleted ? '✅' : '📝'}
                        </div>
                      </div>
                    </div>

                    {/* Quiz Body */}
                    <div className="p-4">
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Assigned:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {new Date(quiz.assigned_at || '').toLocaleDateString()}
                          </span>
                        </div>

                        {isCompleted && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                Best Score:
                              </span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {attempt.score}/{attempt.max_score} ({percentage}%)
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                Completed:
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {new Date(attempt.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Progress Bar (if completed) */}
                      {isCompleted && (
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                percentage >= 80 
                                  ? 'bg-green-600' 
                                  : percentage >= 60 
                                  ? 'bg-yellow-600' 
                                  : 'bg-red-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={() => handleStartQuiz(quiz.quiz_id)}
                        className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                          isCompleted
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {isCompleted ? '🔄 Retake Quiz' : '▶️ Start Quiz'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
