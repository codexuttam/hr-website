import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">EduAI</h3>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-base">
              AI-powered education platform that helps students with placement preparation, resume building, coding practice and much more.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-gray-200 tracking-wider uppercase">Features</h4>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">Resume Builder</a></li>
              <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">ATS Checker</a></li>
              <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">Placement Prep</a></li>
              <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">Code IDE</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-gray-200 tracking-wider uppercase">Tools</h4>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">Time Planner</a></li>
              <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">Brain Games</a></li>
              <li><a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">Mock Interview</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8 md:flex md:items-center md:justify-between">
          <p className="text-base text-gray-500 dark:text-gray-400 md:order-1">
            &copy; 2024 EduAI. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 md:order-2">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Powered by <span className="text-slate-800 dark:text-white font-semibold">Bitlance Tech Hub Pvt Ltd</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;