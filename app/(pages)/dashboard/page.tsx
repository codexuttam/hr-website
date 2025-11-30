'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserDashboard from '../../components/auth/UserDashboard';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (!loading && user?.role === 'admin') {
      router.push('/admin_dashboard');
    }
  }, [user, loading, router]);

  // Don't render dashboard for admin users
  if (user?.role === 'admin') {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-100 font-sans">
        <Header />
        <main>
          <UserDashboard />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
