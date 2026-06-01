'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    User, 
    Mail, 
    Lock, 
    Phone, 
    ArrowRight, 
    Eye, 
    EyeOff, 
    CheckCircle2, 
    Sparkles, 
    ShieldCheck, 
    Zap,
    GraduationCap,
    AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [shake, setShake] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 600);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            triggerShake();
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
            setIsLoading(false);
            triggerShake();
            return;
        }

        try {
            // 1. Register with Supabase
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                        role: 'student',
                    }
                }
            });

            if (authError) {
                // Handle case where user might already exist in Auth
                if (authError.message.toLowerCase().includes('already registered') || authError.status === 400) {
                    throw new Error('An account with this email already exists. Please sign in instead.');
                }
                throw new Error(authError.message);
            }

            if (authData.user) {
                // 2. Insert into users table
                const { error: dbError } = await supabase
                    .from('users')
                    .insert([
                        {
                            email: formData.email,
                            name: formData.fullName,
                            role: 'student',
                            user_uid: authData.user.id,
                            credits: 50,
                        }
                    ]);

                if (dbError) {
                    console.error('Error saving to users table:', dbError);
                    // Handle duplicate key error (23505)
                    if (dbError.code === '23505') {
                        throw new Error('An account with this email already exists. Please sign in instead.');
                    }
                    // For other errors, we continue to keep the flow moving if Auth was successful
                }
            }

            // 3. Send data to the webhook
            await fetch('https://bitlanceai.app.n8n.cloud/webhook/eduai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    timestamp: new Date().toISOString(),
                    supabase_id: authData.user?.id
                }),
            }).catch(() => {});

            router.push('/acknowledgment');
        } catch (err: any) {
            setError(err.message || 'An error occurred during registration.');
            triggerShake();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-950 overflow-hidden selection:bg-indigo-500/30">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
                />
            </div>

            {/* Left Side: Information (Desktop only) */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-16 xl:px-24">
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-12 group transition-transform hover:-translate-y-0.5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">EduAI <span className="text-indigo-400">Hub</span></span>
                    </Link>

                    <div className="space-y-8 max-w-lg">
                        <h2 className="text-5xl font-extrabold text-white leading-tight">
                            Start your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI-powered</span> learning journey today.
                        </h2>
                        
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Join thousands of students mastering technology with personalized AI tutors, real-time assessments, and career-focused roadmaps.
                        </p>

                        <div className="space-y-6 pt-4">
                            {[
                                { icon: ShieldCheck, title: "Verified Credentials", desc: "Gain industry-recognized certificates for your portfolio." },
                                { icon: Zap, title: "Instant Feedback", desc: "Get real-time AI corrections on your code and quizzes." },
                                { icon: Sparkles, title: "Curated Roadmaps", desc: "Personalized learning paths tailored to your career goals." }
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-4 items-start group">
                                    <div className="mt-1 w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-colors">
                                        <feature.icon className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold">{feature.title}</h4>
                                        <p className="text-gray-500 text-sm">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Decorative blob */}
                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/5 blur-[160px] rounded-full pointer-events-none" />
            </div>

            {/* Right Side: Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative z-10">
                <div className={`w-full max-w-lg transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-12">
                        {/* Header Mobile Only */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 mb-4">
                                <GraduationCap className="h-7 w-7 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Create an Account</h1>
                            <p className="text-gray-400 mt-2">Join EduAI Hub to start learning</p>
                        </div>

                        {/* Header Desktop */}
                        <div className="hidden lg:block mb-10">
                            <h3 className="text-3xl font-bold text-white mb-2">Create Account</h3>
                            <p className="text-gray-400">Fill in your details to get started.</p>
                        </div>

                        {/* Error Banner */}
                        {error && (
                            <div className={`mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 ${shake ? 'animate-shake' : ''}`}>
                                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-red-300 leading-relaxed">
                                    {error}
                                    {error.includes('already exists') && (
                                        <Link href="/login" className="block mt-1 font-semibold text-red-200 hover:text-white underline underline-offset-2 transition-colors">
                                            Sign in to your account →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Full Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            required
                                            placeholder="John Doe"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Phone (Optional)</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="+1 234 567 890"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Confirm</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            required
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Password requirements hint */}
                            <p className="text-[10px] text-gray-500 leading-tight px-1">
                                Must be 8+ characters with uppercase, lowercase, number & special character.
                            </p>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full group relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-px font-semibold text-white shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <div className="relative flex items-center justify-center gap-2 rounded-2xl bg-transparent py-3.5 px-4 transition-all duration-300 group-hover:bg-white/10">
                                    {isLoading ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-gray-500 text-sm">
                                Already have an account?{' '}
                                <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-xs text-gray-600 max-w-xs mx-auto">
                        By signing up, you agree to our{' '}
                        <a href="#" className="text-gray-500 hover:text-gray-400 underline underline-offset-2">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-gray-500 hover:text-gray-400 underline underline-offset-2">Privacy Policy</a>.
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    15% { transform: translateX(-8px); }
                    30% { transform: translateX(8px); }
                    45% { transform: translateX(-6px); }
                    60% { transform: translateX(6px); }
                    75% { transform: translateX(-3px); }
                    90% { transform: translateX(3px); }
                }
                .animate-shake {
                    animation: shake 0.6s ease-in-out;
                }
            `}</style>
        </div>
    );
}
