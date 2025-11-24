'use client';

import { useState } from 'react';
import { FaPlay, FaBriefcase, FaCode, FaChartLine, FaClock } from 'react-icons/fa';
import { InterviewConfig } from '@/types/interview';

interface InterviewSetupProps {
    onStart: (config: InterviewConfig) => void;
}

export default function InterviewSetup({ onStart }: InterviewSetupProps) {
    const [role, setRole] = useState('');
    const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
    const [duration, setDuration] = useState(15);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [questionType, setQuestionType] = useState<'behavioral' | 'technical' | 'balanced'>('balanced');

    const availableTopics = [
        'Technical Skills',
        'Problem Solving',
        'Communication',
        'Leadership',
        'Teamwork',
        'Project Management',
        'Behavioral Questions',
        'System Design',
        'Coding Challenges',
        'Data Structures',
        'Algorithms',
        'Database Design'
    ];

    const toggleTopic = (topic: string) => {
        setSelectedTopics(prev =>
            prev.includes(topic)
                ? prev.filter(t => t !== topic)
                : [...prev, topic]
        );
    };

    const handleStart = () => {
        if (role && selectedTopics.length > 0) {
            onStart({
                role,
                difficulty,
                duration,
                topics: selectedTopics,
                type: questionType
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-white mb-3">Setup Your Interview</h2>
                    <p className="text-purple-200 text-lg">Configure your AI-powered practice session</p>
                </div>

                <div className="space-y-6">
                    {/* Role Input */}
                    <div>
                        <label className="flex items-center gap-2 text-white font-semibold mb-3">
                            <FaBriefcase className="text-purple-400" />
                            Target Role
                        </label>
                        <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                            className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                    </div>

                    {/* Difficulty Level */}
                    <div>
                        <label className="flex items-center gap-2 text-white font-semibold mb-3">
                            <FaChartLine className="text-purple-400" />
                            Difficulty Level
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setDifficulty(level)}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${difficulty === level
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                                        : 'bg-black/30 text-purple-300 border border-purple-500/30 hover:border-purple-500/50'
                                        }`}
                                >
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="flex items-center gap-2 text-white font-semibold mb-3">
                            <FaClock className="text-purple-400" />
                            Interview Duration: {duration} minutes
                        </label>
                        <input
                            type="range"
                            min="5"
                            max="30"
                            step="5"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="w-full h-2 bg-purple-900/50 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <div className="flex justify-between text-sm text-purple-300 mt-2">
                            <span>5 min</span>
                            <span>15 min</span>
                            <span>30 min</span>
                        </div>
                    </div>

                    {/* Question Type */}
                    <div>
                        <label className="flex items-center gap-2 text-white font-semibold mb-3">
                            <FaCode className="text-purple-400" />
                            Question Focus
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {(['behavioral', 'balanced', 'technical'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setQuestionType(type)}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${questionType === type
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                                        : 'bg-black/30 text-purple-300 border border-purple-500/30 hover:border-purple-500/50'
                                        }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                        <p className="text-purple-300/70 text-sm mt-2">
                            {questionType === 'behavioral' && 'Focus on soft skills, teamwork, and past experiences'}
                            {questionType === 'technical' && 'Focus on technical skills, coding, and problem-solving'}
                            {questionType === 'balanced' && 'Mix of both behavioral and technical questions'}
                        </p>
                    </div>

                    {/* Topics Selection */}
                    <div>
                        <label className="flex items-center gap-2 text-white font-semibold mb-3">
                            <FaCode className="text-purple-400" />
                            Select Topics ({selectedTopics.length} selected)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {availableTopics.map((topic) => (
                                <button
                                    key={topic}
                                    onClick={() => toggleTopic(topic)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedTopics.includes(topic)
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                                        : 'bg-black/30 text-purple-300 border border-purple-500/30 hover:border-purple-500/50'
                                        }`}
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={handleStart}
                        disabled={!role || selectedTopics.length === 0}
                        className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                    >
                        <FaPlay />
                        Start Interview Practice
                    </button>
                </div>
            </div>
        </div>
    );
}
