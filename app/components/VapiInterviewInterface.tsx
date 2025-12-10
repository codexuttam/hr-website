'use client';

import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { useRouter } from 'next/navigation';
import { FaMicrophone, FaMicrophoneSlash, FaStop, FaSpinner } from 'react-icons/fa';
import EyeContactAnalyzer, { EyeContactRef } from './EyeContactAnalyzer';
import { useAuth } from '../contexts/AuthContext';

interface InterviewConfig {
    role: string;
    experience: string;
    techStack: string;
    duration: number;
}

interface VapiInterviewInterfaceProps {
    config: InterviewConfig;
    onExit: () => void;
}

export default function VapiInterviewInterface({ config, onExit }: VapiInterviewInterfaceProps) {
    const [vapi, setVapi] = useState<Vapi | null>(null);
    const { user } = useAuth();
    const router = useRouter();
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string }>>([]);
    const [error, setError] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    const aiVideoRef = useRef<HTMLVideoElement>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const analyzerRef = useRef<EyeContactRef>(null);

    // Initialize Vapi
    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
        if (!apiKey) {
            console.error('Missing NEXT_PUBLIC_VAPI_WEB_TOKEN');
            setError('Vapi Web Token is missing. Please check your environment variables.');
            return;
        }

        const vapiInstance = new Vapi(apiKey);
        setVapi(vapiInstance);

        return () => {
            vapiInstance.stop();
        };
    }, []);

    // Setup AI video
    useEffect(() => {
        if (aiVideoRef.current) {
            aiVideoRef.current.src = '/video/Single_Speaker_Video_Generation.mp4';
            aiVideoRef.current.loop = false;
            aiVideoRef.current.muted = true; // Muted because audio comes from Vapi
        }
    }, []);

    // Timer
    useEffect(() => {
        if (isConnected) {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => {
                    const newTime = prev + 1;
                    if (newTime >= config.duration * 60) {
                        handleEndInterview();
                    }
                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isConnected, config.duration]);

    // Vapi event listeners
    useEffect(() => {
        if (!vapi) return;

        vapi.on('call-start', () => {
            console.log('Call started');
            setIsConnected(true);
        });

        vapi.on('call-end', () => {
            console.log('Call ended');
            setIsConnected(false);
            setIsSpeaking(false);
            setIsListening(false);
        });

        vapi.on('speech-start', () => {
            console.log('AI speaking');
            setIsSpeaking(true);
            // Play AI video when speaking
            if (aiVideoRef.current) {
                aiVideoRef.current.play().catch(err => console.error('Error playing AI video:', err));
            }
        });

        vapi.on('speech-end', () => {
            console.log('AI stopped speaking');
            setIsSpeaking(false);
            // Pause AI video when not speaking
            if (aiVideoRef.current) {
                aiVideoRef.current.pause();
            }
        });

        vapi.on('message', (message: any) => {
            console.log('Message:', message);

            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const speaker = message.role === 'assistant' ? 'AI Interviewer' : 'You';
                setTranscript(prev => [...prev, { speaker, text: message.transcript }]);
            }
        });

        vapi.on('error', (error: any) => {
            console.error('Vapi error details:', error);
            const errorMessage = error.message || (typeof error === 'string' ? error : JSON.stringify(error));
            setError(`An error occurred: ${errorMessage}`);
        });

        return () => {
            vapi.removeAllListeners();
        };
    }, [vapi]);

    // Auto-scroll transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const startInterview = async () => {
        if (!vapi) return;

        try {
            setError(null);

            // Create assistant configuration
            const assistant = {
                name: 'AI Interviewer',
                model: {
                    provider: 'openai' as const,
                    model: 'gpt-3.5-turbo' as const,
                    messages: [
                        {
                            role: 'system' as const,
                            content: `
                            You are an expert technical interviewer conducting a ${config.experience}-level interview for the ${config.role} position.

                            Candidate tech stack: ${config.techStack}.

                            Your responsibilities:
                            - Start with a brief warm greeting and introduction.
                            - Ask clear, focused technical and behavioral questions.
                            - Ask one question at a time.
                            - After each answer, acknowledge briefly and continue with a follow-up or next question.
                            - Use a friendly and professional tone.
                            - Keep responses concise.
                            - Do NOT mention or reference interview duration at any point.
                            - Do NOT answer on behalf of the candidate.

                            At the end:
                            - Provide a short 2–3 sentence performance summary.

                            Stay strictly in the role of an interviewer.`
                        }
                    ],
                    temperature: 0.6,
                },
                voice: {
                    provider: 'openai' as const,
                    voiceId: 'alloy',
                },
                firstMessage: `Hello! I'm your AI interviewer for the ${config.role} position. Let's begin — could you please introduce yourself and share your experience with ${config.techStack}?`,
            };


            await vapi.start(assistant);
            setIsListening(true);
        } catch (err) {
            console.error('Error starting interview:', err);
            setError('Failed to start interview. Please check your API key and try again.');
        }
    };

    const handleEndInterview = async () => {
        if (vapi) {
            vapi.stop();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // Get final stats
        const eyeContactStats = analyzerRef.current?.getStats();

        // Prepare payload
        const payload = {
            transcript,
            eyeContact: {
                percentage: eyeContactStats?.percentage || 0,
                isLookingAtCamera: eyeContactStats?.isLookingAtCamera || false
            },
            config,
            duration: elapsedTime,
            timestamp: new Date().toISOString(),
            userId: user?.user_id
        };

        console.log('Sending interview data to n8n:', payload);

        try {
            // Updated to use internal API with Gemini instead of n8n webhook
            const response = await fetch('/api/interview/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to generate feedback');
            }

            const data = await response.json();
            console.log('Feedback generated successfully:', data);

            if (data.feedback && data.feedback.interviewId) {
                router.push(`/interview/results/${data.feedback.interviewId}`);
            }

        } catch (error) {
            console.error('Error processing interview feedback:', error);
            setError('Failed to save interview feedback. Please try again.');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex flex-col overflow-hidden">
            <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {config.role} Interview
                        </h1>
                        <p className="text-gray-300">
                            {config.experience.charAt(0).toUpperCase() + config.experience.slice(1)} Level • {config.techStack}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-lg border border-white/20">
                            <span className="text-2xl font-mono text-white">{formatTime(elapsedTime)}</span>
                            <span className="text-gray-400 text-sm ml-2">/ {config.duration}:00</span>
                        </div>
                        <button
                            onClick={onExit}
                            className="px-6 py-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30 transition-colors"
                        >
                            Exit
                        </button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {/* Video Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* AI Interviewer Video */}
                    <div className="relative">
                        <div className="bg-black rounded-2xl overflow-hidden border-4 border-purple-500/50 aspect-video">
                            <video
                                ref={aiVideoRef}
                                className="w-full h-full object-cover"
                                playsInline
                            />
                            {isSpeaking && (
                                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 animate-pulse">
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    Speaking
                                </div>
                            )}
                        </div>
                        <div className="mt-2 text-center">
                            <p className="text-white font-semibold">AI Interviewer</p>
                        </div>
                    </div>

                    {/* User Video */}
                    <div className="relative">
                        <div className="bg-black rounded-2xl overflow-hidden border-4 border-blue-500/50 aspect-video">
                            <EyeContactAnalyzer ref={analyzerRef} />
                            {isListening && (
                                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 animate-pulse z-20">
                                    <FaMicrophone className="text-sm" />
                                    Listening
                                </div>
                            )}
                        </div>
                        <div className="mt-2 text-center">
                            <p className="text-white font-semibold">You</p>
                        </div>
                    </div>
                </div>

                {/* Transcript */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6 flex-1 min-h-0 flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-4 flex-shrink-0">Interview Transcript</h2>
                    <div className="space-y-4 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                        {transcript.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">
                                {isConnected ? 'Conversation will appear here...' : 'Click "Start Interview" to begin'}
                            </p>
                        ) : (
                            transcript.map((entry, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg ${entry.speaker === 'AI Interviewer'
                                        ? 'bg-purple-500/20 border border-purple-500/30'
                                        : 'bg-blue-500/20 border border-blue-500/30'
                                        }`}
                                >
                                    <p className="text-sm font-semibold text-white mb-1">{entry.speaker}</p>
                                    <p className="text-gray-200">{entry.text}</p>
                                </div>
                            ))
                        )}
                        <div ref={transcriptEndRef} />
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mb-6">
                    {!isConnected ? (
                        <button
                            onClick={startInterview}
                            className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-3"
                        >
                            <FaMicrophone />
                            Start Interview
                        </button>
                    ) : (
                        <button
                            onClick={handleEndInterview}
                            className="px-8 py-4 rounded-lg bg-red-500 text-white font-semibold text-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-3"
                        >
                            <FaStop />
                            End Interview
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
        </div>
    );
}
