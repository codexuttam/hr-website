'use client';
import React from 'react';
import Link from 'next/link';

const Hero: React.FC = () => {
  return (
    <section className="relative py-20 sm:py-28 lg:py-32">
      <div aria-hidden="true" className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20">
        <div className="blur-[106px] h-56 bg-gradient-to-br from-indigo-600 to-purple-500 "></div>
        <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300 "></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          AI-Powered <span className="text-indigo-600 dark:text-indigo-400">Education Platform</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
          From resume building to placement preparation - everything on one platform. Boost your career with AI automation and personalized guidance.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">

          <Link
            href="/coach"
            className="w-full sm:w-auto inline-block bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300"
          >
            Talk to AI Mentor
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;