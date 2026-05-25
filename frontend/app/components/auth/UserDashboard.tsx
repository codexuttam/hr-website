'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext'; // Keeping for logout/context usage if needed
import RoleBadge from '../ui/RoleBadge';
import { UserRole } from '../../contexts/AuthContext';
import AssignedQuizzes from '../dashboard/AssignedQuizzes';
import InterviewHistory from '../dashboard/InterviewHistory';
import {
  FileText, CheckCircle, Briefcase, Code2,
  Gamepad2, Mic, Bot, Users, BarChart3, Shield, Settings,
  Megaphone, Coins, Sparkles, ArrowRight, TrendingUp,
  BookOpen, Target, Zap, Star, Trophy,
} from 'lucide-react';

// Map feature names → lucide icons + gradient colors
const STUDENT_FEATURES = [
  {
    name: 'Resume Builder',
    href: '/resume-builder',
    icon: FileText,
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-600 dark:text-violet-400',
    desc: 'Build ATS-ready resumes with AI',
  },
  {
    name: 'ATS Checker',
    href: '/ats-tools',
    icon: CheckCircle,
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    desc: 'Score & optimize your resume',
  },
  {
    name: 'Placement Prep',
    href: '/drives',
    icon: Briefcase,
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    desc: 'Browse & apply to placement drives',
  },
  {
    name: 'Code IDE',
    href: '/code-playground',
    icon: Code2,
    gradient: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-600 dark:text-orange-400',
    desc: 'Practice coding in the browser',
  },
  {
    name: 'Brain Games',
    href: '/games',
    icon: Gamepad2,
    gradient: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    text: 'text-pink-600 dark:text-pink-400',
    desc: 'Sharpen your problem-solving skills',
  },
  {
    name: 'Mock Interview',
    href: '/interview',
    icon: Mic,
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    desc: 'AI-powered interview practice',
  },
  {
    name: 'AI Mentor',
    href: '/coach',
    icon: Bot,
    gradient: 'from-indigo-500 to-violet-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    desc: 'Get personalized AI guidance',
  },
];

const ADMIN_FEATURES = [
  { name: 'User Management', href: '/admin/users', icon: Users, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', desc: 'Manage accounts & roles' },
  { name: 'Quiz Management', href: '/admin/quiz', icon: Trophy, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', desc: 'Generate & manage AI quizzes' },
  { name: 'System Analytics', href: '/admin/analytics', icon: BarChart3, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', desc: 'View platform metrics' },
  { name: 'Content Moderation', href: '/admin/content', icon: Shield, gradient: 'from-red-500 to-rose-600', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', desc: 'Review & approve content' },
  { name: 'Platform Settings', href: '/admin/settings', icon: Settings, gradient: 'from-slate-500 to-gray-600', bg: 'bg-slate-50 dark:bg-slate-900/20', text: 'text-slate-600 dark:text-slate-400', desc: 'Configure system settings' },
  { name: 'Post New Drive', href: '/admin/drives/create', icon: Megaphone, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', desc: 'Publish placement drives' },
];

const STUDENT_STATS = [
  { label: 'Resumes Created', key: 'resumes', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  { label: 'Skills Assessed', key: 'skills', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { label: 'Interview Preps', key: 'interviews', icon: Mic, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
];

const ADMIN_STATS = [
  { label: 'Users Managed', key: 'totalUsers', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'System Reports', key: 'reports', icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { label: 'Platform Updates', key: 'updates', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
];

// Greeting based on time of day
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

interface DashboardStats {
  resumes?: number;
  skills?: number;
  interviews?: number;
  totalUsers?: number;
  reports?: number;
  updates?: number;
  [key: string]: number | undefined;
}

interface UserDashboardProps {
  initialUser: any; // Using any for compatibility with different user types, or define specific type
  initialStats: DashboardStats;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ initialUser, initialStats }) => {
  const { user: contextUser } = useAuth();

  // Prefer server-side user, fallback to context
  const user = initialUser || contextUser;

  // Use props for stats directly
  const stats = initialStats;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isStudent = user.role === 'student';
  const features = isStudent ? STUDENT_FEATURES : ADMIN_FEATURES;
  const statsConfig = isStudent ? STUDENT_STATS : ADMIN_STATS;
  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* -- Hero Banner -- */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 shadow-2xl shadow-indigo-500/20">
          {/* Background blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>{greeting}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {user.name}!
              </h1>
              <p className="text-indigo-200 text-sm">{user.email}</p>
              <div className="pt-1">
                <RoleBadge role={user.role} size="lg" />
              </div>
            </div>

            {/* Credits badge */}
            {isStudent && (
              <div className="flex-shrink-0 bg-white/15 backdrop-blur rounded-2xl p-5 border border-white/20 text-center min-w-[130px]">
                <Coins className="h-7 w-7 text-yellow-300 mx-auto mb-1" />
                <div className="text-3xl font-extrabold text-white">{user.credits ?? 0}</div>
                <div className="text-indigo-200 text-xs font-medium mt-0.5">AI Credits</div>
              </div>
            )}
          </div>

          {/* Quick action strip */}
          {isStudent && (
            <div className="relative mt-6 flex flex-wrap gap-3">
              {[
                { label: 'Build Resume', href: '/resume-builder', icon: FileText },
                { label: 'Start Interview', href: '/interview', icon: Mic },
                { label: 'Check ATS', href: '/ats-tools', icon: CheckCircle },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-semibold rounded-xl transition-all duration-200 backdrop-blur"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* -- Quick Stats -- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statsConfig.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {stats[stat.key as keyof DashboardStats] || 0}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* -- Student-only sections -- */}
        {isStudent && (
          <>
            <AssignedQuizzes userId={user.user_id} />
            <InterviewHistory />
          </>
        )}

        {/* -- Feature Grid -- */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isStudent ? 'Career Tools' : 'Admin Controls'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isStudent
                  ? 'Everything you need to land your dream job'
                  : 'Manage and monitor the platform'}
              </p>
            </div>
            {isStudent && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full">
                <Zap className="h-3.5 w-3.5" />
                AI Powered
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  href={feature.href}
                  prefetch
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                >
                  {/* Hover gradient accent */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`h-6 w-6 ${feature.text}`} />
                  </div>

                  {/* Text */}
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>

                  {/* Arrow */}
                  <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200">
                    <ArrowRight className={`h-4 w-4 ${feature.text}`} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* -- Learning Tip (student only) -- */}
        {isStudent && (
          <div className="flex items-start gap-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
              <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Pro Tip</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                Start with the <strong>ATS Checker</strong> to see how recruiters view your resume, then use the <strong>Resume Builder</strong> to improve your score and land more interviews.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserDashboard;
