'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import VisualizerCanvas from '@/components/visualizer/VisualizerCanvas';
import ControlPanel from '@/components/visualizer/ControlPanel';
import CodePanel from '@/components/visualizer/CodePanel';
import AlgorithmSelector from '@/components/visualizer/AlgorithmSelector';
import SpeedSlider from '@/components/visualizer/SpeedSlider';
import ArrayGenerator from '@/components/visualizer/ArrayGenerator';
import { ALGORITHMS, generateRandomArray } from '@/lib/visualizerEngine';
import { AlgorithmType, Frame } from '@/lib/types';

export default function VisualizerPage() {
    // State
    const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmType>('bubble');
    const [array, setArray] = useState<number[]>([]);
    const [frames, setFrames] = useState<Frame[]>([]);
    const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(50);
    const [arraySize, setArraySize] = useState(20);
    const [target, setTarget] = useState<number>(0); // For searching
    const [selectedLanguage, setSelectedLanguage] = useState<string>('Pseudocode');

    // Refs for animation loop
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize array
    useEffect(() => {
        handleGenerateArray();
    }, []);

    // Generate new array and reset
    const handleGenerateArray = useCallback(() => {
        const newArray = generateRandomArray(arraySize);
        setArray(newArray);
        setFrames([]);
        setCurrentFrameIdx(0);
        setIsPlaying(false);

        // Pick a random target from the array for searching demo
        setTarget(newArray[Math.floor(Math.random() * newArray.length)]);
    }, [arraySize]);

    // Re-run algorithm when array or algo changes
    useEffect(() => {
        if (array.length > 0) {
            const algo = ALGORITHMS[selectedAlgo];
            const newFrames = algo.run(array, target);
            setFrames(newFrames);
            setCurrentFrameIdx(0);
            setIsPlaying(false);
        }
    }, [array, selectedAlgo, target]);

    // Animation Loop
    useEffect(() => {
        if (isPlaying) {
            const intervalTime = Math.max(10, 1000 / speed); // Speed mapping
            timerRef.current = setInterval(() => {
                setCurrentFrameIdx((prev) => {
                    if (prev < frames.length - 1) {
                        return prev + 1;
                    } else {
                        setIsPlaying(false);
                        return prev;
                    }
                });
            }, intervalTime);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, frames.length, speed]);

    // Controls
    const handlePlayPause = () => setIsPlaying(!isPlaying);
    const handleNext = () => {
        setIsPlaying(false);
        setCurrentFrameIdx((prev) => Math.min(prev + 1, frames.length - 1));
    };
    const handlePrev = () => {
        setIsPlaying(false);
        setCurrentFrameIdx((prev) => Math.max(prev - 1, 0));
    };
    const handleReset = () => {
        setIsPlaying(false);
        setCurrentFrameIdx(0);
    };
    const handleSeek = (step: number) => {
        setIsPlaying(false);
        setCurrentFrameIdx(Math.min(Math.max(step, 0), frames.length - 1));
    };

    // Current state to render
    const currentFrame = frames[currentFrameIdx];
    const currentArray = currentFrame ? currentFrame.array : array;
    const currentDescription = currentFrame ? currentFrame.description : "Ready to start";
    const currentLine = currentFrame ? currentFrame.codeLine : 0;

    const algoDetails = ALGORITHMS[selectedAlgo];
    const availableLanguages = ['Pseudocode', 'Javascript', 'Python', 'C++'];

    const getCodeContent = () => {
        if (selectedLanguage === 'Pseudocode') return algoDetails.pseudoCode;
        return algoDetails.code?.[selectedLanguage] || 'Code not available for this language yet.';
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 font-sans">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        AlgoVisualizer
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm">Interactive DSA Visualization Engine</p>
                </div>

                {/* Search Target Input (Only for searching algos) */}
                {algoDetails.type === 'searching' && (
                    <div className="flex items-center gap-2 bg-gray-900 p-2 rounded-lg border border-gray-800">
                        <span className="text-sm text-gray-400">Target:</span>
                        <input
                            type="number"
                            value={target}
                            onChange={(e) => {
                                setTarget(Number(e.target.value));
                                // Trigger re-run is handled by useEffect
                            }}
                            className="bg-gray-800 text-white px-2 py-1 rounded w-20 text-sm border border-gray-700 focus:border-blue-500 outline-none"
                        />
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Sidebar - Controls */}
                <div className="lg:col-span-3 space-y-6">
                    <AlgorithmSelector
                        selectedAlgorithm={selectedAlgo}
                        onSelect={setSelectedAlgo}
                    />

                    <ArrayGenerator
                        size={arraySize}
                        onSizeChange={setArraySize}
                        onGenerate={handleGenerateArray}
                        isSorting={algoDetails.type === 'sorting'}
                    />

                    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                        <h3 className="text-gray-400 font-bold mb-3 uppercase text-xs tracking-wider">Animation Speed</h3>
                        <SpeedSlider speed={speed} onChange={setSpeed} />
                    </div>
                </div>

                {/* Center - Canvas & Controls */}
                <div className="lg:col-span-6 space-y-6 flex flex-col">
                    {/* Canvas */}
                    <div className="relative">
                        {currentFrame && (
                            <VisualizerCanvas
                                frame={currentFrame}
                                array={currentArray}
                                maxVal={100}
                            />
                        )}
                        {!currentFrame && (
                            <div className="w-full h-64 md:h-96 bg-gray-900 rounded-xl flex items-center justify-center text-gray-500">
                                Loading...
                            </div>
                        )}
                    </div>

                    {/* Description Box */}
                    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl min-h-[80px] flex items-center justify-center text-center">
                        <p className="text-lg font-medium text-blue-200 animate-pulse-short">
                            {currentDescription}
                        </p>
                    </div>

                    {/* Playback Controls */}
                    <ControlPanel
                        isPlaying={isPlaying}
                        onPlayPause={handlePlayPause}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        onReset={handleReset}
                        progress={currentFrameIdx}
                        totalSteps={frames.length}
                        onSeek={handleSeek}
                    />
                </div>

                {/* Right Sidebar - Code & Info */}
                <div className="lg:col-span-3 space-y-6 flex flex-col h-full">
                    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                        <h3 className="text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Description</h3>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            {algoDetails.description}
                        </p>
                    </div>

                    <div className="flex-1 min-h-[300px] flex flex-col gap-4">
                        <div className="bg-gray-900 rounded-xl p-2 border border-gray-800 flex gap-2 overflow-x-auto">
                            {availableLanguages.map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setSelectedLanguage(lang)}
                                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${selectedLanguage === lang
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>

                        <CodePanel
                            code={getCodeContent()}
                            language={selectedLanguage}
                            currentLine={currentLine}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
