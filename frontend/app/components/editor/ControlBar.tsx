'use client';

import React from 'react';

interface ControlBarProps {
  activeTab: 'program' | 'debug';
  language: string;
  theme: string;
  isRunning?: boolean;
  onTabChange: (tab: 'program' | 'debug') => void;
  onLanguageChange: (language: string) => void;
  onThemeToggle: () => void;
  onRun?: () => void;
  onIncreaseEditor?: () => void;
  onDecreaseEditor?: () => void;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c_cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'golang', label: 'Go' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'rust', label: 'Rust' },
  { value: 'scala', label: 'Scala' },
  { value: 'perl', label: 'Perl' },
  { value: 'r', label: 'R' },
  { value: 'haskell', label: 'Haskell' },
  { value: 'lua', label: 'Lua' },
  { value: 'dart', label: 'Dart' },
  { value: 'elixir', label: 'Elixir' },
  { value: 'clojure', label: 'Clojure' },
  { value: 'fsharp', label: 'F#' },
  { value: 'groovy', label: 'Groovy' },
  { value: 'objectivec', label: 'Objective-C' },
  { value: 'pascal', label: 'Pascal' },
  { value: 'fortran', label: 'Fortran' },
  { value: 'assembly_x86', label: 'Assembly (x86)' },
  { value: 'cobol', label: 'COBOL' },
  { value: 'lisp', label: 'Common Lisp' },
  { value: 'd', label: 'D' },
  { value: 'erlang', label: 'Erlang' },
  { value: 'ocaml', label: 'OCaml' },
  { value: 'prolog', label: 'Prolog' },
  { value: 'sql', label: 'SQL' },
  { value: 'vbscript', label: 'VB.NET' },
];

const ControlBar: React.FC<ControlBarProps> = ({
  activeTab,
  language,
  theme,
  isRunning = false,
  onTabChange,
  onLanguageChange,
  onThemeToggle,
  onRun,
  onIncreaseEditor,
  onDecreaseEditor,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 md:px-4 md:py-2 border-b transition-colors duration-300 ${
        isDark
          ? 'bg-gray-800 border-gray-700'
          : 'bg-gray-100 border-gray-300'
      }`}
    >
      {/* Left: Program Tab + Language Selector */}
      <div className="flex gap-2 items-center" role="tablist" aria-label="Code editor modes">
        <button
          onClick={() => onTabChange('program')}
          role="tab"
          aria-selected={activeTab === 'program'}
          aria-controls="editor-panel"
          aria-label="Program tab"
          tabIndex={activeTab === 'program' ? 0 : -1}
          className={`px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium transition-colors touch-manipulation ${
            activeTab === 'program'
              ? isDark
                ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                : 'bg-white text-gray-900 border-b-2 border-blue-500'
              : isDark
              ? 'bg-transparent text-gray-400 hover:bg-gray-700 active:bg-gray-600 hover:text-gray-200'
              : 'bg-transparent text-gray-600 hover:bg-gray-200 active:bg-gray-300 hover:text-gray-900'
          }`}
        >
          Program
        </button>
        
        {/* Language Selector in place of Debug tab */}
        <div className="flex items-center">
          <label htmlFor="language-selector" className="sr-only">
            Select programming language
          </label>
          <select
            id="language-selector"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Select programming language"
            className={`px-2 py-1.5 md:px-3 md:py-1.5 text-xs md:text-sm rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation ${
              isDark
                ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600'
                : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value + lang.label} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Run Button + Resize Controls */}
      <div className="flex items-center gap-2">
        {/* Run Button */}
        {onRun && (
          <button
            onClick={onRun}
            disabled={isRunning}
            aria-label="Run code"
            title="Run (Ctrl+Enter)"
            className={`px-3 py-1.5 rounded text-xs md:text-sm font-medium transition-colors touch-manipulation flex items-center gap-1 ${
              isRunning
                ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                : isDark
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Running
              </>
            ) : (
              <>
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Run
              </>
            )}
          </button>
        )}

        {/* Resize Controls */}
        {onIncreaseEditor && onDecreaseEditor && (
          <div className="flex items-center gap-1">
            <button
              onClick={onDecreaseEditor}
              aria-label="Decrease editor size"
              title="Decrease editor size"
              className={`p-1.5 rounded transition-colors touch-manipulation ${
                isDark
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 active:bg-gray-500'
                  : 'bg-white text-gray-700 hover:bg-gray-200 active:bg-gray-300 border border-gray-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={onIncreaseEditor}
              aria-label="Increase editor size"
              title="Increase editor size"
              className={`p-1.5 rounded transition-colors touch-manipulation ${
                isDark
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 active:bg-gray-500'
                  : 'bg-white text-gray-700 hover:bg-gray-200 active:bg-gray-300 border border-gray-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Right: Theme Toggle */}
      <button
        onClick={onThemeToggle}
        aria-label="Toggle theme"
        aria-pressed={isDark}
        title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        className={`p-1.5 md:p-2 rounded transition-colors touch-manipulation ${
          isDark
            ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600 active:bg-gray-500'
            : 'bg-white text-gray-700 hover:bg-gray-200 active:bg-gray-300'
        }`}
      >
        {isDark ? (
          // Sun icon for light mode
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="md:w-5 md:h-5"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          // Moon icon for dark mode
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="md:w-5 md:h-5"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ControlBar;
