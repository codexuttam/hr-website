import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ThemeToggleButton from './ThemeToggleButton';
import UserProfile from './auth/UserProfile';
import { useAuth } from '../contexts/AuthContext';
import { useRoleAccess } from '../hooks/useRoleAccess';

const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <Link href={href} className="text-gray-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium">
    {children}
  </Link>
);

const MobileNavLink: React.FC<{ href: string; onClick?: () => void; children: React.ReactNode }> = ({ href, onClick, children }) => (
  <Link href={href} onClick={onClick} className="text-left w-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium">
    {children}
  </Link>
);

const DropdownNavLink: React.FC<{ children: React.ReactNode; isOpen: boolean; onToggle: () => void }> = ({ children, isOpen, onToggle }) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className="flex items-center text-gray-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
    >
      {children}
      <svg className={`ml-1 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>
);

const DropdownItem: React.FC<{ href: string; onClick?: () => void; children: React.ReactNode; description?: string }> = ({ href, onClick, children, description }) => (
  <Link
    href={href}
    onClick={onClick}
    className="block w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
  >
    <div className="font-medium">{children}</div>
    {description && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</div>}
  </Link>
);

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [resumeDropdownOpen, setResumeDropdownOpen] = useState(false);
  const [placementDropdownOpen, setPlacementDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { canAccessAdmin, canPostJobs, canMentorStudents } = useRoleAccess();
  const resumeDropdownRef = useRef<HTMLDivElement>(null);
  const placementDropdownRef = useRef<HTMLDivElement>(null);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  const handleMobileNavClick = () => {
    setIsOpen(false);
  }

  const handleResumeBuilderClick = () => {
    setResumeDropdownOpen(false);
  }

  const handlePlacementPrepClick = () => {
    setPlacementDropdownOpen(false);
  }

  const handleAdminClick = () => {
    setAdminDropdownOpen(false);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resumeDropdownRef.current && !resumeDropdownRef.current.contains(event.target as Node)) {
        setResumeDropdownOpen(false);
      }
      if (placementDropdownRef.current && !placementDropdownRef.current.contains(event.target as Node)) {
        setPlacementDropdownOpen(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setAdminDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-slate-900 dark:text-white">EduAI</Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              <NavLink href="/">Home</NavLink>
              {isAuthenticated && <NavLink href="/dashboard">Dashboard</NavLink>}

              {/* Resume & ATS Dropdown */}
              <div className="relative" ref={resumeDropdownRef}>
                <DropdownNavLink
                  isOpen={resumeDropdownOpen}
                  onToggle={() => setResumeDropdownOpen(!resumeDropdownOpen)}
                >
                  Resume & ATS
                </DropdownNavLink>

                {resumeDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-1">
                      <DropdownItem
                        href="/resume-builder"
                        onClick={handleResumeBuilderClick}
                        description="Create professional resumes with multiple templates"
                      >
                        Resume Builder
                      </DropdownItem>
                      <DropdownItem
                        href="/ats-tools"
                        onClick={handleResumeBuilderClick}
                        description="Optimize your resume for Applicant Tracking Systems"
                      >
                        ATS Tools
                      </DropdownItem>
                      {isAuthenticated && (
                        <DropdownItem
                          href="/my-resumes"
                          onClick={handleResumeBuilderClick}
                          description="View and manage your saved resumes"
                        >
                          My Resumes
                        </DropdownItem>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Placement Prep Dropdown */}
              <div className="relative" ref={placementDropdownRef}>
                <DropdownNavLink
                  isOpen={placementDropdownOpen}
                  onToggle={() => setPlacementDropdownOpen(!placementDropdownOpen)}
                >
                  Placement Prep
                </DropdownNavLink>

                {placementDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-1">

                      <DropdownItem
                        href="/code-playground"
                        description="Practice coding problems and algorithms"
                      >
                        💻 Coding Practice
                      </DropdownItem>
                      <DropdownItem
                        href="/interview"
                        onClick={handlePlacementPrepClick}
                        description="AI-powered mock interviews with real-time feedback"
                      >
                        🎯 Mock Interview
                      </DropdownItem>

                    </div>
                  </div>
                )}
              </div>

              <NavLink href="/alumni">Alumni</NavLink>
              <NavLink href="/drives">Drives</NavLink>

              <NavLink href="#">Games</NavLink>
              <div className="ml-4 flex items-center space-x-3">
                <ThemeToggleButton />
                {isAuthenticated ? (
                  <UserProfile />
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-gray-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="-mr-2 flex items-center md:hidden">
            <ThemeToggleButton />
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="ml-2 bg-gray-100 dark:bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <MobileNavLink href="/" onClick={handleMobileNavClick}>Home</MobileNavLink>
            {isAuthenticated && <MobileNavLink href="/dashboard" onClick={handleMobileNavClick}>Dashboard</MobileNavLink>}

            {/* Resume & ATS Section */}
            <div className="px-3 py-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resume & ATS</div>
            </div>
            <div className="ml-4 space-y-1">
              <MobileNavLink href="/resume-builder" onClick={handleMobileNavClick}>Resume Builder</MobileNavLink>
              <MobileNavLink href="/ats-tools" onClick={handleMobileNavClick}>ATS Tools</MobileNavLink>
              {isAuthenticated && (
                <MobileNavLink href="/my-resumes" onClick={handleMobileNavClick}>My Resumes</MobileNavLink>
              )}
            </div>

            {/* Placement Prep Section */}
            <div className="px-3 py-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Placement Prep</div>
            </div>
            <div className="ml-4 space-y-1">
              <MobileNavLink href="/code-playground" onClick={handleMobileNavClick}>💻 Coding Practice</MobileNavLink>
              <MobileNavLink href="/interview" onClick={handleMobileNavClick}>🎯 Mock Interview</MobileNavLink>
              <MobileNavLink href="#" onClick={handleMobileNavClick}>🧮 Aptitude Tests</MobileNavLink>
            </div>

            <MobileNavLink href="/alumni" onClick={handleMobileNavClick}>🎓 Alumni</MobileNavLink>
            <MobileNavLink href="/drives" onClick={handleMobileNavClick}>🚀 Placement Drives</MobileNavLink>

            {/* Quiz Link - For students */}
            {isAuthenticated && user?.role === 'student' && (
              <MobileNavLink href="/quiz" onClick={handleMobileNavClick}>📚 My Quizzes</MobileNavLink>
            )}

            {/* Quiz Admin - For admins */}
            {canAccessAdmin && (
              <MobileNavLink href="/quiz/admin" onClick={handleMobileNavClick}>🎯 Quiz Admin</MobileNavLink>
            )}

            {/* Admin Section - Only for admins */}
            {canAccessAdmin && (
              <>
                <div className="px-3 py-2">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin</div>
                </div>
                <div className="ml-4 space-y-1">
                  <MobileNavLink href="/admin/users" onClick={handleMobileNavClick}>👥 User Management</MobileNavLink>
                  <MobileNavLink href="/admin/analytics" onClick={handleMobileNavClick}>📊 Analytics</MobileNavLink>
                  <MobileNavLink href="/admin/content" onClick={handleMobileNavClick}>🛡️ Content Moderation</MobileNavLink>
                  <MobileNavLink href="/admin/settings" onClick={handleMobileNavClick}>⚙️ Settings</MobileNavLink>
                </div>
              </>
            )}

            <MobileNavLink href="#" onClick={handleMobileNavClick}>Games</MobileNavLink>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;