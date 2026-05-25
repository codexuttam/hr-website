'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { FaChartLine, FaCheckCircle, FaExclamationTriangle, FaEye, FaArrowRight, FaVideo } from 'react-icons/fa';
import Link from 'next/link';

interface MockInterview {
    id: number;
    scheduled_date: string;
    feedback: string;
    rating: number; // 0-5
    analysis: {
        eyeContactScore: number;
        eyeContactCategory: string;
        detailed_scores: {
            technical: number;
            communication: number;
        }
    };
}

export default function InterviewHistory() {
    const { user } = useAuth();
    const [interviews, setInterviews] = useState<MockInterview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchInterviews();
        }
    }, [user]);

    const fetchInterviews = async () => {
        if (!user) return;

        try {
            const response = await fetch(`/api/interview/history?userId=${user.user_id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch history');
            }

            setInterviews(data || []);
        } catch (error) {
            console.error('Error fetching interview history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 4) return 'text-green-600 dark:text-green-400';
        if (score >= 2.5) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Interview History</h2>
                <div className="flex justify-center p-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
            </div>
        );
    }

    if (interviews.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Interview History</h2>
                    <Link
                        href="/interview"
                        className="text-sm text-blue-600 hover:text-blue-500 font-medium flex items-center"
                    >
                        Start New Practice <FaArrowRight className="ml-1" />
                    </Link>
                </div>
                <div className="text-center py-8 bg-gray-50 dark:bg-slate-800 rounded-lg border border-dashed border-gray-300 dark:border-slate-600">
                    <FaVideo className="text-4xl text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">You haven't taken any AI interviews yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Interview History</h2>
                <Link
                    href="/interview"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + New Interview
                </Link>
            </div>

            <div className="space-y-4">
                {interviews.map((interview, index) => (
                    <div
                        key={interview.id || `interview-${index}`}
                        className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-600 hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {new Date(interview.scheduled_date).toLocaleDateString()}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-slate-700 rounded text-gray-600 dark:text-gray-300">
                                        {new Date(interview.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-6 mt-2">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Overall</p>
                                        <p className={`text-lg font-bold ${getScoreColor(interview.rating)}`}>
                                            {interview.rating.toFixed(1)} <span className="text-xs text-gray-400 font-normal">/ 5.0</span>
                                        </p>
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Technical</p>
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {interview.analysis?.detailed_scores?.technical ?? 0}/10
                                        </p>
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Communication</p>
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {interview.analysis?.detailed_scores?.communication ?? 0}/10
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end">
                                <Link
                                    href={`/interview/results/${interview.id}`}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                >
                                    View Report <FaArrowRight />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
