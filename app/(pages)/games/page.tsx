'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const games = [
    {
        id: 'visualizer',
        title: 'Algorithm Visualizer',
        description: 'Visualize complex algorithms and data structures in real-time. Understand how sorting, searching, and graph algorithms work step-by-step.',
        href: '/games/visualizer',
        icon: (
            <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        color: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
    },
    {
        id: 'quiz',
        title: 'Tech Quiz Challenge',
        description: 'Test your knowledge with our interactive technical quizzes. Challenge yourself across various domains like React, Node.js, and more.',
        href: '/quiz',
        icon: (
            <svg className="w-12 h-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
        color: 'bg-purple-50 dark:bg-purple-900/20',
        borderColor: 'border-purple-200 dark:border-purple-800',
        hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-600',
    },
    {
        id: 'roadmap',
        title: 'AI Roadmap Generator',
        description: 'Generate personalized learning roadmaps powered by AI. Get custom career paths, skill development plans, and project-based learning tracks.',
        href: '/games/roadmap',
        icon: (
            <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        ),
        color: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        hoverBorder: 'hover:border-green-400 dark:hover:border-green-600',
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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Interactive <span className="text-blue-600 dark:text-blue-400">Learning Games</span>
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                        Learn faster and have fun with our collection of educational games and visualizers.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {games.map((game) => (
                        <motion.div key={game.id} variants={item}>
                            <Link
                                href={game.href}
                                className={`block h-full relative group rounded-2xl border-2 ${game.borderColor} ${game.hoverBorder} ${game.color} p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                            >
                                <div className="flex flex-col h-full">
                                    <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-xl w-fit shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        {game.icon}
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {game.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-300 flex-grow">
                                        {game.description}
                                    </p>

                                    <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                                        Play Now
                                        <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
