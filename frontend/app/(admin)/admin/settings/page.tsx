"use client";

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Settings, Shield, Bell, Lock, Globe, Database, UserCheck, Zap } from 'lucide-react';

export default function SettingsPage() {
  const sections = [
    { title: 'General', desc: 'Platform name, branding, and global contact info.', icon: Globe },
    { title: 'Authentication', desc: 'Login methods, session limits, and role permissions.', icon: Lock },
    { title: 'Security', desc: 'API keys, CORS policies, and rate limiting controls.', icon: Shield },
    { title: 'Notifications', desc: 'Email templates, SMS gateways, and push alerts.', icon: Bell },
    { title: 'Database', desc: 'Backup schedules, indexing, and cleanup tasks.', icon: Database },
    { title: 'AI Configuration', desc: 'Manage API keys for OpenAI, Gemini, and Vapi.', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2 text-slate-400 font-semibold uppercase tracking-wider text-xs">
              <Settings className="h-4 w-4" />
              Configuration
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Platform Settings
            </h1>
            <p className="text-slate-400 mt-2">
              Global system configurations and administrative preferences.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:bg-slate-900/60 transition-all cursor-not-allowed group">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-slate-700 transition-colors">
                <section.icon className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{section.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                {section.desc}
              </p>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-slate-950 px-2 py-1 rounded inline-block">
                Module Disabled
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
            <UserCheck className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-white">System is Healthy</h3>
            <p className="text-slate-400 text-sm mt-1">
              All administrative modules are synchronized with the cloud infrastructure. Version 2.4.0 is currently active.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
