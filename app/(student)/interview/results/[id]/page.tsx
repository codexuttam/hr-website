'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
    BarChart3, Eye, MessageSquare, Lightbulb, 
    CheckCircle2, AlertTriangle, ArrowLeft,
    TrendingUp, Award, User, Target,
    Sparkles, Calendar, ChevronRight,
    Zap, Brain, Shield
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Analysis {
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
    analysis: Analysis;
}

export default function InterviewResultPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const [interview, setInterview] = useState<MockInterview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || id === 'undefined' || id === 'null') {
            setLoading(false);
            return;
        }
        fetchInterview();
    }, [id]);

    const fetchInterview = async () => {
        if (!user) return;

        try {
            const response = await fetch(`/api/interview/results/${id}?userId=${user.user_id}`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to fetch interview');

            setInterview(data);
        } catch (error) {
            console.error('Error fetching interview:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-3xl" />
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-3xl border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BarChart3 className="h-8 w-8 text-indigo-600 animate-pulse" />
                    </div>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Compiling Diagnostics</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Analyzing your performance nodes...</p>
            </div>
        );
    }

    if (!interview) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-rose-50 dark:bg-rose-900/10 p-10 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/50 text-center">
                    <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/20">
                        <AlertTriangle className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-rose-950 dark:text-rose-100 mb-2 uppercase tracking-tight">Access Denied</h2>
                    <p className="text-rose-600/70 dark:text-rose-400 mb-8 text-sm font-medium">We couldn't retrieve the requested simulation data. It may have been purged or relocated.</p>
                    <Link
                        href="/interview"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Return to Practice</span>
                    </Link>
                </div>
            </div>
        );
    }

    const { analysis, rating } = interview;
    const notesParts = analysis.engagementAnalysis.notes.split('Improvements:');
    const strengths = notesParts[0]?.replace('Strengths:', '').trim().split(',').filter(s => s.trim()) || [];
    const improvements = notesParts[1]?.trim().split(',').filter(s => s.trim()) || [];

    const getScoreCategory = (score: number) => {
        if (score >= 8) return { label: 'Expert', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' };
        if (score >= 5) return { label: 'Proficient', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' };
        return { label: 'Developing', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' };
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans selection:bg-indigo-500/30">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[120px]" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[120px]" />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20">
                
                {/* ── Header Section ───────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-full shadow-sm"
                        >
                            <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {new Date(interview.scheduled_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </span>
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight"
                        >
                            Post-Simulation <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 font-black">Performance Audit</span>
                        </motion.h1>
                    </div>
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Link
                            href="/interview"
                            className="group flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-bold transition-all hover:-translate-y-1 shadow-xl shadow-slate-900/10 active:scale-95"
                        >
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            <span>Practice Session</span>
                        </motion.div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* ── Left Column: Metrics ─────────────────────────────── */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Overall Rating Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-10 text-center shadow-xl shadow-indigo-500/5 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                            <div className="relative z-10 space-y-6">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Final Proficiency</div>
                                <div className="relative inline-flex items-center justify-center">
                                    <svg className="w-48 h-48 transform -rotate-90">
                                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50 dark:text-slate-800" />
                                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={552.92} strokeDashoffset={552.92 - (rating / 5) * 552.92} strokeLinecap="round" className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000 ease-out" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{rating.toFixed(1)}</span>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">RANK / 5.0</span>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                                        <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Top 15% Profile</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Detailed Scores */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-8 space-y-8 shadow-sm"
                        >
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-3 px-2">
                                <TrendingUp className="h-4 w-4 text-emerald-500" /> Core Vectors
                            </h3>
                            <div className="space-y-8">
                                {[
                                    { label: 'Technical Depth', value: analysis.detailed_scores.technical, icon: Brain, color: 'indigo' },
                                    { label: 'Communication', value: analysis.detailed_scores.communication, icon: MessageSquare, color: 'purple' },
                                    { label: 'Eye Contact', value: (analysis.eyeContactScore / 10), icon: Eye, color: 'pink' },
                                ].map((score, i) => {
                                    const cat = getScoreCategory(score.value);
                                    return (
                                        <div key={i} className="space-y-3 px-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-xl bg-${score.color}-50 dark:bg-${score.color}-900/20 flex items-center justify-center text-${score.color}-600 dark:text-${score.color}-400`}>
                                                        <score.icon className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{score.label}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-slate-900 dark:text-white leading-none">{score.value.toFixed(1)}/10</div>
                                                    <div className={`text-[9px] font-black uppercase tracking-widest ${cat.color}`}>{cat.label}</div>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${score.value * 10}%` }}
                                                    transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                                                    className={`h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Right Column: Insights ──────────────────────────── */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Executive Summary */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-10 shadow-xl shadow-indigo-500/5 relative group"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-3">
                                    <Sparkles className="h-4 w-4 text-amber-500" /> Executive Analysis
                                </h3>
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            </div>
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium italic">
                                    "{interview.feedback}"
                                </p>
                            </div>
                        </motion.div>

                        {/* Strengths & Growth Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-emerald-50/30 dark:bg-emerald-900/10 rounded-[2.5rem] border border-emerald-100/50 dark:border-emerald-900/30 p-8 space-y-6"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xs font-black text-emerald-950 dark:text-emerald-100 uppercase tracking-[0.2em]">Key Strengths</h3>
                                </div>
                                <div className="space-y-4">
                                    {strengths.map((s, i) => (
                                        <div key={i} className="flex gap-4 group">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 group-hover:scale-150 transition-transform" />
                                            <p className="text-sm font-bold text-emerald-900/70 dark:text-emerald-300/70 leading-relaxed">{s}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-amber-50/30 dark:bg-amber-900/10 rounded-[2.5rem] border border-amber-100/50 dark:border-amber-900/30 p-8 space-y-6"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                        <Lightbulb className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xs font-black text-amber-950 dark:text-amber-100 uppercase tracking-[0.2em]">Growth Nodes</h3>
                                </div>
                                <div className="space-y-4">
                                    {improvements.map((s, i) => (
                                        <div key={i} className="flex gap-4 group">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 group-hover:scale-150 transition-transform" />
                                            <p className="text-sm font-bold text-amber-900/70 dark:text-amber-300/70 leading-relaxed">{s}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Detailed Behavioral Insights */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-8 md:p-10 shadow-sm overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-3">
                                    <Eye className="h-4 w-4 text-purple-500" /> Behavioral Integrity
                                </h3>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-[9px] font-black uppercase text-slate-400 tracking-widest border border-gray-100 dark:border-slate-700">Engagement Metrics</span>
                                    <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest border border-indigo-100 dark:border-indigo-800/50">v4.0 Finalized</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-gray-100 dark:border-slate-700/50 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-indigo-500" />
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Ocular Attention</h4>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{analysis.eyeContactScore.toFixed(1)}%</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{analysis.eyeContactCategory}</p>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic border-l-2 border-indigo-500/20 pl-4">
                                        {analysis.eyeContactExplanation}
                                    </p>
                                </div>

                                <div className="p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-gray-100 dark:border-slate-700/50 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-amber-500" />
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Neural Resonance</h4>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Confidence Node</span>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.engagementAnalysis.confidence}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Initial Handshake</span>
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic opacity-80">"{analysis.engagementAnalysis.greeting}"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* CTA / Next Steps */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-indigo-600 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-500/20"
                        >
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white tracking-tight">Ready for Calibration?</h3>
                                <p className="text-indigo-100/70 text-sm font-bold uppercase tracking-widest">Target the next simulation to bridge growth gaps.</p>
                            </div>
                            <Link
                                href="/interview"
                                className="group px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-3 whitespace-nowrap shadow-xl"
                            >
                                <span>Relaunch Simulation</span>
                                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
