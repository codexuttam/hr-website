"use client";

import React, { useState } from "react";
import {
  Cpu,
  Sparkles,
  Loader2,
  ArrowLeft,
  Wand2,
  BrainCircuit,
  Building2,
  Terminal,
  Layers,
  Zap,
  Bot
} from "lucide-react";
import Link from "next/link";

// AI Generation types
type AIGenerationMode = "topic" | "company" | "custom";

export default function AiGeneratorPage() {
    // AI Generator states
    const [aiModeType, setAiModeType] = useState<AIGenerationMode>("topic");
    const [aiTopic, setAiTopic] = useState("");
    const [aiCompanyList, setAiCompanyList] = useState<string[]>([]);
    const [aiCustomPrompt, setAiCustomPrompt] = useState("");
    const [aiNumQuestions, setAiNumQuestions] = useState("5");
    const [aiDifficulty, setAiDifficulty] = useState("medium");
    const [aiProvider, setAiProvider] = useState<'auto' | 'openai' | 'gemini'>("auto");
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiQuizTitle, setAiQuizTitle] = useState("");

    async function handleAIGenerate() {
        if (aiModeType === "topic" && !aiTopic.trim()) {
            return;
        }

        if (aiModeType === "company" && aiCompanyList.length === 0) {
            return;
        }

        if (aiModeType === "custom" && !aiCustomPrompt.trim()) {
            return;
        }

        setAiGenerating(true);

        try {
            const res = await fetch("/api/quiz/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: aiModeType,
                    topic: aiTopic,
                    companies: aiCompanyList,
                    customPrompt: aiCustomPrompt,
                    numQuestions: parseInt(aiNumQuestions),
                    difficulty: aiDifficulty,
                    provider: aiProvider,
                    title: aiQuizTitle,
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "AI generation failed");

            setAiTopic("");
            setAiCompanyList([]);
            setAiCustomPrompt("");
            setAiQuizTitle("");
            alert("✨ Assessment synchronized successfully.");

        } catch (err: any) {
            console.error(err);
            alert(err.message);
        } finally {
            setAiGenerating(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <Link 
                        href="/admin/quiz" 
                        className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            Neural Generator
                            <Cpu className="h-6 w-6 text-teal-400" />
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Harness large language models for assessment creation</p>
                    </div>
                </div>

                {/* Main Panel */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                        <BrainCircuit className="h-48 w-48" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                        
                        {/* LEFT: Configuration */}
                        <div className="lg:col-span-7 space-y-8">
                            
                            {/* Mode Selection Tabs */}
                            <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-2xl w-fit">
                                {[
                                    { id: 'topic', label: 'Topic', icon: Zap },
                                    { id: 'company', label: 'Company', icon: Building2 },
                                    { id: 'custom', label: 'Custom', icon: Terminal },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setAiModeType(tab.id as AIGenerationMode)}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                            aiModeType === tab.id 
                                            ? "bg-teal-500 text-teal-950 shadow-lg shadow-teal-500/20" 
                                            : "text-slate-500 hover:text-slate-300"
                                        }`}
                                    >
                                        <tab.icon className="h-3.5 w-3.5" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-6">
                                {/* Title Input */}
                                <div className="grid gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Assessment Name (Optional)</label>
                                    <input
                                        value={aiQuizTitle}
                                        onChange={(e) => setAiQuizTitle(e.target.value)}
                                        placeholder="LLM will deduce a name if left blank"
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-700 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Dynamic Input */}
                                {aiModeType === "topic" && (
                                    <div className="grid gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Primary Subject Matter</label>
                                        <input
                                            value={aiTopic}
                                            onChange={(e) => setAiTopic(e.target.value)}
                                            placeholder="e.g., Fullstack Node.js with TypeScript"
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-700 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                        />
                                    </div>
                                )}

                                {aiModeType === "company" && (
                                    <div className="grid gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Corporate Entities</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {["Amazon", "Google", "Meta", "Microsoft", "Apple", "Netflix", "Adobe", "Oracle"].map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => {
                                                        setAiCompanyList(prev => 
                                                            prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
                                                        );
                                                    }}
                                                    className={`p-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                                                        aiCompanyList.includes(c)
                                                        ? "bg-teal-500/10 border-teal-500 text-teal-400"
                                                        : "bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700"
                                                    }`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {aiModeType === "custom" && (
                                    <div className="grid gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Prompt Engineering Instructions</label>
                                        <textarea
                                            value={aiCustomPrompt}
                                            onChange={(e) => setAiCustomPrompt(e.target.value)}
                                            placeholder="Specify constraints, focus areas, and tone..."
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-700 focus:ring-1 focus:ring-teal-500 outline-none h-32 resize-none transition-all"
                                        />
                                    </div>
                                )}

                                {/* Advanced Tuning */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="grid gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Volume</label>
                                        <select
                                            value={aiNumQuestions}
                                            onChange={(e) => setAiNumQuestions(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:ring-1 focus:ring-teal-500 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} Questions</option>)}
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Complexity</label>
                                        <select
                                            value={aiDifficulty}
                                            onChange={(e) => setAiDifficulty(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:ring-1 focus:ring-teal-500 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="easy">Elementary</option>
                                            <option value="medium">Intermediate</option>
                                            <option value="hard">Advanced</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Core Engine</label>
                                        <select
                                            value={aiProvider}
                                            onChange={(e) => setAiProvider(e.target.value as any)}
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:ring-1 focus:ring-teal-500 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="auto">Adaptive Choice</option>
                                            <option value="openai">GPT-4 Omni</option>
                                            <option value="gemini">Gemini 1.5 Pro</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Status & Execution */}
                        <div className="lg:col-span-5">
                            <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-8 h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                                        <Bot className="h-5 w-5 text-teal-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white leading-none">Inference Engine</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">Status: Standby</p>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Model Parameters</div>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Latency', val: 'Minimal' },
                                                { label: 'Context', val: 'High-Precision' },
                                                { label: 'Output', val: 'Structured JSON' },
                                            ].map((p, i) => (
                                                <div key={i} className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-500 font-medium">{p.label}</span>
                                                    <span className="text-teal-400 font-bold">{p.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-500 leading-relaxed italic">
                                        "The system will parse your requirements and construct a sequence of multiple-choice questions with validated solutions."
                                    </p>
                                </div>

                                <button
                                    onClick={handleAIGenerate}
                                    disabled={aiGenerating}
                                    className="w-full mt-8 py-5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-teal-500/20 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {aiGenerating ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" /> 
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-5 w-5" />
                                            Execute Generation
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
