import Link from 'next/link';
import React from 'react';

const CTA: React.FC = () => {
  return (
    <section className="bg-white dark:bg-slate-800">
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 sm:py-24 lg:px-8 text-center">
        <div className="relative">
          <div className="absolute -inset-2">
            <div
              className="w-full h-full mx-auto rotate-180 max-w-sm opacity-30 blur-lg filter"
              style={{
                background: 'linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)',
              }}
            ></div>
          </div>
          <h2 className="relative text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Ready to Transform Your Career?
          </h2>
        </div>
        <p className="mt-4 text-lg leading-6 text-gray-600 dark:text-gray-300">
          Join thousands of students who are already using our AI-powered platform to ace their placements.
        </p>
        <Link
          href="#"
          className="mt-8 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 sm:w-auto transition-all duration-300 transform hover:scale-105"
        >
          Start Your Journey
        </Link>
      </div>
    </section>
  );
};

export default CTA;