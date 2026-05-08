'use client';
import React from 'react';
import Link from 'next/link';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-24 pb-32 sm:pt-32 sm:pb-40 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900"></div>
      
      <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 dark:opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-indigo-600 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-300/30 mb-8 bg-indigo-50/50 dark:bg-indigo-900/30 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mr-2 animate-ping"></span>
            EduAI 2.0 is here
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Unlock Your Career <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 animate-gradient">Potential with AI</span>
          </h1>
          
          <p className="mt-8 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            From intelligent resume building to hyper-personalized interview preparation — an all-in-one platform engineered to land your dream job faster.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/coach"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold py-4 px-8 rounded-xl shadow-xl hover:shadow-indigo-500/25 hover:-translate-y-1 transition-all duration-300"
            >
              Talk to AI Mentor
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/resume-builder"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-semibold py-4 px-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:-translate-y-1 transition-all duration-300"
            >
              Build Resume
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Graphic */}
        <div className="mt-20 relative mx-auto max-w-5xl animate-fade-in-up delay-200">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-xl"></div>
          <div className="relative rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl overflow-hidden aspect-[16/9]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/90 dark:to-slate-900/90 z-10"></div>
            {/* Mockup UI representation */}
            <div className="absolute top-0 inset-x-0 h-10 bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="pt-14 px-6 flex gap-6 h-full">
              <div className="w-1/4 space-y-4">
                <div className="h-8 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg w-full"></div>
                <div className="h-32 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg w-full"></div>
                <div className="h-8 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg w-3/4"></div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex gap-4">
                  <div className="h-24 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-xl flex-1 border border-indigo-200/50 dark:border-indigo-700/50"></div>
                  <div className="h-24 bg-purple-100/50 dark:bg-purple-900/30 rounded-xl flex-1 border border-purple-200/50 dark:border-purple-700/50"></div>
                  <div className="h-24 bg-pink-100/50 dark:bg-pink-900/30 rounded-xl flex-1 border border-pink-200/50 dark:border-pink-700/50"></div>
                </div>
                <div className="h-64 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;