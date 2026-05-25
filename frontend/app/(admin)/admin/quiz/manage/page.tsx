"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  List,
  Trophy,
  History,
  Share2,
  Trash2,
  Search,
  X,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  LayoutDashboard,
  Filter,
  BarChart3,
  Users
} from "lucide-react";
import Link from "next/link";

type Quiz = { quiz_id: number; title: string; description?: string };

export default function ManageQuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

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
        if (!confirm("Are you sure you want to delete this quiz? This will remove all associated questions and student assignments.")) return;

        setLoading(true);
        try {
            const res = await fetch("/api/quiz/admin/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quizId }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(JSON.stringify(json));

            loadQuizzes();
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        } finally {
            setLoading(false);
        }
    }

    const filteredQuizzes = quizzes.filter(q => 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/admin/quiz" 
                            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Quiz Management</h1>
                            <p className="text-slate-500 text-sm font-medium">Control center for assessments and student analytics</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input 
                                type="text"
                                placeholder="Filter quizzes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN - QUIZZES LIST */}
                    <div className="lg:col-span-7">
                        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[750px]">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <List className="h-5 w-5 text-indigo-400" /> 
                                    Available Assessments
                                    <span className="ml-2 text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">
                                        {filteredQuizzes.length}
                                    </span>
                                </h2>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {filteredQuizzes.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                        <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mb-4">
                                            <Search className="h-8 w-8 text-slate-800" />
                                        </div>
                                        <p>No quizzes found matching your criteria</p>
                                    </div>
                                )}
                                {filteredQuizzes.map((q) => (
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
                        <AttemptsPanel />
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
        if (!quizId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/quiz/admin/attempts?quizId=${quizId}`);
            const json = await res.json();
            if (!res.ok) throw new Error(JSON.stringify(json));
            setAttempts(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-sky-400" /> Recent Attempts
            </h2>
            <div className="flex gap-2 mb-4">
                <input
                    value={quizId}
                    onChange={(e) => setQuizId(e.target.value)}
                    placeholder="Enter Quiz ID"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-sm focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                />
                <button
                    onClick={loadAttempts}
                    disabled={loading}
                    className="px-5 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-bold hover:bg-sky-400 transition-colors disabled:opacity-50"
                >
                    {loading ? "..." : "Fetch"}
                </button>
            </div>

            <div className="max-h-[220px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {attempts.length === 0 && (
                    <div className="text-center text-slate-600 text-sm py-8 border border-dashed border-slate-800 rounded-2xl">
                        Enter an ID to view user scores
                    </div>
                )}
                {attempts.map((a) => (
                    <div key={a.attempt_id} className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm group hover:border-slate-700 transition-all">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-300 font-bold flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                {a.user_id.slice(0, 8)}...
                            </span>
                            <span className="text-sky-400 font-black">{a.score}/{a.max_score}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>{a.duration_sec}s Duration</span>
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
        if (!quizId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/quiz/${quizId}/leaderboard`);
            const json = await res.json();
            if (!res.ok) throw new Error(JSON.stringify(json));
            setRows(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" /> Global Standings
            </h2>
            <div className="flex gap-2 mb-4">
                <input
                    value={quizId}
                    onChange={(e) => setQuizId(e.target.value)}
                    placeholder="Enter Quiz ID"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-sm focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
                <button
                    onClick={loadLeaderboard}
                    disabled={loading}
                    className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                    {loading ? "..." : "Load"}
                </button>
            </div>

            <div className="max-h-[220px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {rows.length === 0 && (
                    <div className="text-center text-slate-600 text-sm py-8 border border-dashed border-slate-800 rounded-2xl">
                        No ranking data for this ID yet
                    </div>
                )}
                {rows.map((r, i) => (
                    <div key={i} className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm flex justify-between items-center group hover:border-slate-700 transition-all">
                        <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${i === 0 ? "bg-amber-500 text-amber-950" :
                                i === 1 ? "bg-slate-400 text-slate-950" :
                                    i === 2 ? "bg-orange-700 text-orange-100" : "bg-slate-800 text-slate-500"
                                }`}>
                                {i + 1}
                            </span>
                            <span className="text-slate-300 font-bold">{r.user_id.slice(0, 8)}...</span>
                        </div>
                        <span className="text-amber-500 font-black">{r.score} pts</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function QuizItem({ quiz, onDelete, onRefresh }: { quiz: Quiz; onDelete: (quizId: number) => void; onRefresh: () => void }) {
    const [showShareModal, setShowShareModal] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    async function loadStudents() {
        try {
            const { data, error } = await supabase
                .from("users")
                .select("user_uid, name, email")
                .eq("role", "student")
                .order("name");

            if (error) throw error;
            setStudents(data || []);
        } catch (err) {
            console.error(err);
        }
    }

    function toggleStudent(uid: string) {
        setSelectedStudents((prev) =>
            prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid]
        );
    }

    async function handleShare() {
        if (selectedStudents.length === 0) return;
        setLoading(true);
        try {
            const assignments = selectedStudents.map((uid) => ({
                quiz_id: quiz.quiz_id,
                user_id: uid, // Use user_uid for consistency with schema
                assigned_at: new Date().toISOString(),
                status: "assigned",
            }));

            const { error } = await supabase
                .from("quiz_assignments")
                .upsert(assignments, { onConflict: "quiz_id,user_id" });

            if (error) throw error;
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
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="p-5 bg-slate-950/40 border border-slate-800 rounded-2xl hover:border-slate-600 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BarChart3 className="h-12 w-12" />
                </div>
                
                <div className="mb-4 relative">
                    <div className="flex justify-between items-start gap-4">
                        <h3 className="font-bold text-white text-lg leading-tight group-hover:text-indigo-400 transition-colors">{quiz.title}</h3>
                        <span className="flex-shrink-0 text-[10px] font-black bg-slate-900 border border-slate-800 text-slate-500 px-2 py-1 rounded-lg">ID: {quiz.quiz_id}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">{quiz.description || "No assessment description available."}</p>
                </div>

                <div className="flex gap-3 relative">
                    <button
                        onClick={() => {
                            setShowShareModal(true);
                            loadStudents();
                        }}
                        className="flex-1 py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-indigo-500/20"
                    >
                        <Share2 className="h-3.5 w-3.5" /> Assign to Students
                    </button>
                    <button
                        onClick={() => onDelete(quiz.quiz_id)}
                        className="w-10 h-10 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all flex items-center justify-center border border-red-500/20"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <div>
                                <h3 className="font-bold text-white text-xl">Assign Assessment</h3>
                                <p className="text-xs text-slate-500 mt-1">{quiz.title}</p>
                            </div>
                            <button 
                                onClick={() => setShowShareModal(false)} 
                                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>

                            <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                                {filteredStudents.map((student) => (
                                    <div
                                        key={student.user_uid}
                                        onClick={() => toggleStudent(student.user_uid)}
                                        className={`p-3 rounded-2xl cursor-pointer flex items-center justify-between text-sm transition-all border ${selectedStudents.includes(student.user_uid)
                                            ? "bg-indigo-500/10 border-indigo-500/50 shadow-inner shadow-indigo-500/5"
                                            : "bg-slate-950/50 border-slate-800 hover:border-slate-600"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${selectedStudents.includes(student.user_uid) ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                                {student.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div className="text-white font-bold">{student.name}</div>
                                                <div className="text-[10px] text-slate-500 font-medium">{student.email}</div>
                                            </div>
                                        </div>
                                        {selectedStudents.includes(student.user_uid) && (
                                            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg">
                                                <CheckCircle2 className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <div className="text-center py-12 border border-dashed border-slate-800 rounded-3xl">
                                        <Users className="h-8 w-8 text-slate-800 mx-auto mb-3" />
                                        <p className="text-sm text-slate-600">No active students found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex flex-col gap-3">
                            <button
                                onClick={handleShare}
                                disabled={loading || selectedStudents.length === 0}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                            >
                                {loading ? "Syncing..." : `Assign to ${selectedStudents.length} Students`}
                            </button>
                            <p className="text-[10px] text-center text-slate-500 font-medium">Students will receive a dashboard notification upon assignment.</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
