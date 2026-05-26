import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    console.log('Theme toggle clicked, current theme:', theme);
    console.log('Document classes before toggle:', document.documentElement.className);
    toggleTheme();
    // Check after a brief delay to see the change
    setTimeout(() => {
      console.log('Document classes after toggle:', document.documentElement.className);
    }, 100);
  };

  // Prevent hydration mismatch by rendering nothing until mounted
  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder to reserve space for button
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-1000 transition-all duration-200 border border-gray-200 dark:border-gray-600"
        aria-label="Toggle dark mode"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          // Moon icon for dark mode
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          // Sun icon for light mode
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </button>
      {/* Debug indicator - remove in production */}
      <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
        {theme}
      </span>
    </div>
  );
};

export default ThemeToggleButton;