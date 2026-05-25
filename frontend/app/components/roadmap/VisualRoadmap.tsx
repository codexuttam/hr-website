'use client';
import React, { useMemo, useState } from 'react';
import {
    RoadmapStructure,
    Phase as PhaseType,
    Milestone as MilestoneType
} from '@/types/roadmap';

interface Phase {
    title: string;
    weeks: string;
    topics: string[];
    color: string;
    weekStart?: number;
    weekEnd?: number;
}

interface Milestone {
    week: number;
    title: string;
    description: string;
}

interface VisualRoadmapProps {
    aiResponse: string;
    structuredData?: RoadmapStructure;
    darkMode?: boolean;
}

export default function VisualRoadmap({
    aiResponse,
    structuredData,
    darkMode = true
}: VisualRoadmapProps) {
    const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
    const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

    // Parse the AI response to extract structured data
    const parsedData = useMemo(() => {
        const colors = [
            'from-blue-500 to-cyan-500',
            'from-purple-500 to-pink-500',
            'from-green-500 to-emerald-500',
            'from-orange-500 to-red-500',
            'from-indigo-500 to-purple-500'
        ];

        // Use structured data directly
        if (structuredData) {
            const phases: Phase[] = structuredData.phases.map((phase, index) => ({
                title: phase.title,
                weeks: phase.weeks,
                topics: phase.topics,
                color: colors[index % colors.length]
            }));

            const milestones: Milestone[] = structuredData.milestones.map((m) => ({
                week: m.week,
                title: m.title,
                description: m.description
            }));

            return { phases, milestones };
        }

        // Fallback to text parsing
        const phases: Phase[] = [];
        const milestones: Milestone[] = [];

        const lines = aiResponse.split('\n');
        let currentPhase: Phase | null = null;
        let phaseIndex = 0;

        for (const lineRaw of lines) {
            const line = lineRaw.trim();

            const phaseMatch = line.match(
                /(?:###?\s*)?(\w+\s+Phase)[:\s]*\(?(weeks?\s+(\d+)-(\d+)|week\s+(\d+))\)?/i
            );

            if (phaseMatch) {
                if (currentPhase) phases.push(currentPhase);

                const weekStart = phaseMatch[3] || phaseMatch[5] || '1';
                const weekEnd = phaseMatch[4] || phaseMatch[5] || '4';

                currentPhase = {
                    title: phaseMatch[1],
                    weeks: `Week ${weekStart}-${weekEnd}`,
                    topics: [],
                    color: colors[phaseIndex % colors.length]
                };

                phaseIndex++;
                continue;
            }

            if (currentPhase && (line.startsWith('-') || line.startsWith('*') || line.startsWith('•'))) {
                const topic = line.replace(/^[-*•]\s*/, '').trim();
                if (topic.length > 3) currentPhase.topics.push(topic);
            }

            const weekMatch = line.match(/week\s+(\d+)[:\s-]+(.*)/i);
            if (weekMatch) {
                milestones.push({
                    week: parseInt(weekMatch[1]),
                    title: `Week ${weekMatch[1]}`,
                    description: weekMatch[2].trim()
                });
            }
        }

        if (currentPhase) phases.push(currentPhase);

        if (phases.length === 0) {
            const defaultPhases = [
                {
                    title: 'Foundation Phase',
                    weeks: 'Week 1-4',
                    topics: ['Getting started', 'Core concepts', 'Basic skills'],
                    color: colors[0]
                },
                {
                    title: 'Intermediate Phase',
                    weeks: 'Week 5-8',
                    topics: ['Advanced topics', 'Practical projects', 'Skill building'],
                    color: colors[1]
                },
                {
                    title: 'Advanced Phase',
                    weeks: 'Week 9-12',
                    topics: ['Expert level', 'Real-world applications', 'Mastery'],
                    color: colors[2]
                }
            ];
            phases.push(...defaultPhases);
        }

        return { phases, milestones };
    }, [aiResponse, structuredData]);

    const { phases, milestones } = parsedData;

    const toggleTopic = (phaseIndex: number, topicIndex: number) => {
        const key = `${phaseIndex}-${topicIndex}`;
        const newSet = new Set(expandedTopics);
        newSet.has(key) ? newSet.delete(key) : newSet.add(key);
        setExpandedTopics(newSet);
    };

    const bgClass = darkMode ? 'bg-slate-900' : 'bg-gray-50';
    const cardBg = darkMode ? 'bg-slate-800' : 'bg-white';
    const textClass = darkMode ? 'text-white' : 'text-slate-900';
    const mutedText = darkMode ? 'text-gray-400' : 'text-gray-600';
    const borderClass = darkMode ? 'border-slate-700' : 'border-gray-200';

    return (
        <div className={`${bgClass} ${textClass} rounded-2xl p-8`}>
            {/* Header */}
            <div className="mb-8 text-center">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                    🗺️ Your Learning Roadmap
                </h2>
                <p className={`${mutedText} text-sm`}>
                    {phases.length} phases • {phases.reduce((sum, p) => sum + p.topics.length, 0)} topics
                </p>
            </div>

            {/* Flowchart-style Roadmap */}
            <div className="relative">
                {/* Vertical Connection Line */}
                <div className={`absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 opacity-20 transform -translate-x-1/2`}></div>

                {/* Phases */}
                <div className="space-y-12">
                    {phases.map((phase, phaseIndex) => (
                        <div key={phaseIndex} className="relative">
                            {/* Phase Container */}
                            <div className="flex flex-col items-center">
                                {/* Phase Number Badge */}
                                <div className={`relative z-10 w-16 h-16 rounded-full bg-gradient-to-br ${phase.color} flex items-center justify-center shadow-2xl mb-6 transform transition-all duration-300 hover:scale-110`}>
                                    <span className="text-white font-bold text-2xl">{phaseIndex + 1}</span>
                                </div>

                                {/* Phase Title Card */}
                                <div
                                    className={`${cardBg} rounded-2xl border-2 ${borderClass} p-6 shadow-xl w-full max-w-2xl mx-auto transform transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer`}
                                    onClick={() => setSelectedPhase(selectedPhase === phaseIndex ? null : phaseIndex)}
                                >
                                    <div className="text-center mb-4">
                                        <h3 className={`text-2xl font-bold bg-gradient-to-r ${phase.color} bg-clip-text text-transparent mb-2`}>
                                            {phase.title}
                                        </h3>
                                        <p className={`${mutedText} text-sm font-medium`}>{phase.weeks}</p>
                                    </div>

                                    {/* Topics Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                        {phase.topics.slice(0, selectedPhase === phaseIndex ? undefined : 4).map((topic, topicIndex) => (
                                            <div
                                                key={topicIndex}
                                                className={`group relative ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'} rounded-lg p-3 border ${borderClass} transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleTopic(phaseIndex, topicIndex);
                                                }}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${phase.color} mt-2 flex-shrink-0`}></div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium leading-relaxed">{topic}</p>
                                                        {expandedTopics.has(`${phaseIndex}-${topicIndex}`) && (
                                                            <div className={`mt-2 pt-2 border-t ${borderClass}`}>
                                                                <p className={`${mutedText} text-xs`}>
                                                                    Click to learn more about this topic
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className={`text-xs ${mutedText} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                        {expandedTopics.has(`${phaseIndex}-${topicIndex}`) ? '−' : '+'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Show More Button */}
                                    {phase.topics.length > 4 && selectedPhase !== phaseIndex && (
                                        <button
                                            className={`mt-4 w-full py-2 rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors text-sm font-medium`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPhase(phaseIndex);
                                            }}
                                        >
                                            Show {phase.topics.length - 4} more topics
                                        </button>
                                    )}
                                </div>

                                {/* Connection Arrow */}
                                {phaseIndex < phases.length - 1 && (
                                    <div className="flex flex-col items-center my-6">
                                        <div className={`w-1 h-8 bg-gradient-to-b ${phase.color} opacity-50`}></div>
                                        <div className={`text-3xl ${mutedText} animate-bounce`}>↓</div>
                                        <div className={`w-1 h-8 bg-gradient-to-b ${phases[phaseIndex + 1].color} opacity-50`}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Completion Badge */}
                    <div className="flex flex-col items-center mt-12">
                        <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl mb-4 animate-pulse">
                            <span className="text-4xl">🎯</span>
                        </div>
                        <div className={`${cardBg} rounded-2xl border-2 border-green-500 p-6 shadow-xl text-center max-w-md`}>
                            <h3 className="text-2xl font-bold text-green-500 mb-2">Goal Achieved!</h3>
                            <p className={`${mutedText} text-sm`}>
                                Complete all phases to master your learning path
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Milestones Section */}
            {milestones.length > 0 && (
                <div className={`${cardBg} rounded-xl border ${borderClass} p-6 mt-12`}>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>🏆</span>
                        <span>Key Milestones</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {milestones.slice(0, 6).map((milestone, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'} border ${borderClass} transition-all duration-200 hover:shadow-lg hover:scale-105`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
                                        {milestone.week}
                                    </div>
                                    <h4 className="font-semibold text-sm">{milestone.title}</h4>
                                </div>
                                <p className={`${mutedText} text-xs leading-relaxed`}>{milestone.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Footer */}
            <div className="grid grid-cols-3 gap-4 mt-8">
                <div className={`${cardBg} rounded-xl border ${borderClass} p-4 text-center`}>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                        {phases.length}
                    </div>
                    <p className={`${mutedText} text-xs mt-1`}>Phases</p>
                </div>
                <div className={`${cardBg} rounded-xl border ${borderClass} p-4 text-center`}>
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                        {phases.reduce((sum, phase) => sum + phase.topics.length, 0)}
                    </div>
                    <p className={`${mutedText} text-xs mt-1`}>Topics</p>
                </div>
                <div className={`${cardBg} rounded-xl border ${borderClass} p-4 text-center`}>
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                        {milestones.length || phases.length * 2}
                    </div>
                    <p className={`${mutedText} text-xs mt-1`}>Milestones</p>
                </div>
            </div>
        </div>




    );
}
