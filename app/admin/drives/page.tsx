'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaArrowRight, FaPlus, FaUsers } from 'react-icons/fa';

interface Drive {
    id: number;
    company_name: string;
    role: string;
    salary: string;
    location: string;
    deadline: string;
    created_at: string;
}

export default function AdminDrivesPage() {
    const { user } = useAuth();
    const [drives, setDrives] = useState<Drive[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrives();
    }, []);

    const fetchDrives = async () => {
        try {
            const { data, error } = await supabase
                .from('placement_drives')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDrives(data || []);
        } catch (error) {
            console.error('Error fetching drives:', error);
        } finally {
            setLoading(false);
        }
    };

    // if (user?.role !== 'admin') {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
    //             <div className="text-center">
    //                 <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
    //                 <p className="text-gray-600 dark:text-gray-400 mt-2">You do not have permission to view this page.</p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Placement Drives</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage job opportunities for students.</p>
                    </div>

                    <Link
                        href="/admin/drives/create"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
                    >
                        <FaPlus className="mr-2" /> Post New Drive
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 animate-pulse">
                                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
                                <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : drives.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaBuilding className="text-2xl text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No drives posted yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Start by posting your first placement drive.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {drives.map((drive) => (
                            <div
                                key={drive.id}
                                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700 transition-all duration-200"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl flex-shrink-0">
                                            {drive.company_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                                {drive.role}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">{drive.company_name}</p>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center">
                                                    <FaMoneyBillWave className="mr-2" /> {drive.salary || 'Not disclosed'}
                                                </span>
                                                <span className="flex items-center">
                                                    <FaMapMarkerAlt className="mr-2" /> {drive.location || 'Remote'}
                                                </span>
                                                <span className="flex items-center">
                                                    <FaCalendarAlt className="mr-2" /> Deadline: {new Date(drive.deadline).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/admin/drives/${drive.id}/applications`}
                                            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <FaUsers className="mr-2" /> View Applications
                                        </Link>
                                        <Link
                                            href={`/drives/${drive.id}`}
                                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors"
                                        >
                                            View Details <FaArrowRight className="ml-2" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
