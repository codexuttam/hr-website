'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function CodingProfilePage() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const darkMode = theme === 'dark';
    const [isEditing, setIsEditing] = useState(false);

    // Mock Data - In a real app, fetch this from your backend/database
    const userStats = {
        username: user?.name || "Guest User",
        rank: 12450,
        totalSolved: 450,
        easy: 200,
        medium: 200,
        hard: 50,
        acceptanceRate: "68.5%",
        streak: 12,
        badges: [
            { name: "Problem Solver", icon: "🧩", color: "bg-blue-100 text-blue-600" },
            { name: "30 Day Streak", icon: "🔥", color: "bg-orange-100 text-orange-600" },
            { name: "Algorithm Master", icon: "⚡", color: "bg-yellow-100 text-yellow-600" },
            { name: "Data Structure Pro", icon: "📚", color: "bg-purple-100 text-purple-600" }
        ],
        recentActivity: [
            { problem: "Two Sum", difficulty: "Easy", date: "2 hours ago", status: "Solved" },
            { problem: "Add Two Numbers", difficulty: "Medium", date: "5 hours ago", status: "Solved" },
            { problem: "Median of Two Sorted Arrays", difficulty: "Hard", date: "1 day ago", status: "Attempted" },
            { problem: "Longest Palindromic Substring", difficulty: "Medium", date: "2 days ago", status: "Solved" },
        ],
        skills: [
            { name: "Arrays", progress: 85 },
            { name: "Strings", progress: 70 },
            { name: "Dynamic Programming", progress: 40 },
            { name: "Graphs", progress: 60 },
            { name: "Trees", progress: 55 },
        ]
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                        {userStats.username.charAt(0)}
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-3xl font-bold">{userStats.username}</h1>
                        <p className="text-gray-500 dark:text-gray-400">Rank: #{userStats.rank.toLocaleString()}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            {userStats.badges.map((badge, idx) => (
                                <span key={idx} className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${badge.color}`}>
                                    {badge.icon} {badge.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Stats */}
                    <div className="space-y-8">
                        {/* Solved Problems */}
                        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} shadow-sm`}>
                            <h2 className="text-xl font-bold mb-6">Solved Problems</h2>
                            <div className="flex items-center justify-center mb-6">
                                <div className="relative w-40 h-40 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-200 dark:text-slate-800" />
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="440" strokeDashoffset={440 - (440 * userStats.totalSolved / 1000)} className="text-blue-500" />
                                    </svg>
                                    <div className="absolute text-center">
                                        <span className="text-3xl font-bold block">{userStats.totalSolved}</span>
                                        <span className="text-xs text-gray-500">Solved</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-green-500 font-medium">Easy</span>
                                    <span className="text-sm font-bold">{userStats.easy}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(userStats.easy / userStats.totalSolved) * 100}%` }}></div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-yellow-500 font-medium">Medium</span>
                                    <span className="text-sm font-bold">{userStats.medium}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
                                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(userStats.medium / userStats.totalSolved) * 100}%` }}></div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-red-500 font-medium">Hard</span>
                                    <span className="text-sm font-bold">{userStats.hard}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
                                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(userStats.hard / userStats.totalSolved) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} shadow-sm`}>
                            <h2 className="text-xl font-bold mb-6">Skills</h2>
                            <div className="space-y-4">
                                {userStats.skills.map((skill, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium">{skill.name}</span>
                                            <span className="text-sm text-gray-500">{skill.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
                                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${skill.progress}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Activity & Heatmap (Placeholder) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Activity Heatmap Placeholder */}
                        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} shadow-sm`}>
                            <h2 className="text-xl font-bold mb-6">Submission Activity</h2>
                            <div className="flex flex-wrap gap-1">
                                {Array.from({ length: 365 }).map((_, i) => {
                                    const intensity = Math.random() > 0.7 ? (Math.random() > 0.5 ? 'bg-green-500' : 'bg-green-300') : (darkMode ? 'bg-slate-800' : 'bg-gray-100');
                                    return (
                                        <div key={i} className={`w-3 h-3 rounded-sm ${intensity}`} title={`Day ${i + 1}`}></div>
                                    )
                                })}
                            </div>
                            <p className="text-xs text-gray-500 mt-4 text-right">Last 12 months</p>
                        </div>

                        {/* Recent Activity */}
                        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} shadow-sm`}>
                            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                            <div className="space-y-4">
                                {userStats.recentActivity.map((activity, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                                        <div>
                                            <h3 className="font-medium">{activity.problem}</h3>
                                            <p className="text-xs text-gray-500">{activity.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${activity.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                activity.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {activity.difficulty}
                                            </span>
                                            <p className={`text-xs mt-1 ${activity.status === 'Solved' ? 'text-green-600' : 'text-gray-500'}`}>
                                                {activity.status}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}
