"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wand2,
  FileEdit,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  Trophy,
  Sparkles,
  Zap,
  Target,
  Users
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardHub() {
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    avgScore: 0,
    activeStudents: 0,
    loading: true
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [quizzesRes, questionsRes, attemptsRes, studentsRes] = await Promise.all([
        supabase.from('quizzes').select('quiz_id', { count: 'exact', head: true }),
        supabase.from('questions').select('question_id', { count: 'exact', head: true }),
        supabase.from('attempts').select('score, max_score'),
        supabase.from('users').select('user_uid', { count: 'exact', head: true }).eq('role', 'student')
      ]);

      // Calculate Average Score
      let avg = 0;
      if (attemptsRes.data && attemptsRes.data.length > 0) {
        const totalEarned = attemptsRes.data.reduce((sum, a) => sum + (a.score || 0), 0);
        const totalPossible = attemptsRes.data.reduce((sum, a) => sum + (a.max_score || 0), 0);
        avg = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
      }

      setStats({
        totalQuizzes: quizzesRes.count || 0,
        totalQuestions: questionsRes.count || 0,
        avgScore: avg,
        activeStudents: studentsRes.count || 0,
        loading: false
      });
    } catch (err) {
      console.error("Error fetching admin quiz stats:", err);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }

  const cards = [
    {
      title: "AI Generator",
      desc: "Instantly generate comprehensive quizzes on any topic or for specific companies using advanced AI models.",
      href: "/admin/quiz/ai-generator",
      icon: Wand2,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "hover:border-teal-500/50",
      shadow: "hover:shadow-teal-500/10",
      gradient: "from-teal-500 to-emerald-500",
      cta: "Start Generating"
    },
    {
      title: "Manual Creation",
      desc: "Build quizzes from scratch. Create shells, add custom questions, and map them precisely as needed.",
      href: "/admin/quiz/manual",
      icon: FileEdit,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "hover:border-indigo-500/50",
      shadow: "hover:shadow-indigo-500/10",
      gradient: "from-indigo-500 to-violet-500",
      cta: "Open Editor"
    },
    {
      title: "Manage & Analytics",
      desc: "View all quizzes, assign them to students, track attempts, and monitor leaderboard performance.",
      href: "/admin/quiz/manage",
      icon: BarChart3,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "hover:border-amber-500/50",
      shadow: "hover:shadow-amber-500/10",
      gradient: "from-amber-500 to-orange-500",
      cta: "View Dashboard"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-slate-800 group-hover:border-slate-700 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quiz Engine v2.0</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Trophy className="h-3.5 w-3.5" />
            Admin Control Hub
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Assessment <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-400">Ecosystem</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Architect your platform's learning path. Leverage advanced AI generation, manual craftsmanship, or deep performance analytics to drive student success.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {cards.map((card, i) => (
            <Link key={i} href={card.href} className="group relative h-full">
              <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-3xl blur opacity-0 group-hover:opacity-20 transition-all duration-500`} />

              <div className={`relative h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800 ${card.border} rounded-3xl p-8 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl ${card.shadow} flex flex-col`}>
                <div className={`w-14 h-14 ${card.bg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <card.icon className={`h-7 w-7 ${card.color}`} />
                </div>

                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-white transition-colors">
                  {card.title}
                </h2>
                <p className="text-slate-400 mb-10 flex-1 leading-relaxed text-sm">
                  {card.desc}
                </p>

                <div className={`flex items-center gap-2 text-sm font-bold ${card.color} group-hover:gap-4 transition-all`}>
                  {card.cta}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Summary / Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Quizzes', value: stats.loading ? '...' : stats.totalQuizzes.toLocaleString(), icon: Zap, color: 'text-indigo-400' },
            { label: 'Total Questions', value: stats.loading ? '...' : stats.totalQuestions.toLocaleString(), icon: Target, color: 'text-teal-400' },
            { label: 'Avg Score', value: stats.loading ? '...' : `${stats.avgScore}%`, icon: Sparkles, color: 'text-amber-400' },
            { label: 'Active Students', value: stats.loading ? '...' : stats.activeStudents.toLocaleString(), icon: Users, color: 'text-rose-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
