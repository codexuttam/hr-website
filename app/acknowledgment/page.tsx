'use client';

import Link from 'next/link';
import { FaCheckCircle, FaHome } from 'react-icons/fa';

export default function AcknowledgmentPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-purple-600/20 blur-[120px]" />
                <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-12 text-center animate-fadeIn">
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                        <FaCheckCircle className="text-5xl text-green-400" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">Registration Successful!</h1>
                <p className="text-gray-300 mb-8 text-lg">
                    Thank you for signing up. Your account has been created successfully. We're excited to have you on board!
                </p>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/"
                        className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <FaHome /> Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
