'use client';

import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { useRouter } from 'next/navigation';
import {
    Mic, StopCircle, Loader2,
    Video, MessageSquare, Clock, Shield,
    User, Cpu,
    Play, Activity, Brain, LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import EyeContactAnalyzer, { EyeContactRef } from './EyeContactAnalyzer';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { InterviewConfig } from './InterviewSetup';

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
            aiVideoRef.current.muted = true;
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
            setIsConnected(true);
        });

        vapi.on('call-end', () => {
            setIsConnected(false);
            setIsSpeaking(false);
            setIsListening(false);
        });

        vapi.on('speech-start', () => {
            setIsSpeaking(true);
            if (aiVideoRef.current) {
                aiVideoRef.current.play().catch(err => console.error('Error playing AI video:', err));
            }
        });

        vapi.on('speech-end', () => {
            setIsSpeaking(false);
            if (aiVideoRef.current) {
                aiVideoRef.current.pause();
            }
        });

        vapi.on('message', (message: any) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const speaker = message.role === 'assistant' ? 'AI Interviewer' : 'You';
                setTranscript(prev => [...prev, { speaker, text: message.transcript }]);
            }
        });

        vapi.on('error', (error: any) => {
            const errorMessage = error.message || (typeof error === 'string' ? error : JSON.stringify(error));
            setError(`Protocol Error: ${errorMessage}`);
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
            setError('Failed to start interview. Please check your connection.');
        }
    };

    const handleEndInterview = async () => {
        if (vapi) {
            vapi.stop();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        const eyeContactStats = analyzerRef.current?.getStats();

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

        try {
            const response = await fetch('/api/interview/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to generate feedback');

            if (data.feedback && data.feedback.interviewId) {
                router.push(`/interview/results/${data.feedback.interviewId}`);
            } else {
                setError('Interview completed! Feedback was generated but could not be saved to history.');
            }

        } catch (error) {
            console.error('Error processing interview feedback:', error);
            setError('Failed to process feedback. Your session data is logged below.');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col overflow-hidden selection:bg-indigo-500/30">
            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
                 style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            {/* - Top Navigation / Header - */}
            <header className="relative z-10 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 px-6 py-4">
                <div className="max-w-[1800px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Cpu className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {config.role}
                                </h1>
                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/50 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">
                                    Session Active
                                </span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {config.experience} • {config.techStack}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 px-5 py-2.5 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-inner">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                                    {formatTime(elapsedTime)}
                                </span>
                            </div>
                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                            <span className="text-xs font-bold text-slate-400">LIMIT {config.duration}M</span>
                        </div>
                        <Link
                            href="/dashboard"
                            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-500 hover:text-indigo-600 font-bold border border-gray-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all active:scale-95 text-sm flex items-center gap-2"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                        <button
                            onClick={onExit}
                            className="px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-500 hover:text-rose-500 font-bold border border-gray-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900/50 transition-all active:scale-95 text-sm"
                        >
                            Exit Setup
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 max-w-[1800px] mx-auto w-full p-6 flex flex-col lg:flex-row gap-6 min-h-0">
                
                {/* - Left Column: Video Feeds - */}
                <div className="flex-[1.5] flex flex-col gap-6 min-h-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* AI Interviewer Feed */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Cpu className="h-3 w-3" /> System Neural Link
                                </span>
                                {isSpeaking && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 animate-pulse">
                                        <Activity className="h-3 w-3" /> TRANSMITTING
                                    </span>
                                )}
                            </div>
                            <div className="relative aspect-video bg-slate-950 rounded-[2.5rem] overflow-hidden border-[6px] border-white dark:border-slate-900 shadow-2xl group">
                                <video
                                    ref={aiVideoRef}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    playsInline
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                        <Brain className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-white font-bold tracking-tight">AI Interviewer</span>
                                </div>
                            </div>
                        </div>

                        {/* Candidate (User) Feed */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <User className="h-3 w-3" /> Candidate Feed
                                </span>
                                {isListening && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 animate-pulse">
                                        <Mic className="h-3 w-3" /> CAPTURING
                                    </span>
                                )}
                            </div>
                            <div className="relative aspect-video bg-slate-950 rounded-[2.5rem] overflow-hidden border-[6px] border-white dark:border-slate-900 shadow-2xl group">
                                <EyeContactAnalyzer ref={analyzerRef} />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />
                                <div className="absolute bottom-6 left-6 flex items-center gap-3 pointer-events-none">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                        <User className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-white font-bold tracking-tight">You (Candidate)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Connection Status */}
                    <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm w-fit">
                        <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        <div className="flex items-center gap-2 text-sm">
                            <Shield className={`h-4 w-4 ${isConnected ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <span className={`font-bold ${isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                {isConnected ? 'Voice Link Active' : 'Not Connected'}
                            </span>
                        </div>
                        {isConnected && (
                            <>
                                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                    <Activity className="h-3.5 w-3.5" />
                                    {transcript.length} exchanges
                                </div>
                            </>
                        )}
                    </div>

                    {/* Control Bar */}
                    <div className="mt-auto py-6 flex items-center justify-center gap-6">
                        {!isConnected ? (
                            <button
                                onClick={startInterview}
                                className="group px-12 py-5 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-2xl shadow-indigo-500/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                            >
                                <Play className="h-6 w-6 fill-current" />
                                Initialize Audio Link
                            </button>
                        ) : (
                            <button
                                onClick={handleEndInterview}
                                className="group px-12 py-5 rounded-[2rem] bg-rose-500 hover:bg-rose-600 text-white font-bold text-lg shadow-2xl shadow-rose-500/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                            >
                                <StopCircle className="h-6 w-6" />
                                Terminate Session
                            </button>
                        )}
                        
                        <div className="flex items-center gap-3">
                            <button className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                                <Mic className="h-6 w-6" />
                            </button>
                            <button className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                                <Video className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* - Right Column: Transcript - */}
                <aside className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Protocol Transcript</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Live Log</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                            <AnimatePresence mode="popLayout">
                                {transcript.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20"
                                    >
                                        <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 text-slate-200 dark:text-slate-700 animate-spin" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Waiting for Link...</p>
                                            <p className="text-xs text-slate-400">Communication data will stream here</p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    transcript.map((entry, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex flex-col ${entry.speaker === 'You' ? 'items-end' : 'items-start'} gap-2`}
                                        >
                                            <div className="flex items-center gap-2 px-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{entry.speaker}</span>
                                            </div>
                                            <div className={`max-w-[90%] px-5 py-3.5 rounded-3xl text-sm font-medium leading-relaxed ${
                                                entry.speaker === 'AI Interviewer'
                                                    ? 'bg-indigo-600 text-white rounded-tl-sm shadow-lg shadow-indigo-500/10'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tr-sm'
                                            }`}>
                                                {entry.text}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                            <div ref={transcriptEndRef} />
                        </div>

                        {/* Transcript Footer Overlay */}
                        <div className="p-4 bg-gradient-to-t from-white dark:from-slate-900 to-transparent h-12 pointer-events-none" />
                    </div>
                    
                    {error && (
                        <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 flex items-start gap-3">
                            <Shield className="h-5 w-5 text-rose-500 shrink-0" />
                            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-tight uppercase tracking-tight">{error}</p>
                        </div>
                    )}
                </aside>
            </main>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(148, 163, 184, 0.2);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(148, 163, 184, 0.4);
                }
            `}</style>
        </div>
    );
}
