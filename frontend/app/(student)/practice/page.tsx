'use client';

import React from 'react';
import Link from 'next/link';
import { PROBLEMS } from '@/data/problems';
import { 
  Code2, 
  ChevronRight, 
  Search, 
  Filter,
  Trophy,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PracticeListPage() {
  const problemList = Object.values(PROBLEMS);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <Header />
        
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Problem Set</h1>
              <p className="text-slate-500 font-medium">Sharpen your coding skills with curated DSA challenges.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                <div className="text-center px-4 border-r border-slate-100 dark:border-slate-800">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">124</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Solved</div>
                </div>
                <div className="text-center px-4 border-r border-slate-100 dark:border-slate-800">
                  <div className="text-2xl font-black text-indigo-500">1420</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Points</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-2xl font-black text-emerald-500">84%</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search problems by name, tag, or company..."
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <button className="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-indigo-500/30 transition-all shadow-sm">
                <Filter className="h-4 w-4" />
                Difficulty
              </button>
              <button className="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-indigo-500/30 transition-all shadow-sm">
                <Activity className="h-4 w-4" />
                Category
              </button>
            </div>
          </div>

          {/* Problem Table */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 dark:border-slate-800">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Difficulty</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Success Rate</th>
                    <th className="px-8 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {problemList.map((problem) => (
                    <tr key={problem.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-6">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </td>
                      <td className="px-8 py-6">
                        <Link href={`/practice/${problem.id}`} className="text-lg font-black text-slate-900 dark:text-white hover:text-indigo-500 transition-colors">
                          {problem.title}
                        </Link>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                        }`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-sm">
                          <Code2 className="h-4 w-4" />
                          {problem.category}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: '65%' }} />
                          </div>
                          <span className="text-xs font-bold text-slate-500">65%</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link 
                          href={`/practice/${problem.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-indigo-500/10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                        >
                          Solve
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
