'use client';

import React from 'react';

interface SpeedSliderProps {
    speed: number;
    onChange: (speed: number) => void;
}

const SpeedSlider: React.FC<SpeedSliderProps> = ({ speed, onChange }) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-gray-400">
                <span>Slow</span>
                <span>Speed: {speed}x</span>
                <span>Fast</span>
            </div>
            <input
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
        </div>
    );
};

export default SpeedSlider;
