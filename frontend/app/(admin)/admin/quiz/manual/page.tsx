"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  FileEdit, 
  ArrowLeft, 
  Plus, 
  Database, 
  Link2, 
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

type Quiz = { quiz_id: number; title: string; description?: string };
type Question = { question_id: number; question: string; choices?: string[]; difficulty?: string };

export default function ManualCreatePage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);

    // manual form states
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [qText, setQText] = useState("");
    const [qChoices, setQChoices] = useState<string>("");
    const [qCorrect, setQCorrect] = useState("");
    const [qDifficulty, setQDifficulty] = useState("easy");
    const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

    useEffect(() => {
        loadQuizzes();
        loadQuestions();
    }, []);

    async function loadQuizzes() {
        const { data } = await supabase
            .from("quizzes")
            .select("*")
            .order("created_at", { ascending: false });

        setQuizzes((data || []) as Quiz[]);
    }

    async function loadQuestions() {
        const { data } = await supabase
            .from("questions")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(200);

        setQuestions((data || []) as Question[]);
    }

    async function handleCreateQuiz(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);
        try {
            const res = await fetch("/api/quiz/admin/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(JSON.stringify(json));

            setTitle("");
            setDescription("");
            loadQuizzes();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddQuestion(e: React.FormEvent) {
        e.preventDefault();
        if (!qText.trim()) return;
        setLoading(true);
        try {
            const payload = {
                question: qText,
                choices: qChoices ? qChoices.split(",").map((s) => s.trim()) : [],
                correct_answer: qCorrect || null,
                difficulty: qDifficulty,
            };

            const res = await fetch("/api/quiz/admin/add-question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(JSON.stringify(json));

            setQText("");
            setQChoices("");
            setQCorrect("");
            loadQuestions();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAttach() {
        if (!selectedQuiz || !selectedQuestion) return;

        setLoading(true);
        try {
            const res = await fetch("/api/quiz/admin/attach-question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quizId: selectedQuiz, questionId: selectedQuestion }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(JSON.stringify(json));

            alert("Question successfully attached to quiz");
        } catch (err) {
            console.error(err);
            alert("Failed to attach");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                
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
                            Manual Craftsmanship
                            <FileEdit className="h-6 w-6 text-indigo-400" />
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Build custom assessments step-by-step</p>
                    </div>
                </div>

                <div className="grid gap-8">
                    
                    {/* 1. Create Quiz Shell */}
                    <section className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Plus className="h-24 w-24" />
                        </div>
                        
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">1</div>
                            <h2 className="text-xl font-bold text-white">Initialize Quiz Shell</h2>
                        </div>

                        <form onSubmit={handleCreateQuiz} className="grid gap-6">
                            <div className="grid gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Assessment Title</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Advanced React Patterns"
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Global Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Briefly explain the purpose and scope of this assessment..."
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none h-24 resize-none transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !title}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all active:scale-95"
                            >
                                {loading ? "Creating..." : "Create Shell"}
                            </button>
                        </form>
                    </section>

                    {/* 2. Add Questions */}
                    <section className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Database className="h-24 w-24" />
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-sky-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-sky-500/20">2</div>
                            <h2 className="text-xl font-bold text-white">Populate Question Pool</h2>
                        </div>

                        <form onSubmit={handleAddQuestion} className="grid gap-6">
                            <div className="grid gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Question Content</label>
                                <textarea
                                    value={qText}
                                    onChange={(e) => setQText(e.target.value)}
                                    placeholder="What is the result of...?"
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-700 focus:ring-1 focus:ring-sky-500 outline-none h-24 resize-none transition-all"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Options (Comma separated)</label>
                                <input
                                    value={qChoices}
                                    onChange={(e) => setQChoices(e.target.value)}
                                    placeholder="Choice A, Choice B, Choice C..."
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-700 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Correct Answer</label>
                                    <input
                                        value={qCorrect}
                                        onChange={(e) => setQCorrect(e.target.value)}
                                        placeholder="Must match one of the choices"
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-700 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Complexity Level</label>
                                    <select
                                        value={qDifficulty}
                                        onChange={(e) => setQDifficulty(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:ring-1 focus:ring-sky-500 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !qText}
                                className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-bold shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all active:scale-95"
                            >
                                {loading ? "Storing..." : "Add to Repository"}
                            </button>
                        </form>
                    </section>

                    {/* 3. Attach Question */}
                    <section className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Link2 className="h-24 w-24" />
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/20">3</div>
                            <h2 className="text-xl font-bold text-white">Map Questions to Quizzes</h2>
                        </div>

                        <div className="grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Assessment</label>
                                    <select
                                        value={selectedQuiz ?? ""}
                                        onChange={(e) => setSelectedQuiz(Number(e.target.value) || null)}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:ring-1 focus:ring-amber-500 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Select a quiz shell</option>
                                        {quizzes.map((q) => (
                                            <option key={q.quiz_id} value={q.quiz_id}>{q.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Source Question</label>
                                    <select
                                        value={selectedQuestion ?? ""}
                                        onChange={(e) => setSelectedQuestion(Number(e.target.value) || null)}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:ring-1 focus:ring-amber-500 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Select from repository</option>
                                        {questions.map((q) => (
                                            <option key={q.question_id} value={q.question_id}>
                                                {q.question.length > 50 ? q.question.slice(0, 50) + "..." : q.question}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleAttach}
                                disabled={loading || !selectedQuiz || !selectedQuestion}
                                className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all active:scale-95"
                            >
                                {loading ? "Mapping..." : "Bind Question to Quiz"}
                            </button>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
