'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaArrowRight, FaPlus } from 'react-icons/fa';

interface Drive {
    id: number;
    company_name: string;
    role: string;
    salary: string;
    location: string;
    deadline: string;
    created_at: string;
}

export default function DrivesPage() {
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

            if (error) {
                console.error('Supabase error fetching drives:', error);
                throw error;
            }

            if (data) {
                setDrives(data);
            }
        } catch (error: any) {
            console.error('Error fetching drives:', error.message || error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Placement Drives</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Explore and apply for the latest job opportunities.</p>
                    </div>

                    {user?.role === 'admin' && (
                        <Link
                            href="/admin/drives/create"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
                        >
                            <FaPlus className="mr-2" /> Post New Drive
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
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
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No active drives</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Check back later for new opportunities.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {drives.map((drive) => (
                            <div
                                key={drive.id}
                                className="group bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700 transition-all duration-200 flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                                        {drive.company_name.charAt(0)}
                                    </div>
                                    <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20 rounded-full">
                                        Active
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {drive.role}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">{drive.company_name}</p>

                                <div className="space-y-2 mb-6 flex-grow">
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <FaMoneyBillWave className="mr-2 w-4 h-4" />
                                        {drive.salary || 'Not disclosed'}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <FaMapMarkerAlt className="mr-2 w-4 h-4" />
                                        {drive.location || 'Remote'}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <FaCalendarAlt className="mr-2 w-4 h-4" />
                                        Apply by {new Date(drive.deadline).toLocaleDateString()}
                                    </div>
                                </div>

                                <Link
                                    href={`/drives/${drive.id}`}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                    View Details <FaArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
