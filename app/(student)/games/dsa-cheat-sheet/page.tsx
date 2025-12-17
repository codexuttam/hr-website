'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';



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
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function DSACheatSheetPage() {
    const { theme } = useTheme();
    const darkMode = theme === 'dark';
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [completedProblems, setCompletedProblems] = useState<Record<string, boolean>>({});

    // Load progress from localStorage on mount
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

    // Calculate progress for a pattern
    const getPatternProgress = (patternProblems: string[]) => {
        const completedCount = patternProblems.filter(p => completedProblems[p]).length;
        return Math.round((completedCount / patternProblems.length) * 100);
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
                <Header />
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Document Header */}
                <div className="text-center mb-12 space-y-4">


                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent py-2">
                        DSA PATTERN CHEATSHEET 2025
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Master Data Structures and Algorithms with these essential patterns.
                        <br />
                        <span className="text-sm text-gray-500">Click on a pattern to view problems and track your progress.</span>
                    </p>
                </div>

                {/* Patterns Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-6 mb-16"
                >
                    {patterns.map((pattern) => {
                        const progress = getPatternProgress(pattern.problems);
                        const isExpanded = expandedId === pattern.id;

                        return (
                            <motion.div
                                key={pattern.id}
                                variants={item}
                                layout
                                className={`rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-blue-500 shadow-2xl' : 'hover:shadow-xl hover:-translate-y-1'}`}
                            >
                                {/* Card Header - Clickable */}
                                <div
                                    onClick={() => toggleExpand(pattern.id)}
                                    className={`p-6 cursor-pointer flex flex-col gap-4 ${isExpanded ? (darkMode ? 'bg-slate-800/50' : 'bg-gray-50') : ''}`}
                                >
                                    <div className="flex items-start justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <span className={`flex items-center justify-center w-8 h-8 rounded-full ${progress === 100 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'} font-bold text-sm`}>
                                                {progress === 100 ? '✓' : pattern.id}
                                            </span>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {pattern.title}
                                            </h2>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {/* Progress Bar (Mini) */}
                                            <div className="hidden sm:flex flex-col items-end gap-1">
                                                <span className="text-xs font-medium text-gray-500">{progress}% Done</span>
                                                <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                            {/* Chevron */}
                                            <svg
                                                className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Concept Snippet (Always visible or truncated?) - Let's keep it visible but maybe smaller if collapsed */}
                                    <p className={`text-gray-600 dark:text-gray-300 text-sm leading-relaxed ${!isExpanded && 'line-clamp-2'}`}>
                                        {pattern.concept}
                                    </p>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-gray-100 dark:border-slate-800"
                                        >
                                            <div className="p-6 space-y-6">
                                                {/* Extended Details */}
                                                {pattern.details && (
                                                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
                                                        <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wider">Key Concepts</h4>
                                                        <ul className="space-y-2">
                                                            {pattern.details.map((detail, idx) => (
                                                                <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                                    {detail}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Problems List with Checkboxes */}
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                                        <span>LeetCode Problems</span>
                                                        <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                            {pattern.problems.filter(p => completedProblems[p]).length}/{pattern.problems.length}
                                                        </span>
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {pattern.problems.map((problem, idx) => {
                                                            const isDone = completedProblems[problem] || false;
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className={`group flex items-center justify-between p-3 rounded-lg border transition-all ${isDone
                                                                        ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                                                                        : 'bg-gray-50 dark:bg-slate-800/50 border-transparent hover:border-gray-200 dark:hover:border-slate-700'
                                                                        }`}
                                                                >
                                                                    <div
                                                                        className="flex items-start gap-3 flex-1 cursor-pointer"
                                                                        onClick={() => toggleProblem(problem)}
                                                                    >
                                                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isDone
                                                                            ? 'bg-green-500 border-green-500 text-white'
                                                                            : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 group-hover:border-blue-400'
                                                                            }`}>
                                                                            {isDone && (
                                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                        <span className={`text-sm transition-colors ${isDone
                                                                            ? 'text-gray-500 dark:text-gray-400 line-through decoration-gray-400'
                                                                            : 'text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                                                            }`}>
                                                                            {problem}
                                                                        </span>
                                                                    </div>

                                                                    <a
                                                                        href={`https://leetcode.com/problems/${problem.split(' (LeetCode')[0].toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')}/`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="ml-3 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        Solve
                                                                    </a>
                                                                </div>
                                                            );
                                                        })}
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

                <Footer />

            </main>
        </div>
    );
}
