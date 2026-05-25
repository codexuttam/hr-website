import Link from 'next/link';
import React from 'react';

const CTA: React.FC = () => {
  return (
    <section className="py-24 sm:py-32 bg-white dark:bg-slate-900 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl">
          {/* Animated Background inside the card */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full blur-3xl opacity-40 animate-pulse mix-blend-screen"></div>
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-pink-500 to-rose-500 rounded-full blur-3xl opacity-30 animate-pulse delay-700 mix-blend-screen"></div>
          </div>
          
          <div className="relative px-6 py-16 sm:px-16 sm:py-24 lg:px-20 lg:py-28 text-center border border-white/10 rounded-3xl backdrop-blur-sm bg-slate-900/50">
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
              Ready to Transform <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Your Career?</span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl leading-8 text-slate-300">
              Join thousands of students who are already using our AI-powered platform to land their dream jobs and ace their placements.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full text-slate-900 bg-white hover:bg-slate-100 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.7)] transition-all duration-300 transform hover:-translate-y-1"
              >
                Start Your Journey Free
                <svg className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;