import React from 'react';
import { getAuthenticatedUser } from '@/backend/auth/getAuthenticatedUser';
import { supabase } from '@/lib/supabase'; // Using client for querying linked data, or use server client from getAuthenticatedUser

export default async function ParentDashboard() {
    const { user, supabase: serverSupabase } = await getAuthenticatedUser();

    if (!user) return null;

    // Fetch linked students
    const { data: linkedStudents, error } = await serverSupabase
        .from('parent_student_links')
        .select(`
        student:profiles (
            id,
            full_name,
            email,
            avatar_url,
            credits
        )
    `)
        .eq('parent_id', user.id);

    const students = linkedStudents?.map((link: any) => link.student) || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Parent Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor your children's progress and activity</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Link New Student
                </button>
            </div>

            {students.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Students Linked</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Link your child's account to start viewing their progress.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map((student: any) => (
                        <div key={student.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xl">
                                        {student.full_name?.[0] || student.email?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{student.full_name || 'Student'}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Credits Available</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{student.credits || 0}</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <a href={`/research-and-development/parent/student/${student.id}`} className="block w-full text-center py-2 px-4 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium">
                                            View Full Report
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
