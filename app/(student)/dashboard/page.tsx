'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserDashboard from '../../components/auth/UserDashboard';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-100 font-sans">
      <Header />
      <main>
        <UserDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
