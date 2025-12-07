'use client';
import React, { useEffect, useState } from 'react';
import RoleProtectedRoute from '../../components/auth/RoleProtectedRoute';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import RoleBadge from '../../components/ui/RoleBadge';
import { supabase } from '../../lib/supabase';

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
        supabase.from('users').select('user_id', { count: 'exact', head: true }),
        supabase.from('quizzes').select('quiz_id', { count: 'exact', head: true }),
        supabase.from('resumes').select('resume_id', { count: 'exact', head: true }),
        supabase.from('attempts').select('attempt_id', { count: 'exact', head: true }),
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
      setLoading(false);
    }
  }

  return (
    <RoleProtectedRoute allowedRoles={['admin']}>
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-100 font-sans">
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Admin Header */}
            <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Admin Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Welcome, {user?.name}! Manage your platform from here.
                  </p>
                </div>
                <div className="text-right">
                  {user && <RoleBadge role={user.role} size="lg" />}
                </div>
              </div>
            </div>

            {/* Admin Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Quiz Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Create, edit, and manage quizzes and questions
                </p>
                <a href="/quiz/admin" className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center">
                  Manage Quizzes
                </a>
              </div>

              <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6">
                <div className="text-3xl mb-3">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  User Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Manage user accounts, roles, and permissions
                </p>
                <a href="/admin/users" className="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center">
                  Manage Users
                </a>
              </div>

              <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  View platform usage statistics and reports
                </p>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors" disabled>
                  Coming Soon
                </button>
              </div>

              <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6">
                <div className="text-3xl mb-3">📄</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Resume Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  View and manage user resumes
                </p>
                <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors" disabled>
                  Coming Soon
                </button>
              </div>

              <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6">
                <div className="text-3xl mb-3">🛡️</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Content Moderation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Review and moderate user-generated content
                </p>
                <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors" disabled>
                  Coming Soon
                </button>
              </div>

              <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6">
                <div className="text-3xl mb-3">⚙️</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Platform Settings
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Configure platform-wide settings and features
                </p>
                <button className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors" disabled>
                  Coming Soon
                </button>
              </div>

              <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6">
                <div className="text-3xl mb-3">🚀</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Placement Drives
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Create and manage placement drives and applications
                </p>
                <a href="/admin/drives" className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center">
                  Manage Drives
                </a>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Platform Overview
              </h3>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading stats...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalUsers}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Total Users</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.totalQuizzes}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Total Quizzes</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.totalResumes}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Resumes Created</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {stats.totalAttempts}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Quiz Attempts</div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {stats.totalApplications}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Drive Applications</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminDashboardPage;
