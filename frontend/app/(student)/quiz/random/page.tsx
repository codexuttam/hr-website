'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function RandomQuizPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, router]);

  async function loadRandomQuiz() {
    setLoading(true);
    try {
      // Get a random quiz
      const { data: quizzes, error } = await supabase
        .from('quizzes')
        .select('quiz_id')
        .limit(100);

      if (error || !quizzes || quizzes.length === 0) {
        throw new Error('No quizzes available');
      }

      // Pick a random quiz
      const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
      
      // Redirect to the quiz
      router.push(`/quiz/${randomQuiz.quiz_id}`);
    } catch (error: any) {
      console.error('Error loading random quiz:', error);
      alert(error.message || 'Failed to load random quiz');
      router.push('/quiz');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadRandomQuiz();
    }
  }, [isAuthenticated]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Loading Random Quiz...
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Finding a quiz for you to take
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
