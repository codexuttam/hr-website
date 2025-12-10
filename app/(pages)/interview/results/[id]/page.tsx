'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { FaChartBar, FaEye, FaCommentDots, FaLightbulb, FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

interface InterviewAnalysis {
    eyeContactScore: number;
    overallAssessment: string;
    engagementAnalysis: {
        notes: string;
        greeting: string;
        readiness: string;
        confidence: string;
    };
    eyeContactCategory: string;
    eyeContactExplanation: string;
    detailed_scores: {
        technical: number;
        communication: number;
    };
}

interface MockInterview {
    id: number;
    scheduled_date: string;
    feedback: string;
    rating: number; // 0-5
    analysis: InterviewAnalysis;
}

export default function InterviewResultPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const [interview, setInterview] = useState<MockInterview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchInterview();
        }
    }, [id]);

    const fetchInterview = async () => {
        if (!user) return;

        try {
            const response = await fetch(`/api/interview/results/${id}?userId=${user.user_id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch interview');
            }

            setInterview(data);
        } catch (error) {
            console.error('Error fetching interview:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading interview results...</p>
                </div>
            </div>
        );
    }

    if (!interview) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg max-w-md">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaExclamationTriangle className="text-2xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Results Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Unable to load the interview results.</p>
                    <Link
                        href="/interview"
                        className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" /> Back to Practice
                    </Link>
                </div>
            </div>
        );
    }

    const { analysis, rating } = interview;
    // Parse the strengths/improvements from notes if format matches expected structure
    // Notes format: "Strengths: A, B. Improvements: C, D"
    const notesParts = analysis.engagementAnalysis.notes.split('Improvements:');
    const strengths = notesParts[0]?.replace('Strengths:', '').trim().split(',').filter(s => s.trim()) || [];
    const improvements = notesParts[1]?.trim().split(',').filter(s => s.trim()) || [];

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-600 dark:text-green-400';
        if (score >= 5) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getProgressColor = (score: number) => {
        if (score >= 8) return 'bg-green-500';
        if (score >= 5) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Interview Analysis</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Completed on {new Date(interview.scheduled_date).toLocaleDateString()} at {new Date(interview.scheduled_date).toLocaleTimeString()}
                        </p>
                    </div>
                    <Link
                        href="/interview"
                        className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" /> Practice Again
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Overall Score Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative w-40 h-40 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#E2E8F0"
                                        strokeWidth="3"
                                        className="dark:stroke-slate-700"
                                    />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke={rating >= 4 ? "#10B981" : rating >= 2.5 ? "#F59E0B" : "#EF4444"}
                                        strokeWidth="3"
                                        strokeDasharray={`${(rating / 5) * 100}, 100`}
                                        className="animate-[dash_1s_ease-out_forwards]"
                                    />
                                </svg>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{rating.toFixed(1)}</span>
                                    <span className="block text-xs text-gray-500 uppercase font-semibold">Overall Rating</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 w-full">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Technical Knowledge</span>
                                        <span className={`text-sm font-bold ${getScoreColor(analysis.detailed_scores.technical)}`}>
                                            {analysis.detailed_scores.technical}/10
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${getProgressColor(analysis.detailed_scores.technical)}`}
                                            style={{ width: `${(analysis.detailed_scores.technical / 10) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Communication Skills</span>
                                        <span className={`text-sm font-bold ${getScoreColor(analysis.detailed_scores.communication)}`}>
                                            {analysis.detailed_scores.communication}/10
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${getProgressColor(analysis.detailed_scores.communication)}`}
                                            style={{ width: `${(analysis.detailed_scores.communication / 10) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Eye Contact</span>
                                        <span className={`text-sm font-bold ${getScoreColor(analysis.eyeContactScore / 10)}`}>
                                            {analysis.eyeContactScore.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${getProgressColor(analysis.eyeContactScore / 10)}`}
                                            style={{ width: `${analysis.eyeContactScore}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Summary */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <FaCommentDots className="mr-2 text-blue-500" /> Executive Summary
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {interview.feedback}
                        </p>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                <FaCheckCircle className="mr-2 text-green-500" /> Key Strengths
                            </h3>
                            <ul className="space-y-3">
                                {strengths.length > 0 ? strengths.map((s, i) => (
                                    <li key={i} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                        <span className="mr-2 text-green-500 mt-1">•</span>
                                        {s}
                                    </li>
                                )) : (
                                    <li className="text-sm text-gray-500 italic">No specific strengths highlighted.</li>
                                )}
                            </ul>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                <FaLightbulb className="mr-2 text-yellow-500" /> Areas for Improvement
                            </h3>
                            <ul className="space-y-3">
                                {improvements.length > 0 ? improvements.map((s, i) => (
                                    <li key={i} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                        <span className="mr-2 text-yellow-500 mt-1">•</span>
                                        {s}
                                    </li>
                                )) : (
                                    <li className="text-sm text-gray-500 italic">No specific improvements highlighted.</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Detailed Analysis (Eye Contact & Metrics) */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <FaEye className="mr-2 text-purple-500" /> Behavioral & Engagement Insights
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30">
                                <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Eye Contact Analysis</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                    <span className="font-bold">{analysis.eyeContactCategory}</span> ({analysis.eyeContactScore.toFixed(1)}%)
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {analysis.eyeContactExplanation}
                                </p>
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Confidence & Readiness</h4>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <p>{analysis.engagementAnalysis.confidence}</p>
                                    <p className="italic">{analysis.engagementAnalysis.greeting}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
