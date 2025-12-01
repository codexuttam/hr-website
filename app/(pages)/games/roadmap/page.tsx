'use client';
import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { RoadmapInput, RoadmapOutput } from '@/types/roadmap';

export default function RoadmapPage() {
    const [goal, setGoal] = useState('AI Engineer');
    const [skillLevel, setSkillLevel] = useState('Beginner');
    const [duration, setDuration] = useState('3 months');
    const [roadmapType, setRoadmapType] = useState('Learning Roadmap');
    const [extra, setExtra] = useState('');
    const [projectHierarchy, setProjectHierarchy] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<RoadmapOutput | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [favorites, setFavorites] = useState<RoadmapOutput[]>([]);
    const [shareLink, setShareLink] = useState('');
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

        // Load favorites from localStorage
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
        setResult(null);
        setSaved(false);

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
            setResult(data);
            setSaved(true);

            // Show success toast
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }

    function downloadMarkdown() {
        if (!result) return;
        const blob = new Blob([result.ai_response], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roadmap-${goal.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    function copyToClipboard() {
        if (!result) return;
        navigator.clipboard.writeText(result.ai_response).then(() => {
            alert('✅ Copied to clipboard!');
        });
    }

    function addToFavorites() {
        if (!result) return;
        const newFavorites = [...favorites, result];
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        alert('⭐ Added to favorites!');
    }

    function generateShareLink() {
        if (!result) return;
        const link = `${window.location.origin}/roadmap?share=${btoa(JSON.stringify(result))}`;
        setShareLink(link);
        navigator.clipboard.writeText(link);
        alert('🔗 Share link copied!');
    }

    const bgClass = darkMode ? 'bg-slate-950' : 'bg-white';
    const textClass = darkMode ? 'text-white' : 'text-slate-900';
    const inputClass = darkMode
        ? 'bg-slate-800 border-slate-700 text-white'
        : 'bg-gray-100 border-gray-300 text-slate-900';

    return (
        <div className={`min-h-screen ${bgClass} ${textClass} transition-colors duration-300`}>
            {/* Header */}
            <div className={`${darkMode ? 'bg-slate-900' : 'bg-gray-100'} border-b ${darkMode ? 'border-slate-800' : 'border-gray-200'} sticky top-0 z-40`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        🛣️ RoadmapAI
                    </h1>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-2 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-gray-200'} transition-all`}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Panel */}
                    <div className="lg:col-span-1">
                        <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'} rounded-2xl border shadow-xl p-6 space-y-5 sticky top-20`}>
                            <h2 className="text-2xl font-bold">Build Your Path</h2>

                            <form onSubmit={generateRoadmap} className="space-y-5">
                                {/* Voice Input Button */}
                                <button
                                    type="button"
                                    onClick={startVoiceInput}
                                    className={`w-full py-3 rounded-lg font-semibold transition-all ${isListening
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                                        }`}
                                >
                                    {isListening ? '🎤 Listening...' : '🎤 Voice Input'}
                                </button>

                                {/* Goal */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Goal</label>
                                    <select
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputClass}`}
                                    >
                                        <option>AI Engineer</option>
                                        <option>ML Developer</option>
                                        <option>Placement Prep</option>
                                        <option>Project Onboarding</option>
                                        <option>Frontend Developer</option>
                                        <option>Backend Developer</option>
                                        <option>Full-Stack Developer</option>
                                    </select>
                                </div>

                                {/* Skill Level */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Skill Level</label>
                                    <select
                                        value={skillLevel}
                                        onChange={(e) => setSkillLevel(e.target.value)}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputClass}`}
                                    >
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Timeline</label>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputClass}`}
                                    >
                                        <option>1 month</option>
                                        <option>3 months</option>
                                        <option>6 months</option>
                                        <option>1 year</option>
                                    </select>
                                </div>

                                {/* Roadmap Type */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Roadmap Type</label>
                                    <select
                                        value={roadmapType}
                                        onChange={(e) => setRoadmapType(e.target.value)}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${inputClass}`}
                                    >
                                        <option>Learning Roadmap</option>
                                        <option>Career Roadmap</option>
                                        <option>Project-based Roadmap</option>
                                        <option>Custom Roadmap</option>
                                    </select>
                                </div>

                                {/* Extra Preferences */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Extra Preferences</label>
                                    <textarea
                                        value={extra}
                                        onChange={(e) => setExtra(e.target.value)}
                                        placeholder="e.g., Focus on frameworks, include project ideas..."
                                        rows={3}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${inputClass}`}
                                    />
                                </div>

                                {/* Error Display */}
                                {error && (
                                    <div className="p-3 bg-red-500/20 border border-red-500 text-red-400 rounded-lg text-sm">
                                        ⚠️ {error}
                                    </div>
                                )}

                                {/* Generate Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-lg"
                                >
                                    {loading ? '✨ Generating...' : '🚀 Generate Roadmap'}
                                </button>

                                {/* Success Message */}
                                {saved && (
                                    <p className="text-sm text-green-400 font-medium text-center">
                                        ✓ Saved to your history
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Output Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Loading State */}
                        {loading && (
                            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'} rounded-2xl border shadow-xl p-12 text-center`}>
                                <div className="inline-block">
                                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <p className="mt-6 text-lg font-semibold">Generating your personalized roadmap...</p>
                                <p className="text-gray-500 text-sm mt-2">This usually takes 10-30 seconds</p>
                            </div>
                        )}

                        {/* Result Display */}
                        {result && !loading && (
                            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'} rounded-2xl border shadow-xl p-8`}>
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-3xl font-bold">Your Roadmap</h2>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowPreview(!showPreview)}
                                            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                                            title="Toggle preview"
                                        >
                                            👁️
                                        </button>
                                    </div>
                                </div>

                                {/* Markdown Content */}
                                <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 mb-6 max-h-96 overflow-y-auto`}>
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown>{result.ai_response}</ReactMarkdown>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                    <button
                                        onClick={downloadMarkdown}
                                        className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200"
                                    >
                                        📥 Download
                                    </button>
                                    <button
                                        onClick={copyToClipboard}
                                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200"
                                    >
                                        📋 Copy
                                    </button>
                                    <button
                                        onClick={addToFavorites}
                                        className="px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all duration-200"
                                    >
                                        ⭐ Favorite
                                    </button>
                                    <button
                                        onClick={generateShareLink}
                                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200"
                                    >
                                        🔗 Share
                                    </button>
                                </div>

                                {/* Metadata */}
                                <details className={`p-4 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                                    <summary className="font-bold cursor-pointer">📊 View Details</summary>
                                    <pre className="mt-3 text-xs overflow-x-auto p-3 rounded bg-slate-950 text-green-400">
                                        {JSON.stringify(result.metadata, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        )}

                        {/* Empty State */}
                        {!result && !loading && (
                            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'} rounded-2xl border shadow-xl p-12 text-center`}>
                                <div className="text-6xl mb-4">🎯</div>
                                <h3 className="text-2xl font-bold mb-2">Ready to Build Your Path?</h3>
                                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                    Fill in the form on the left and click "Generate" to create your personalized roadmap
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Favorites Section */}
                {favorites.length > 0 && (
                    <div className="mt-16">
                        <h3 className="text-2xl font-bold mb-6">⭐ Your Favorites</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {favorites.map((fav, i) => (
                                <div
                                    key={i}
                                    className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'} rounded-xl border p-4 cursor-pointer hover:shadow-lg transition-all`}
                                    onClick={() => setResult(fav)}
                                >
                                    <p className="font-bold truncate">{fav.metadata?.goal || 'Saved Roadmap'}</p>
                                    <p className="text-sm text-gray-500">Level: {fav.metadata?.skill_level}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}