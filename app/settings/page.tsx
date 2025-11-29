'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Account Settings
                    </h2>

                    <div className="space-y-6">
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Notifications
                            </h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Push Notifications
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Receive notifications about your account activity.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setNotifications(!notifications)}
                                    className={`${notifications ? 'bg-blue-600' : 'bg-gray-200'
                                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                >
                                    <span
                                        className={`${notifications ? 'translate-x-5' : 'translate-x-0'
                                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Email Preferences
                            </h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Marketing Emails
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Receive emails about new features and offers.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setMarketingEmails(!marketingEmails)}
                                    className={`${marketingEmails ? 'bg-blue-600' : 'bg-gray-200'
                                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                >
                                    <span
                                        className={`${marketingEmails ? 'translate-x-5' : 'translate-x-0'
                                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-red-600 mb-4">
                                Danger Zone
                            </h3>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                            Delete Account
                                        </p>
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            Permanently delete your account and all of your content.
                                        </p>
                                    </div>
                                    <button className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-sm font-medium transition-colors">
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
