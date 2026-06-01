'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, CheckCircle, HelpCircle, Loader2 } from 'lucide-react';

interface Question {
  question_id: number;
  question: string;
  choices: string[];
  correct_answer: string;
  difficulty?: string;
}

interface QuizPreviewModalProps {
  quizId: number | null;
  quizTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuizPreviewModal({ quizId, quizTitle, isOpen, onClose }: QuizPreviewModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && quizId) {
      loadQuestions();
    }
  }, [isOpen, quizId]);

  async function loadQuestions() {
    setLoading(true);
    setError(null);
    try {
      // 1. Get the mapped question IDs
      const { data: qmap, error: mErr } = await supabase
        .from('quiz_questions')
        .select('question_id')
        .eq('quiz_id', quizId);

      if (mErr) throw mErr;
      if (!qmap || qmap.length === 0) {
        setQuestions([]);
        return;
      }

      const ids = qmap.map((m) => m.question_id);

      // 2. Fetch the question details
      const { data: questionsData, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .in('question_id', ids);

      if (qErr) throw qErr;
      setQuestions(questionsData || []);
    } catch (err: any) {
      console.error('Error loading quiz preview questions:', err);
      setError(err.message || 'Failed to load questions.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">Quiz Preview (ID: {quizId})</span>
            <h3 className="font-bold text-white text-xl mt-1">{quizTitle}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-teal-400 mb-3" />
              <p className="text-sm">Retrieving quiz questions...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && questions.length === 0 && (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-3xl text-slate-500">
              <HelpCircle className="h-8 w-8 text-slate-700 mx-auto mb-3" />
              <p className="text-sm">No questions attached to this quiz yet.</p>
            </div>
          )}

          {!loading && !error && questions.map((q, idx) => (
            <div key={q.question_id} className="p-5 bg-slate-950/40 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all">
              <div className="flex justify-between items-start gap-4 mb-4">
                <span className="text-xs font-black bg-slate-900 border border-slate-800 text-slate-500 px-2.5 py-1 rounded-lg">Q{idx + 1}</span>
                {q.difficulty && (
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400' :
                    q.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-rose-500/10 text-rose-400'
                  }`}>
                    {q.difficulty}
                  </span>
                )}
              </div>
              
              <h4 className="font-bold text-white text-base leading-relaxed mb-4">{q.question}</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.choices?.map((choice, i) => {
                  const isCorrect = choice === q.correct_answer;
                  return (
                    <div 
                      key={i} 
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        isCorrect 
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                          : 'bg-slate-950/50 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span><strong>{String.fromCharCode(65 + i)}.</strong> {choice}</span>
                      {isCorrect && <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 ml-2" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
