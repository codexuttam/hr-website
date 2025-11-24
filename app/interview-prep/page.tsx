'use client';
import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function InterviewPrep() {
  const tools = [


    {
      id: 'voice-screening',
      title: 'Voice Interview Screening',
      description: 'Practice real-time voice interviews with AI-powered feedback',
      icon: '🎤',
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      href: '/interview-prep/voice-screening'
    }
  ];

  return (
    <ProtectedRoute>
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-100 font-sans min-h-screen">
        <Header />
        <main className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            {/* <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Interview Preparation
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Master your interview skills with AI-powered tools and practice sessions
              </p>
            </div> */}

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group"
                >
                  <div className={`${tool.bgColor} rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 h-full`}>
                    <div className={`w-16 h-16 bg-gradient-to-br ${tool.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <span className="text-3xl">{tool.icon}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
                      {tool.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                      {tool.description}
                    </p>
                    <div className="mt-4 text-center">
                      <span className={`inline-block px-4 py-2 bg-gradient-to-r ${tool.color} text-white rounded-lg text-sm font-medium group-hover:shadow-lg transition-shadow`}>
                        Start Practice →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Access to Interview Components */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-12 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🎯 Quick Start Interview Practice
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/interview-prep/questions"
                  className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <span className="text-2xl mr-3">❓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Practice Questions</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Browse and practice common interview questions</p>
                  </div>
                </Link>
                <Link
                  href="/interview-prep/mock"
                  className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <span className="text-2xl mr-3">🎤</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Mock Interview</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Take a full mock interview with AI feedback</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                💡 Interview Preparation Tips
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Research the Company</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Understand their mission, values, and recent news</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Practice STAR Method</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Structure your answers: Situation, Task, Action, Result</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Prepare Questions</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Have thoughtful questions ready for the interviewer</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Mock Interviews</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Practice with friends or use our AI mock interview tool</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
