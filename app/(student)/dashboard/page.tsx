import React from 'react';
import UserDashboard from '../../components/auth/UserDashboard';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getAuthenticatedUser } from '@/backend/auth/getAuthenticatedUser';
import { redirect } from 'next/navigation';

const DashboardPage = async () => {
  const { user, supabase } = await getAuthenticatedUser();

  if (!user) {
    redirect('/login?redirect_to=/dashboard');
  }

  // Server-side Data Fetching
  const stats = {
    resumes: 0,
    skills: 0,
    interviews: 0
  };

  let publicUserId: number | undefined;

  try {
    if (user.user_metadata?.role === 'student') {
      const userId = user.id; // Or user.user_metadata.id if standard user_id comes from there? 
      // NOTE: The previous code cast user_id to string, implying the resumes table uses numeric ID or string ID.
      // Let's check user table. Resume list route uses integer parsing: parseInt(userId).
      // This means we likely need the integer ID from the public.users table corresponding to this auth.user.

      // 1. Get Public User ID
      const { data: publicUser } = await supabase
        .from('users')
        .select('user_id')
        .eq('user_uid', user.id)
        .single();

      publicUserId = publicUser?.user_id;

      if (publicUserId) {
        // 2. Fetch Resumes Count
        const { count: resumeCount } = await supabase
          .from('resumes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', publicUserId);

        // 3. Fetch Skills Assessed
        const { count: skillCount } = await supabase
          .from('quiz_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', publicUserId)
          .eq('status', 'completed');

        // 4. Fetch Interview Preps
        // Note: The API route uses mock_interviews table and student_id
        const { count: interviewCount } = await supabase
          .from('mock_interviews')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', publicUserId);

        stats.resumes = resumeCount || 0;
        stats.skills = skillCount || 0;
        stats.interviews = interviewCount || 0;
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
  }

  // Construct a user object compatible with the dashboard expectations
  // We merge auth user with basic profile info
  const fullUser = {
    ...user,
    role: user.user_metadata?.role || 'student',
    name: user.user_metadata?.name || user.email?.split('@')[0],
    user_id: user.user_metadata?.sub || user.id // Or pass public ID if needed by children
  };

  // Need to pass the numeric ID if chilren use it for fetching more stuff?
  // UserDashboard -> AssignedQuizzes(userId) -> uses it for fetching.
  // So yes, we should probably fetch the real profile fully or at least the ID.
  // Let's rely on the publicUser fetch we did above.

  // Better: Fetch full profile from new table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  /* 
     DashboardUser object construction. 
     We prefer the profile data. 
  */
  const dashboardUser = {
    ...fullUser,
    ...profile, // Overlay profile data (credits, role, name)
    user_id: user.id // We are consistently using UUIDs now
  };

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-100 font-sans">
      <Header />
      <main>
        {/* Pass the UUID. The child component needs to be updated to handle UUIDs if it strictly expects numbers */}
        <UserDashboard initialUser={dashboardUser} initialStats={stats} />
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
