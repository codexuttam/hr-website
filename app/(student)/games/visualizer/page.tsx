'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import VisualizerCanvas from '@/components/visualizer/VisualizerCanvas';
import ControlPanel from '@/components/visualizer/ControlPanel';
import CodePanel from '@/components/visualizer/CodePanel';
import AlgorithmSelector from '@/components/visualizer/AlgorithmSelector';
import SpeedSlider from '@/components/visualizer/SpeedSlider';
import ArrayGenerator from '@/components/visualizer/ArrayGenerator';
import { ALGORITHMS, generateRandomArray } from '@/lib/visualizerEngine';
import { AlgorithmType, Frame } from '@/lib/types';
import { Activity, Code2, Settings2, Info, ChevronRight, Play } from 'lucide-react';

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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans">
            <Header />
            
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                
                {/* ── Page Header ─────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Activity className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                AlgoVisualizer
                                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-indigo-200/50">Engine v2.0</span>
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Interactive Data Structures & Algorithms Visualization</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {algoDetails.type === 'searching' && (
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Value</span>
                                <input
                                    type="number"
                                    value={target}
                                    onChange={(e) => setTarget(Number(e.target.value))}
                                    className="bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-md w-16 text-center focus:ring-2 focus:ring-indigo-500 outline-none border border-gray-200 dark:border-slate-700"
                                />
                            </div>
                        )}
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800/50 text-xs font-bold uppercase tracking-widest">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                           System Ready
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* ── Left Column: Config ─────────────────────────────────── */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Algorithm Selection */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-gray-400">
                                <Settings2 className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Configuration</span>
                            </div>
                            <AlgorithmSelector
                                selectedAlgorithm={selectedAlgo}
                                onSelect={setSelectedAlgo}
                            />
                        </div>

                        {/* Array Management */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
                            <ArrayGenerator
                                size={arraySize}
                                onSizeChange={setArraySize}
                                onGenerate={handleGenerateArray}
                                isSorting={algoDetails.type === 'sorting'}
                            />
                        </div>

                        {/* Speed Control */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Animation Speed</h3>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">{speed}fps</span>
                            </div>
                            <SpeedSlider speed={speed} onChange={setSpeed} />
                        </div>
                    </div>

                    {/* ── Center Column: Canvas ───────────────────────────────── */}
                    <div className="lg:col-span-6 space-y-6">
                        {/* Visualizer Area */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                                 style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            
                            <div className="relative aspect-video md:aspect-auto md:h-[400px]">
                                {currentFrame ? (
                                    <VisualizerCanvas
                                        frame={currentFrame}
                                        array={currentArray}
                                        maxVal={100}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 dark:bg-slate-950/50 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-4">
                                        <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                                        <p className="text-sm">Initializing visualizer...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description / Step Info */}
                        <div className="bg-indigo-600 dark:bg-indigo-500 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                             <div className="relative flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                     <Play className="h-5 w-5 fill-current" />
                                 </div>
                                 <p className="text-lg font-semibold leading-tight">
                                     {currentDescription}
                                 </p>
                             </div>
                        </div>

                        {/* Controls */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm">
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
                    </div>

                    {/* ── Right Column: Info & Code ───────────────────────────── */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Algo Info */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-gray-400">
                                <Info className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Algorithm Info</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{algoDetails.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                                {algoDetails.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-gray-500 uppercase tracking-tighter border border-gray-200 dark:border-slate-700">Type: {algoDetails.type}</span>
                                <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-gray-500 uppercase tracking-tighter border border-gray-200 dark:border-slate-700">Steps: {frames.length}</span>
                            </div>
                        </div>

                        {/* Code Panel */}
                        <div className="flex-1 min-h-[400px] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-2 mb-4 text-gray-400">
                                    <Code2 className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Implementation</span>
                                </div>
                                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                                    {availableLanguages.map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => setSelectedLanguage(lang)}
                                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap uppercase tracking-tighter border ${selectedLanguage === lang
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                                                    : 'text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800'
                                                }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 p-2 bg-slate-950 overflow-hidden">
                                <CodePanel
                                    code={getCodeContent()}
                                    language={selectedLanguage}
                                    currentLine={currentLine}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </main>
            
            <Footer />
        </div>
    );
}
