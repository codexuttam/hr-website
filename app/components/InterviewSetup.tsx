'use client';

import { useState } from 'react';
import { FaBriefcase, FaCode, FaClock, FaUserGraduate, FaArrowRight } from 'react-icons/fa';

interface InterviewConfig {
    role: string;
    experience: string;
    techStack: string;
    duration: number;
}

interface InterviewSetupProps {
    onStart: (config: InterviewConfig) => void;
}

export default function InterviewSetup({ onStart }: InterviewSetupProps) {
    const [mode, setMode] = useState<'manual' | 'upload'>('manual');
    const [config, setConfig] = useState<InterviewConfig>({
        role: '',
        experience: 'Mid-Level',
        techStack: '',
        duration: 15
    });
    const [files, setFiles] = useState<{ resume: File | null }>({
        resume: null
    });
    const [jdText, setJdText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'manual') {
            if (config.role && config.techStack) {
                onStart(config);
            }
        } else {
            // Placeholder for file processing logic
            if (files.resume) {
                // In a real app, you'd upload these files to an API to extract details
                // For this demo, we'll mock it or ask the user to fill details after "uploading"
                // Or we can just start with a generic "Based on Resume" role
                onStart({
                    ...config,
                    role: 'Candidate (from Resume)',
                    techStack: jdText ? 'Extracted from Resume & JD' : 'Extracted from Resume',
                });
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'jd') => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
        }
    };

    const experienceLevels = ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Architect'];
    const durations = [5, 10, 15, 20, 30];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4">
                            AI Interview Practice
                        </h1>
                        <p className="text-gray-300 text-lg">
                            Customize your interview session to match your career goals.
                        </p>
                    </div>

                    {/* Mode Selection Tabs */}
                    <div className="flex p-1 bg-black/20 rounded-xl mb-8">
                        <button
                            onClick={() => setMode('manual')}
                            className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${mode === 'manual'
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Manual Setup
                        </button>
                        <button
                            onClick={() => setMode('upload')}
                            className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${mode === 'upload'
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Upload Resume & JD
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {mode === 'manual' ? (
                            <>
                                {/* Role Input */}
                                <div className="space-y-2">
                                    <label className="text-white font-semibold flex items-center gap-2">
                                        <FaBriefcase className="text-purple-400" />
                                        Target Role
                                    </label>
                                    <input
                                        type="text"
                                        value={config.role}
                                        onChange={(e) => setConfig({ ...config, role: e.target.value })}
                                        placeholder="e.g. Frontend Developer, Product Manager"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                        required
                                    />
                                </div>

                                {/* Experience & Duration Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-white font-semibold flex items-center gap-2">
                                            <FaUserGraduate className="text-blue-400" />
                                            Experience Level
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={config.experience}
                                                onChange={(e) => setConfig({ ...config, experience: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                            >
                                                {experienceLevels.map(level => (
                                                    <option key={level} value={level} className="bg-slate-900">
                                                        {level}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-white font-semibold flex items-center gap-2">
                                            <FaClock className="text-green-400" />
                                            Duration (Minutes)
                                        </label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {durations.map(mins => (
                                                <button
                                                    key={mins}
                                                    type="button"
                                                    onClick={() => setConfig({ ...config, duration: mins })}
                                                    className={`py-2 rounded-lg text-sm font-medium transition-all ${config.duration === mins
                                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                                                        : 'bg-black/20 text-gray-400 hover:bg-black/40'
                                                        }`}
                                                >
                                                    {mins}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Tech Stack Input */}
                                <div className="space-y-2">
                                    <label className="text-white font-semibold flex items-center gap-2">
                                        <FaCode className="text-pink-400" />
                                        Tech Stack / Skills
                                    </label>
                                    <textarea
                                        value={config.techStack}
                                        onChange={(e) => setConfig({ ...config, techStack: e.target.value })}
                                        placeholder="e.g. React, Node.js, TypeScript, AWS, System Design"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all h-24 resize-none"
                                        required
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-6">
                                {/* Resume Upload */}
                                <div className="space-y-2">
                                    <label className="text-white font-semibold flex items-center gap-2">
                                        <FaUserGraduate className="text-blue-400" />
                                        Upload Resume (PDF/DOCX)
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => handleFileChange(e, 'resume')}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-8 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 transition-all cursor-pointer text-center"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            {!files.resume && <span className="text-gray-500">Drag & drop or click to upload</span>}
                                        </div>
                                    </div>
                                    {files.resume && (
                                        <p className="text-sm text-green-400 flex items-center gap-2">
                                            ✓ {files.resume.name}
                                        </p>
                                    )}
                                </div>

                                {/* JD Input (Optional) */}
                                <div className="space-y-2">
                                    <label className="text-white font-semibold flex items-center gap-2">
                                        <FaBriefcase className="text-purple-400" />
                                        Job Description (Optional)
                                    </label>
                                    <textarea
                                        value={jdText}
                                        onChange={(e) => setJdText(e.target.value)}
                                        placeholder="Paste the job description here..."
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all h-32 resize-none"
                                    />
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                    <p className="text-blue-200 text-sm">
                                        Note: We will analyze your resume {jdText ? 'and the job description' : ''} to tailor the interview questions specifically for you.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={mode === 'manual' ? (!config.role || !config.techStack) : (!files.resume)}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {mode === 'manual' ? 'Start Interview Session' : 'Analyze & Start Interview'}
                            <FaArrowRight />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
