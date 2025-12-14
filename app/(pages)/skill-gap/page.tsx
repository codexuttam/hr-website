"use client";
import React, { useState } from 'react';
import SkillForm from './SkillForm';
import ResultView from './ResultView';

export default function SkillGapPage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
                        Skill Gap Analyzer
                    </h1>
                    <p className="text-lg text-gray-600">
                        Identify your hidden potential and bridge the gap to your dream job.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="w-full">
                        <SkillForm onAnalyze={setResult} setLoading={setLoading} />
                    </div>

                    <div className="w-full">
                        {loading ? (
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600 mb-4"></div>
                                <p className="text-gray-600 font-medium">Analyzing your skills...</p>
                                <p className="text-sm text-gray-400 mt-2 text-center">Comparing against thousands of job descriptions</p>
                            </div>
                        ) : result ? (
                            <ResultView data={result} />
                        ) : (
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[400px] text-center">
                                <div className="bg-blue-50 p-4 rounded-full mb-4">
                                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Start?</h3>
                                <p className="text-gray-500 max-w-sm">
                                    Enter your skills on the left to see how you match up against industry requirements.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
