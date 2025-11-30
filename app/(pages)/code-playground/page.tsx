'use client';
import React from 'react';
import CodePlayground from '../pages/CodePlayground';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CodePlaygroundPage() {
  return (
    <ProtectedRoute>
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-100 font-sans">
        <Header />
        <main>
          <CodePlayground />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
