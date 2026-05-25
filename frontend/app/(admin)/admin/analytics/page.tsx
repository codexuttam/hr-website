"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Trophy, 
  Briefcase, 
  Calendar, 
  Sparkles, 
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userGrowth: '0%',
    quizCompletion: '0%',
    placementRate: '0%',
    totalUsers: 0,
    totalQuizzes: 0,
    totalApplications: 0
  });

  useEffect(() => {
    fetchRealtimeStats();
  }, []);

  async function fetchRealtimeStats() {
    setLoading(true);
    try {
      // 1. User Growth (New users in last 30 days vs total)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [totalUsersRes, newUsersRes] = await Promise.all([
        supabase.from('users').select('user_id', { count: 'exact', head: true }),
        supabase.from('users').select('user_id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString())
      ]);

      const totalUsers = totalUsersRes.count || 0;
      const newUsers = newUsersRes.count || 0;
      const growthRate = totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(1) : '0';

      // 2. Quiz Completion (Completed vs Total Assignments)
      const [totalAssignmentsRes, completedAssignmentsRes] = await Promise.all([
        supabase.from('quiz_assignments').select('assignment_id', { count: 'exact', head: true }),
        supabase.from('quiz_assignments').select('assignment_id', { count: 'exact', head: true }).eq('status', 'completed')
      ]);

      const totalAssignments = totalAssignmentsRes.count || 0;
      const completedAssignments = completedAssignmentsRes.count || 0;
      const completionRate = totalAssignments > 0 ? ((completedAssignments / totalAssignments) * 100).toFixed(1) : '0';

      // 3. Placement Rate (Accepted vs Total Applications)
      const [totalAppsRes, acceptedAppsRes] = await Promise.all([
        supabase.from('drive_applications').select('id', { count: 'exact', head: true }),
        supabase.from('drive_applications').select('id', { count: 'exact', head: true }).eq('status', 'accepted')
      ]);

      const totalApps = totalAppsRes.count || 0;
      const acceptedApps = acceptedAppsRes.count || 0;
      const placementRate = totalApps > 0 ? ((acceptedApps / totalApps) * 100).toFixed(1) : '0';

      setStats({
        userGrowth: `+${growthRate}%`,
        quizCompletion: `${completionRate}%`,
        placementRate: `${placementRate}%`,
        totalUsers,
        totalQuizzes: totalAssignments,
        totalApplications: totalApps
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  const statConfig = [
    { label: 'User Growth', value: stats.userGrowth, icon: Users, color: 'text-blue-400', sub: 'Last 30 days' },
    { label: 'Quiz Completion', value: stats.quizCompletion, icon: Trophy, color: 'text-amber-400', sub: 'Course average' },
    { label: 'Placement Rate', value: stats.placementRate, icon: Briefcase, color: 'text-emerald-400', sub: 'Offer conversion' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2 text-indigo-400 font-semibold uppercase tracking-wider text-xs">
              <TrendingUp className="h-4 w-4" />
              Platform Insights
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              System Analytics
            </h1>
            <p className="text-slate-400 mt-2">
              Monitor platform growth, user engagement, and assessment performance.
            </p>
          </div>
          <button 
            onClick={fetchRealtimeStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-indigo-400" />}
            Refresh Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           {statConfig.map((stat, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className="h-12 w-12" />
              </div>
              <div className="text-slate-500 text-sm font-bold uppercase tracking-tight mb-1">{stat.label}</div>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-black text-white">
                  {loading ? '...' : stat.value}
                </div>
                <div className="text-emerald-500 text-xs font-bold mb-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3" />
                  {stat.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="text-indigo-400" />
              Engagement Overview
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Total Active Users', value: stats.totalUsers, max: 1000 },
                { label: 'Total Assessments', value: stats.totalQuizzes, max: 500 },
                { label: 'Total Applications', value: stats.totalApplications, max: 2000 },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400 font-medium">{item.label}</span>
                    <span className="text-white font-bold">{loading ? '...' : item.value}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl p-8 flex flex-col justify-center text-center">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-8 w-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Custom Reports</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Need more granular data? Export custom CSV reports for specific placement drives or student batches.
            </p>
            <button className="mt-8 px-8 py-3 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-all self-center">
              Generate Report
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
