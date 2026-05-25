"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Rocket, ArrowRight, TrendingUp, Briefcase, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function PlacementDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeDrives: 0, myApplications: 0, loading: true });

  useEffect(() => {
    fetchLiveStats();
  }, [user]);

  async function fetchLiveStats() {
    try {
      const [drivesRes, appsRes] = await Promise.all([
        supabase.from('placement_drives').select('id', { count: 'exact', head: true }),
        user
          ? supabase.from('drive_applications').select('id', { count: 'exact', head: true }).eq('user_id', user.user_id)
          : Promise.resolve({ count: 0 }),
      ]);
      setStats({ activeDrives: drivesRes.count || 0, myApplications: appsRes.count || 0, loading: false });
    } catch {
      setStats(prev => ({ ...prev, loading: false }));
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Placement Portal</h1>
          <p className="text-slate-500 font-medium mt-1">Your hub for recruitment drives and applications.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-blue-500 w-fit mb-4">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.loading ? <Loader2 className="h-7 w-7 animate-spin text-slate-400" /> : stats.activeDrives.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Active Drives</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-emerald-500 w-fit mb-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.loading ? <Loader2 className="h-7 w-7 animate-spin text-slate-400" /> : stats.myApplications.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">My Applications</div>
          </div>
        </div>

        {/* Quick Link */}
        <Link
          href="/drives/list"
          className="group flex items-center justify-between bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-xl"
        >
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <Rocket className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Browse Active Drives</h2>
              <p className="text-slate-500 text-sm mt-0.5">View and apply for current recruitment opportunities.</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        </Link>

      </div>
    </div>
  );
}
