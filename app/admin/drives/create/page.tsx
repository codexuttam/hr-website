'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { FaBuilding, FaBriefcase, FaMoneyBillWave, FaMapMarkerAlt, FaCalendarAlt, FaLink } from 'react-icons/fa';

export default function CreateDrivePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '',
        role: '',
        description: '',
        requirements: '',
        salary: '',
        location: '',
        deadline: '',
        application_link: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('placement_drives')
                .insert([formData]);

            if (error) throw error;

            alert('Placement drive posted successfully!');
            router.push('/admin/drives');
        } catch (error: any) {
            console.error('Error posting drive:', error);
            alert('Failed to post drive: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Basic role check - in a real app, use middleware or server-side check
    // if (user && user.role !== 'admin') {
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
            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-slate-700">
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-blue-600 to-indigo-600">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FaBriefcase className="text-white/80" />
                            Post New Placement Drive
                        </h1>
                        <p className="text-blue-100 mt-1">Create a new job opportunity for students.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Company Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <FaBuilding className="text-gray-400" /> Company Name
                                </label>
                                <input
                                    type="text"
                                    name="company_name"
                                    required
                                    placeholder="e.g. Google, Microsoft"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Role */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <FaBriefcase className="text-gray-400" /> Job Role
                                </label>
                                <input
                                    type="text"
                                    name="role"
                                    required
                                    placeholder="e.g. Software Engineer"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Salary */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <FaMoneyBillWave className="text-gray-400" /> CTC / Salary
                                </label>
                                <input
                                    type="text"
                                    name="salary"
                                    placeholder="e.g. 12 LPA"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-gray-400" /> Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="e.g. Bangalore, Remote"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Deadline */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <FaCalendarAlt className="text-gray-400" /> Application Deadline
                                </label>
                                <input
                                    type="date"
                                    name="deadline"
                                    required
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Application Link (Optional) */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <FaLink className="text-gray-400" /> External Link (Optional)
                                </label>
                                <input
                                    type="url"
                                    name="application_link"
                                    placeholder="https://..."
                                    value={formData.application_link}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Job Description</label>
                            <textarea
                                name="description"
                                rows={4}
                                required
                                placeholder="Detailed description of the role..."
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>

                        {/* Requirements */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Requirements / Eligibility</label>
                            <textarea
                                name="requirements"
                                rows={4}
                                required
                                placeholder="Skills, GPA, Batch, etc..."
                                value={formData.requirements}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Posting...' : 'Post Drive'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
