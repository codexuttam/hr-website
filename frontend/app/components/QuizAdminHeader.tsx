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
                    className="inline-flex items-center text-neutral-400 hover:text-white transition-colors text-sm"
                >
                    <FaArrowLeft className="mr-2" /> Back to Main Admin Dashboard
                </Link>
                <div className="text-neutral-500 text-xs hidden md:block">
                    Quiz Administration Suite
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-black/80 backdrop-blur-xl/50 border border-neutral-900 rounded-xl p-1 flex flex-wrap gap-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-neutral-900 text-white shadow-sm border border-neutral-800/50"
                                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                                }`}
                        >
                            <Icon className={isActive ? "text-gray-500" : ""} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
