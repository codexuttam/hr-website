'use client';

import React from 'react';
import { AlgorithmType } from '@/lib/types';
import { ALGORITHMS } from '@/lib/visualizerEngine';

interface AlgorithmSelectorProps {
    selectedAlgorithm: AlgorithmType;
    onSelect: (algo: AlgorithmType) => void;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({ selectedAlgorithm, onSelect }) => {
    const categories = {
        Sorting: ['bubble', 'selection', 'insertion', 'merge', 'quick'],
        Searching: ['linear', 'binary'],
    };

    return (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <h3 className="text-gray-400 font-bold mb-3 uppercase text-xs tracking-wider">Select Algorithm</h3>
            <div className="space-y-4">
                {Object.entries(categories).map(([category, algos]) => (
                    <div key={category}>
                        <h4 className="text-gray-500 text-xs font-semibold mb-2 ml-1">{category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {algos.map((algoKey) => {
                                const algo = ALGORITHMS[algoKey as AlgorithmType];
                                return (
                                    <button
                                        key={algoKey}
                                        onClick={() => onSelect(algoKey as AlgorithmType)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${selectedAlgorithm === algoKey
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                                            }`}
                                    >
                                        {algo.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlgorithmSelector;
