"use client";

import React, { useState } from "react";
import {
    FaRobot,
    FaMagic,
    FaSpinner,
} from "react-icons/fa";
import QuizAdminHeader from "@/components/QuizAdminHeader";

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
            return alert("Enter a topic");
        }

        if (aiModeType === "company" && aiCompanyList.length === 0) {
            return alert("Select at least one company");
        }

        if (aiModeType === "custom" && !aiCustomPrompt.trim()) {
            return alert("Write a custom prompt");
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

            alert(`✨ Quiz Generated Successfully!`);

            setAiTopic("");
            setAiCompanyList([]);
            setAiCustomPrompt("");
            setAiQuizTitle("");

            // Optionally redirect to manage page to see the new quiz
            // window.location.href = "/quiz/admin/manage";

        } catch (err: any) {
            console.error(err);
            alert(err.message);
        } finally {
            setAiGenerating(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <QuizAdminHeader />

                {/* Page Title */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-500/20 rounded-lg">
                        <FaRobot className="text-3xl text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">AI Quiz Generator</h1>
                </div>

                {/* AI Generator Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="flex items-center gap-2 mb-2 relative z-10">
                        <FaMagic className="text-teal-400" />
                        <h2 className="text-xl font-bold text-white">Generate New Quiz</h2>
                    </div>
                    <p className="text-slate-400 text-sm mb-6 relative z-10">
                        Let AI do the heavy lifting. Generate a complete quiz in seconds.
                    </p>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-slate-800 pb-1 relative z-10">
                        <button
                            onClick={() => setAiModeType("topic")}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${aiModeType === "topic"
                                ? "text-teal-400 border-b-2 border-teal-400 bg-slate-800/50"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                                }`}
                        >
                            Topic Based
                        </button>
                        <button
                            onClick={() => setAiModeType("company")}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${aiModeType === "company"
                                ? "text-teal-400 border-b-2 border-teal-400 bg-slate-800/50"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                                }`}
                        >
                            Company Based
                        </button>
                        <button
                            onClick={() => setAiModeType("custom")}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${aiModeType === "custom"
                                ? "text-teal-400 border-b-2 border-teal-400 bg-slate-800/50"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                                }`}
                        >
                            Custom Prompt
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-5">
                            {/* Quiz Title Input (Optional) */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Quiz Title (Optional)</label>
                                <input
                                    value={aiQuizTitle}
                                    onChange={(e) => setAiQuizTitle(e.target.value)}
                                    placeholder="Auto-generated if empty"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                />
                            </div>

                            {/* Dynamic Input based on Mode */}
                            {aiModeType === "topic" && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Enter topic (e.g. Java, DSA, ML...)</label>
                                    <input
                                        value={aiTopic}
                                        onChange={(e) => setAiTopic(e.target.value)}
                                        placeholder="e.g. Advanced React Patterns"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                    />
                                </div>
                            )}

                            {aiModeType === "company" && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Select Companies</label>
                                    <select
                                        multiple
                                        value={aiCompanyList}
                                        onChange={(e) => setAiCompanyList(Array.from(e.target.selectedOptions, (o) => o.value))}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white h-32 focus:border-teal-500 outline-none"
                                    >
                                        {["Amazon", "Google", "Meta", "Microsoft", "Apple", "Netflix", "Adobe", "Oracle", "TCS", "Infosys"].map(c => (
                                            <option key={c} value={c} className="p-1 hover:bg-slate-800">{c}</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-slate-500 mt-1">Hold CTRL/CMD to select multiple.</p>
                                </div>
                            )}

                            {aiModeType === "custom" && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Custom Instructions</label>
                                    <textarea
                                        value={aiCustomPrompt}
                                        onChange={(e) => setAiCustomPrompt(e.target.value)}
                                        placeholder="Describe exactly what kind of quiz you want..."
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-600 h-32 focus:border-teal-500 outline-none resize-none"
                                    />
                                </div>
                            )}

                            {/* Settings Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Questions</label>
                                    <select
                                        value={aiNumQuestions}
                                        onChange={(e) => setAiNumQuestions(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-teal-500 outline-none"
                                    >
                                        {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Difficulty</label>
                                    <select
                                        value={aiDifficulty}
                                        onChange={(e) => setAiDifficulty(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-teal-500 outline-none"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">AI Provider</label>
                                <select
                                    value={aiProvider}
                                    onChange={(e) => setAiProvider(e.target.value as any)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-teal-500 outline-none"
                                >
                                    <option value="auto">🤖 Auto (Best Available)</option>
                                    <option value="openai">🟢 OpenAI (GPT-4)</option>
                                    <option value="gemini">🔵 Gemini (Pro)</option>
                                </select>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-slate-950/50 border border-dashed border-slate-700 rounded-lg p-6 flex flex-col justify-center h-full">
                            <div className="flex items-center gap-2 mb-4 text-teal-400">
                                <FaRobot className="text-xl" />
                                <span className="font-semibold">AI Generation Details</span>
                            </div>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-teal-500 mt-1">•</span> Quiz title & description
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-teal-500 mt-1">•</span> {aiNumQuestions} multiple-choice questions
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-teal-500 mt-1">•</span> Correct answers for each
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-teal-500 mt-1">•</span> Everything attached automatically
                                </li>
                            </ul>
                            <div className="mt-auto pt-6 border-t border-slate-800">
                                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Current Mode</div>
                                <div className="text-lg text-white font-medium mt-1">
                                    {aiModeType === "topic" && "Topic Based Generation"}
                                    {aiModeType === "company" && "Company Interview Prep"}
                                    {aiModeType === "custom" && "Custom Prompt Instructions"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleAIGenerate}
                        disabled={aiGenerating}
                        className="w-full mt-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold rounded-lg shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                    >
                        {aiGenerating ? (
                            <>
                                <FaSpinner className="animate-spin" /> Generating Quiz...
                            </>
                        ) : (
                            <>
                                <FaMagic /> Generate Quiz with AI
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
