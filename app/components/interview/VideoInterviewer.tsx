'use client';

import { useEffect, useRef } from 'react';
import { FaVideo, FaRobot } from 'react-icons/fa';

interface VideoInterviewerProps {
    isSpeaking: boolean;
    isThinking?: boolean;
    currentQuestion: string;
}

export default function VideoInterviewer({ isSpeaking, isThinking, currentQuestion }: VideoInterviewerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            if (isSpeaking) {
                videoRef.current.play().catch(e => console.error("Error playing video:", e));
            } else {
                videoRef.current.pause();
            }
        }
    }, [isSpeaking]);

    return (
        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <FaRobot className="text-purple-400" />
                    AI Interviewer
                </h3>
                <div className="flex items-center gap-3">
                    {isThinking && (
                        <div className="flex items-center gap-2 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                            </div>
                            <span className="text-purple-300 text-xs font-medium">Thinking...</span>
                        </div>
                    )}
                    {isSpeaking && (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-green-400 text-sm font-medium">Speaking</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden shadow-2xl border border-purple-500/20">
                <video
                    ref={videoRef}
                    src="/video/Professional%20Interview%20Scene.mp4"
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                />

                {/* Audio visualizer overlay when speaking */}
                {isSpeaking && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-purple-900/80 to-transparent flex items-end justify-center gap-1 px-4 pb-2">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-purple-400 rounded-full animate-pulse"
                                style={{
                                    height: `${Math.random() * 100}%`,
                                    animationDelay: `${i * 0.1}s`
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Status indicator */}
            <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-purple-300">
                    <FaVideo />
                    <span>AI-Powered Interview</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isSpeaking ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    isThinking ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                    {isSpeaking ? 'Active' : isThinking ? 'Processing' : 'Listening'}
                </div>
            </div>
        </div>
    );
}
