'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Loader2, ChevronRight, ChevronLeft, SendHorizonal,
    ListChecks, Clock, ArrowLeft, CheckCircle2, Brain,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { InterviewConfig } from './InterviewSetup';

const AGENTS_URL = process.env.NEXT_PUBLIC_AGENTS_URL || 'http://localhost:5001';

interface StaticInterviewInterfaceProps {
    config: InterviewConfig;
    onExit: () => void;
}

type Phase = 'loading' | 'answering' | 'submitting' | 'error';

export default function StaticInterviewInterface({ config, onExit }: StaticInterviewInterfaceProps) {
    const router = useRouter();
    const { user } = useAuth();

    const [phase, setPhase] = useState<Phase>('loading');
    const [questions, setQuestions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [current, setCurrent] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const [elapsed, setElapsed] = useState(0);

    // Load questions on mount
    useEffect(() => {
        generateQuestions();
    }, []);

    // Timer
    useEffect(() => {
        if (phase !== 'answering') return;
        const t = setInterval(() => setElapsed(s => s + 1), 1000);
        return () => clearInterval(t);
    }, [phase]);

    const generateQuestions = async () => {
        setPhase('loading');
        try {
            const res = await fetch(`${AGENTS_URL}/api/interview/questions`, {
                method: 'POST',
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
            if (!res.ok || !data.questions) throw new Error(data.error || 'Failed to load questions');
            setQuestions(data.questions);
            setAnswers(new Array(data.questions.length).fill(''));
            setPhase('answering');
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'Failed to generate questions');
            setPhase('error');
        }
    };

    const handleSubmit = async () => {
        setPhase('submitting');

        // Build transcript in the same format the feedback API expects
        const transcript = questions.flatMap((q, i) => [
            { speaker: 'AI Interviewer', text: q },
            { speaker: 'You', text: answers[i] || '(no answer provided)' },
        ]);

        try {
            const res = await fetch('/api/interview/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transcript,
                    eyeContact: { percentage: 0, isLookingAtCamera: false },
                    config,
                    duration: elapsed,
                    timestamp: new Date().toISOString(),
                    userId: user?.user_id,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate feedback');
            if (data.feedback?.interviewId) {
                router.push(`/interview/results/${data.feedback.interviewId}`);
            } else {
                setErrorMsg('Feedback generated but could not be saved.');
                setPhase('error');
            }
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'Submission failed');
            setPhase('error');
        }
    };

    const formatTime = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    // ── Loading ──────────────────────────────────────────────────────
    if (phase === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-black dark:text-white flex items-center justify-center shadow-lg shadow-gray-1000/20">
                    <Loader2 className="h-7 w-7 text-white animate-spin" />
                </div>
                <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400">Generating questions for {config.role}…</p>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────────
    if (phase === 'error') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center gap-4 p-6">
                <p className="text-red-500 font-semibold text-center max-w-sm">{errorMsg}</p>
                <button onClick={onExit} className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Setup
                </button>
            </div>
        );
    }

    const isLast = current === questions.length - 1;
    const answered = answers.filter(a => a.trim()).length;

    // ── Answering / Submitting ───────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-sans">

            {/* Header */}
            <header className="bg-white/80 dark:bg-black/80 backdrop-blur-xl/80 backdrop-blur-xl border-b border-gray-100 dark:border-neutral-900 px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black dark:text-white flex items-center justify-center">
                            <ListChecks className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-black dark:text-white">{config.role}</p>
                            <p className="text-xs text-neutral-400">{config.experience} · {config.techStack}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-neutral-400 text-sm font-mono">
                            <Clock className="h-4 w-4" />
                            {formatTime(elapsed)}
                        </div>
                        <button
                            onClick={onExit}
                            className="text-xs font-bold text-neutral-400 hover:text-black transition-colors"
                        >
                            Exit
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
                        <span>Question {current + 1} of {questions.length}</span>
                        <span>{answered} answered</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gray-1000 rounded-full transition-all duration-300"
                            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                    <div className="flex gap-1.5">
                        {questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`flex-1 h-1.5 rounded-full transition-all ${
                                    i === current
                                        ? 'bg-gray-1000'
                                        : answers[i]?.trim()
                                        ? 'bg-gray-500'
                                        : 'bg-gray-200 dark:bg-neutral-800'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white dark:bg-black/80 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-neutral-900 p-6 md:p-8 shadow-sm space-y-5">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-zinc-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Brain className="h-4 w-4 text-black dark:text-white dark:text-gray-500" />
                        </div>
                        <p className="text-black dark:text-white font-semibold text-base leading-relaxed">
                            {questions[current]}
                        </p>
                    </div>

                    <textarea
                        key={current}
                        value={answers[current]}
                        onChange={(e) => {
                            const next = [...answers];
                            next[current] = e.target.value;
                            setAnswers(next);
                        }}
                        placeholder="Type your answer here…"
                        rows={7}
                        className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl px-4 py-3 text-black dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-gray-1000 outline-none transition-all text-sm resize-none"
                        disabled={phase === 'submitting'}
                    />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setCurrent(c => c - 1)}
                        disabled={current === 0}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 text-sm font-semibold text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft className="h-4 w-4" /> Previous
                    </button>

                    {isLast ? (
                        <button
                            onClick={handleSubmit}
                            disabled={phase === 'submitting' || answered === 0}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black dark:text-white text-white text-sm font-bold hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            {phase === 'submitting' ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                            ) : (
                                <><SendHorizonal className="h-4 w-4" /> Submit & Get Feedback</>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrent(c => c + 1)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/80 backdrop-blur-xl dark:bg-white text-white dark:text-black text-sm font-bold hover:-translate-y-0.5 active:scale-95 transition-all shadow-sm"
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Answered overview */}
                {answered > 0 && (
                    <div className="flex items-center gap-2 text-xs text-black dark:text-white dark:text-gray-500 font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        {answered} of {questions.length} questions answered
                        {answered < questions.length && ' — you can still go back and fill in the rest'}
                    </div>
                )}
            </div>
        </div>
    );
}
