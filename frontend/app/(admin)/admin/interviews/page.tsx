'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { Search, Calendar, Star, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminInterviewsPage() {
    const { user } = useAuth();
    const [interviews, setInterviews] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            const res = await fetch('/api/admin/interviews');
            if (res.ok) {
                const data = await res.json();
                setInterviews(data);
            }
        } catch (error) {
            console.error('Failed to fetch interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInterviews = interviews.filter(int => 
        int.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        int.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <RoleProtectedRoute allowedRoles={['admin', 'recruiter']}>
            <div className="p-8 max-w-7xl mx-auto min-h-screen">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-black dark:text-white mb-2 tracking-tight">Interview Results</h1>
                        <p className="text-neutral-500 font-medium">Review candidate interview evaluations and performance.</p>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Filter by candidate name or role..."
                            className="block w-full md:w-80 pl-10 pr-3 py-2.5 border border-gray-200 dark:border-neutral-800 rounded-xl leading-5 bg-white dark:bg-black/80 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl h-48 border border-gray-100 dark:border-neutral-800" />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-black/50 backdrop-blur-xl border border-gray-200 dark:border-neutral-900 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-neutral-500 uppercase bg-gray-50/50 dark:bg-neutral-900/50 border-b border-gray-100 dark:border-neutral-900">
                                    <tr>
                                        <th className="px-6 py-4 font-bold tracking-wider">Candidate</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Role & Exp.</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Score</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-neutral-900">
                                    {filteredInterviews.length > 0 ? filteredInterviews.map((interview) => (
                                        <tr key={interview.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-black dark:text-white">{interview.users?.name || 'Unknown'}</div>
                                                <div className="text-xs text-neutral-500">{interview.users?.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-black dark:text-white">{interview.role || 'General'}</div>
                                                <div className="text-xs text-neutral-500">{interview.experience || 'Any'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Star className={`h-4 w-4 ${interview.rating >= 4 ? 'text-green-500 fill-green-500' : interview.rating >= 2.5 ? 'text-yellow-500 fill-yellow-500' : 'text-rose-500 fill-rose-500'}`} />
                                                    <span className="font-bold">{interview.rating != null ? interview.rating.toFixed(1) : 'N/A'}/5.0</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(interview.scheduled_date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link 
                                                    href={`/interview/results/${interview.id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-black dark:text-white transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Eval
                                                </Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                                                No interviews found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </RoleProtectedRoute>
    );
}
