'use client';

import { useState } from 'react';
import { 
    Briefcase, Code2, Clock, UserGraduate, 
    ArrowRight, Sparkles, Brain, Target,
    Layers, Zap, Mic
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    const [config, setConfig] = useState<InterviewConfig>({
        role: '',
        experience: 'Mid-Level',
        techStack: '',
        duration: 15
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (config.role && config.techStack) {
            onStart(config);
        }
    };

    const experienceLevels = ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Architect'];
    const durations = [5, 10, 15, 20, 30];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans selection:bg-indigo-500/30">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-600/5" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] dark:bg-purple-600/5" />
            </div>

            <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-24 space-y-12">
                
                {/* ── Hero Section ─────────────────────────────────────────── */}
                <div className="text-center space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 backdrop-blur rounded-full text-indigo-600 dark:text-indigo-400 text-[10px] font-bold tracking-widest uppercase border border-indigo-100 dark:border-indigo-800/50"
                    >
                        <Sparkles className="h-4 w-4" />
                        <span>AI Training Protocol v4.0</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight"
                    >
                        Elite Interview <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Simulation</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto text-slate-500 dark:text-slate-400 text-lg md:text-xl leading-relaxed"
                    >
                        Master your technical communication with our ultra-realistic AI interviewer. Tailor the session to your dream role.
                    </motion.p>
                </div>

                {/* ── Form Section ─────────────────────────────────────────── */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-2xl shadow-indigo-500/5 p-8 md:p-12"
                >
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            
                            {/* Left Column: Role & Experience */}
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Briefcase className="h-3 w-3 text-indigo-500" />
                                        Target Position
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={config.role}
                                            onChange={(e) => setConfig({ ...config, role: e.target.value })}
                                            placeholder="e.g. Senior Software Engineer"
                                            className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            required
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                            <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Brain className="h-3 w-3 text-purple-500" />
                                        Difficulty Level
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Junior', 'Mid-Level', 'Senior'].map(level => (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => setConfig({ ...config, experience: level })}
                                                className={`py-3 rounded-2xl text-xs font-bold transition-all border ${config.experience === level
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                                                    : 'bg-gray-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900'
                                                }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Duration & Stack */}
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Clock className="h-3 w-3 text-emerald-500" />
                                        Session Duration
                                    </label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {durations.map(mins => (
                                            <button
                                                key={mins}
                                                type="button"
                                                onClick={() => setConfig({ ...config, duration: mins })}
                                                className={`py-3 rounded-2xl text-[10px] font-black transition-all border ${config.duration === mins
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20'
                                                    : 'bg-gray-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-gray-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900'
                                                }`}
                                            >
                                                {mins}m
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Code2 className="h-3 w-3 text-rose-500" />
                                        Primary Tech Stack
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            value={config.techStack}
                                            onChange={(e) => setConfig({ ...config, techStack: e.target.value })}
                                            placeholder="React, Node.js, GraphQL, AWS..."
                                            className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 outline-none transition-all h-[116px] resize-none"
                                            required
                                        />
                                        <div className="absolute right-4 bottom-4 w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                                            <Layers className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={!config.role || !config.techStack}
                                className="w-full group bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-5 rounded-[1.5rem] shadow-xl shadow-slate-900/20 dark:shadow-white/10 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                <div className="w-8 h-8 rounded-xl bg-white/10 dark:bg-slate-900/10 flex items-center justify-center">
                                    <Mic className="h-4 w-4" />
                                </div>
                                <span className="text-lg">Initialize Protocol</span>
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* ── Footer Stats ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-gray-100 dark:border-slate-800">
                    {[
                        { label: 'AI Accuracy', value: '99.8%', icon: Zap, color: 'text-indigo-500' },
                        { label: 'Feedback Nodes', value: '1,240+', icon: Layers, color: 'text-purple-500' },
                        { label: 'Success Rate', value: '86%', icon: Target, color: 'text-emerald-500' },
                    ].map((stat, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800">
                            <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
