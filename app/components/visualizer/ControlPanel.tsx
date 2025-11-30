'use client';

import React from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRedo } from 'react-icons/fa';

interface ControlPanelProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    onReset: () => void;
    progress: number;
    totalSteps: number;
    onSeek: (step: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
    isPlaying,
    onPlayPause,
    onNext,
    onPrev,
    onReset,
    progress,
    totalSteps,
    onSeek,
}) => {
    return (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-col gap-4">
            {/* Timeline Slider */}
            <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-gray-400">
                    <span>Start</span>
                    <span>Step {progress} / {totalSteps}</span>
                    <span>End</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max={totalSteps}
                    value={progress}
                    onChange={(e) => onSeek(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    disabled={totalSteps === 0}
                />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={onReset}
                    className="p-3 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-all"
                    title="Reset"
                >
                    <FaRedo size={16} />
                </button>

                <button
                    onClick={onPrev}
                    disabled={progress <= 0}
                    className="p-3 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Previous Step"
                >
                    <FaStepBackward size={16} />
                </button>

                <button
                    onClick={onPlayPause}
                    className={`p-4 rounded-full text-white shadow-lg transform hover:scale-105 transition-all ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    title={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} className="ml-1" />}
                </button>

                <button
                    onClick={onNext}
                    disabled={progress >= totalSteps}
                    className="p-3 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Next Step"
                >
                    <FaStepForward size={16} />
                </button>
            </div>
        </div>
    );
};

export default ControlPanel;
