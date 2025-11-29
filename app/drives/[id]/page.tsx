'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

interface Drive {
    id: number;
    company_name: string;
    role: string;
    description: string;
    requirements: string;
    salary: string;
    location: string;
    deadline: string;
    application_link?: string;
}

export default function DriveDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [drive, setDrive] = useState<Drive | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        if (id) {
            fetchDriveDetails();
            if (user) {
                checkApplicationStatus();
            }
        }
    }, [id, user]);

    const fetchDriveDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('placement_drives')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setDrive(data);
        } catch (error) {
            console.error('Error fetching drive details:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkApplicationStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('drive_applications')
                .select('*')
                .eq('drive_id', id)
                .eq('user_id', user?.user_id)
                .single();

            if (data) {
                setHasApplied(true);
            }
        } catch (error) {
            // No application found is fine
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <Link
                    href="/drives"
                    className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
                >
                    <FaArrowLeft className="mr-2" /> Back to Drives
                </Link>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : !drive ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Drive Not Found</h1>
                        <Link href="/drives" className="text-blue-600 hover:text-blue-700">
                            &larr; Back to Drives
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                                <div className="p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-2xl">
                                            {drive.company_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{drive.role}</h1>
                                            <p className="text-lg text-gray-600 dark:text-gray-400">{drive.company_name}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                                                <FaMoneyBillWave /> Salary
                                            </div>
                                            <div className="font-semibold text-gray-900 dark:text-white">{drive.salary || 'Not disclosed'}</div>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                                                <FaMapMarkerAlt /> Location
                                            </div>
                                            <div className="font-semibold text-gray-900 dark:text-white">{drive.location || 'Remote'}</div>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                                                <FaCalendarAlt /> Deadline
                                            </div>
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                {new Date(drive.deadline).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="prose dark:prose-invert max-w-none">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Job Description</h3>
                                        <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-6">
                                            {drive.description}
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Requirements</h3>
                                        <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                            {drive.requirements}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar / Application Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 sticky top-24">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Apply Now</h3>

                                {!isAuthenticated ? (
                                    <div className="text-center py-6">
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">Please login to apply for this drive.</p>
                                        <Link
                                            href={`/login?redirect=/drives/${id}`}
                                            className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center"
                                        >
                                            Login to Apply
                                        </Link>
                                    </div>
                                ) : hasApplied ? (
                                    <div className="text-center py-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                                        <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-3" />
                                        <h4 className="text-lg font-semibold text-green-800 dark:text-green-300">Applied Successfully</h4>
                                        <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                                            You have already registered for this drive.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!user) {
                                            router.push('/login');
                                            return;
                                        }

                                        setApplying(true);
                                        try {
                                            const { error } = await supabase
                                                .from('drive_applications')
                                                .insert([
                                                    {
                                                        drive_id: id,
                                                        user_id: user.user_id,
                                                        resume_link: '', // Will be uploaded later
                                                        cover_letter: '',
                                                        status: drive.application_link ? 'applied_externally' : 'pending'
                                                    }
                                                ]);

                                            if (error) throw error;

                                            setHasApplied(true);

                                            if (drive.application_link) {
                                                alert('Registration successful! Redirecting to company portal...');
                                                window.open(drive.application_link, '_blank');
                                            } else {
                                                alert('Registered successfully! You can upload your resume later from your dashboard.');
                                            }
                                        } catch (error: any) {
                                            console.error('Error registering:', error);
                                            alert('Failed to register: ' + error.message);
                                        } finally {
                                            setApplying(false);
                                        }
                                    }} className="space-y-4">
                                        {drive.application_link && (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 text-sm text-blue-800 dark:text-blue-200">
                                                <p className="font-medium mb-1">External Application Required</p>
                                                <p>Register here to track your application, then you will be redirected to the company's portal.</p>
                                            </div>
                                        )}

                                        <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                                            <p>Click below to register for this drive. You can upload your resume and add more details later.</p>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={applying}
                                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {applying ? 'Registering...' : 'Register for Drive'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
