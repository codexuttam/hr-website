import React from 'react';

interface SkillTagProps {
    label: string;
    type?: 'missing' | 'weak' | 'present' | 'neutral';
}

const SkillTag: React.FC<SkillTagProps> = ({ label, type = 'neutral' }) => {
    const styles = {
        missing: 'bg-red-100 text-red-700 border-red-200',
        weak: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        present: 'bg-green-100 text-green-700 border-green-200',
        neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[type]} inline-flex items-center gap-1`}>
            {label}
        </span>
    );
};

export default SkillTag;
