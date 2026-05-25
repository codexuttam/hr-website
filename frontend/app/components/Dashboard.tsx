import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  navigateTo?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ navigateTo }) => {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'mentor': return 'bg-green-100 text-green-800 border-green-200';
      case 'recruiter': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getWelcomeMessage = (role: string) => {
    switch (role) {
      case 'admin': return 'Welcome to the admin dashboard! You have full access to manage the platform.';
      case 'mentor': return 'Welcome! You can help students with mock interviews and career guidance.';
      case 'recruiter': return 'Welcome! You can post jobs and review student applications.';
      default: return 'Welcome! Start building your resume and preparing for your career.';
    }
  };

  const getQuickActions = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          { title: 'User Management', description: 'Manage platform users', action: () => {} },
          { title: 'System Analytics', description: 'View platform statistics', action: () => {} },
          { title: 'Content Management', description: 'Manage platform content', action: () => {} },
        ];
      case 'mentor':
        return [
          { title: 'Mock Interviews', description: 'Schedule and conduct interviews', action: () => {} },
          { title: 'Student Guidance', description: 'Provide career advice', action: () => {} },
          { title: 'Review Resumes', description: 'Help students improve resumes', action: () => {} },
        ];
      case 'recruiter':
        return [
          { title: 'Post Jobs', description: 'Create new job postings', action: () => {} },
          { title: 'Review Applications', description: 'View student applications', action: () => {} },
          { title: 'Talent Search', description: 'Find qualified candidates', action: () => {} },
        ];
      default:
        return [
          { title: 'Resume Builder', description: 'Create and edit professional resumes', action: () => navigateTo?.('resumeBuilder') },
          { title: 'ATS Analysis', description: 'Optimize your resume for ATS', action: () => navigateTo?.('atsTools') },
          { title: 'Code Playground', description: 'Write and run code interactively', action: () => navigateTo?.('codePlayground') },
          { title: 'Mock Interview', description: 'Practice interview skills', action: () => {} },
        ];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Hello, {user.name}!
              </h1>
              <p className="text-gray-600 mb-4">
                {getWelcomeMessage(user.role)}
              </p>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getRoleColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getQuickActions(user.role).map((action, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={action.action}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {action.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500">No recent activity to display</p>
            <p className="text-sm text-gray-400 mt-2">
              Start using the platform to see your activity here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;