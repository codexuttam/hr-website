import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import RoleBadge from '../ui/RoleBadge';
import { UserRole } from '../../contexts/AuthContext';
import AssignedQuizzes from '../dashboard/AssignedQuizzes';

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
            { name: 'Platform Settings', href: '/admin/settings', icon: '⚙️' }
          ]
        };
      case 'recruiter':
        return {
          title: 'Recruiter Dashboard',
          description: 'Find, evaluate, and hire the best candidates',
          features: [
            { name: 'ATS Tools', href: '/ats-tools', icon: '🎯' },
            { name: 'Candidate Search', href: '/candidates', icon: '🔍' },
            { name: 'Interview Scheduling', href: '/interviews', icon: '📅' },
            { name: 'Job Postings', href: '/jobs', icon: '💼' }
          ]
        };
      case 'mentor':
        return {
          title: 'Mentor Dashboard',
          description: 'Guide and support students in their career journey',
          features: [
            { name: 'Student Sessions', href: '/mentor/sessions', icon: '🎓' },
            { name: 'Career Guidance', href: '/mentor/guidance', icon: '🧭' },
            { name: 'Resume Reviews', href: '/mentor/reviews', icon: '📄' },
            { name: 'Mentorship Tools', href: '/mentor/tools', icon: '🛠️' }
          ]
        };
      case 'student':
      default:
        return {
          title: 'Student Dashboard',
          description: 'Build your career with AI-powered tools and guidance',
          features: [
            { name: 'Resume Builder', href: '/resume-builder', icon: '📝' },
            { name: 'ATS Analysis', href: '/ats-tools', icon: '🎯' },
            { name: 'Interview Prep', href: '/interview', icon: '💬' },
            { name: 'Skill Assessment', href: '/quiz', icon: '🧠' }
          ]
        };
    }
  };

  const roleContent = getRoleSpecificContent(user.role);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{user.email}</p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">{roleContent.description}</p>
            </div>
            <div className="text-right">
              <RoleBadge role={user.role} size="lg" />
            </div>
          </div>
        </div>

        {/* Assigned Quizzes - Only for Students */}
        {user.role === 'student' && (
          <AssignedQuizzes userId={user.user_id} />
        )}

        {/* Role-specific Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            {roleContent.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roleContent.features.map((feature, index) => (
              <a
                key={index}
                href={feature.href}
                className="bg-white dark:bg-slate-700 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 block group"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {feature.name}
                </h3>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Stats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {user.role === 'student' ? 'Resumes Created' :
                  user.role === 'recruiter' ? 'Candidates Reviewed' :
                    user.role === 'mentor' ? 'Students Mentored' : 'Users Managed'}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {user.role === 'student' ? 'Skills Assessed' :
                  user.role === 'recruiter' ? 'Jobs Posted' :
                    user.role === 'mentor' ? 'Sessions Completed' : 'System Reports'}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {user.role === 'student' ? 'Interview Preps' :
                  user.role === 'recruiter' ? 'Interviews Scheduled' :
                    user.role === 'mentor' ? 'Career Plans Created' : 'Platform Updates'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
