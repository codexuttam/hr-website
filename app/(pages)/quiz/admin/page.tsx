
"use client";

import React from "react";
import Link from "next/link";
import {
  FaRobot,
  FaPen,
  FaList,
  FaArrowRight,
  FaArrowLeft,
  FaMagic,
  FaLayerGroup,
  FaChartLine
} from "react-icons/fa";

import QuizAdminHeader from "@/components/QuizAdminHeader";

export default function AdminDashboardHub() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      <div className="max-w-6xl mx-auto">

        <QuizAdminHeader />

        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Quiz Administration
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Manage your assessment ecosystem. Generate quizzes with AI, craft them manually, or analyze student performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Card 1: AI Generator */}
          <Link href="/quiz/admin/ai-generator" className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative h-full bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-500/10 flex flex-col">
              <div className="w-14 h-14 bg-teal-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaMagic className="text-2xl text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-teal-400 transition-colors">
                AI Generator
              </h2>
              <p className="text-slate-400 mb-8 flex-1 leading-relaxed">
                Instantly generate comprehensive quizzes on any topic or for specific companies using advanced AI models.
              </p>
              <div className="flex items-center text-teal-400 font-medium group-hover:translate-x-2 transition-transform">
                Start Generating <FaArrowRight className="ml-2" />
              </div>
            </div>
          </Link>

          {/* Card 2: Manual Creation */}
          <Link href="/quiz/admin/manual" className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative h-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaPen className="text-2xl text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                Create Manually
              </h2>
              <p className="text-slate-400 mb-8 flex-1 leading-relaxed">
                Build quizzes from scratch. Create shells, add custom questions, and map them precisely as needed.
              </p>
              <div className="flex items-center text-indigo-400 font-medium group-hover:translate-x-2 transition-transform">
                Open Editor <FaArrowRight className="ml-2" />
              </div>
            </div>
          </Link>

          {/* Card 3: Manage & Analytics */}
          <Link href="/quiz/admin/manage" className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative h-full bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col">
              <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaChartLine className="text-2xl text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                Manage & Analytics
              </h2>
              <p className="text-slate-400 mb-8 flex-1 leading-relaxed">
                View all quizzes, assign them to students, track attempts, and monitor leaderboard performance.
              </p>
              <div className="flex items-center text-amber-400 font-medium group-hover:translate-x-2 transition-transform">
                View Dashboard <FaArrowRight className="ml-2" />
              </div>
            </div>
          </Link>

        </div>

      </div>
    </div>
  );
}
