'use client';

import React, { useEffect, useRef } from 'react';

interface LanguageChangeDialogProps {
  isOpen: boolean;
  currentLanguage: string;
  targetLanguage: string;
  theme: 'light' | 'dark';
  onConfirm: () => void;
  onCancel: () => void;
}

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  c_cpp: 'C++',
  c: 'C',
  typescript: 'TypeScript',
  ruby: 'Ruby',
  golang: 'Go',
};

const LanguageChangeDialog: React.FC<LanguageChangeDialogProps> = ({
  isOpen,
  currentLanguage,
  targetLanguage,
  theme,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const isDark = theme === 'dark';

  // Focus management and keyboard support
  useEffect(() => {
    if (!isOpen) return;

    // Focus the confirm button when dialog opens
    confirmButtonRef.current?.focus();

    // Handle keyboard events
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        onConfirm();
      } else if (event.key === 'Tab') {
        // Focus trapping
        event.preventDefault();
        const focusableElements = [confirmButtonRef.current, cancelButtonRef.current];
        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLButtonElement);
        const nextIndex = event.shiftKey 
          ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
          : (currentIndex + 1) % focusableElements.length;
        focusableElements[nextIndex]?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  const currentLangLabel = LANGUAGE_LABELS[currentLanguage] || currentLanguage;
  const targetLangLabel = LANGUAGE_LABELS[targetLanguage] || targetLanguage;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 dialog-overlay transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        className={`w-full max-w-md rounded-lg shadow-xl dialog-content transform transition-all duration-300 ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            {/* Warning Icon */}
            <svg
              className="w-6 h-6 text-yellow-500 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2
              id="dialog-title"
              className="text-lg font-semibold"
            >
              Switch Language?
            </h2>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="px-6 py-4">
          <p
            id="dialog-description"
            className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
          >
            You have unsaved changes in your code. Switching from{' '}
            <span className="font-semibold">{currentLangLabel}</span> to{' '}
            <span className="font-semibold">{targetLangLabel}</span> will discard your current code
            and load the template for the new language.
          </p>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Do you want to continue?
          </p>
        </div>

        {/* Dialog Footer */}
        <div
          className={`px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 touch-manipulation ${
              isDark
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 active:bg-gray-500'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
            }`}
          >
            Cancel
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-all duration-200 touch-manipulation"
          >
            Switch & Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageChangeDialog;
