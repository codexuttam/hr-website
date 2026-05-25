'use client';

import React from 'react';

interface CodePanelProps {
    code: string;
    language: string;
    currentLine: number;
}

const CodePanel: React.FC<CodePanelProps> = ({ code, language, currentLine }) => {
    const lines = code.split('\n');
    const isPseudocode = language === 'Pseudocode';

    return (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 h-full overflow-auto font-mono text-sm">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider">Algorithm Logic</h3>
                <span className="text-xs text-blue-400 font-medium px-2 py-1 bg-blue-900/30 rounded">{language}</span>
            </div>
            <div className="space-y-1">
                {lines.map((line, index) => (
                    <div
                        key={index}
                        className={`px-2 py-1 rounded transition-colors duration-200 ${isPseudocode && index + 1 === currentLine
                            ? 'bg-blue-900/50 text-blue-200 border-l-2 border-blue-500'
                            : 'text-gray-500'
                            }`}
                    >
                        <span className="mr-3 text-gray-700 select-none text-xs">{index + 1}</span>
                        <pre className="inline font-mono whitespace-pre-wrap">{line}</pre>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CodePanel;
