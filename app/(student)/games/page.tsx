'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { 
  Activity, Trophy, Map, FileCode2, Sparkles, 
  ArrowRight, Zap, Target, Brain, Gamepad2
} from 'lucide-react';

const games = [
    {
        id: 'visualizer',
        title: 'Algorithm Visualizer',
        description: 'Visualize complex algorithms and data structures in real-time. Understand how sorting, searching, and graph algorithms work step-by-step.',
        href: '/games/visualizer',
        icon: Activity,
        gradient: 'from-blue-500 to-indigo-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        borderColor: 'border-blue-100 dark:border-blue-800/50',
    },
    {
        id: 'quiz',
        title: 'Tech Quiz Challenge',
        description: 'Test your knowledge with our interactive technical quizzes. Challenge yourself across various domains like React, Node.js, and more.',
        href: '/quiz',
        icon: Trophy,
        gradient: 'from-purple-500 to-violet-600',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        borderColor: 'border-purple-100 dark:border-purple-800/50',
    },
    {
        id: 'roadmap',
        title: 'AI Roadmap Generator',
        description: 'Generate personalized learning roadmaps powered by AI. Get custom career paths, skill development plans, and project-based learning tracks.',
        href: '/games/roadmap',
        icon: Map,
        gradient: 'from-emerald-500 to-teal-600',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        borderColor: 'border-emerald-100 dark:border-emerald-800/50',
    },
    {
        id: 'dsa-cheat-sheet',
        title: 'DSA Pattern Cheat Sheet',
        description: 'Master Data Structures and Algorithms with our comprehensive pattern cheat sheet. Essential for interview preparation.',
        href: '/games/dsa-cheat-sheet',
        icon: FileCode2,
        gradient: 'from-orange-500 to-amber-600',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        borderColor: 'border-orange-100 dark:border-orange-800/50',
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function GamesPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans">
            <Header />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                
                {/* ── Hero Banner ─────────────────────────────────────────── */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 md:p-12 shadow-2xl shadow-indigo-500/20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

                    <div className="relative flex flex-col items-center text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-indigo-100 text-sm font-semibold tracking-wide border border-white/20">
                            <Brain className="h-4 w-4" />
                            <span>Interactive Learning Experience</span>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
                            Master Skills Through <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-300">Gamified Learning</span>
                        </h1>
                        
                        <p className="max-w-2xl text-indigo-100 text-lg md:text-xl leading-relaxed">
                            Stop boring tutorials. Dive into interactive visualizers, AI-powered roadmaps, and technical challenges designed to make learning stick.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/15 rounded-xl border border-white/20 text-white text-sm font-medium">
                                <Zap className="h-4 w-4 text-yellow-300" />
                                AI Powered
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/15 rounded-xl border border-white/20 text-white text-sm font-medium">
                                <Target className="h-4 w-4 text-emerald-300" />
                                Results Driven
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/15 rounded-xl border border-white/20 text-white text-sm font-medium">
                                <Sparkles className="h-4 w-4 text-purple-300" />
                                100% Free
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Games Grid ─────────────────────────────────────────── */}
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">The Learning Lab</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Explore our collection of interactive tools and games</p>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-2xl text-sm">
                            <Gamepad2 className="h-5 w-5" />
                            {games.length} Tools Available
                        </div>
                    </div>

                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {games.map((game) => {
                            const Icon = game.icon;
                            return (
                                <motion.div key={game.id} variants={item}>
                                    <Link
                                        href={game.href}
                                        className={`group block h-full relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border ${game.borderColor} p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                                    >
                                        {/* Hover gradient accent */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none`} />

                                        <div className="flex flex-col h-full relative z-10">
                                            <div className={`mb-6 w-16 h-16 ${game.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                                <Icon className={`w-8 h-8 ${game.text}`} />
                                            </div>

                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {game.title}
                                            </h3>

                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                                                {game.description}
                                            </p>

                                            <div className="mt-auto flex items-center justify-between">
                                                <div className={`flex items-center gap-2 font-bold ${game.text} text-sm uppercase tracking-wider`}>
                                                    Start Learning
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                                
                                                {/* Skill tags based on ID */}
                                                <div className="flex gap-2">
                                                  {game.id === 'roadmap' && <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-full uppercase tracking-tighter">AI Driven</span>}
                                                  {game.id === 'visualizer' && <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-tighter">Real-time</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>

                {/* ── Footer Tip ─────────────────────────────────────────── */}
                <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">Have a game idea?</h3>
                        <p className="text-slate-400">We are constantly adding new learning tools to our platform.</p>
                    </div>
                    <button className="px-8 py-3 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-colors shadow-lg">
                        Suggest a Feature
                    </button>
                </div>

            </main>
            
            <Footer />
        </div>
    );
}
