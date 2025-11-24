'use client';

import { FaTrophy, FaEye, FaMicrophone, FaComments, FaRedo, FaDownload, FaChartLine } from 'react-icons/fa';
import type { InterviewResults as InterviewResultsType } from '@/types/interview';

interface InterviewResultsProps {
    results: InterviewResultsType;
    onRestart: () => void;
}

export default function InterviewResults({ results, onRestart }: InterviewResultsProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreGradient = (score: number) => {
        if (score >= 80) return 'from-green-500 to-emerald-500';
        if (score >= 60) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-pink-500';
    };

    const downloadReport = () => {
        const report = {
            timestamp: new Date().toISOString(),
            overallScore: results.overallScore,
            scores: {
                eyeContact: results.eyeContactScore,
                speechClarity: results.speechClarity,
                responseQuality: results.responseQuality
            },
            transcript: results.transcript,
            recommendations: results.recommendations
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Overall Score Card */}
            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-8 text-center">
                <div className="inline-block p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mb-4">
                    <FaTrophy className="text-6xl text-yellow-400" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">Interview Complete!</h2>
                <p className="text-purple-200 mb-6">Here's how you performed</p>

                <div className="inline-block">
                    <div className="relative">
                        <svg className="w-48 h-48" viewBox="0 0 200 200">
                            <circle
                                cx="100"
                                cy="100"
                                r="80"
                                fill="none"
                                stroke="rgba(139, 92, 246, 0.2)"
                                strokeWidth="20"
                            />
                            <circle
                                cx="100"
                                cy="100"
                                r="80"
                                fill="none"
                                stroke="url(#scoreGradient)"
                                strokeWidth="20"
                                strokeDasharray={`${(results.overallScore / 100) * 502.4} 502.4`}
                                strokeLinecap="round"
                                transform="rotate(-90 100 100)"
                                className="transition-all duration-1000"
                            />
                            <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#a78bfa" />
                                    <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-5xl font-bold ${getScoreColor(results.overallScore)}`}>
                                {Math.round(results.overallScore)}
                            </span>
                            <span className="text-purple-300 text-sm">Overall Score</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Eye Contact Score */}
                <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <FaEye className="text-2xl text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Eye Contact</h3>
                            <p className="text-purple-300 text-sm">Camera engagement</p>
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-purple-300 text-sm">Score</span>
                            <span className={`text-2xl font-bold ${getScoreColor(results.eyeContactScore)}`}>
                                {Math.round(results.eyeContactScore)}%
                            </span>
                        </div>
                        <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${getScoreGradient(results.eyeContactScore)} transition-all duration-1000`}
                                style={{ width: `${results.eyeContactScore}%` }}
                            />
                        </div>
                    </div>

                    <p className="text-purple-200 text-sm">
                        {results.eyeContactScore >= 80
                            ? 'Excellent! You maintained great eye contact throughout.'
                            : results.eyeContactScore >= 60
                                ? 'Good effort. Try to look at the camera more consistently.'
                                : 'Practice looking directly at the camera when speaking.'}
                    </p>
                </div>

                {/* Speech Clarity Score */}
                <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <FaMicrophone className="text-2xl text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Speech Clarity</h3>
                            <p className="text-purple-300 text-sm">Voice quality</p>
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-purple-300 text-sm">Score</span>
                            <span className={`text-2xl font-bold ${getScoreColor(results.speechClarity)}`}>
                                {Math.round(results.speechClarity)}%
                            </span>
                        </div>
                        <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${getScoreGradient(results.speechClarity)} transition-all duration-1000`}
                                style={{ width: `${results.speechClarity}%` }}
                            />
                        </div>
                    </div>

                    <p className="text-purple-200 text-sm">
                        {results.speechClarity >= 80
                            ? 'Crystal clear! Your speech was easy to understand.'
                            : results.speechClarity >= 60
                                ? 'Generally clear. Work on speaking at a steady pace.'
                                : 'Practice speaking more slowly and clearly.'}
                    </p>
                </div>

                {/* Response Quality Score */}
                <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <FaComments className="text-2xl text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Response Quality</h3>
                            <p className="text-purple-300 text-sm">Answer depth</p>
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-purple-300 text-sm">Score</span>
                            <span className={`text-2xl font-bold ${getScoreColor(results.responseQuality)}`}>
                                {Math.round(results.responseQuality)}%
                            </span>
                        </div>
                        <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${getScoreGradient(results.responseQuality)} transition-all duration-1000`}
                                style={{ width: `${results.responseQuality}%` }}
                            />
                        </div>
                    </div>

                    <p className="text-purple-200 text-sm">
                        {results.responseQuality >= 80
                            ? 'Outstanding answers with great detail and examples.'
                            : results.responseQuality >= 60
                                ? 'Good responses. Add more specific examples.'
                                : 'Focus on providing detailed, structured answers.'}
                    </p>
                </div>
            </div>

            {/* Interview Transcript */}
            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
                <h3 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
                    <FaChartLine className="text-purple-400" />
                    Interview Transcript
                </h3>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {results.transcript.map((item, index) => (
                        <div key={index} className="bg-black/30 rounded-xl p-4 space-y-3">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-purple-400 font-semibold text-sm">Question {index + 1}:</span>
                                    <span className="text-purple-300 text-xs">
                                        {new Date(item.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-white">{item.question}</p>
                            </div>

                            <div>
                                <span className="text-green-400 font-semibold text-sm">Your Answer:</span>
                                <p className="text-purple-100 mt-1">{item.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            {results.recommendations.length > 0 && (
                <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
                    <h3 className="text-white font-semibold text-xl mb-4">💡 Recommendations for Improvement</h3>

                    <ul className="space-y-3">
                        {results.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-3 text-purple-100">
                                <span className="text-purple-400 font-bold">{index + 1}.</span>
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
                <button
                    onClick={downloadReport}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105 flex items-center gap-3"
                >
                    <FaDownload />
                    Download Report
                </button>

                <button
                    onClick={onRestart}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105 flex items-center gap-3"
                >
                    <FaRedo />
                    Practice Again
                </button>
            </div>
        </div>
    );
}
