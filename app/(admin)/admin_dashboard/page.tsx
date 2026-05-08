'use client';

import React, { useEffect, useState } from 'react';
import RoleProtectedRoute from '../../components/auth/RoleProtectedRoute';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import RoleBadge from '../../components/ui/RoleBadge';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { 
  Users, BarChart3, Shield, Settings, Megaphone, 
  Trophy, FileText, LayoutDashboard, TrendingUp,
  UserCheck, BookOpen, Briefcase, ArrowRight, Sparkles
} from 'lucide-react';

const ADMIN_FEATURES = [
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    desc: 'Manage account access & roles',
    active: true
  },
  {
    name: 'Quiz Management',
    href: '/quiz/admin',
    icon: Trophy,
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    desc: 'Configure assessments & questions',
    active: true
  },
  {
    name: 'Placement Drives',
    href: '/admin/drives',
    icon: Megaphone,
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-600 dark:text-violet-400',
    desc: 'Manage job drives & hiring',
    active: true
  },
  {
    name: 'Analytics',
    href: '#',
    icon: BarChart3,
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    desc: 'Platform growth & usage metrics',
    active: false
  },
  {
    name: 'Resume Management',
    href: '#',
    icon: FileText,
    gradient: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    text: 'text-rose-600 dark:text-rose-400',
    desc: 'Review & manage student resumes',
    active: false
  },
  {
    name: 'System Settings',
    href: '#',
    icon: Settings,
    gradient: 'from-slate-500 to-gray-600',
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    text: 'text-slate-600 dark:text-slate-400',
    desc: 'Global configurations',
    active: false
  },
];

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalResumes: 0,
    totalAttempts: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [usersRes, quizzesRes, resumesRes, attemptsRes, applicationsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('quizzes').select('quiz_id', { count: 'exact', head: true }),
        supabase.from('resumes').select('resume_id', { count: 'exact', head: true }),
        supabase.from('quiz_assignments').select('assignment_id', { count: 'exact', head: true }),
        supabase.from('drive_applications').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalQuizzes: quizzesRes.count || 0,
        totalResumes: resumesRes.count || 0,
        totalAttempts: attemptsRes.count || 0,
        totalApplications: applicationsRes.count || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setTimeout(() => setLoading(false), 500); // Small delay to prevent flash
    }
  }

  return (
    <RoleProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* ── Admin Hero Banner ─────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 shadow-2xl shadow-indigo-500/10">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-[80px] pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-indigo-200 text-xs font-semibold tracking-wider uppercase">
                  <Shield className="h-3.5 w-3.5" />
                  Administrator Portal
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Welcome, {user?.name}
                </h1>
                <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                  Platform management and operational overview. Monitor user growth, manage content, and oversee placement drives from your central command center.
                </p>
              </div>
              
              <div className="flex-shrink-0 flex items-center gap-4">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[140px] text-center">
                  <div className="text-indigo-400 text-xs font-bold uppercase mb-1">Status</div>
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </div>
                </div>
                <div className="hidden sm:block">
                  <RoleBadge role="admin" size="lg" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats Row ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Active Quizzes', value: stats.totalQuizzes, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              { label: 'Resumes', value: stats.totalResumes, icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
              { label: 'Quiz Attempts', value: stats.totalAttempts, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'Applications', value: stats.totalApplications, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? '...' : stat.value}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ── Admin Features ────────────────────────────────────── */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Management Tools</h2>
                <p className="text-sm text-slate-500 mt-1">Core administrative functions and platform controls</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full uppercase tracking-tighter">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Control Center
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ADMIN_FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                const isComingSoon = !feature.active;
                
                return (
                  <div 
                    key={i}
                    className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm transition-all ${
                      isComingSoon ? 'opacity-80' : 'hover:shadow-xl hover:-translate-y-1'
                    }`}
                  >
                    {!isComingSoon && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity rounded-2xl pointer-events-none`} />
                    )}
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${feature.text}`} />
                      </div>
                      {isComingSoon && (
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md">
                          Coming Soon
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                      {feature.desc}
                    </p>

                    {feature.active ? (
                      <Link 
                        href={feature.href}
                        className={`inline-flex items-center gap-2 text-sm font-bold ${feature.text} hover:underline underline-offset-4`}
                      >
                        Launch Module
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <div className="text-xs text-slate-400 italic">Under development</div>
                    )}
                  </div>
                );
              })}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <RoleBadge role="admin" size="lg" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats Row ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Active Quizzes', value: stats.totalQuizzes, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              { label: 'Resumes', value: stats.totalResumes, icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
              { label: 'Quiz Attempts', value: stats.totalAttempts, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'Applications', value: stats.totalApplications, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? '...' : stat.value}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ── Admin Features ────────────────────────────────────── */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Management Tools</h2>
                <p className="text-sm text-slate-500 mt-1">Core administrative functions and platform controls</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full uppercase tracking-tighter">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Control Center
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ADMIN_FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                const isComingSoon = !feature.active;
                
                return (
                  <div 
                    key={i}
                    className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm transition-all ${
                      isComingSoon ? 'opacity-80' : 'hover:shadow-xl hover:-translate-y-1'
                    }`}
                  >
                    {!isComingSoon && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity rounded-2xl pointer-events-none`} />
                    )}
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${feature.text}`} />
                      </div>
                      {isComingSoon && (
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md">
                          Coming Soon
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                      {feature.desc}
                    </p>

                    {feature.active ? (
                      <Link 
                        href={feature.href}
                        className={`inline-flex items-center gap-2 text-sm font-bold ${feature.text} hover:underline underline-offset-4`}
                      >
                        Launch Module
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <div className="text-xs text-slate-400 italic">Under development</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Maintenance Section ───────────────────────────────── */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 border border-indigo-100/50 dark:border-indigo-800/30">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
              <Sparkles className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200">System Optimizer</h3>
              <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 mt-1">
                Last database synchronization was successful. All services are running at optimal performance.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              Refresh Stats
            </button>
          </div>

        </main>
        
        <Footer />
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminDashboardPage;
