import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import RoleBadge from '../ui/RoleBadge';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
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
    try {
      setShowProfile(false);
      await logout();
      // Use window.location.href to force a full page refresh and clear any client-side state
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout handler error:', error);
      window.location.href = '/login';
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
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-2">
              <RoleBadge role={user.role} size="sm" />
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
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;