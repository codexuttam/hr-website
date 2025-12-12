import React from 'react';
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
            { name: 'Post New Drive', href: '/admin/drives/create', icon: '📢' }
          ]
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
            { name: 'Time Planner', href: '/dashboard', icon: '📅' },
            { name: 'Brain Games', href: '/games', icon: '🧩' },
            { name: 'Mock Interview', href: '/ai-interview', icon: '🎤' },
            { name: 'AI Mentor', href: '/coach', icon: '🤖' },
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

        {/* Interview History - Only for Students */}
        {user.role === 'student' && (
          <InterviewHistory />
        )}

        {/* Resume Upload Section - Only for Students */}
        {user.role === 'student' && (
          <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Resume</h2>
            <div className="flex items-center gap-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC, DOCX (MAX. 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={async (e) => {
                    if (!e.target.files || !e.target.files[0]) return;

                    const file = e.target.files[0];
                    // Simple loading state via alert for now as we can't easily add state in this replace block without rewriting the whole component
                    // Ideally we would use the state defined above, but let's do it inline to be safe with the replace tool
                    const confirmUpload = window.confirm(`Upload ${file.name}?`);
                    if (!confirmUpload) return;

                    try {
                      const fileExt = file.name.split('.').pop();
                      const fileName = `${user?.user_id}_${Date.now()}.${fileExt}`;
                      const filePath = `${fileName}`;

                      const { error: uploadError } = await supabase.storage
                        .from('resumes')
                        .upload(filePath, file);

                      if (uploadError) throw new Error('Storage error: ' + uploadError.message);

                      const { data: { publicUrl } } = supabase.storage
                        .from('resumes')
                        .getPublicUrl(filePath);

                      // Save to resumes table
                      const { error: dbError } = await supabase
                        .from('resumes')
                        .insert([
                          {
                            user_id: user?.user_id,
                            resume_name: file.name,
                            resume_file_path: publicUrl,
                            resume_data: {},
                          }
                        ]);

                      if (dbError) throw new Error('Database error: ' + dbError.message);

                      alert('Resume uploaded successfully!');
                    } catch (error: any) {
                      console.error('Error uploading resume:', error);
                      alert('Failed to upload resume: ' + error.message);
                    }
                  }}
                />
              </label>
            </div>
          </div>
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
                {user.role === 'student' ? 'Resumes Created' : 'Users Managed'}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {user.role === 'student' ? 'Skills Assessed' : 'System Reports'}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {user.role === 'student' ? 'Interview Preps' : 'Platform Updates'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
