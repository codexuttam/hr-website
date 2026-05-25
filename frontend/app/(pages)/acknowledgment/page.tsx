'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
    CheckCircle2, 
    Home, 
    ArrowRight, 
    Mail, 
    LogIn, 
    Sparkles, 
    GraduationCap,
    Clock
} from 'lucide-react';

export default function AcknowledgmentPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden selection:bg-indigo-500/30">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
                />
            </div>

            <div className={`relative w-full max-w-2xl p-4 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden">
                    <div className="p-8 md:p-12 text-center">
                        {/* Success Icon */}
                        <div className="relative inline-flex items-center justify-center mb-8">
                            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full animate-pulse" />
                            <div className="relative w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-3xl flex items-center justify-center border border-green-500/30 shadow-xl shadow-green-500/10">
                                <CheckCircle2 className="w-12 h-12 text-green-400" />
                            </div>
                            <div className="absolute -top-2 -right-2">
                                <Sparkles className="w-6 h-6 text-indigo-400 animate-bounce" />
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                            Welcome to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Future</span> of Learning!
                        </h1>
                        <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                            Registration complete! You're now part of the EduAI Hub community. Let's get you set up for success.
                        </p>

                        {/* Next Steps Card */}
                        <div className="grid md:grid-cols-2 gap-4 mb-10">
                            {[
                                { icon: Mail, title: "Verify Email", desc: "Check your inbox for a confirmation link to activate your account." },
                                { icon: Clock, title: "Finalizing", desc: "Our AI is preparing your personalized dashboard and roadmaps." }
                            ].map((step, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left flex gap-4 items-start hover:bg-white/[0.07] transition-colors group">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <step.icon className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-sm mb-1">{step.title}</h4>
                                        <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/login"
                                className="group relative flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <span>Sign In to Your Dashboard</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            
                            <Link
                                href="/"
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all"
                            >
                                <Home className="w-4 h-4" />
                                <span>Back to Home</span>
                            </Link>
                        </div>
                    </div>

                    {/* Bottom accent */}
                    <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 opacity-50" />
                </div>

                {/* Brand Footer */}
                <div className="mt-12 flex items-center justify-center gap-2 opacity-50">
                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-bold text-white tracking-widest uppercase">EduAI Hub</span>
                </div>
            </div>
        </div>
    );
}
