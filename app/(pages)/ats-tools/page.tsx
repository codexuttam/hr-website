'use client';
import React from 'react';
import ATSTools from '../pages/ATSTools';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ATSToolsPage() {
  return (
    <ProtectedRoute>
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-100 font-sans">
        <Header />
        <main>
          <ATSTools />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
