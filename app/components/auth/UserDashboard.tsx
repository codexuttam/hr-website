'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import RoleBadge from '../ui/RoleBadge';
import { UserRole } from '../../contexts/AuthContext';
import AssignedQuizzes from '../dashboard/AssignedQuizzes';
import InterviewHistory from '../dashboard/InterviewHistory';
import { supabase } from '@/lib/supabase';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getRoleSpecificContent = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          title: 'Admin Dashboard',
          description: 'Manage platform users, content, and system settings',
          features: [
            { name: 'User Management', href: '/admin/users', icon: '👥' },
            { name: 'System Analytics', href: '/admin/analytics', icon: '📊' },
            { name: 'Content Moderation', href: '/admin/content', icon: '🛡️' },
            { name: 'Platform Settings', href: '/admin/settings', icon: '⚙️' },
            { name: 'Post New Drive', href: '/admin/drives/create', icon: '📢' },
          ],
        };
      case 'student':
      default:
        return {
          title: 'Student Dashboard',
          description: 'Build your career with AI-powered tools and guidance',
          features: [
            { name: 'Resume Builder', href: '/resume-builder', icon: '📝' },
            { name: 'ATS Score Checker', href: '/ats-tools', icon: '✅' },
            { name: 'Placement Preparation', href: '/drives', icon: '💼' },
            { name: 'Code IDE', href: '/code-playground', icon: '💻' },
            { name: 'Time Planner', href: '/skill-gap', icon: '📅' },
            { name: 'Brain Games', href: '/games', icon: '🧩' },
            { name: 'Mock Interview', href: '/interview', icon: '🎤' },
            { name: 'AI Mentor', href: '/coach', icon: '🤖' },
          ],
        };
    }
  };

  const roleContent = getRoleSpecificContent(user.role);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {roleContent.description}
              </p>
            </div>
            <RoleBadge role={user.role} size="lg" />
          </div>
        </div>

        {/* Student Sections */}
        {user.role === 'student' && <AssignedQuizzes userId={user.user_id} />}
        {user.role === 'student' && <InterviewHistory />}

        {/* Feature Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            {roleContent.title}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roleContent.features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                prefetch
                className="bg-white dark:bg-slate-700 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 block group"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                  {feature.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Quick Stats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: user.role === 'student' ? 'Resumes Created' : 'Users Managed' },
              { label: user.role === 'student' ? 'Skills Assessed' : 'System Reports' },
              { label: user.role === 'student' ? 'Interview Preps' : 'Platform Updates' },
            ].map((item, i) => (
              <div key={i} className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
