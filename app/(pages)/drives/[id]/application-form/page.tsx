'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FaPaperPlane, FaArrowLeft, FaFileUpload } from 'react-icons/fa';
import Link from 'next/link';

export default function ApplicationFormPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [driveDescription, setDriveDescription] = useState<string>('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        experience: '',
    });
    const [files, setFiles] = useState<File[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        const fetchDriveDetails = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from('placement_drives')
                    .select('description')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (data) {
                    setDriveDescription(data.description);
                }
            } catch (error) {
                console.error('Error fetching drive details:', error);
            }
        };

        fetchDriveDetails();
    }, [id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('First Name', formData.firstName);
            data.append('Last Name', formData.lastName);
            data.append('Email', formData.email);
            data.append('Phone', formData.phone);
            data.append('Years of experience', formData.experience);
            if (driveDescription) {
                data.append('Job Description', driveDescription);
            }

            if (files.length > 0) {
                files.forEach(file => {
                    data.append('Upload your CV', file);
                });
            }

            const response = await fetch('/api/submit-application', {
                method: 'POST',
                body: data,
            });

            if (response.ok) {
                alert('Application details submitted successfully!');
                // Redirect to the drives list so the user can see other drives
                router.push('/drives');
            } else {
                throw new Error('Failed to submit application');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error submitting form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
                <Link
                    href={`/drives/${id}`}
                    className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
                >
                    <FaArrowLeft className="mr-2" /> Back to Drive Details
                </Link>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Application</h1>
                            <p className="text-gray-600 dark:text-gray-400">Please provide the required details to finalize your application.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        required
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        required
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    placeholder="john.doe@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        required
                                        placeholder="+1 234 567 8900"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Years of Experience <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="experience"
                                        name="experience"
                                        required
                                        min="0"
                                        step="0.1"
                                        placeholder="e.g. 2.5"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="cv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Upload your CV (.pdf only)
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer relative group">
                                    <div className="space-y-1 text-center">
                                        <FaFileUpload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                                            >
                                                <span>Upload a file</span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    multiple
                                                    className="sr-only"
                                                    accept=".pdf"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            {files.length > 0
                                                ? `${files.length} file(s) selected: ${files.map(f => f.name).join(', ')}`
                                                : 'PDF up to 10MB'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaPaperPlane />
                                        <span>Submit Application</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
