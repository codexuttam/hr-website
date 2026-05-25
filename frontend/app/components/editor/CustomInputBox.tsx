'use client';

import React from 'react';

interface CustomInputBoxProps {
  value: string;
  onChange: (value: string) => void;
  theme: string;
}

const CustomInputBox: React.FC<CustomInputBoxProps> = ({
  value,
  onChange,
  theme,
}) => {
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col h-full">
      <label
        id="custom-input-label"
        htmlFor="custom-input"
        className={`text-xs md:text-sm font-medium px-2 py-1.5 md:px-3 md:py-2 border-b transition-colors duration-300 ${
          isDark
            ? 'bg-gray-800 text-gray-200 border-gray-700'
            : 'bg-gray-100 text-gray-700 border-gray-300'
        }`}
      >
        Custom Input
      </label>
      <textarea
        id="custom-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter custom input here..."
        aria-label="Custom input for program"
        aria-describedby="custom-input-label"
        className={`flex-1 p-2 md:p-3 font-mono text-xs md:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation transition-colors duration-300 ${
          isDark
            ? 'bg-gray-900 text-gray-100 placeholder-gray-500'
            : 'bg-white text-gray-900 placeholder-gray-400'
        }`}
        style={{
          minHeight: '150px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        }}
      />
    </div>
  );
};

export default CustomInputBox;
