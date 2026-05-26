'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
    Briefcase, Code2, Clock, Brain,
    Mic, ArrowLeft, LayoutDashboard, FileText, Upload,
    ListChecks, ArrowRight, X, Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

export interface InterviewConfig {
    role: string;
    experience: string;
    techStack: string;
    duration: number;
    type: 'conversational' | 'static';
    resumeText: string;
}

interface InterviewSetupProps {
    onStart: (config: InterviewConfig) => void;
}

const MODES = [
    {
        type: 'conversational' as const,
        icon: Mic,
        title: 'Conversational',
        desc: 'Live voice interview with an AI interviewer. Speak your answers in real time.',
    },
    {
        type: 'static' as const,
        icon: ListChecks,
        title: 'Question Bank',
        desc: 'AI generates questions based on your role. Answer them in writing at your own pace.',
    },
];

type ParseState = 'idle' | 'parsing' | 'done' | 'error';

export default function InterviewSetup({ onStart }: InterviewSetupProps) {
    const [config, setConfig] = useState<Omit<InterviewConfig, 'resumeText'>>({
        role: '',
        experience: 'Mid-Level',
        techStack: '',
        duration: 15,
        type: 'conversational',
    });

    const [resumeText,     setResumeText]     = useState('');
    const [resumeFileName, setResumeFileName] = useState('');
    const [parseState,     setParseState]     = useState<ParseState>('idle');
    const [parseError,     setParseError]     = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Client-side text extraction ──────────────────────────────────
    const extractText = async (file: File): Promise<string> => {
        const name = file.name.toLowerCase();

        if (name.endsWith('.pdf')) {
            const pdfjsLib = await import('pdfjs-dist');
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
            }
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, verbosity: 0 }).promise;
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                text += content.items.map((item: any) => item?.str ?? '').join(' ') + '\n';
            }
            const trimmed = text.trim();
            if (!trimmed) throw new Error('No text found in PDF. It may be scanned or image-based.');
            return trimmed;
        }

        if (name.endsWith('.docx')) {
            const mammoth = await import('mammoth');
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            const trimmed = result.value.trim();
            if (!trimmed) throw new Error('No text found in DOCX file.');
            return trimmed;
        }

        if (name.endsWith('.doc')) {
            try {
                const mammoth = await import('mammoth');
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                const trimmed = result.value.trim();
                if (!trimmed) throw new Error('No text found in DOC file.');
                return trimmed;
            } catch {
                throw new Error('Old .doc format could not be parsed. Please save as .docx or .pdf and try again.');
            }
        }

        throw new Error('Unsupported format. Please upload a PDF, DOC, or DOCX file.');
    };

    // ── File upload handler ──────────────────────────────────────────
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setParseState('parsing');
        setParseError('');
        setResumeFileName(file.name);
        setResumeText('');

        try {
            const text = await extractText(file);
            setResumeText(text);
            setParseState('done');
        } catch (err: unknown) {
            setParseError(err instanceof Error ? err.message : 'Failed to parse file');
            setParseState('error');
            setResumeFileName('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const clearResume = () => {
        setResumeText('');
        setResumeFileName('');
        setParseState('idle');
        setParseError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Submit ───────────────────────────────────────────────────────
    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!config.role || !config.techStack || !resumeText) return;
        onStart({ ...config, resumeText });
    };

    const canSubmit = !!config.role && !!config.techStack && !!resumeText && parseState !== 'parsing';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-sans">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gray-1000/10 blur-[120px] dark:bg-black dark:text-white/5" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gray-1000/10 blur-[120px] dark:bg-neutral-900/5" />
            </div>

            {/* Nav */}
            <nav className="relative z-10 border-b border-gray-100 dark:border-neutral-900 bg-white/80 dark:bg-black/80 backdrop-blur-xl/80 backdrop-blur-xl">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors text-sm font-semibold">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-2 text-neutral-400">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Mock Interview</span>
                    </div>
                </div>
            </nav>

            <div className="relative max-w-3xl mx-auto px-4 py-10 space-y-6">

                {/* Mode Selection */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Choose Interview Mode</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {MODES.map((mode) => {
                            const Icon  = mode.icon;
                            const selected = config.type === mode.type;
                            return (
                                <button
                                    key={mode.type}
                                    type="button"
                                    onClick={() => setConfig({ ...config, type: mode.type })}
                                    className={`relative text-left p-6 rounded-2xl border-2 transition-all ${
                                        selected
                                            ? 'border-gray-1000 bg-gray-100 dark:bg-zinc-900/20'
                                            : 'border-gray-100 dark:border-neutral-900 bg-white dark:bg-black/80 backdrop-blur-xl hover:border-gray-300 dark:hover:border-zinc-900/50'
                                    }`}
                                >
                                    {selected && <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-gray-1000" />}
                                    <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${
                                        selected ? 'bg-gray-1000 text-white' : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400'
                                    }`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className={`font-bold text-sm mb-1 ${selected ? 'text-zinc-900 dark:text-gray-400' : 'text-black dark:text-white'}`}>
                                        {mode.title}
                                    </h3>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{mode.desc}</p>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Config Form */}
                <motion.form
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-black/80 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-neutral-900 shadow-sm p-6 md:p-8 space-y-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Target Position */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Briefcase className="h-3 w-3 text-gray-1000" /> Target Position
                            </label>
                            <input
                                type="text"
                                value={config.role}
                                onChange={(e) => setConfig({ ...config, role: e.target.value })}
                                placeholder="e.g. Software Engineer"
                                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl px-4 py-3 text-black dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-gray-1000 outline-none transition-all text-sm"
                                required
                            />
                        </div>

                        {/* Tech Stack */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Code2 className="h-3 w-3 text-black" /> Tech Stack
                            </label>
                            <input
                                type="text"
                                value={config.techStack}
                                onChange={(e) => setConfig({ ...config, techStack: e.target.value })}
                                placeholder="React, Node.js, AWS..."
                                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl px-4 py-3 text-black dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-black outline-none transition-all text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Brain className="h-3 w-3 text-gray-1000" /> Experience Level
                        </label>
                        <div className="flex gap-2">
                            {['Junior', 'Mid-Level', 'Senior'].map(level => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setConfig({ ...config, experience: level })}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                        config.experience === level
                                            ? 'bg-black dark:text-white text-white border-black dark:text-white shadow-sm'
                                            : 'bg-gray-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border-gray-100 dark:border-neutral-800 hover:border-gray-300'
                                    }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration — conversational only */}
                    {config.type === 'conversational' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock className="h-3 w-3 text-black" /> Session Duration
                            </label>
                            <div className="flex gap-2">
                                {[5, 10, 15, 20, 30].map(mins => (
                                    <button
                                        key={mins}
                                        type="button"
                                        onClick={() => setConfig({ ...config, duration: mins })}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                            config.duration === mins
                                                ? 'bg-black dark:bg-white text-white border-emerald-600 shadow-sm'
                                                : 'bg-gray-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border-gray-100 dark:border-neutral-800 hover:border-emerald-200'
                                        }`}
                                    >
                                        {mins}m
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resume Upload — REQUIRED */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                            <FileText className="h-3 w-3 text-black" />
                            Resume
                            <span className="text-black font-black">*</span>
                            <span className="normal-case font-normal text-neutral-400 tracking-normal">— PDF, DOC, or DOCX</span>
                        </label>

                        {/* Uploaded + parsed */}
                        {parseState === 'done' && resumeFileName && (
                            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-black dark:text-white dark:text-gray-500 flex-shrink-0" />
                                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{resumeFileName}</span>
                                    <span className="text-xs text-black">· {Math.ceil(resumeText.length / 500)} pages extracted</span>
                                </div>
                                <button type="button" onClick={clearResume} className="text-gray-500 hover:text-black transition-colors ml-3">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {/* Parsing in progress */}
                        {parseState === 'parsing' && (
                            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3">
                                <Loader2 className="h-4 w-4 text-black dark:text-white animate-spin flex-shrink-0" />
                                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                    Extracting text from {resumeFileName}…
                                </span>
                            </div>
                        )}

                        {/* Error */}
                        {parseState === 'error' && (
                            <div className="flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-3">
                                <AlertCircle className="h-4 w-4 text-black flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{parseError}</p>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-black underline mt-1">
                                        Try another file
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Upload drop zone — shown when no file */}
                        {parseState === 'idle' && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-neutral-900 border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-8 text-neutral-500 dark:text-neutral-400 hover:border-gray-500 dark:hover:border-amber-600 hover:text-black dark:text-white dark:hover:text-gray-500 transition-all group"
                            >
                                <Upload className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold">Click to upload your resume</span>
                                <span className="text-xs text-neutral-400">PDF, DOC, DOCX · Max 10 MB</span>
                            </button>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="w-full flex items-center justify-center gap-3 bg-black/80 backdrop-blur-xl dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {config.type === 'conversational' ? <Mic className="h-5 w-5" /> : <ListChecks className="h-5 w-5" />}
                        {config.type === 'conversational' ? 'Start Voice Interview' : 'Generate Questions'}
                        <ArrowRight className="h-4 w-4" />
                    </button>

                    {!resumeText && (
                        <p className="text-center text-xs text-neutral-400">
                            Upload your resume to continue — it's used to tailor every question to your actual experience.
                        </p>
                    )}
                </motion.form>
            </div>
        </div>
    );
}
