import React from 'react';
import { getAuthenticatedUser } from '@/backend/auth/getAuthenticatedUser';
import { supabase } from '@/lib/supabase'; // Client for data fetching usually, but we prefer server fetching here
import { redirect, notFound } from 'next/navigation';
import { FaArrowLeft, FaChartLine, FaCheckCircle, FaClock } from 'react-icons/fa';
import Link from 'next/link';

// NOTE: We need to use server supabase client for secure fetching
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function StudentDetail({ params }: { params: { id: string } }) {
    const { id: studentId } = params;
    const { user, supabase: serverSupabase } = await getAuthenticatedUser();

    if (!user) return null;

    // 1. Verify Parent-Student Link (Security Check)
    const { data: link } = await serverSupabase
        .from('parent_student_links')
        .select('id')
        .eq('parent_id', user.id)
        .eq('student_id', studentId)
        .single();

    if (!link) {
        // Not authorized or link doesn't exist
        return (
            <div className="p-8 text-center text-red-600">
                Unauthorized access. You are not linked to this student.
            </div>
        );
    }

    // 2. Fetch Student Profile
    const { data: student } = await serverSupabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();

    if (!student) notFound();

    // 3. Fetch Student Activity Stats (Parallel Fetching)
    const [
        { count: resumeCount },
        { count: quizCount },
        { data: recentQuizzes }
    ] = await Promise.all([
        serverSupabase.from('resumes').select('*', { count: 'exact', head: true }).eq('user_id_uuid', studentId),
        serverSupabase.from('quiz_assignments').select('*', { count: 'exact', head: true }).eq('user_id_uuid', studentId),
        serverSupabase.from('quiz_assignments')
            .select(`
                *,
                quiz:quizzes(title)
            `)
            .eq('user_id_uuid', studentId)
            .order('assigned_at', { ascending: false })
            .limit(5)
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/research-and-development/parent/dashboard" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                    <FaArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {student.full_name}'s Report
                </h1>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Credits</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{student.credits}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Resumes Created</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{resumeCount || 0}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Quizzes Taken</h3>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{quizCount || 0}</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Quiz Activity</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {recentQuizzes?.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No recent activity found.</div>
                    ) : (
                        recentQuizzes?.map((quiz: any) => (
                            <div key={quiz.assignment_id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    {quiz.status === 'completed' ? (
                                        <FaCheckCircle className="text-green-500" />
                                    ) : (
                                        <FaClock className="text-yellow-500" />
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{quiz.quiz?.title || 'Unknown Quiz'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(quiz.assigned_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-sm">
                                    {quiz.status === 'completed' ? (
                                        <span className="font-semibold text-gray-900 dark:text-white">{quiz.score ?? '-'}%</span>
                                    ) : (
                                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs">Pending</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
