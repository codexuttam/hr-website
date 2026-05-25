'use client';

import React from 'react';

interface ArrayGeneratorProps {
    size: number;
    onSizeChange: (size: number) => void;
    onGenerate: () => void;
    isSorting: boolean; // Only show size slider for sorting
}

const ArrayGenerator: React.FC<ArrayGeneratorProps> = ({ size, onSizeChange, onGenerate, isSorting }) => {
    return (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col gap-4">
            <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider">Data Controls</h3>

            {isSorting && (
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Size: {size}</span>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="50"
                        value={size}
                        onChange={(e) => onSizeChange(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                </div>
            )}

            <button
                onClick={onGenerate}
                className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors border border-gray-700 hover:border-gray-600"
            >
                Generate New Array
            </button>
        </div>
    );
};

export default ArrayGenerator;
