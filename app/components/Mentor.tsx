import React from 'react';
import Link from 'next/link';

const Mentor: React.FC = () => {
  return (
    <section className="py-20 sm:py-24 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div className="mb-12 lg:mb-0">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Meet Your <span className="text-indigo-600 dark:text-indigo-400">AI Mentor</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Get 24/7 personalized guidance, career advice, and academic support. Your AI mentor is always ready to help with study planning, interview preparation, and career decisions.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/coach"
                className="w-full sm:w-auto inline-block bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
              >
                Start Chatting
              </Link>
              <Link
                href="#"
                className="w-full sm:w-auto inline-block bg-transparent text-indigo-600 dark:text-indigo-400 font-semibold py-3 px-8 rounded-lg hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="lg:mt-0">
            <img
              className="rounded-xl shadow-2xl object-cover w-full h-full"
              src="https://aiwebix.com/assets/img/core-img/ai_mentor.jpg"
              alt="AI Mentor interacting with a student"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mentor;