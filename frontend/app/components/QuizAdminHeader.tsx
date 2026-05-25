"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaPen, FaArrowLeft, FaMagic, FaChartLine, FaThLarge } from "react-icons/fa";

export default function QuizAdminHeader() {
    const pathname = usePathname();

    const navItems = [
        { name: "Overview", path: "/admin/quiz", icon: FaThLarge },
        { name: "AI Generator", path: "/admin/quiz/ai-generator", icon: FaMagic },
        { name: "Manual Creation", path: "/admin/quiz/manual", icon: FaPen },
        { name: "Manage & Analytics", path: "/admin/quiz/manage", icon: FaChartLine },
    ];

    return (
        <div className="mb-8">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm"
                >
                    <FaArrowLeft className="mr-2" /> Back to Main Admin Dashboard
                </Link>
                <div className="text-slate-500 text-xs hidden md:block">
                    Quiz Administration Suite
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-1 flex flex-wrap gap-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-slate-800 text-white shadow-sm border border-slate-700/50"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                }`}
                        >
                            <Icon className={isActive ? "text-indigo-400" : ""} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
