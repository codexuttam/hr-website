'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FaArrowLeft, FaDownload, FaEnvelope, FaUser } from 'react-icons/fa';
import Link from 'next/link';
import * as XLSX from 'xlsx';

interface Application {
    id: number;
    created_at: string;
    status: string;
    users: {
        name: string;
        email: string;
        user_uid: string;
    };
    resume_link?: string;
}

interface Drive {
    id: number;
    company_name: string;
    role: string;
}

export default function DriveApplicationsPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const [drive, setDrive] = useState<Drive | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            // Fetch drive details
            const { data: driveData, error: driveError } = await supabase
                .from('placement_drives')
                .select('id, company_name, role')
                .eq('id', id)
                .single();

            if (driveError) throw driveError;
            setDrive(driveData);

            // Fetch applications with user details
            const { data: appsData, error: appsError } = await supabase
                .from('drive_applications')
                .select(`
                    id,
                    created_at,
                    status,
                    resume_link,
                    users (
                        name,
                        email,
                        user_uid
                    )
                `)
                .eq('drive_id', id)
                .order('created_at', { ascending: false });

            if (appsError) throw appsError;

            // Transform data safely
            const formattedApps = (appsData || []).map((app: any) => ({
                id: app.id,
                created_at: app.created_at,
                status: app.status,
                resume_link: app.resume_link,
                users: app.users // Supabase returns object for single relation
            }));

            setApplications(formattedApps);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (applications.length === 0) return;

        // Prepare data for export
        const exportData = applications.map(app => ({
            'Applicant Name': app.users?.name || 'Unknown',
            'Email': app.users?.email || 'Unknown',
            'Application Date': new Date(app.created_at).toLocaleDateString(),
            'Status': app.status,
            'Resume Link': app.resume_link || 'Not provided'
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Applicants");

        // Save file
        const fileName = `${drive?.company_name}-${drive?.role}-applicants.xlsx`.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        XLSX.writeFile(wb, fileName);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex-1">
                        <Link
                            href="/admin/drives"
                            className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
                        >
                            <FaArrowLeft className="mr-2" /> Back to Drives
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {drive?.company_name} - {drive?.role}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Total Registrations: <span className="font-bold">{applications.length}</span>
                        </p>
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={applications.length === 0}
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaDownload className="mr-2" /> Export to Excel
                    </button>
                </div>

                {/* Applications Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    {applications.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaUser className="text-2xl text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No applicants yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Wait for students to register for this drive.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Applicant
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Applied On
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {applications.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                            {app.users?.name?.charAt(0) || '?'}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {app.users?.name || 'Unknown User'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {app.users?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {new Date(app.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(app.created_at).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                            app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <a
                                                    href={`mailto:${app.users?.email}`}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                                                    title="Send Email"
                                                >
                                                    <FaEnvelope className="inline" />
                                                </a>
                                                {/* Add more actions if needed */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
