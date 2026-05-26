'use client';
import React from 'react';

const steps = [
  {
    title: 'Create Your Profile',
    description: 'Sign up and start by filling out your essential details, education, and experiences in our secure platform.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    title: 'AI-Powered Formatting',
    description: 'Our AI engine analyzes your data and perfectly formats it to pass Applicant Tracking Systems (ATS).',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: 'Land Your Dream Job',
    description: 'Export your pristine resume in PDF format, ace the mock interviews, and secure the offers you deserve.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 sm:py-32 relative bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold text-black dark:text-gray-400 tracking-wide uppercase mb-3">Simple Process</h2>
          <h3 className="text-4xl sm:text-5xl font-extrabold text-black dark:text-white tracking-tight">How EduAI Works</h3>
          <p className="mt-6 text-xl text-gray-700 dark:text-gray-400">
            Three simple steps to transform your career prospects using artificial intelligence.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 hover:bg-white/60 dark:hover:bg-black/60 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-6 shadow-xl shadow-black/10 dark:shadow-white/10">
                {step.icon}
              </div>
              <h4 className="text-2xl font-bold text-black dark:text-white mb-4">{step.title}</h4>
              <p className="text-gray-700 dark:text-gray-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
