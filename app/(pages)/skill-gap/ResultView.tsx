import React from 'react';
import SkillTag from '@/components/SkillTag';

interface Recommendation {
    title: string;
    platform: string;
    url: string;
}

interface ResultData {
    missingSkills: string[];
    weakSkills: string[];
    recommendedCourses: Recommendation[];
}

interface ResultViewProps {
    data: ResultData | null;
}

const ResultView: React.FC<ResultViewProps> = ({ data }) => {
    if (!data) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Analysis Results</h2>

            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Missing Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {data.missingSkills.length > 0 ? (
                            data.missingSkills.map((skill) => (
                                <SkillTag key={skill} label={skill} type="missing" />
                            ))
                        ) : (
                            <p className="text-gray-500 italic">No missing critical skills found. Great job!</p>
                        )}
                    </div>
                </div>

                {data.weakSkills.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-yellow-600 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Skills to Improve
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {data.weakSkills.map((skill) => (
                                <SkillTag key={skill} label={skill} type="weak" />
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="text-lg font-semibold text-blue-600 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        Recommended Learning Path
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {data.recommendedCourses.length > 0 ? (
                            data.recommendedCourses.map((course, idx) => (
                                <div key={idx} className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-md transition-all group">
                                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{course.title}</div>
                                    <div className="text-sm text-gray-500 mt-1">{course.platform}</div>
                                    <a href={course.url} className="text-xs text-blue-500 mt-2 inline-block hover:underline" onClick={(e) => e.preventDefault()}>View Course &rarr;</a>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic">No specific recommendations at this time.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultView;
