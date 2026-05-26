'use client';
import React from 'react';
import Link from 'next/link';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-white to-white dark:from-black dark:via-black dark:to-black"></div>
      
      <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-gray-200 to-gray-400 dark:from-zinc-800 dark:to-zinc-600 opacity-30 dark:opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-black dark:text-gray-300 ring-1 ring-inset ring-black/10 dark:ring-white/20 mb-8 bg-gray-100/50 dark:bg-white/10 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-black dark:bg-white mr-2 animate-ping"></span>
            EduAI 2.0 is here
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-black dark:text-white leading-[1.1]">
            Unlock Your Career <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-black dark:text-white via-neutral-900 to-zinc-800 animate-gradient">Potential with AI</span>
          </h1>
          
          <p className="mt-8 max-w-2xl mx-auto text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            From intelligent resume building to hyper-personalized interview preparation — an all-in-one platform engineered to land your dream job faster.
          </p>
          

        </div>


      </div>
    </section>
  );
};

export default Hero;