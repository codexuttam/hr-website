'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Frame } from '@/lib/types';

interface VisualizerCanvasProps {
    frame: Frame;
    array: number[]; // Current array state to render
    maxVal: number;
}

const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({ frame, array, maxVal }) => {
    // Calculate bar width based on array size to fit container
    // We'll use flexbox for layout so width is automatic, but we can set min width

    return (
        <div className="w-full h-64 md:h-96 bg-gray-900 rounded-xl p-4 flex items-end justify-center gap-1 shadow-inner border border-gray-800 overflow-hidden relative">
            <AnimatePresence>
                {array.map((value, index) => {
                    const isHighlighted = frame.highlights.includes(index);
                    const isSwap = frame.action === 'swap' && frame.highlights.includes(index);
                    const isCompare = frame.action === 'compare' && frame.highlights.includes(index);
                    const isFound = frame.action === 'found' && (frame.highlights.length === 0 || frame.highlights.includes(index));

                    let colorClass = 'bg-blue-500'; // Default
                    if (isFound) colorClass = 'bg-green-500';
                    else if (isSwap) colorClass = 'bg-red-500';
                    else if (isCompare) colorClass = 'bg-yellow-500';
                    else if (isHighlighted) colorClass = 'bg-purple-500';

                    // Height percentage
                    const height = `${(value / maxVal) * 100}%`;

                    return (
                        <motion.div
                            key={`${index}-${value}`} // Key helps with re-ordering animation if we used value as key, but index is safer for duplicates if we handle layoutId correctly. 
                            // Actually for Framer Motion reordering, we need a unique ID for each element if they move. 
                            // But here we are just re-rendering the array at each step. 
                            // Simple layout animation might be tricky with duplicates. 
                            // Let's stick to simple height/color animation for now.
                            layout
                            initial={{ height: 0, opacity: 0 }}
                            animate={{
                                height,
                                opacity: 1,
                                backgroundColor: isFound ? '#22c55e' : isSwap ? '#ef4444' : isCompare ? '#eab308' : isHighlighted ? '#a855f7' : '#3b82f6'
                            }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className={`rounded-t-md relative group ${colorClass}`}
                            style={{
                                width: `${Math.min(40, 800 / array.length)}px`, // Dynamic width
                                height
                            }}
                        >
                            {/* Tooltip or Value Label */}
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                {value}
                            </span>

                            {/* Pointers */}
                            {Object.entries(frame.pointers).map(([key, val]) => {
                                if (val === index) {
                                    return (
                                        <div key={key} className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-white mb-1"></div>
                                            <span className="text-xs font-bold text-white uppercase">{key}</span>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default VisualizerCanvas;
