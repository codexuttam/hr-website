import React from 'react';
import Link from 'next/link';

const Mentor: React.FC = () => {
  return (
    <section className="py-24 sm:py-32 bg-white dark:bg-slate-900 overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div className="mb-16 lg:mb-0">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-rose-600 dark:text-rose-400 ring-1 ring-inset ring-rose-600/20 dark:ring-rose-400/30 mb-6 bg-rose-50/50 dark:bg-rose-900/30">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 dark:bg-rose-400 mr-2"></span>
              24/7 Availability
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Meet Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI Mentor</span>
            </h2>
            <p className="mt-6 text-xl leading-relaxed text-gray-600 dark:text-gray-300">
              Get personalized guidance, career advice, and academic support anytime, anywhere. Your AI mentor is always ready to help with study planning, interview preparation, and career decisions.
            </p>
            
            <ul className="mt-8 space-y-4 text-gray-600 dark:text-gray-300">
              {['Personalized study plans', 'Real-time doubt clearing', 'Career trajectory mapping'].map((item, idx) => (
                <li key={idx} className="flex items-center">
                  <svg className="w-5 h-5 text-indigo-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/coach"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-indigo-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1"
              >
                Start Chatting Now
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="lg:mt-0 relative group perspective">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-2xl bg-white dark:bg-slate-800 transform transition-transform duration-500 hover:rotate-y-2 hover:rotate-x-2">
              <img
                className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-105"
                src="https://aiwebix.com/assets/img/core-img/ai_mentor.jpg"
                alt="AI Mentor interacting with a student"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold">AI Mentor Active</p>
                    <p className="text-indigo-200 text-sm">Responding in &lt; 1s</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mentor;