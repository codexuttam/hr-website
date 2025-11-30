'use client';

import { useState } from 'react';
import VapiInterviewInterface from '@/components/VapiInterviewInterface';
import { FaVideo, FaMicrophone, FaBrain, FaChartLine } from 'react-icons/fa';

export default function AIInterviewPage() {
    const [isStarted, setIsStarted] = useState(false);
    const [interviewConfig, setInterviewConfig] = useState({
        role: '',
        experience: 'intermediate',
        techStack: '',
        duration: 15,
    });

    const handleStartInterview = () => {
        if (interviewConfig.role && interviewConfig.techStack) {
            setIsStarted(true);
        }
    };

    if (isStarted) {
        return <VapiInterviewInterface config={interviewConfig} onExit={() => setIsStarted(false)} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        AI Mock Interview
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Practice with AI-powered interviewer and get real-time feedback
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400 transition-all duration-300">
                        <FaVideo className="text-4xl text-purple-400 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Video Interview</h3>
                        <p className="text-gray-300">Face-to-face interview simulation with AI interviewer</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400 transition-all duration-300">
                        <FaMicrophone className="text-4xl text-pink-400 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Voice AI</h3>
                        <p className="text-gray-300">Natural conversation with Vapi AI technology</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400 transition-all duration-300">
                        <FaBrain className="text-4xl text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Smart Questions</h3>
                        <p className="text-gray-300">AI-generated questions based on your profile</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400 transition-all duration-300">
                        <FaChartLine className="text-4xl text-green-400 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Performance Analytics</h3>
                        <p className="text-gray-300">Detailed feedback on your interview performance</p>
                    </div>
                </div>

                {/* Configuration Form */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-6">Configure Your Interview</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-white font-medium mb-2">
                                Target Role *
                            </label>
                            <input
                                type="text"
                                value={interviewConfig.role}
                                onChange={(e) => setInterviewConfig({ ...interviewConfig, role: e.target.value })}
                                placeholder="e.g., Frontend Developer, Data Scientist"
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-white font-medium mb-2">
                                Experience Level
                            </label>
                            <select
                                value={interviewConfig.experience}
                                onChange={(e) => setInterviewConfig({ ...interviewConfig, experience: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-400 transition-colors"
                            >
                                <option value="entry" className="bg-slate-800">Entry Level (0-2 years)</option>
                                <option value="intermediate" className="bg-slate-800">Intermediate (2-5 years)</option>
                                <option value="senior" className="bg-slate-800">Senior (5+ years)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-white font-medium mb-2">
                                Tech Stack / Skills *
                            </label>
                            <input
                                type="text"
                                value={interviewConfig.techStack}
                                onChange={(e) => setInterviewConfig({ ...interviewConfig, techStack: e.target.value })}
                                placeholder="e.g., React, Node.js, Python, AWS"
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-white font-medium mb-2">
                                Interview Duration
                            </label>
                            <select
                                value={interviewConfig.duration}
                                onChange={(e) => setInterviewConfig({ ...interviewConfig, duration: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-400 transition-colors"
                            >
                                <option value="10" className="bg-slate-800">10 minutes</option>
                                <option value="15" className="bg-slate-800">15 minutes</option>
                                <option value="20" className="bg-slate-800">20 minutes</option>
                                <option value="30" className="bg-slate-800">30 minutes</option>
                            </select>
                        </div>

                        <button
                            onClick={handleStartInterview}
                            disabled={!interviewConfig.role || !interviewConfig.techStack}
                            className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Start Interview
                        </button>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mt-8 bg-blue-500/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-400/20">
                    <h3 className="text-xl font-semibold text-white mb-4">💡 Interview Tips</h3>
                    <ul className="space-y-2 text-gray-300">
                        <li>• Ensure you have a stable internet connection</li>
                        <li>• Allow microphone and camera permissions when prompted</li>
                        <li>• Find a quiet environment with good lighting</li>
                        <li>• Speak clearly and maintain eye contact with the camera</li>
                        <li>• Take your time to think before answering</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
