"use client";

import React, { useState } from 'react';
import { JOB_SKILLS_DB } from '@/lib/skill-gap/jobSkillsDB';

interface SkillFormProps {
    onAnalyze: (data: any) => void;
    setLoading: (loading: boolean) => void;
}

const SkillForm: React.FC<SkillFormProps> = ({ onAnalyze, setLoading }) => {
    const [skillsInput, setSkillsInput] = useState('');
    const [selectedRole, setSelectedRole] = useState(Object.keys(JOB_SKILLS_DB)[0]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const userSkills = skillsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

        try {
            const res = await fetch('/api/skill-gap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userSkills,
                    jobRole: selectedRole,
                }),
            });

            if (!res.ok) throw new Error('Analysis failed');

            const data = await res.json();
            onAnalyze(data);
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Enter Your Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Job Role</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 text-gray-800"
                    >
                        {Object.keys(JOB_SKILLS_DB).map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Skills (Comma Separated)</label>
                    <textarea
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        placeholder="e.g. React, Node.js, Python..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-32 bg-gray-50 text-gray-800"
                    />
                    <p className="text-xs text-gray-500 mt-2">Tip: List as many tools and technologies as you know.</p>
                </div>

                <button
                    type="submit"
                    className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-md transform hover:scale-[1.02] transition-all duration-200"
                >
                    Analyze Skill Gap
                </button>
            </form>
        </div>
    );
};

export default SkillForm;
