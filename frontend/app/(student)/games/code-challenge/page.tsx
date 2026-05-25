'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Code2, ChevronRight, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProblemListItem {
  id: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

const DIFF_COLOR: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Hard: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function ProblemListPage() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/code-server/problems')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProblems(data.problems || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-4">
            <Terminal className="w-3.5 h-3.5" />
            Code Challenges
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Select a Problem
          </h1>
          <p className="mt-3 text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed">
            Practice your algorithms and data structures. Solve problems in your favorite language and receive instant AI-powered feedback.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm text-center">
            {error}
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center p-12 border border-slate-800 border-dashed rounded-2xl bg-slate-900/30 text-slate-500">
            No problems available right now.
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-3 sm:gap-4"
          >
            {problems.map(problem => (
              <motion.div key={problem.id} variants={itemVariants}>
                <Link
                  href={`/games/code-challenge/${problem.slug}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                      <Code2 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {problem.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${DIFF_COLOR[problem.difficulty]}`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-xs text-slate-500 font-medium bg-slate-800/50 px-2 py-0.5 rounded-md">
                          {problem.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex items-center justify-end sm:justify-start gap-2 text-indigo-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                    Solve Challenge
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
