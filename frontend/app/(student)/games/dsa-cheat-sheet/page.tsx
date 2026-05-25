'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCode2, CheckCircle2, ChevronDown, ExternalLink, 
  Search, BookOpen, Trophy, Sparkles, Layers,
  ArrowRightLeft, MousePointer2, RefreshCw, ListOrdered,
  LayoutGrid, Share2, Target, Brain, Code2, Zap
} from 'lucide-react';

// Map pattern titles to Lucide icons
const patternIcons: Record<string, any> = {
  'Arrays & Hashing': Layers,
  'Prefix Sum': ListOrdered,
  'Two Pointers': ArrowRightLeft,
  'Sliding Window': MousePointer2,
  'Fast & Slow Pointers (Tortoise and Hare)': RefreshCw,
  'Linked List In-Place Reversal': RefreshCw,
  'Monotonic Stack': ListOrdered,
  'Top K Elements (Heap)': Trophy,
  'Overlapping Intervals': LayoutGrid,
  'Modified Binary Search': Search,
  'Binary Tree Traversal': Share2,
  'Depth-First Search (DFS)': Brain,
  'Breadth-First Search (BFS)': Target,
  'Matrix Traversal': LayoutGrid,
  'Backtracking': RefreshCw,
  'Dynamic Programming (DP)': Zap,
  'Graph Traversal': Share2,
};

const patterns = [
    {
        id: 1,
        title: 'Arrays & Hashing',
        concept: 'Fundamental array manipulation techniques, hashing, and cyclic sort patterns.',
        problems: [
            'Longest Consecutive Sequence (LeetCode #128)',
            'Find All Numbers Disappeared in an Array (LeetCode #448)',
            'Shortest Unsorted Continuous Subarray (LeetCode #581)',
            'Single Number (LeetCode #136)',
            'First Missing Positive (LeetCode #41)',
            'Set Matrix Zeroes (LeetCode #73)',
            'Circular Array Loop (LeetCode #457)',
            'Missing Number (LeetCode #268)',
            'Number of Matching Subsequences (LeetCode #792)',
            'Product of Array Except Self (LeetCode #238)',
            'Word Search (LeetCode #79)',
            'Rotate Image (LeetCode #48)',
            'Spiral Matrix (LeetCode #54)',
            'Contains Duplicate (LeetCode #217)',
            'Find All Duplicates in an Array (LeetCode #442)',
            'Find the Duplicate Number (LeetCode #287)',
        ],
    },
    {
        id: 2,
        title: 'Prefix Sum',
        concept: 'Precompute a prefix sum array where prefix[i] stores the sum of elements from index 0 to i. This enables quick sum queries over any subarray.',
        problems: [
            'Range Sum Query - Immutable (LeetCode #303)',
            'Contiguous Array (LeetCode #525)',
            'Subarray Sum Equals K (LeetCode #560)',
        ]
    },
    {
        id: 3,
        title: 'Two Pointers',
        concept: 'Use two pointers (either moving towards or away from each other) to efficiently search or process elements in an array.',
        problems: [
            'Two Sum II — Sorted Array (LeetCode #167)',
            '3Sum (LeetCode #15)',
            'Container With Most Water (LeetCode #11)',
            'Trapping Rain Water (LeetCode #42)',
        ]
    },
    {
        id: 4,
        title: 'Sliding Window',
        concept: 'Maintain a dynamic window (subarray or substring) that slides over the input while updating required values efficiently.',
        problems: [
            'Longest Substring Without Repeating Characters (LeetCode #3)',
            'Minimum Window Substring (LeetCode #76)',
            'Sliding Window Maximum (LeetCode #239)',
            'Longest Repeating Character Replacement (LeetCode #424)',
        ]
    },
    {
        id: 5,
        title: 'Fast & Slow Pointers (Tortoise and Hare)',
        concept: 'Use two pointers moving at different speeds to detect cycles or find specific elements in linked lists.',
        problems: [
            'Linked List Cycle (LeetCode #141)',
            'Find the Duplicate Number (LeetCode #287)',
            'Happy Number (LeetCode #202)',
            'Reorder List (LeetCode #143)',
        ]
    },
    {
        id: 6,
        title: 'Linked List In-Place Reversal',
        concept: 'Reverse sections of a linked list in place by adjusting pointers without extra memory.',
        problems: [
            'Reverse Linked List (LeetCode #206)',
            'Reverse Linked List II (LeetCode #92)',
            'Swap Nodes in Pairs (LeetCode #24)',
            'Rotate List (LeetCode #61)',
        ]
    },
    {
        id: 7,
        title: 'Monotonic Stack',
        concept: 'Use a stack to maintain a sequence of increasing/decreasing elements to solve problems related to the "next greater/smaller" elements.',
        problems: [
            'Next Greater Element I (LeetCode #496)',
            'Daily Temperatures (LeetCode #739)',
            'Largest Rectangle in Histogram (LeetCode #84)',
            'Online Stock Span (LeetCode #901)',
        ]
    },
    {
        id: 8,
        title: 'Top K Elements (Heap)',
        concept: 'Use heaps (priority queues) or quick-select to efficiently find the k largest/smallest elements.',
        problems: [
            'Kth Largest Element in an Array (LeetCode #215)',
            'Top K Frequent Elements (LeetCode #347)',
            'Find K Pairs with Smallest Sums (LeetCode #373)',
        ]
    },
    {
        id: 9,
        title: 'Overlapping Intervals',
        concept: 'Merge or process overlapping intervals in a sorted list.',
        problems: [
            'Merge Intervals (LeetCode #56)',
            'Insert Interval (LeetCode #57)',
            'Non-Overlapping Intervals (LeetCode #435)',
        ]
    },
    {
        id: 10,
        title: 'Modified Binary Search',
        concept: 'Apply binary search variations on sorted, rotated, or complex datasets.',
        problems: [
            'Search in Rotated Sorted Array (LeetCode #33)',
            'Find Minimum in Rotated Sorted Array (LeetCode #153)',
            'Search a 2D Matrix II (LeetCode #240)',
        ]
    },
    {
        id: 11,
        title: 'Binary Tree Traversal',
        concept: 'Visit all nodes in a tree using different orders.',
        problems: [
            'Binary Tree Inorder Traversal (LeetCode #94)',
            'Binary Tree Zigzag Level Order Traversal (LeetCode #103)',
            'Binary Tree Paths (LeetCode #257)',
        ]
    },
    {
        id: 12,
        title: 'Depth-First Search (DFS)',
        concept: 'Explore as far as possible along each branch before backtracking.',
        problems: [
            'Clone Graph (LeetCode #133)',
            'Path Sum II (LeetCode #113)',
            'Course Schedule II (LeetCode #210)',
        ]
    },
    {
        id: 13,
        title: 'Breadth-First Search (BFS)',
        concept: 'Explore all nodes at the current depth before moving deeper.',
        problems: [
            'Binary Tree Level Order Traversal (LeetCode #102)',
            'Rotting Oranges (LeetCode #994)',
            'Word Ladder (LeetCode #127)',
        ]
    },
    {
        id: 14,
        title: 'Matrix Traversal',
        concept: 'Navigate through matrices using BFS, DFS, or pattern-based traversal.',
        problems: [
            'Set Matrix Zeroes (LeetCode #73)',
            'Number of Islands (LeetCode #200)',
            'Spiral Matrix (LeetCode #54)',
        ]
    },
    {
        id: 15,
        title: 'Backtracking',
        concept: 'Explore all possible choices recursively, undoing changes when necessary.',
        problems: [
            'Combination Sum (LeetCode #39)',
            'Sudoku Solver (LeetCode #37)',
            'Permutations (LeetCode #46)',
        ]
    },
    {
        id: 16,
        title: 'Dynamic Programming (DP)',
        concept: 'Break a problem into smaller overlapping subproblems, store the results to avoid redundant computations (memoization or tabulation).',
        details: [
            'Top-down (Memoization): Solve recursively and store results.',
            'Bottom-up (Tabulation): Solve iteratively using a DP table.',
            'State Transition: Define dp[i] meaningfully and derive recurrence relations.',
        ],
        problems: [
            'Climbing Stairs (LeetCode #70) → Basic DP',
            'House Robber (LeetCode #198) → 1D DP',
            'Longest Palindromic Substring (LeetCode #5) → String DP',
            'Unique Paths (LeetCode #62) → Grid DP',
            'Coin Change (LeetCode #322) → Unbounded Knapsack',
            'Edit Distance (LeetCode #72) → 2D DP',
            'Longest Increasing Subsequence (LeetCode #300) → LIS Pattern',
        ]
    },
    {
        id: 17,
        title: 'Graph Traversal',
        concept: 'Explore all nodes in a graph using DFS or BFS.',
        problems: [
            'Number of Islands (LeetCode #200)',
            'Clone Graph (LeetCode #133)',
            'Path Sum II (LeetCode #113)',
        ]
    }
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function DSACheatSheetPage() {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [completedProblems, setCompletedProblems] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const savedProgress = localStorage.getItem('dsa_cheat_sheet_progress');
        if (savedProgress) {
            try {
                setCompletedProblems(JSON.parse(savedProgress));
            } catch (e) {
                console.error('Failed to parse progress', e);
            }
        }
    }, []);

    const toggleProblem = (problem: string) => {
        const newProgress = {
            ...completedProblems,
            [problem]: !completedProblems[problem]
        };
        setCompletedProblems(newProgress);
        localStorage.setItem('dsa_cheat_sheet_progress', JSON.stringify(newProgress));
    };

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getPatternProgress = (patternProblems: string[]) => {
        const completedCount = patternProblems.filter(p => completedProblems[p]).length;
        return Math.round((completedCount / patternProblems.length) * 100);
    };

    const totalProblems = patterns.reduce((acc, p) => acc + p.problems.length, 0);
    const totalCompleted = Object.values(completedProblems).filter(Boolean).length;
    const overallProgress = Math.round((totalCompleted / totalProblems) * 100);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                
                {/* - Hero Banner - */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-800 p-8 md:p-12 shadow-2xl shadow-indigo-500/10 border border-indigo-500/10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-[80px] pointer-events-none" />

                    <div className="relative flex flex-col items-center text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur rounded-full text-indigo-300 text-xs font-bold tracking-widest uppercase border border-white/10">
                            <Code2 className="h-4 w-4" />
                            <span>Algorithm Preparation Guide</span>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
                            DSA Pattern <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">CheatSheet 2025</span>
                        </h1>
                        
                        <p className="max-w-2xl text-slate-400 text-lg md:text-xl leading-relaxed">
                            Master the core concepts behind technical interviews. Track your progress across 17 essential patterns and 60+ curated LeetCode problems.
                        </p>

                        {/* Overall Progress Tracker */}
                        <div className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 mt-4">
                            <div className="flex justify-between items-end mb-2">
                                <div className="text-left">
                                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Overall Completion</span>
                                    <div className="text-2xl font-black text-white">{overallProgress}%</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</span>
                                    <div className="text-sm font-bold text-indigo-300">{totalCompleted} / {totalProblems} Solved</div>
                                </div>
                            </div>
                            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${overallProgress}%` }}
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* - Patterns List - */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Essential Patterns</h2>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm">
                            <Sparkles className="h-4 w-4 text-indigo-500" />
                            Curated Content
                        </div>
                    </div>

                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 gap-4"
                    >
                        {patterns.map((pattern) => {
                            const progress = getPatternProgress(pattern.problems);
                            const isExpanded = expandedId === pattern.id;
                            const Icon = patternIcons[pattern.title] || BookOpen;

                            return (
                                <motion.div
                                    key={pattern.id}
                                    variants={item}
                                    layout
                                    className={`group rounded-3xl border transition-all duration-300 overflow-hidden ${
                                        isExpanded 
                                            ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900 shadow-xl shadow-indigo-500/5' 
                                            : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-md'
                                    }`}
                                >
                                    {/* Header - Clickable */}
                                    <div
                                        onClick={() => toggleExpand(pattern.id)}
                                        className={`p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 ${isExpanded ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                                    >
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                                                isExpanded 
                                                    ? 'bg-indigo-600 text-white rotate-6' 
                                                    : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:-rotate-6'
                                            }`}>
                                                <Icon className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">Pattern {pattern.id}</span>
                                                    {progress === 100 && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                                                            <CheckCircle2 className="h-3 w-3" /> Mastered
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {pattern.title}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 font-medium">
                                                    {pattern.concept}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 justify-between md:justify-end">
                                            <div className="flex flex-col items-end gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-500">{progress}%</span>
                                                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pattern.problems.length} Problems</span>
                                            </div>
                                            <div className={`p-2 rounded-xl transition-all duration-300 ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600'}`}>
                                                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-gray-100 dark:border-slate-800"
                                            >
                                                <div className="p-8 space-y-8">
                                                    {/* Concept Breakdown */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest">
                                                                <FileCode2 className="h-4 w-4" />
                                                                Core Logic
                                                            </div>
                                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                                                {pattern.concept}
                                                            </p>
                                                            {pattern.details && (
                                                                <div className="grid grid-cols-1 gap-2">
                                                                    {pattern.details.map((detail, idx) => (
                                                                        <div key={idx} className="flex items-start gap-3 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/30">
                                                                            <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0 mt-0.5">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                                                                            </div>
                                                                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{detail}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Problems Grid */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest">
                                                                    <Trophy className="h-4 w-4" />
                                                                    Problem List
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                                    {pattern.problems.filter(p => completedProblems[p]).length} / {pattern.problems.length} COMPLETED
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                                                                {pattern.problems.map((problem, idx) => {
                                                                    const isDone = completedProblems[problem] || false;
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className={`group/item flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                                                                isDone
                                                                                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30'
                                                                                    : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50'
                                                                            }`}
                                                                        >
                                                                            <div
                                                                                className="flex items-center gap-4 flex-1 cursor-pointer"
                                                                                onClick={() => toggleProblem(problem)}
                                                                            >
                                                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                                                                    isDone
                                                                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 group-hover/item:border-indigo-500'
                                                                                }`}>
                                                                                    {isDone && <CheckCircle2 className="h-4 w-4" />}
                                                                                </div>
                                                                                <span className={`text-sm font-bold transition-all ${
                                                                                    isDone
                                                                                        ? 'text-slate-400 dark:text-slate-500 line-through'
                                                                                        : 'text-slate-700 dark:text-slate-300 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400'
                                                                                }`}>
                                                                                    {problem}
                                                                                </span>
                                                                            </div>

                                                                            <a
                                                                                href={`https://leetcode.com/problems/${problem.split(' (LeetCode')[0].toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')}/`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all active:scale-95 ml-2"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                Solve
                                                                                <ExternalLink className="h-3 w-3" />
                                                                            </a>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>

                {/* - Call to Action - */}
                <div className="bg-indigo-600 dark:bg-indigo-500 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-y-1/2 translate-x-1/2 blur-3xl" />
                    
                    <div className="relative max-w-2xl mx-auto space-y-6">
                        <h2 className="text-3xl md:text-4xl font-black">Ready to land your dream job?</h2>
                        <p className="text-indigo-100 text-lg">
                            Consistent practice is the only way to master DSA. Use this checklist daily and watch your problem-solving skills skyrocket.
                        </p>
                        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                            <button className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-xl hover:-translate-y-1">
                                Share Progress
                            </button>
                            <Link href="/quiz" className="px-8 py-4 bg-indigo-700/50 hover:bg-indigo-700 text-white font-bold rounded-2xl border border-indigo-400/30 transition-all hover:-translate-y-1">
                                Take a Quiz
                            </Link>
                        </div>
                    </div>
                </div>

            </main>
            
            <Footer />
        </div>
    );
}
