'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [role, setRole] = useState<'student' | 'admin'>('student');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Use Supabase Auth via AuthContext
            await login(formData.email, formData.password);

            // Optional: Webhook call for analytics/tracking (non-blocking)
            fetch('https://bitlanceai.app.n8n.cloud/webhook/eduai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'login',
                    email: formData.email,
                    timestamp: new Date().toISOString(),
                }),
            }).catch(console.error);

            // Redirect handled by AuthContext or manual push
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-purple-600/20 blur-[120px]" />
                <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 animate-fadeIn">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-300">Sign in to continue to your dashboard</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Role Selection */}
                    <div className="flex p-1 bg-black/20 rounded-lg mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('student')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${role === 'student'
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('admin')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${role === 'admin'
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Admin
                        </button>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-400 transition-colors">
                            <FaEnvelope />
                        </div>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder-gray-500 transition-all"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-400 transition-colors">
                            <FaLock />
                        </div>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder-gray-500 transition-all"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-gray-400 hover:text-gray-300 cursor-pointer">
                            <input type="checkbox" className="mr-2 rounded bg-white/10 border-white/20 text-purple-600 focus:ring-purple-500" />
                            Remember me
                        </label>
                        <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Forgot Password?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Sign In as {role === 'admin' ? 'Admin' : 'Student'} <FaSignInAlt className="text-sm" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                        Create one
                    </Link>
                </div>
            </div>
        </div>
    );
}
