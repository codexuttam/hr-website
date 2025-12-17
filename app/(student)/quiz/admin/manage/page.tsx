"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    FaList,
    FaTrophy,
    FaHistory,
    FaShareAlt,
    FaTrash,
} from "react-icons/fa";
import QuizAdminHeader from "@/components/QuizAdminHeader";

type Quiz = { quiz_id: number; title: string; description?: string };

export default function ManageQuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadQuizzes();
    }, []);

    async function loadQuizzes() {
        const { data } = await supabase
            .from("quizzes")
            .select("*")
            .order("created_at", { ascending: false });

        setQuizzes((data || []) as Quiz[]);
    }

    async function handleDeleteQuiz(quizId: number) {
        if (!confirm("Delete quiz and all mappings?")) return;

        setLoading(true);
        try {
            const res = await fetch("/api/quiz/admin/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quizId }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(JSON.stringify(json));

            alert("Deleted");
            loadQuizzes();
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                <QuizAdminHeader />

                {/* Page Title */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-500/20 rounded-lg">
                        <FaList className="text-3xl text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Manage Quizzes & Analytics</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN - QUIZZES LIST */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col h-[800px]">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <FaList className="text-indigo-400" /> All Quizzes
                            </h2>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {quizzes.length === 0 && (
                                    <div className="text-center text-slate-500 py-10">No quizzes found. Create one!</div>
                                )}
                                {quizzes.map((q) => (
                                    <QuizItem
                                        key={q.quiz_id}
                                        quiz={q}
                                        onDelete={handleDeleteQuiz}
                                        onRefresh={loadQuizzes}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - ANALYTICS */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* View Attempts */}
                        <AttemptsPanel />

                        {/* Leaderboard */}
                        <LeaderboardPanel />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ============================================================
   SUB-COMPONENTS
============================================================ */

function AttemptsPanel() {
    const [quizId, setQuizId] = useState<string>("");
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function loadAttempts() {
        if (!quizId) return alert("Enter quizId");
        setLoading(true);
        try {
            const res = await fetch(`/api/quiz/admin/attempts?quizId=${quizId}`);
            const json = await res.json();
            if (!res.ok) throw new Error(JSON.stringify(json));
            setAttempts(json);
        } catch (err) {
            console.error(err);
            alert("Failed to load attempts");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaHistory className="text-sky-400" /> View Attempts
            </h2>
            <div className="flex gap-2 mb-4">
                <input
                    value={quizId}
                    onChange={(e) => setQuizId(e.target.value)}
                    placeholder="Enter quiz_id"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-sky-500 outline-none"
                />
                <button
                    onClick={loadAttempts}
                    disabled={loading}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    {loading ? "..." : "Load"}
                </button>
            </div>

            <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {attempts.length === 0 && (
                    <div className="text-center text-slate-600 text-sm py-4">No attempts to display.</div>
                )}
                {attempts.map((a) => (
                    <div key={a.attempt_id} className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-sm">
                        <div className="flex justify-between mb-1">
                            <span className="text-slate-300 font-medium">User: {a.user_id}</span>
                            <span className="text-sky-400 font-bold">{a.score}/{a.max_score}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>{a.duration_sec}s</span>
                            <span>{new Date(a.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LeaderboardPanel() {
    const [quizId, setQuizId] = useState<string>("");
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function loadLeaderboard() {
        if (!quizId) return alert("Enter quizId");
        setLoading(true);
        try {
            const res = await fetch(`/api/quiz/${quizId}/leaderboard`);
            const json = await res.json();
            if (!res.ok) throw new Error(JSON.stringify(json));
            setRows(json);
        } catch (err) {
            console.error(err);
            alert("Failed to load leaderboard");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaTrophy className="text-yellow-400" /> Leaderboard
            </h2>
            <div className="flex gap-2 mb-4">
                <input
                    value={quizId}
                    onChange={(e) => setQuizId(e.target.value)}
                    placeholder="Enter quiz_id"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-yellow-500 outline-none"
                />
                <button
                    onClick={loadLeaderboard}
                    disabled={loading}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    {loading ? "..." : "Load"}
                </button>
            </div>

            <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {rows.length === 0 && (
                    <div className="text-center text-slate-600 text-sm py-4">No leaderboard data available.</div>
                )}
                {rows.map((r, i) => (
                    <div key={i} className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-sm flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-500/20 text-yellow-500" :
                                i === 1 ? "bg-slate-400/20 text-slate-400" :
                                    i === 2 ? "bg-amber-700/20 text-amber-700" : "bg-slate-800 text-slate-500"
                                }`}>
                                {i + 1}
                            </span>
                            <span className="text-slate-300 font-medium">User: {r.user_id}</span>
                        </div>
                        <span className="text-yellow-500 font-bold">{r.score} pts</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function QuizItem({ quiz, onDelete, onRefresh }: { quiz: Quiz; onDelete: (quizId: number) => void; onRefresh: () => void }) {
    const [showShareModal, setShowShareModal] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    async function loadStudents() {
        try {
            const { data, error } = await supabase
                .from("users")
                .select("user_id, name, email")
                .eq("role", "student")
                .order("name");

            if (error) throw error;
            setStudents(data || []);
        } catch (err) {
            console.error(err);
            alert("Failed to load students");
        }
    }

    function toggleStudent(id: number) {
        setSelectedStudents((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }

    async function handleShare() {
        if (selectedStudents.length === 0) return alert("Select students");
        setLoading(true);
        try {
            const assignments = selectedStudents.map((userId) => ({
                quiz_id: quiz.quiz_id,
                user_id: userId,
                assigned_at: new Date().toISOString(),
                status: "assigned",
            }));

            const { error } = await supabase
                .from("quiz_assignments")
                .upsert(assignments, { onConflict: "quiz_id,user_id" });

            if (error) throw error;
            alert(`Shared with ${selectedStudents.length} students`);
            setShowShareModal(false);
        } catch (err) {
            console.error(err);
            alert("Failed to share quiz");
        } finally {
            setLoading(false);
        }
    }

    const filteredStudents = students.filter(
        (s) =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors group">
                <div className="mb-2">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-white text-sm line-clamp-1">{quiz.title}</h3>
                        <span className="text-[10px] text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded">ID: {quiz.quiz_id}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{quiz.description || "No description"}</p>
                </div>

                <div className="flex gap-2 mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => {
                            setShowShareModal(true);
                            loadStudents();
                        }}
                        className="flex-1 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs rounded transition-colors flex items-center justify-center gap-1"
                    >
                        <FaShareAlt /> Share
                    </button>
                    <button
                        onClick={() => onDelete(quiz.quiz_id)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded transition-colors"
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-white">Assign Quiz</h3>
                            <button onClick={() => setShowShareModal(false)} className="text-slate-500 hover:text-white">✕</button>
                        </div>

                        <div className="p-4">
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white mb-4 focus:border-indigo-500 outline-none"
                            />

                            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                                {filteredStudents.map((student) => (
                                    <div
                                        key={student.user_id}
                                        onClick={() => toggleStudent(student.user_id)}
                                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-sm ${selectedStudents.includes(student.user_id)
                                            ? "bg-indigo-500/20 border border-indigo-500/50"
                                            : "hover:bg-slate-800 border border-transparent"
                                            }`}
                                    >
                                        <div>
                                            <div className="text-white font-medium">{student.name}</div>
                                            <div className="text-xs text-slate-500">{student.email}</div>
                                        </div>
                                        {selectedStudents.includes(student.user_id) && (
                                            <span className="text-indigo-400">✓</span>
                                        )}
                                    </div>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <div className="text-center text-slate-500 py-4 text-sm">No students found</div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleShare}
                                disabled={loading || selectedStudents.length === 0}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Assigning..." : `Assign to ${selectedStudents.length} Students`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
