'use client';
import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import VisualRoadmap from '@/components/roadmap/VisualRoadmap';
import { RoadmapOutput } from '@/types/roadmap';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import Header from '@/components/Header';
import { useTheme } from '@/contexts/ThemeContext';

function RoadmapViewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [roadmap, setRoadmap] = useState<RoadmapOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const darkMode = theme === 'dark';
    const roadmapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Get roadmap data from URL params or localStorage
        const roadmapId = searchParams.get('id');

        if (roadmapId) {
            // Try to get from localStorage
            const stored = localStorage.getItem(`roadmap_${roadmapId}`);
            if (stored) {
                setRoadmap(JSON.parse(stored));
                setLoading(false);
            } else {
                // Redirect back if no data found
                router.push('/games/roadmap');
            }
        } else {
            router.push('/games/roadmap');
        }
    }, [searchParams, router]);

    const handleDownload = async () => {
        if (!roadmapRef.current) return;

        try {
            // Generate image using html-to-image
            // We set a fixed width or use scrollWidth to ensure we capture the full layout
            const element = roadmapRef.current;
            const canvasWidth = element.scrollWidth;
            const canvasHeight = element.scrollHeight;

            const dataUrl = await toPng(element, {
                cacheBust: true,
                backgroundColor: darkMode ? '#0f172a' : '#ffffff',
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
            const margin = 10; // 10mm margin
            const printWidth = pageWidth - (2 * margin);
            const printHeight = pageHeight - (2 * margin);

            const imgProps = pdf.getImageProperties(dataUrl);
            const imgHeight = (imgProps.height * printWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = margin; // Start at top margin

            // First page
            pdf.addImage(dataUrl, 'PNG', margin, position, printWidth, imgHeight);
            heightLeft -= printHeight;

            // Additional pages
            while (heightLeft > 0) {
                position -= printHeight; // Shift up by the printable height of one page
                pdf.addPage();
                pdf.addImage(dataUrl, 'PNG', margin, position, printWidth, imgHeight);
                heightLeft -= printHeight;
            }

            pdf.save(`roadmap-${Date.now()}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    const handleCopy = () => {
        if (!roadmap) return;
        navigator.clipboard.writeText(roadmap.ai_response).then(() => {
            alert('✅ Copied to clipboard!');
        });
    };

    const bgClass = darkMode ? 'bg-slate-950' : 'bg-white';
    const textClass = darkMode ? 'text-white' : 'text-slate-900';

    if (loading) {
        return (
            <div className={`min-h-screen ${bgClass} ${textClass} flex items-center justify-center`}>
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-semibold">Loading your roadmap...</p>
                </div>
            </div>
        );
    }

    if (!roadmap) {
        return null; // Or handle redirect
    }

    return (
        <div className={`min-h-screen ${bgClass} ${textClass}`}>
            <div className={`${darkMode ? 'bg-slate-900' : 'bg-gray-100'} border-b ${darkMode ? 'border-slate-800' : 'border-gray-200'} sticky top-0 z-40`}>
                <Header />
            </div>

            {/* Toolbar - Not sticky to avoid double header issues */}
            <div className={`${darkMode ? 'bg-slate-900/95' : 'bg-gray-100/95'} border-b ${darkMode ? 'border-slate-800' : 'border-gray-200'} shadow-sm`}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/games/roadmap')}
                                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-200 hover:bg-gray-300'} transition-colors font-medium`}
                            >
                                ← Back to Generator
                            </button>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                🗺️ Your Learning Roadmap
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDownload}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                            >
                                <span>📥</span> Download PDF
                            </button>
                            <button
                                onClick={handleCopy}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200"
                            >
                                📋 Copy Text
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Roadmap Content */}
            <div className="max-w-7xl mx-auto px-6 py-8" ref={roadmapRef}>
                <VisualRoadmap
                    aiResponse={roadmap.ai_response}
                    structuredData={roadmap.structured_data}
                    darkMode={darkMode}
                />
            </div>
        </div>
    );
}

export default function RoadmapViewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-semibold">Loading...</p>
                </div>
            </div>
        }>
            <RoadmapViewContent />
        </Suspense>
    );
}
