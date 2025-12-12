'use client';

import React from 'react';
import Link from 'next/link';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, href }) => (
  <Link
    href={href}
    className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-all duration-300 transform hover:-translate-y-1 block cursor-pointer"
  >
    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-500 text-white mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </Link>
);

const Features: React.FC = () => {
  const features = [
    {
      icon: <IconResume />,
      title: 'Resume Builder',
      description: 'AI-powered resume builder with ATS optimization and multiple templates.',
      href: '/resume-builder',
    },
    {
      icon: <IconATS />,
      title: 'ATS Score Checker',
      description: 'Optimize your resume for ATS systems and check compatibility scores.',
      href: '/ats-tools',
    },
    {
      icon: <IconPlacement />,
      title: 'Placement Preparation',
      description: 'Company-wise previous year questions, preparation kits and placement guidance.',
      href: '/drives',
    },
    {
      icon: <IconCode />,
      title: 'Code IDE',
      description: 'Online coding environment with multiple programming languages.',
      href: '/code-playground',
    },
    {
      icon: <IconPlanner />,
      title: 'Time Planner',
      description: 'Smart timetable planner with progress tracking and reminders.',
      href: '/dashboard',
    },
    {
      icon: <IconGames />,
      title: 'Brain Games',
      description: 'Puzzles, reasoning ability games and mental exercises.',
      href: '/games',
    },
    {
      icon: <IconInterview />,
      title: 'Mock Interview',
      description: 'AI-powered mock interviews with real-time feedback.',
      href: '/ai-interview',
    },
    {
      icon: <IconMentor />,
      title: 'AI Mentor',
      description: '24/7 AI mentor support and personalized guidance.',
      href: '/coach',
    }
  ];

  return (
    <section id="features" className="py-20 sm:py-24 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Complete Education Ecosystem</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            A comprehensive platform built with AI automation that fulfills every student's need.
          </p>
        </div>
        <div className="mt-16 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

// SVG Icons as components
const IconResume = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconATS = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const IconPlacement = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconCode = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
const IconPlanner = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconGames = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19M4.879 4.879L9.758 9.758m0 0A3.5 3.5 0 1012 3.5a3.5 3.5 0 00-2.242 6.258zM14.121 4.879L9.242 9.758m0 0A3.5 3.5 0 1112 17.5a3.5 3.5 0 01-2.242-6.258z" /></svg>;
const IconInterview = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const IconMentor = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;


export default Features;