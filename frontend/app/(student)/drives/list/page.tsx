'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, MapPin, BadgeDollarSign, Calendar, ArrowRight, Plus, Search, Filter } from 'lucide-react';

interface Drive {
    id: number;
    company_name: string;
    role: string;
    salary: string;
    location: string;
    deadline: string;
    created_at: string;
}

export default function DrivesListPage() {
    const { user } = useAuth();
    const [drives, setDrives] = useState<Drive[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

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
            if (data) setDrives(data);
        } catch (error: any) {
            console.error('Error fetching drives:', error.message || error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDrives = drives.filter(d => 
        d.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Search & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Active Opportunities</h1>
                        <p className="text-slate-500 font-medium mt-1">Live recruitment drives and corporate openings.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search companies or roles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all w-full sm:w-64"
                            />
                        </div>

                        {user?.role === 'admin' && (
                            <Link
                                href="/admin/drives/create"
                                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
                            >
                                <Plus className="mr-2 h-4 w-4" /> New Drive
                            </Link>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 animate-pulse">
                                <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6"></div>
                                <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4 mb-4"></div>
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2 mb-8"></div>
                                <div className="space-y-3 mb-8">
                                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div>
                                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-2/3"></div>
                                </div>
                                <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredDrives.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-700">
                            <Building2 className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No drives found</h3>
                        <p className="text-slate-500 mt-2 max-w-xs mx-auto">Try adjusting your search criteria or check back later for new opportunities.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDrives.map((drive) => (
                            <div
                                key={drive.id}
                                className="group bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/20 transition-all duration-500 flex flex-col relative overflow-hidden"
                            >
                                {/* Decorative Gradient */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none" />

                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-2xl group-hover:scale-110 transition-transform duration-500">
                                        {drive.company_name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 rounded-full">
                                            Live
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                    {drive.role}
                                </h3>
                                <p className="text-slate-500 font-bold text-sm mb-8 uppercase tracking-tight">{drive.company_name}</p>

                                <div className="space-y-4 mb-10 flex-grow">
                                    <div className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                                        <BadgeDollarSign className="mr-3 w-4 h-4 text-indigo-500" />
                                        {drive.salary || 'Competitive'}
                                    </div>
                                    <div className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                                        <MapPin className="mr-3 w-4 h-4 text-indigo-500" />
                                        {drive.location || 'Pan India'}
                                    </div>
                                    <div className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                                        <Calendar className="mr-3 w-4 h-4 text-indigo-500" />
                                        Deadline: {new Date(drive.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    </div>
                                </div>

                                <Link
                                    href={`/drives/${drive.id}`}
                                    className="w-full inline-flex items-center justify-center px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black uppercase tracking-widest rounded-2xl group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 transition-all shadow-xl shadow-slate-900/10"
                                >
                                    Details <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
