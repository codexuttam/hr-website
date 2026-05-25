'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Question = {
  question_id: number;
  question: string;
  choices?: string[];
  correct_answer?: string;
};

type Quiz = {
  quiz_id: number;
  title: string;
};

export default function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const [startTime] = useState(Date.now());
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const [fullscreenAccepted, setFullscreenAccepted] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                           ANTI-CHEATING BEHAVIOR                           */
  /* -------------------------------------------------------------------------- */

  // Block copy/paste/right-click
  useEffect(() => {
    const block = (e: Event) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', block);
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('paste', block);

    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('paste', block);
    };
  }, []);

  // Tab switching
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && fullscreenAccepted && !showResults) {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);

        if (newCount > 2) {
          alert("You switched tabs too many times. Auto-submitting.");
          handleSubmit();
        } else {
          alert(`Warning: Tab switching is not allowed! (${newCount}/2)`);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [tabSwitchCount, fullscreenAccepted, showResults]);

  /* -------------------------------------------------------------------------- */
  /*                         FULLSCREEN (with user action)                      */
  /* -------------------------------------------------------------------------- */

  const enableFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setFullscreenAccepted(true);
    } catch (err) {
      console.error("Fullscreen failed:", err);
      alert("Unable to enter fullscreen. Please try again.");
    }
  };

  // Enforce staying in fullscreen
  useEffect(() => {
    if (!fullscreenAccepted || loading || showResults) return;

    const handleFS = () => {
      if (!document.fullscreenElement && !showResults) {
        alert("Please stay in full-screen mode.");
      }
    };

    document.addEventListener("fullscreenchange", handleFS);
    return () => document.removeEventListener("fullscreenchange", handleFS);
  }, [fullscreenAccepted, loading, showResults]);

  /* -------------------------------------------------------------------------- */
  /*                                 LOAD QUIZ                                  */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    loadQuiz();
  }, [quizId, isAuthenticated]);

  async function loadQuiz() {
    try {
      const { data: quizData, error: qErr } = await supabase
        .from('quizzes')
        .select('*')
        .eq('quiz_id', quizId)
        .single();

      if (qErr || !quizData) throw new Error("Quiz not found");
      setQuiz(quizData);

      const { data: qmap, error: mErr } = await supabase
        .from('quiz_questions')
        .select('question_id')
        .eq('quiz_id', quizId);

      if (mErr || !qmap || !qmap.length) throw new Error("No questions found");

      const ids = qmap.map((m: { question_id: number }) => m.question_id);

      const { data: questionsData, error: qErr2 } = await supabase
        .from('questions')
        .select('*')
        .in('question_id', ids);

      if (qErr2 || !questionsData) throw new Error("Failed loading questions");

      setQuestions(questionsData);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
      router.push('/quiz');
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                 SUBMISSION                                 */
  /* -------------------------------------------------------------------------- */

  const handleAnswerSelect = (a: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: a,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(i => i - 1);
    }
  };

  async function handleSubmit() {
    let correct = 0;
    questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correct_answer) correct++;
    });

    setScore(correct);
    setShowResults(true);

    if (user) {
      const timeSec = Math.floor((Date.now() - startTime) / 1000);

      try {
        await supabase.from('attempts').insert([
          {
            quiz_id: Number(quizId),
            user_id: user.user_id,
            score: correct,
            max_score: questions.length,
            duration_sec: timeSec,
          },
        ]);
        // Redirect to results dashboard
        router.push(`/quiz/${quizId}/result`);
      } catch (err) {
        console.error("Error saving attempt:", err);
      }
    } else {
      setShowResults(true); // Fallback if no user (shouldn't happen due to auth check)
    }
  }

  // Check if already taken
  useEffect(() => {
    async function checkAttempt() {
      if (!user || !quizId) return;
      const { data } = await supabase
        .from('attempts')
        .select('attempt_id')
        .eq('user_id', user.user_id)
        .eq('quiz_id', quizId)
        .maybeSingle(); // Use maybeSingle to avoid 406 error if multiple exists or single requirement

      if (data) {
        router.replace(`/quiz/${quizId}/result`);
      }
    }
    checkAttempt();
  }, [user, quizId, router]);

  /* -------------------------------------------------------------------------- */
  /*                             LOADING & ERRORS                               */
  /* -------------------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
        <div>
          <div className="animate-spin h-12 w-12 border-b-4 border-blue-600 mx-auto rounded-full"></div>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-300">Loading quiz...</p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                         FULLSCREEN ENTRY REQUIRED                          */
  /* -------------------------------------------------------------------------- */

  if (!fullscreenAccepted && !showResults) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
        <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Enter Full Screen</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You must enable full-screen mode before taking the quiz.
          </p>

          <button
            onClick={enableFullscreen}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Enter Fullscreen & Start Quiz
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                               RESULTS PAGE                                 */
  /* -------------------------------------------------------------------------- */

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Header />

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow">
            <h1 className="text-3xl font-bold text-center mb-6">Quiz Completed 🎉</h1>

            <div className="text-center mb-8">
              <div className="inline-block p-10 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-3">
                <div className="text-6xl font-bold text-blue-600">{percentage}%</div>
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300">
                You scored {score} out of {questions.length}
              </p>
            </div>

            <div className="space-y-4">
              {questions.map((q, i) => {
                const uans = selectedAnswers[i];
                const correct = uans === q.correct_answer;
                return (
                  <div
                    key={q.question_id}
                    className={`p-4 border-2 rounded-lg ${correct ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                      }`}
                  >
                    <p className="font-semibold mb-1">{i + 1}. {q.question}</p>
                    <p>Your answer: {uans || "Not answered"}</p>
                    {!correct && (
                      <p className="text-green-600">Correct: {q.correct_answer}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button onClick={() => router.push('/quiz')} className="px-6 py-3 bg-gray-700 text-white rounded-lg">
                Go Back
              </button>
              <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white rounded-lg">
                Retake Quiz
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                 QUIZ PAGE                                  */
  /* -------------------------------------------------------------------------- */

  const q = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-800 border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{quiz?.title}</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm">
            Time: {Math.floor((Date.now() - startTime) / 60000)}m {Math.floor(((Date.now() - startTime) / 1000) % 60)}s
          </span>

          <div className="w-32 h-2 bg-gray-300 rounded-full">
            <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar */}
        <aside className="hidden md:block w-72 p-6 bg-white dark:bg-slate-800 border-r overflow-y-auto">
          <h3 className="font-semibold mb-3">Questions</h3>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`p-2 rounded-lg text-sm text-center ${currentQuestionIndex === idx
                  ? "bg-blue-600 text-white"
                  : selectedAnswers[idx]
                    ? "bg-green-200 text-green-900"
                    : "bg-gray-100"
                  }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 overflow-y-auto flex justify-center">
          <div className="w-full max-w-3xl">

            <div className="bg-white dark:bg-slate-800 rounded-xl border shadow-sm p-6">
              <span className="text-xs px-3 py-1 bg-blue-50 rounded-full font-semibold">
                QUESTION {currentQuestionIndex + 1}
              </span>

              <h2 className="text-2xl font-bold mt-4">{q.question}</h2>

              <div className="mt-6 space-y-3">
                {q.choices?.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(choice)}
                    className={`w-full p-4 text-left border rounded-xl ${selectedAnswers[currentQuestionIndex] === choice
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    <strong>{String.fromCharCode(65 + i)}.</strong> {choice}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="px-5 py-3 border rounded-lg disabled:opacity-50"
              >
                ← Previous
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg"
              >
                {currentQuestionIndex === questions.length - 1 ? "Submit Quiz" : "Next →"}
              </button>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}
