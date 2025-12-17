import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { FaClipboardList, FaArrowRight, FaCheckCircle, FaClock } from 'react-icons/fa';

interface AssignedQuiz {
    assignment_id: number;
    quiz_id: number;
    status: 'assigned' | 'completed';
    assigned_at: string;
    completed_at?: string;
    score?: number;
    quiz: {
        title: string;
        description: string;
    };
}

const AssignedQuizzes: React.FC<{ userId: string | number }> = ({ userId }) => {
    const [assignments, setAssignments] = useState<AssignedQuiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchAssignments();
        }
    }, [userId]);

    const fetchAssignments = async () => {
        try {
            // Determine if we should query by integer ID or UUID
            const isNumeric = !isNaN(Number(userId)) && !String(userId).includes('-');
            const queryColumn = isNumeric ? 'user_id' : 'user_id_uuid';

            console.log(`fetching assignments for ${userId} using column ${queryColumn}`);

            const { data, error } = await supabase
                .from('quiz_assignments')
                .select(`
          assignment_id,
          quiz_id,
          status,
          assigned_at,
          completed_at,
          quiz:quizzes (
            title,
            description
          )
        `)
                .eq(queryColumn, userId)
                .order('assigned_at', { ascending: false });

            if (error) {
                // If the error is about the column not existing (migration not run yet)
                // and we tried querying UUID, we might want to log that safely.
                if (error.code === '42703' && queryColumn === 'user_id_uuid') {
                    console.warn('Migration pending: user_id_uuid column not found in quiz_assignments.');
                    setAssignments([]);
                    return;
                }

                console.error('Supabase Query Error:', JSON.stringify(error, null, 2));
                throw error;
            }

            // Transform data to match interface if quiz is returned as array
            const formattedData = (data || []).map((item: any) => ({
                ...item,
                quiz: Array.isArray(item.quiz) ? item.quiz[0] : item.quiz
            }));

            setAssignments(formattedData);
        } catch (error: any) {
            console.error('Error fetching assignments:', error.message || JSON.stringify(error));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse h-20 bg-gray-100 dark:bg-slate-800 rounded-lg"></div>;
    }

    if (assignments.length === 0) {
        return null; // Don't show anything if no assignments
    }

    return (
        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaClipboardList className="text-blue-500" />
                Assigned Quizzes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignments.map((assignment) => (
                    <div
                        key={assignment.assignment_id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50 dark:bg-slate-800"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {assignment.quiz.title}
                            </h3>
                            {assignment.status === 'completed' ? (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <FaCheckCircle /> Completed
                                </span>
                            ) : (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <FaClock /> Pending
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {assignment.quiz.description || 'No description available.'}
                        </p>

                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                            </span>

                            {assignment.status === 'assigned' ? (
                                <Link
                                    href={`/quiz/${assignment.quiz_id}`}
                                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
                                >
                                    Start Quiz <FaArrowRight size={12} />
                                </Link>
                            ) : (
                                <Link
                                    href={`/quiz/results/${assignment.quiz_id}`}
                                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                >
                                    View Results
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssignedQuizzes;
