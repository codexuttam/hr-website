'use client';
import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import VisualRoadmap from '@/components/roadmap/VisualRoadmap';
import { RoadmapOutput } from '@/types/roadmap';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
    Download, Copy, ArrowLeft, 
    Map as MapIcon, Share2, Printer,
    ChevronRight, Sparkles, Brain, Target
} from 'lucide-react';
import { motion } from 'framer-motion';

function RoadmapViewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [roadmap, setRoadmap] = useState<RoadmapOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const roadmapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const roadmapId = searchParams.get('id');

        if (roadmapId) {
            const stored = localStorage.getItem(`roadmap_${roadmapId}`);
            if (stored) {
                setRoadmap(JSON.parse(stored));
                setLoading(false);
            } else {
                router.push('/games/roadmap');
            }
        } else {
            router.push('/games/roadmap');
        }
    }, [searchParams, router]);

    const handleDownload = async () => {
        if (!roadmapRef.current) return;

        try {
            const element = roadmapRef.current;
            const canvasWidth = element.scrollWidth;
            const canvasHeight = element.scrollHeight;

            const dataUrl = await toPng(element, {
                cacheBust: true,
                backgroundColor: '#0f172a', // Force dark for export consistency
                width: canvasWidth,
                height: canvasHeight,
                style: {
                    height: 'auto',
                    overflow: 'visible',
                    maxHeight: 'none',
                }
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const printWidth = pageWidth - (2 * margin);
            const printHeight = pageHeight - (2 * margin);

            const imgProps = pdf.getImageProperties(dataUrl);
            const imgHeight = (imgProps.height * printWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = margin;

            pdf.addImage(dataUrl, 'PNG', margin, position, printWidth, imgHeight);
            heightLeft -= printHeight;

            while (heightLeft > 0) {
                position -= printHeight;
                pdf.addPage();
                pdf.addImage(dataUrl, 'PNG', margin, position, printWidth, imgHeight);
                heightLeft -= printHeight;
            }

            pdf.save(`career-roadmap-${Date.now()}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    const handleCopy = () => {
        if (!roadmap) return;
        navigator.clipboard.writeText(roadmap.ai_response).then(() => {
            alert('✅ Roadmap text copied to clipboard!');
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-500/20 rounded-full" />
                    <div className="absolute inset-0 w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <MapIcon className="absolute inset-0 m-auto h-8 w-8 text-indigo-400" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">Cartographing your path...</h2>
                    <p className="text-slate-400 text-sm">Structuring your personalized career roadmap</p>
                </div>
            </div>
        );
    }

    if (!roadmap) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans">
            <Header />

            {/* - Secondary Toolbar - */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                onClick={() => router.push('/games/roadmap')}
                                className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-all active:scale-95 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {roadmap.metadata?.goal || 'Career Strategy'}
                                    </h1>
                                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-indigo-200/50">
                                        Generated by AI
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-0.5">
                                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                        <Brain className="h-3 w-3" />
                                        {roadmap.metadata?.skill_level}
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                        <Target className="h-3 w-3" />
                                        {roadmap.metadata?.duration}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                            <button
                                onClick={handleDownload}
                                className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 text-sm whitespace-nowrap"
                            >
                                <Download className="h-4 w-4" />
                                Download PDF
                            </button>
                            <button
                                onClick={handleCopy}
                                className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold border border-gray-200 dark:border-slate-700 hover:bg-gray-50 transition-all text-sm flex items-center gap-2 shadow-sm whitespace-nowrap"
                            >
                                <Copy className="h-4 w-4" />
                                Copy Text
                            </button>
                            <button className="p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold border border-gray-200 dark:border-slate-700 hover:bg-gray-50 transition-all shadow-sm">
                                <Share2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* - Roadmap Content - */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Visual Header */}
                <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <MapIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Interactive Roadmap</h2>
                            <p className="text-slate-500 dark:text-slate-400">Navigate through your curated learning nodes and milestones.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800/50 text-xs font-bold uppercase tracking-widest">
                        <Sparkles className="h-4 w-4 animate-pulse" />
                        Live Roadmap
                    </div>
                </div>

                <div ref={roadmapRef} className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800">
                    <VisualRoadmap
                        aiResponse={roadmap.ai_response}
                        structuredData={roadmap.structured_data}
                        darkMode={true} // Default to dark for premium look
                    />
                </div>

                {/* Footer Notes */}
                <div className="mt-12 p-8 rounded-3xl bg-slate-900 text-white border border-white/5 relative overflow-hidden text-center md:text-left">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full translate-y-1/2 translate-x-1/4 blur-3xl" />
                    <div className="relative flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 space-y-2">
                            <h3 className="text-xl font-bold">What's Next?</h3>
                            <p className="text-slate-400">Follow each milestone in order. We recommend spending at least 15 hours per week to stay on track with your {roadmap.metadata?.duration} timeline.</p>
                        </div>
                        <button 
                            onClick={() => router.push('/games')}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20"
                        >
                            Return to Learning Lab
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function RoadmapViewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-slate-400 font-medium">Synchronizing roadmap data...</p>
                </div>
            </div>
        }>
            <RoadmapViewContent />
        </Suspense>
    );
}
