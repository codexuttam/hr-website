"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FaPen } from "react-icons/fa";
import QuizAdminHeader from "@/components/QuizAdminHeader";

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
        setLoading(true);
        try {
            const res = await fetch("/api/quiz/admin/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(JSON.stringify(json));

            alert("Quiz created");
            setTitle("");
            setDescription("");
            loadQuizzes();
        } catch (err) {
            console.error(err);
            alert("Failed to create quiz");
        } finally {
            setLoading(false);
        }
    }

    async function handleAddQuestion(e: React.FormEvent) {
        e.preventDefault();
        if (!qText.trim()) return alert("Enter question text");
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

            alert("Question added");
            setQText("");
            setQChoices("");
            setQCorrect("");
            loadQuestions();
        } catch (err) {
            console.error(err);
            alert("Failed to add question");
        } finally {
            setLoading(false);
        }
    }

    async function handleAttach() {
        if (!selectedQuiz || !selectedQuestion) return alert("Select quiz and question");

        setLoading(true);
        try {
            const res = await fetch("/api/quiz/admin/attach-question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quizId: selectedQuiz, questionId: selectedQuestion }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(JSON.stringify(json));

            alert("Question attached to quiz");
        } catch (err) {
            console.error(err);
            alert("Failed to attach");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <QuizAdminHeader />

                {/* Page Title */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-500/20 rounded-lg">
                        <FaPen className="text-3xl text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Manual Quiz Creation</h1>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-lg space-y-10">

                    {/* 1. Create Quiz Shell */}
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold flex items-center gap-2 text-lg">
                            <span className="bg-indigo-500 w-8 h-8 rounded-full flex items-center justify-center text-sm text-white font-bold">1</span>
                            Create a Quiz Shell
                        </h3>
                        <div className="grid gap-4 pl-10">
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Quiz title"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-600 focus:border-indigo-500 outline-none transition-all"
                            />
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Description"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-600 focus:border-indigo-500 outline-none h-24 resize-none transition-all"
                            />
                            <button
                                onClick={handleCreateQuiz}
                                disabled={loading}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Create Quiz Shell
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-800"></div>

                    {/* 2. Add Questions */}
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold flex items-center gap-2 text-lg">
                            <span className="bg-indigo-500 w-8 h-8 rounded-full flex items-center justify-center text-sm text-white font-bold">2</span>
                            Add Questions to Database
                        </h3>
                        <div className="grid gap-4 pl-10">
                            <textarea
                                value={qText}
                                onChange={(e) => setQText(e.target.value)}
                                placeholder="Question text"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-600 focus:border-indigo-500 outline-none h-24 resize-none transition-all"
                            />
                            <input
                                value={qChoices}
                                onChange={(e) => setQChoices(e.target.value)}
                                placeholder="Choices (comma separated)"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-600 focus:border-indigo-500 outline-none transition-all"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    value={qCorrect}
                                    onChange={(e) => setQCorrect(e.target.value)}
                                    placeholder="Correct answer"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-600 focus:border-indigo-500 outline-none transition-all"
                                />
                                <select
                                    value={qDifficulty}
                                    onChange={(e) => setQDifficulty(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                            <button
                                onClick={handleAddQuestion}
                                disabled={loading}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Add Question to Database
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-800"></div>

                    {/* 3. Attach Question */}
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold flex items-center gap-2 text-lg">
                            <span className="bg-indigo-500 w-8 h-8 rounded-full flex items-center justify-center text-sm text-white font-bold">3</span>
                            Attach Question to Quiz
                        </h3>
                        <div className="grid gap-4 pl-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select
                                    value={selectedQuiz ?? ""}
                                    onChange={(e) => setSelectedQuiz(Number(e.target.value) || null)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="">Select quiz</option>
                                    {quizzes.map((q) => (
                                        <option key={q.quiz_id} value={q.quiz_id}>{q.title}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedQuestion ?? ""}
                                    onChange={(e) => setSelectedQuestion(Number(e.target.value) || null)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="">Select question</option>
                                    {questions.map((q) => (
                                        <option key={q.question_id} value={q.question_id}>{q.question.slice(0, 80)}...</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleAttach}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Attach Selected Question to Quiz
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
