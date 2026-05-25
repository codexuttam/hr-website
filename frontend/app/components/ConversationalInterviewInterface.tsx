'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Loader2, MessageSquare, Clock, Brain, Activity,
    LayoutDashboard, WifiOff, StopCircle, Mic,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import EyeContactAnalyzer, { EyeContactRef } from './EyeContactAnalyzer';
import { useAuth } from '../contexts/AuthContext';
import { InterviewConfig } from './InterviewSetup';

const AGENTS_URL = process.env.NEXT_PUBLIC_AGENTS_URL || 'http://localhost:5001';
const VOICE_THRESHOLD     = 20;    // 0-255 avg amplitude = speech
const SILENCE_AFTER_MS    = 1500;  // stop after 1.5s of silence post-speech
const NO_RESPONSE_MS      = 10000; // 10s with no speech → skip to next question

interface TranscriptEntry {
    speaker: 'AI Interviewer' | 'You';
    text: string;
}

type Phase = 'connecting' | 'listening' | 'processing' | 'playing' | 'ending' | 'error';

interface Props {
    config: InterviewConfig;
    onExit: () => void;
}

async function blobToBase64(blob: Blob): Promise<string> {
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

export default function ConversationalInterviewInterface({ config, onExit }: Props) {
    const router = useRouter();
    const { user } = useAuth();
    const analyzerRef       = useRef<EyeContactRef>(null);
    const transcriptEndRef  = useRef<HTMLDivElement>(null);
    const audioRef          = useRef<HTMLAudioElement | null>(null);
    const recorderRef       = useRef<MediaRecorder | null>(null);
    const chunksRef         = useRef<Blob[]>([]);
    const timerRef          = useRef<NodeJS.Timeout | null>(null);
    const audioCtxRef       = useRef<AudioContext | null>(null);
    const rafRef            = useRef<number | null>(null);
    const noRespTimerRef    = useRef<NodeJS.Timeout | null>(null);
    const cdIntervalRef     = useRef<NodeJS.Timeout | null>(null);
    const isTimeoutRef      = useRef(false);
    const hasSpeechRef      = useRef(false);
    const sessionIdRef      = useRef<string | null>(null);
    const startedRef        = useRef(false);

    const [phase,     setPhase]     = useState<Phase>('connecting');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [elapsed,   setElapsed]   = useState(0);
    const [turnCount, setTurnCount] = useState(0);
    const [error,     setError]     = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Auto-scroll transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    // Session timer
    useEffect(() => {
        const active = ['listening', 'processing', 'playing'].includes(phase);
        if (active && !timerRef.current) {
            timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
        }
        if (!active && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, [phase]);

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;
        startSession();
        return () => {
            timerRef.current && clearInterval(timerRef.current);
            audioRef.current?.pause();
            cleanupListening();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addTranscript = (speaker: TranscriptEntry['speaker'], text: string) =>
        setTranscript(prev => [...prev, { speaker, text }]);

    const playAudio = (b64: string): Promise<void> =>
        new Promise(resolve => {
            const audio = new Audio(`data:audio/wav;base64,${b64}`);
            audioRef.current = audio;
            audio.onended = () => resolve();
            audio.onerror = () => resolve();
            audio.play().catch(() => resolve());
        });

    const cleanupListening = () => {
        if (rafRef.current)         cancelAnimationFrame(rafRef.current);
        if (noRespTimerRef.current) clearTimeout(noRespTimerRef.current);
        if (cdIntervalRef.current)  clearInterval(cdIntervalRef.current);
        audioCtxRef.current?.close().catch(() => {});
        audioCtxRef.current = null;
        rafRef.current = null;
        noRespTimerRef.current = null;
        cdIntervalRef.current  = null;
    };

    // ── Session init ─────────────────────────────────────────────────
    const startSession = async () => {
        setPhase('connecting');
        try {
            const res  = await fetch(`${AGENTS_URL}/api/interview/conversation/start`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role:       config.role,
                    experience: config.experience,
                    techStack:  config.techStack,
                    duration:   config.duration,
                    resumeText: config.resumeText ?? null,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Failed to start session');

            sessionIdRef.current = data.session_id;
            addTranscript('AI Interviewer', data.greeting);
            setPhase('playing');
            await playAudio(data.audio);
            beginListening();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Could not connect');
            setPhase('error');
        }
    };

    // ── Auto-listen after AI speaks ──────────────────────────────────
    const beginListening = async () => {
        setPhase('listening');
        setError(null);
        isTimeoutRef.current = false;
        hasSpeechRef.current = false;
        setCountdown(10);
        setIsSpeaking(false);

        try {
            const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
            const recorder = new MediaRecorder(stream, { mimeType });
            chunksRef.current = [];

            recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            recorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop());
                cleanupListening();
                setCountdown(null);
                setIsSpeaking(false);
                if (isTimeoutRef.current) {
                    await doTextTurn('(The candidate did not respond. Briefly acknowledge it and ask your next question.)');
                } else {
                    const blob = new Blob(chunksRef.current, { type: mimeType });
                    await doAudioTurn(blob, mimeType.includes('ogg') ? 'ogg' : 'webm');
                }
            };

            recorderRef.current = recorder;
            recorder.start();

            // Voice-activity detection via AudioContext analyser
            const ctx      = new AudioContext();
            audioCtxRef.current = ctx;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            ctx.createMediaStreamSource(stream).connect(analyser);
            const buf = new Uint8Array(analyser.frequencyBinCount);
            let silenceStart: number | null = null;

            const tick = () => {
                analyser.getByteFrequencyData(buf);
                const vol = buf.reduce((a, b) => a + b, 0) / buf.length;

                if (vol > VOICE_THRESHOLD) {
                    hasSpeechRef.current = true;
                    setIsSpeaking(true);
                    silenceStart = null;
                } else if (hasSpeechRef.current) {
                    setIsSpeaking(false);
                    if (!silenceStart) silenceStart = Date.now();
                    if (Date.now() - silenceStart > SILENCE_AFTER_MS) {
                        commitRecording();
                        return;
                    }
                }
                rafRef.current = requestAnimationFrame(tick);
            };
            rafRef.current = requestAnimationFrame(tick);

            // Visible countdown (only until speech starts)
            let rem = 10;
            cdIntervalRef.current = setInterval(() => {
                if (hasSpeechRef.current) {
                    setCountdown(null);
                    clearInterval(cdIntervalRef.current!);
                    return;
                }
                rem--;
                setCountdown(rem > 0 ? rem : null);
            }, 1000);

            // Hard timeout → advance without audio
            noRespTimerRef.current = setTimeout(() => {
                if (!hasSpeechRef.current) {
                    isTimeoutRef.current = true;
                    commitRecording();
                }
            }, NO_RESPONSE_MS);

        } catch {
            setError('Microphone access denied. Please allow microphone access.');
            setPhase('error');
        }
    };

    const commitRecording = () => {
        if (recorderRef.current?.state === 'recording') {
            recorderRef.current.stop();
            setPhase('processing');
        }
    };

    // ── Audio turn (user spoke) ──────────────────────────────────────
    const doAudioTurn = async (blob: Blob, fmt: string) => {
        const sid = sessionIdRef.current;
        if (!sid) return;
        try {
            const base64 = await blobToBase64(blob);
            const res    = await fetch(`${AGENTS_URL}/api/interview/conversation/turn`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sid, audio: base64, audio_format: fmt }),
            });
            const data = await res.json();
            console.log('[doAudioTurn] response:', data);
            if (!res.ok) throw new Error(data.detail || 'Turn failed');

            if (!data.success) {
                console.warn('[doAudioTurn] success=false:', data.error);
                setError(data.error || 'Could not understand. Please speak clearly.');
                beginListening();
                return;
            }

            if (data.user_text) addTranscript('You', data.user_text);
            addTranscript('AI Interviewer', data.ai_response);
            setTurnCount(data.turn_count);
            setPhase('playing');
            await playAudio(data.audio);
            beginListening();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            beginListening();
        }
    };

    // ── Text turn (timeout / no audio) ──────────────────────────────
    const doTextTurn = async (text: string) => {
        const sid = sessionIdRef.current;
        if (!sid) return;
        setPhase('processing');
        try {
            const res  = await fetch(`${AGENTS_URL}/api/interview/conversation/turn-text`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sid, user_text: text }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Turn failed');

            addTranscript('AI Interviewer', data.ai_response);
            setTurnCount(data.turn_count);
            setPhase('playing');
            await playAudio(data.audio);
            beginListening();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            beginListening();
        }
    };

    // ── End interview ────────────────────────────────────────────────
    const handleEndInterview = async () => {
        setPhase('ending');
        cleanupListening();
        recorderRef.current?.state === 'recording' && recorderRef.current.stop();
        audioRef.current?.pause();
        const sid = sessionIdRef.current;

        try {
            const eyeStats = analyzerRef.current?.getStats();
            let finalTranscript = transcript;

            if (sid) {
                const res  = await fetch(`${AGENTS_URL}/api/interview/conversation/end`, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sid }),
                });
                const data = await res.json();
                if (res.ok && Array.isArray(data.transcript) && data.transcript.length > 0) {
                    finalTranscript = data.transcript;
                }
            }

            const feedRes  = await fetch('/api/interview/feedback', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transcript: finalTranscript,
                    eyeContact: {
                        percentage:        eyeStats?.percentage        ?? 0,
                        isLookingAtCamera: eyeStats?.isLookingAtCamera ?? false,
                    },
                    config,
                    duration:  elapsed,
                    timestamp: new Date().toISOString(),
                    userId:    user?.user_id,
                }),
            });
            const feedData = await feedRes.json();

            if (feedData.feedback?.interviewId) {
                router.push(`/interview/results/${feedData.feedback.interviewId}`);
            } else {
                setError('Interview complete, but feedback could not be saved.');
                setPhase('error');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to submit feedback');
            setPhase('error');
        }
    };

    const formatTime = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const isActive = ['listening', 'processing', 'playing'].includes(phase);

    return (
        <div className="h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col overflow-hidden">
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
                 style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            {/* Header */}
            <header className="relative z-10 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Brain className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-slate-900 dark:text-white">{config.role}</h1>
                            <p className="text-[11px] text-slate-400 font-medium">{config.experience} · {config.techStack}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {isActive && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 font-mono text-sm font-black text-slate-900 dark:text-white">
                                <Clock className="h-4 w-4 text-slate-400" />
                                {formatTime(elapsed)}
                            </div>
                        )}
                        {turnCount > 0 && (
                            <div className="px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                {turnCount} exchange{turnCount !== 1 ? 's' : ''}
                            </div>
                        )}
                        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 font-semibold text-sm transition-all">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                        <button onClick={onExit} className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 font-semibold text-sm transition-all">
                            Exit
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full p-6 flex flex-col lg:flex-row gap-6 min-h-0">

                {/* Left: camera + status + controls */}
                <div className="flex-[1.2] flex flex-col gap-5 min-h-0">

                    {/* Camera */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                            Candidate Feed
                        </span>
                        <div className="relative aspect-video bg-slate-950 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl">
                            <EyeContactAnalyzer ref={analyzerRef} />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />
                            {phase === 'listening' && (
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/90 backdrop-blur rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    <span className="text-white text-[10px] font-black uppercase tracking-wider">LIVE</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status bar */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            phase === 'connecting' ? 'bg-amber-400 animate-pulse' :
                            phase === 'error'      ? 'bg-rose-500' :
                            phase === 'playing'    ? 'bg-indigo-500 animate-pulse' :
                            phase === 'listening'  ? (isSpeaking ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-400') :
                            'bg-slate-400 animate-pulse'
                        }`} />
                        <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
                            {phase === 'connecting' && <><Loader2 className="h-4 w-4 text-amber-500 animate-spin flex-shrink-0" /><span className="text-amber-600 font-medium">Connecting…</span></>}
                            {phase === 'listening' && isSpeaking  && <><Activity className="h-4 w-4 text-emerald-500 animate-pulse flex-shrink-0" /><span className="text-emerald-600 dark:text-emerald-400 font-medium">Listening…</span></>}
                            {phase === 'listening' && !isSpeaking && countdown !== null && (
                                <><Mic className="h-4 w-4 text-emerald-500 flex-shrink-0" /><span className="text-emerald-600 dark:text-emerald-400 font-medium truncate">Your turn… <span className="text-slate-400 text-xs">next question in {countdown}s</span></span></>
                            )}
                            {phase === 'listening' && !isSpeaking && countdown === null && (
                                <><Mic className="h-4 w-4 text-emerald-500 flex-shrink-0" /><span className="text-emerald-600 dark:text-emerald-400 font-medium">Listening…</span></>
                            )}
                            {phase === 'processing' && <><Loader2 className="h-4 w-4 text-indigo-500 animate-spin flex-shrink-0" /><span className="text-indigo-600 dark:text-indigo-400 font-medium">Processing…</span></>}
                            {phase === 'playing'    && <><Activity className="h-4 w-4 text-indigo-500 animate-pulse flex-shrink-0" /><span className="text-indigo-600 dark:text-indigo-400 font-medium">AI is speaking…</span></>}
                            {phase === 'ending'     && <><Loader2 className="h-4 w-4 text-slate-400 animate-spin flex-shrink-0" /><span className="text-slate-500 font-medium">Generating feedback…</span></>}
                            {phase === 'error'      && <><WifiOff className="h-4 w-4 text-rose-500 flex-shrink-0" /><span className="text-rose-600 font-medium">Connection error</span></>}
                        </div>
                    </div>

                    {/* Waveform bars when listening */}
                    {phase === 'listening' && (
                        <div className="flex items-center justify-center gap-1.5 py-1">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    className={`w-1.5 rounded-full ${isSpeaking ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    animate={{ height: isSpeaking ? [8, 8 + (i % 3) * 10, 8] : 8 }}
                                    transition={{ duration: 0.4, repeat: isSpeaking ? Infinity : 0, delay: i * 0.06 }}
                                />
                            ))}
                        </div>
                    )}

                    {/* End button */}
                    <div className="mt-auto flex flex-col gap-3">
                        {isActive && phase !== 'ending' && (
                            <button
                                onClick={handleEndInterview}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900 font-bold text-sm transition-all shadow-sm"
                            >
                                <StopCircle className="h-4 w-4" />
                                End & Get Feedback
                            </button>
                        )}
                        {phase === 'error' && (
                            <button
                                onClick={startSession}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-sm hover:-translate-y-0.5 transition-all"
                            >
                                Reconnect
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: transcript */}
                <aside className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <MessageSquare className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Live Transcript</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{transcript.length} messages</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth">
                            <AnimatePresence mode="popLayout">
                                {transcript.length === 0 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                            <MessageSquare className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Connecting…</p>
                                        <p className="text-xs text-slate-400">Transcript will appear here</p>
                                    </motion.div>
                                ) : transcript.map((entry, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                        className={`flex flex-col ${entry.speaker === 'You' ? 'items-end' : 'items-start'} gap-1.5`}>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{entry.speaker}</span>
                                        <div className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                            entry.speaker === 'AI Interviewer'
                                                ? 'bg-indigo-600 text-white rounded-tl-sm shadow-md shadow-indigo-500/10'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tr-sm'
                                        }`}>
                                            {entry.text}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={transcriptEndRef} />
                        </div>

                        {error && (
                            <div className="p-4 border-t border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10 flex items-start gap-2">
                                <WifiOff className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 leading-tight">{error}</p>
                            </div>
                        )}
                    </div>
                </aside>
            </main>
        </div>
    );
}
