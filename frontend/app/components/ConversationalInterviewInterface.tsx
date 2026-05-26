'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

const AGENTS_URL      = process.env.NEXT_PUBLIC_AGENTS_URL || 'http://localhost:5001';
const VOICE_THRESHOLD = 20;    // 0-255 avg amplitude = speech
const SILENCE_AFTER_MS = 800; // stop 0.8 s after silence (was 1500 ms)
const NO_RESPONSE_MS  = 10000; // 10 s with no speech → skip

interface TranscriptEntry {
    speaker: 'AI Interviewer' | 'You';
    text: string;
}

type Phase = 'connecting' | 'listening' | 'processing' | 'playing' | 'ending' | 'error';

interface WsAiTurnMsg {
    type: 'ai_turn' | 'error';
    text?: string;
    audio?: string;
    turn_count?: number;
    message?: string;
}

interface Props {
    config: InterviewConfig;
    onExit: () => void;
}

async function blobToBase64(blob: Blob): Promise<string> {
    const buffer = await blob.arrayBuffer();
    const bytes  = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

export default function ConversationalInterviewInterface({ config, onExit }: Props) {
    const router = useRouter();
    const { user } = useAuth();

    const analyzerRef      = useRef<EyeContactRef>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const audioRef         = useRef<HTMLAudioElement | null>(null);
    const recorderRef      = useRef<MediaRecorder | null>(null);
    const chunksRef        = useRef<Blob[]>([]);
    const timerRef         = useRef<NodeJS.Timeout | null>(null);
    const audioCtxRef      = useRef<AudioContext | null>(null);
    const rafRef           = useRef<number | null>(null);
    const noRespTimerRef   = useRef<NodeJS.Timeout | null>(null);
    const cdIntervalRef    = useRef<NodeJS.Timeout | null>(null);
    const isTimeoutRef     = useRef(false);
    const hasSpeechRef     = useRef(false);
    const sessionIdRef     = useRef<string | null>(null);
    const startedRef       = useRef(false);

    // WebSocket refs
    const wsRef            = useRef<WebSocket | null>(null);
    const resolveWsTurnRef = useRef<((msg: WsAiTurnMsg) => void) | null>(null);

    // Live speech recognition (display-only — Sarvam STT remains the source of truth)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef   = useRef<any>(null);

    const [phase,       setPhase]       = useState<Phase>('connecting');
    const [transcript,  setTranscript]  = useState<TranscriptEntry[]>([]);
    const [elapsed,     setElapsed]     = useState(0);
    const [turnCount,   setTurnCount]   = useState(0);
    const [error,       setError]       = useState<string | null>(null);
    const [countdown,   setCountdown]   = useState<number | null>(null);
    const [isSpeaking,  setIsSpeaking]  = useState(false);
    const [interimText, setInterimText] = useState('');

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

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
            wsRef.current?.close();
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
        audioCtxRef.current    = null;
        rafRef.current         = null;
        noRespTimerRef.current = null;
        cdIntervalRef.current  = null;
        try { recognitionRef.current?.stop(); } catch { /* ignore */ }
        recognitionRef.current = null;
        setInterimText('');
    };

    // ── WebSocket message handler ────────────────────────────────────
    const handleWsMessage = useCallback((event: MessageEvent) => {
        let msg: Record<string, unknown>;
        try { msg = JSON.parse(event.data as string); }
        catch { return; }

        const type = msg.type as string;

        if (type === 'transcribed') {
            // User's words appear immediately — before AI responds
            addTranscript('You', msg.text as string);
        } else if (type === 'status') {
            if (msg.status === 'thinking') setPhase('processing');
        } else if (type === 'ai_turn') {
            addTranscript('AI Interviewer', msg.text as string);
            resolveWsTurnRef.current?.({ type: 'ai_turn', ...msg } as WsAiTurnMsg);
            resolveWsTurnRef.current = null;
        } else if (type === 'error') {
            setError(msg.message as string);
            resolveWsTurnRef.current?.({ type: 'error', message: msg.message as string });
            resolveWsTurnRef.current = null;
        }
    // addTranscript reads only setTranscript (stable); setPhase/setError are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Open WebSocket after session is created ──────────────────────
    const openWebSocket = useCallback((sessionId: string) => {
        const wsUrl = AGENTS_URL.replace(/^http/, 'ws');
        const ws    = new WebSocket(`${wsUrl}/api/interview/ws/${sessionId}`);

        ws.onopen    = () => console.log('[WS] open session=%s', sessionId);
        ws.onmessage = handleWsMessage;
        ws.onerror   = (e) => console.error('[WS] error', e);
        ws.onclose   = () => {
            console.log('[WS] closed');
            if (wsRef.current === ws) wsRef.current = null;
        };

        wsRef.current = ws;
    }, [handleWsMessage]);

    // ── Wait for a turn response over WebSocket ──────────────────────
    const awaitWsTurn = (): Promise<WsAiTurnMsg> =>
        new Promise(resolve => { resolveWsTurnRef.current = resolve; });

    // ── Get open WS — reconnects automatically if closed ────────────
    const getReadyWs = (): Promise<WebSocket | null> => {
        const existing = wsRef.current;
        const sid      = sessionIdRef.current;

        // If closed/closing/absent, reconnect before waiting
        if (!existing ||
            existing.readyState === WebSocket.CLOSED ||
            existing.readyState === WebSocket.CLOSING) {
            if (!sid) return Promise.resolve(null);
            console.log('[WS] reconnecting for session', sid);
            openWebSocket(sid);
        }

        const ws = wsRef.current;
        if (!ws) return Promise.resolve(null);
        if (ws.readyState === WebSocket.OPEN) return Promise.resolve(ws);
        if (ws.readyState !== WebSocket.CONNECTING) return Promise.resolve(null);

        return new Promise(resolve => {
            const done = (result: WebSocket | null) => {
                clearTimeout(timer);
                ws.removeEventListener('open',  onOpen);
                ws.removeEventListener('error', onFail);
                ws.removeEventListener('close', onFail);
                resolve(result);
            };
            const onOpen = () => done(ws);
            const onFail = () => done(null);
            const timer  = setTimeout(() => done(null), 5000);
            ws.addEventListener('open',  onOpen, { once: true });
            ws.addEventListener('error', onFail, { once: true });
            ws.addEventListener('close', onFail, { once: true });
        });
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

            // Open WS immediately while greeting plays — it'll be ready before first turn
            openWebSocket(data.session_id);

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
        isTimeoutRef.current  = false;
        hasSpeechRef.current  = false;
        setCountdown(10);
        setIsSpeaking(false);

        try {
            const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
            const fmt      = mimeType.includes('ogg') ? 'ogg' : 'webm';

            // Recorder is created lazily — started only when speech is detected.
            // This prevents idle waiting time from bloating the audio duration and
            // hitting Sarvam STT's 30-second limit.
            let recorder: MediaRecorder | null = null;
            const maxCapRef = { timer: null as ReturnType<typeof setTimeout> | null };

            const startRecorder = () => {
                if (recorder) return; // already started
                chunksRef.current = [];
                recorder = new MediaRecorder(stream, { mimeType });
                recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
                recorder.onstop = async () => {
                    if (maxCapRef.timer) { clearTimeout(maxCapRef.timer); maxCapRef.timer = null; }
                    stream.getTracks().forEach(t => t.stop());
                    cleanupListening();
                    setCountdown(null);
                    setIsSpeaking(false);
                    if (isTimeoutRef.current) {
                        await doTextTurn('(The candidate did not respond. Briefly acknowledge it and ask your next question.)');
                    } else {
                        const blob = new Blob(chunksRef.current, { type: mimeType });
                        await doAudioTurn(blob, fmt);
                    }
                };
                recorderRef.current = recorder;
                recorder.start();

                // Hard cap at 25 s to stay under Sarvam STT's 30-second limit
                maxCapRef.timer = setTimeout(() => commitRecording(), 25000);
            };

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
                    if (!hasSpeechRef.current) startRecorder(); // start recording on first word
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

            // ── Live captions via Web Speech API (display-only) ──────
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const win = window as any;
            const SR  = win.SpeechRecognition || win.webkitSpeechRecognition;
            if (SR) {
                const recog = new SR();
                recog.continuous     = true;
                recog.interimResults = true;
                recog.lang           = 'en-IN';
                recog.onresult = (e: { resultIndex: number; results: { isFinal: boolean; 0: { transcript: string } }[] }) => {
                    let interim = '';
                    for (let i = e.resultIndex; i < e.results.length; i++) {
                        if (!e.results[i].isFinal) interim += e.results[i][0].transcript;
                    }
                    setInterimText(interim);
                };
                recog.onerror = () => { /* silent — Sarvam STT is the source of truth */ };
                recognitionRef.current = recog;
                try { recog.start(); } catch { /* ignore */ }
            }

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

    // ── Audio turn via WebSocket ─────────────────────────────────────
    const doAudioTurn = async (blob: Blob, fmt: string) => {
        const base64 = await blobToBase64(blob);
        const ws     = await getReadyWs();

        if (!ws) {
            setError('Connection lost. Please reconnect.');
            setPhase('error');
            return;
        }

        const reply = awaitWsTurn();
        ws.send(JSON.stringify({ type: 'audio_turn', audio: base64, format: fmt }));
        const msg = await reply;
        if (msg.type === 'error') { beginListening(); return; }
        setTurnCount(msg.turn_count ?? 0);
        setPhase('playing');
        await playAudio(msg.audio!);
        beginListening();
    };

    // ── Text turn via WebSocket ──────────────────────────────────────
    const doTextTurn = async (text: string) => {
        setPhase('processing');
        const ws = await getReadyWs();

        if (!ws) {
            setError('Connection lost. Please reconnect.');
            setPhase('error');
            return;
        }

        const reply = awaitWsTurn();
        ws.send(JSON.stringify({ type: 'text_turn', text }));
        const msg = await reply;
        if (msg.type === 'error') { beginListening(); return; }
        setTurnCount(msg.turn_count ?? 0);
        setPhase('playing');
        await playAudio(msg.audio!);
        beginListening();
    };

    // ── End interview ────────────────────────────────────────────────
    const handleEndInterview = async () => {
        setPhase('ending');
        cleanupListening();
        recorderRef.current?.state === 'recording' && recorderRef.current.stop();
        audioRef.current?.pause();
        wsRef.current?.close();

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
            console.log('[feedback]', feedRes.status, feedData);

            if (feedData.feedback?.interviewId) {
                router.push(`/interview/results/${feedData.feedback.interviewId}`);
            } else {
                // Surface the real API error so the user knows what went wrong
                const reason = feedData.error ?? `HTTP ${feedRes.status}`;
                setError(`Could not save feedback: ${reason}`);
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
        <div className="h-screen bg-neutral-50 dark:bg-black font-sans flex flex-col overflow-hidden">
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
                 style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            {/* Header */}
            <header className="relative z-10 flex-shrink-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl/80 backdrop-blur-xl border-b border-gray-100 dark:border-neutral-900 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-black dark:text-white flex items-center justify-center shadow-lg shadow-gray-1000/20">
                            <Brain className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-black dark:text-white">{config.role}</h1>
                            <p className="text-[11px] text-neutral-400 font-medium">{config.experience} · {config.techStack}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {isActive && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 font-mono text-sm font-black text-black dark:text-white">
                                <Clock className="h-4 w-4 text-neutral-400" />
                                {formatTime(elapsed)}
                            </div>
                        )}
                        {turnCount > 0 && (
                            <div className="px-3 py-2 text-xs font-bold text-black dark:text-white dark:text-gray-500 bg-gray-100 dark:bg-zinc-900/30 rounded-xl border border-gray-200 dark:border-zinc-800">
                                {turnCount} exchange{turnCount !== 1 ? 's' : ''}
                            </div>
                        )}
                        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-black/80 backdrop-blur-xl border border-gray-200 dark:border-neutral-900 text-neutral-500 hover:text-black dark:text-white font-semibold text-sm transition-all">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                        <button onClick={onExit} className="px-4 py-2 rounded-xl bg-white dark:bg-black/80 backdrop-blur-xl border border-gray-200 dark:border-neutral-900 text-neutral-500 hover:text-black font-semibold text-sm transition-all">
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
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2 px-1">
                            Candidate Feed
                        </span>
                        <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border-4 border-white dark:border-black shadow-2xl">
                            <EyeContactAnalyzer ref={analyzerRef} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                            {phase === 'listening' && (
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/90 backdrop-blur rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    <span className="text-white text-[10px] font-black uppercase tracking-wider">LIVE</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status bar */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-black/80 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-neutral-900 shadow-sm">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            phase === 'connecting' ? 'bg-gray-500 animate-pulse' :
                            phase === 'error'      ? 'bg-black' :
                            phase === 'playing'    ? 'bg-gray-1000 animate-pulse' :
                            phase === 'listening'  ? (isSpeaking ? 'bg-black animate-pulse' : 'bg-gray-500') :
                            'bg-neutral-400 animate-pulse'
                        }`} />
                        <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
                            {phase === 'connecting' && <><Loader2 className="h-4 w-4 text-black animate-spin flex-shrink-0" /><span className="text-black dark:text-white font-medium">Connecting…</span></>}
                            {phase === 'listening' && isSpeaking  && <><Activity className="h-4 w-4 text-black animate-pulse flex-shrink-0" /><span className="text-black dark:text-white dark:text-gray-500 font-medium">Listening…</span></>}
                            {phase === 'listening' && !isSpeaking && countdown !== null && (
                                <><Mic className="h-4 w-4 text-black flex-shrink-0" /><span className="text-black dark:text-white dark:text-gray-500 font-medium truncate">Your turn… <span className="text-neutral-400 text-xs">next question in {countdown}s</span></span></>
                            )}
                            {phase === 'listening' && !isSpeaking && countdown === null && (
                                <><Mic className="h-4 w-4 text-black flex-shrink-0" /><span className="text-black dark:text-white dark:text-gray-500 font-medium">Listening…</span></>
                            )}
                            {phase === 'processing' && <><Loader2 className="h-4 w-4 text-gray-1000 animate-spin flex-shrink-0" /><span className="text-black dark:text-white dark:text-gray-500 font-medium">Processing…</span></>}
                            {phase === 'playing'    && <><Activity className="h-4 w-4 text-gray-1000 animate-pulse flex-shrink-0" /><span className="text-black dark:text-white dark:text-gray-500 font-medium">AI is speaking…</span></>}
                            {phase === 'ending'     && <><Loader2 className="h-4 w-4 text-neutral-400 animate-spin flex-shrink-0" /><span className="text-neutral-500 font-medium">Generating feedback…</span></>}
                            {phase === 'error'      && <><WifiOff className="h-4 w-4 text-black flex-shrink-0" /><span className="text-black font-medium">Connection error</span></>}
                        </div>
                    </div>

                    {/* Waveform bars when listening */}
                    {phase === 'listening' && (
                        <div className="flex items-center justify-center gap-1.5 py-1">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    className={`w-1.5 rounded-full ${isSpeaking ? 'bg-black' : 'bg-neutral-200 dark:bg-neutral-800'}`}
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
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-black/80 backdrop-blur-xl border border-gray-200 dark:border-neutral-900 text-neutral-500 hover:text-black hover:border-rose-200 dark:hover:border-rose-900 font-bold text-sm transition-all shadow-sm"
                            >
                                <StopCircle className="h-4 w-4" />
                                End &amp; Get Feedback
                            </button>
                        )}
                        {phase === 'error' && (
                            <button
                                onClick={startSession}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-black dark:text-white text-white font-bold text-sm shadow-sm hover:-translate-y-0.5 transition-all"
                            >
                                Reconnect
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: transcript */}
                <aside className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 bg-white dark:bg-black/80 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-neutral-900 shadow-xl overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-gray-100 dark:border-neutral-900 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-zinc-900/30 flex items-center justify-center">
                                    <MessageSquare className="h-3.5 w-3.5 text-black dark:text-white dark:text-gray-500" />
                                </div>
                                <span className="text-xs font-black text-black dark:text-white uppercase tracking-wider">Live Transcript</span>
                            </div>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase">{transcript.length} messages</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth">
                            <AnimatePresence mode="popLayout">
                                {transcript.length === 0 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
                                        <div className="w-14 h-14 rounded-2xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
                                            <MessageSquare className="h-6 w-6 text-neutral-300 dark:text-neutral-600" />
                                        </div>
                                        <p className="text-sm font-bold text-black dark:text-white">Connecting…</p>
                                        <p className="text-xs text-neutral-400">Transcript will appear here</p>
                                    </motion.div>
                                ) : transcript.map((entry, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                        className={`flex flex-col ${entry.speaker === 'You' ? 'items-end' : 'items-start'} gap-1.5`}>
                                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">{entry.speaker}</span>
                                        <div className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                            entry.speaker === 'AI Interviewer'
                                                ? 'bg-black dark:text-white text-white rounded-tl-sm shadow-md shadow-gray-1000/10'
                                                : 'bg-neutral-100 dark:bg-neutral-900 text-black dark:text-neutral-100 rounded-tr-sm'
                                        }`}>
                                            {entry.text}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Live interim caption — appears while user is speaking */}
                                {interimText && phase === 'listening' && (
                                    <motion.div
                                        key="interim"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-end gap-1.5"
                                    >
                                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">You</span>
                                        <div className="max-w-[88%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 italic border border-dashed border-neutral-300 dark:border-neutral-600">
                                            {interimText}
                                            <span className="inline-block w-1.5 h-3.5 bg-neutral-400 ml-1 align-middle animate-pulse rounded-sm" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={transcriptEndRef} />
                        </div>

                        {error && (
                            <div className="p-4 border-t border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10 flex items-start gap-2">
                                <WifiOff className="h-4 w-4 text-black shrink-0 mt-0.5" />
                                <p className="text-xs font-semibold text-black dark:text-gray-500 leading-tight">{error}</p>
                            </div>
                        )}
                    </div>
                </aside>
            </main>
        </div>
    );
}
