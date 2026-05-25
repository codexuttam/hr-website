'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

// Map raw Supabase/API error messages → friendly user-facing messages
function getFriendlyError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials') || msg.includes('invalid email or password')) {
    return 'Incorrect email or password. Please double-check and try again.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please verify your email address before logging in. Check your inbox for a confirmation link.';
  }
  if (msg.includes('too many requests') || msg.includes('rate limit')) {
    return 'Too many login attempts. Please wait a few minutes and try again.';
  }
  if (msg.includes('user not found') || msg.includes('no user found')) {
    return 'No account found with this email. Would you like to create one?';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }
  if (msg.includes('password')) {
    return 'Incorrect password. Please try again or reset your password.';
  }
  return raw || 'Something went wrong. Please try again.';
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); // clear error on typing
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (!success) {
        setError('Login failed. Please try again.');
        triggerShake();
        return;
      }

      // Non-blocking analytics webhook
      fetch('https://bitlanceai.app.n8n.cloud/webhook/eduai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: formData.email, timestamp: new Date().toISOString() }),
      }).catch(() => {});

      router.push('/dashboard');
    } catch (err: any) {
      const friendly = getFriendlyError(err.message || '');
      setError(friendly);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <div className={`relative w-full max-w-md px-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-400 tracking-widest uppercase">EduAI Platform</span>
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-1.5">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to continue your learning journey</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className={`mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 ${shake ? 'animate-shake' : ''}`}>
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-300 leading-relaxed">
                {error}
                {error.includes('No account found') && (
                  <Link href="/register" className="block mt-1 font-semibold text-red-200 hover:text-white underline underline-offset-2">
                    Create an account →
                  </Link>
                )}
                {error.includes('reset your password') && (
                  <a href="#" className="block mt-1 font-semibold text-red-200 hover:text-white underline underline-offset-2">
                    Reset password →
                  </a>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
              <div className={`relative group flex items-center rounded-xl border transition-all duration-200 ${
                error ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5 focus-within:border-indigo-500/70 focus-within:bg-indigo-500/5'
              }`}>
                <Mail className="absolute left-3.5 h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3.5 bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none rounded-xl"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">Password</label>
              <div className={`relative group flex items-center rounded-xl border transition-all duration-200 ${
                error ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5 focus-within:border-indigo-500/70 focus-within:bg-indigo-500/5'
              }`}>
                <Lock className="absolute left-3.5 h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3.5 bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 hover:text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                />
                Remember me
              </label>
              <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
            >
              {/* Shimmer on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">New here?</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Register CTA */}
          <Link
            href="/register"
            className="block w-full py-3 text-center text-sm font-semibold text-indigo-400 border border-indigo-500/30 hover:border-indigo-400/60 hover:text-indigo-300 hover:bg-indigo-500/5 rounded-xl transition-all duration-200"
          >
            Create a free account
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-600 mt-5">
          By signing in, you agree to our{' '}
          <a href="#" className="text-gray-500 hover:text-gray-400 underline underline-offset-2">Terms</a>
          {' '}and{' '}
          <a href="#" className="text-gray-500 hover:text-gray-400 underline underline-offset-2">Privacy Policy</a>.
        </p>
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
