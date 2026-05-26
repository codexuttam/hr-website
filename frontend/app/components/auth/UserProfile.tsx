import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import RoleBadge from '../ui/RoleBadge';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      setShowProfile(false);
      await logout();
      // Replace history entry so back button doesn't return to protected page
      router.replace('/login');
    } catch (error) {
      console.error('Logout handler error:', error);
      // Force hard redirect as fallback
      window.location.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowProfile(!showProfile)}
        className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden md:block font-medium">{user.name}</span>
      </button>

      {showProfile && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{user.name}</h3>
                {/* <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p> */}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <RoleBadge role={user.role} size="sm" />
              <div className="flex items-center px-2 py-1 bg-gray-100 dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-md text-xs">
                 <span className="font-medium text-black dark:text-gray-400 mr-1.5">Credits:</span>
                 <span className="font-bold text-black dark:text-white">{user.credits !== undefined ? user.credits : 0}</span>
              </div>
            </div>
          </div>

          <div className="p-2">
            <Link
              href="/profile"
              onClick={() => setShowProfile(false)}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
            >
              Edit Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setShowProfile(false)}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
            >
              Settings
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setShowProfile(false)}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
            >
              Dashboard
            </Link>
            <hr className="my-1 border-gray-200 dark:border-slate-700" />
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isLoggingOut ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing out...
                </>
              ) : (
                'Logout'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;