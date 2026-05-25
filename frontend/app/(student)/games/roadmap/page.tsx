'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RoadmapInput, RoadmapOutput } from '@/types/roadmap';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
    Target, Star, Clock, Sparkles, 
    Mic, Play, History, ArrowRight,
    Search, Brain, Compass, Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RoadmapPage() {
    const router = useRouter();
    const [goal, setGoal] = useState('AI Engineer');
    const [skillLevel, setSkillLevel] = useState('Beginner');
    const [duration, setDuration] = useState('3 months');
    const [roadmapType, setRoadmapType] = useState('Learning Roadmap');
    const [extra, setExtra] = useState('');
    const [projectHierarchy, setProjectHierarchy] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [favorites, setFavorites] = useState<RoadmapOutput[]>([]);
    const recognitionRef = useRef<any>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                if (transcript.includes('ai engineer')) setGoal('AI Engineer');
                else if (transcript.includes('ml developer')) setGoal('ML Developer');
                else if (transcript.includes('frontend')) setGoal('Frontend Developer');
                else if (transcript.includes('backend')) setGoal('Backend Developer');
                else if (transcript.includes('full stack')) setGoal('Full-Stack Developer');
                else if (transcript.includes('beginner')) setSkillLevel('Beginner');
                else if (transcript.includes('intermediate')) setSkillLevel('Intermediate');
                else if (transcript.includes('advanced')) setSkillLevel('Advanced');
                else if (transcript.includes('1 month')) setDuration('1 month');
                else if (transcript.includes('3 months')) setDuration('3 months');
                else if (transcript.includes('6 months')) setDuration('6 months');
                else if (transcript.includes('1 year')) setDuration('1 year');
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => {
                setIsListening(false);
            };
        }
    }, []);

    useEffect(() => {
        const uid = localStorage.getItem('user_id');
        if (uid) setUserId(uid);
        else {
            const newUid = `user-${Date.now()}`;
            localStorage.setItem('user_id', newUid);
            setUserId(newUid);
        }

        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    }, []);

    const startVoiceInput = () => {
        if (recognitionRef.current) {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    async function generateRoadmap(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload: RoadmapInput = {
            goal,
            skill_level: skillLevel,
            duration,
            roadmap_type: roadmapType,
            extra_preferences: extra,
            project_hierarchy: projectHierarchy,
            user_id: userId,
        };

        try {
            const res = await fetch('/api/roadmap/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to generate roadmap');
            }

            const data = (await res.json()) as RoadmapOutput;
            const roadmapId = Date.now().toString();
            localStorage.setItem(`roadmap_${roadmapId}`, JSON.stringify(data));
            router.push(`/games/roadmap/view?id=${roadmapId}`);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                
                {/* - Hero Banner - */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-800 p-8 md:p-12 shadow-2xl shadow-indigo-500/10 border border-indigo-500/10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-[80px] pointer-events-none" />

                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur rounded-full text-indigo-300 text-xs font-bold tracking-widest uppercase border border-white/10">
                                <Compass className="h-4 w-4" />
                                <span>AI-Powered Career Navigation</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
                                Design Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Future Career</span>
                            </h1>
                            <p className="max-w-xl text-slate-400 text-lg leading-relaxed">
                                Our AI engine generates personalized, step-by-step learning paths tailored to your goals, skill level, and timeline. 
                            </p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-300 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Dynamic Generation
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    Project Focused
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    Voice Enabled
                                </div>
                            </div>
                        </div>

                        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                             <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Play className="h-5 w-5 text-white fill-current" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Start Building</h2>
                             </div>

                             <form onSubmit={generateRoadmap} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">My Career Goal</label>
                                    <div className="relative">
                                        <select
                                            value={goal}
                                            onChange={(e) => setGoal(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-10 py-3 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                                        >
                                            <option className="bg-slate-900">AI Engineer</option>
                                            <option className="bg-slate-900">ML Developer</option>
                                            <option className="bg-slate-900">Placement Prep</option>
                                            <option className="bg-slate-900">Project Onboarding</option>
                                            <option className="bg-slate-900">Frontend Developer</option>
                                            <option className="bg-slate-900">Backend Developer</option>
                                            <option className="bg-slate-900">Full-Stack Developer</option>
                                        </select>
                                        <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Skill Level</label>
                                        <div className="relative">
                                            <select
                                                value={skillLevel}
                                                onChange={(e) => setSkillLevel(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-10 py-3 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                                            >
                                                <option className="bg-slate-900">Beginner</option>
                                                <option className="bg-slate-900">Intermediate</option>
                                                <option className="bg-slate-900">Advanced</option>
                                            </select>
                                            <Brain className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Timeline</label>
                                        <div className="relative">
                                            <select
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-10 py-3 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                                            >
                                                <option className="bg-slate-900">1 month</option>
                                                <option className="bg-slate-900">3 months</option>
                                                <option className="bg-slate-900">6 months</option>
                                                <option className="bg-slate-900">1 year</option>
                                            </select>
                                            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Roadmap Type</label>
                                    <div className="relative">
                                        <select
                                            value={roadmapType}
                                            onChange={(e) => setRoadmapType(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-10 py-3 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                                        >
                                            <option className="bg-slate-900">Learning Roadmap</option>
                                            <option className="bg-slate-900">Career Roadmap</option>
                                            <option className="bg-slate-900">Project-based Roadmap</option>
                                            <option className="bg-slate-900">Custom Roadmap</option>
                                        </select>
                                        <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={startVoiceInput}
                                        className={`p-3 rounded-2xl transition-all border ${isListening 
                                            ? 'bg-red-500 border-red-500 text-white animate-pulse' 
                                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                                    >
                                        <Mic className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Generate RoadMap
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                             </form>
                        </div>
                    </div>
                </div>

                {/* - Saved History Section - */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Roadmaps</h2>
                            <p className="text-sm text-slate-500 mt-1">Pick up where you left off</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full uppercase tracking-tighter">
                            <History className="h-4 w-4" />
                            Session History
                        </div>
                    </div>

                    {favorites.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-gray-100 dark:border-slate-800 shadow-sm text-center">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No saved paths yet</h3>
                            <p className="text-slate-500 max-w-sm mx-auto text-sm">Generate your first career roadmap to see it listed here in your favorites.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {favorites.map((fav, i) => (
                                <div
                                    key={i}
                                    className="group bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-xl transition-all"
                                    onClick={() => {
                                        const tempId = `fav_${Date.now()}_${i}`;
                                        localStorage.setItem(`roadmap_${tempId}`, JSON.stringify(fav));
                                        router.push(`/games/roadmap/view?id=${tempId}`);
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                            <Compass className="h-5 w-5" />
                                        </div>
                                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
                                            <Star className="h-3.5 w-3.5 fill-current" />
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors truncate">
                                        {fav.metadata?.goal || 'Saved Roadmap'}
                                    </h4>
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1">
                                            <Brain className="h-3 w-3" />
                                            {fav.metadata?.skill_level}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {fav.metadata?.duration}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </main>
            <Footer />
        </div>
    );
}