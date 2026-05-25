'use client';

import React, { useEffect, useRef } from 'react';

interface OutputConsoleProps {
  output: string;
  theme: string;
}

const OutputConsole: React.FC<OutputConsoleProps> = ({ output, theme }) => {
  const consoleRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [output]);

  // Highlight error lines (lines containing "Error" or "❌")
  const formatOutput = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, index) => {
      const isError = line.includes('Error') || line.includes('❌');
      return (
        <div
          key={index}
          className={isError ? 'text-red-500' : ''}
        >
          {line}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      <label
        id="output-console-label"
        className={`text-xs md:text-sm font-medium px-2 py-1.5 md:px-3 md:py-2 border-b transition-colors duration-300 ${
          isDark
            ? 'bg-gray-800 text-gray-200 border-gray-700'
            : 'bg-gray-100 text-gray-700 border-gray-300'
        }`}
      >
        Output
      </label>
      <div
        ref={consoleRef}
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Program output console"
        aria-describedby="output-console-label"
        className={`flex-1 p-2 md:p-3 font-mono text-xs md:text-sm overflow-auto transition-colors duration-300 ${
          isDark
            ? 'bg-gray-900 text-gray-100'
            : 'bg-white text-gray-900'
        }`}
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        }}
      >
        {output ? (
          <pre className="whitespace-pre-wrap break-words m-0">
            {formatOutput(output)}
          </pre>
        ) : (
          <div className="text-gray-500 italic text-xs md:text-sm">
            Output will appear here...
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;
