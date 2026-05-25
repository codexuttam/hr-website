'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggleButton from './ThemeToggleButton';
import UserProfile from './auth/UserProfile';
import { useAuth } from '../contexts/AuthContext';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { 
  ChevronDown, Menu, X, FileText, Code, Target, 
  Gamepad2, GraduationCap, Rocket, Users, BarChart, 
  Shield, Settings, Briefcase, BookOpen, UserCircle
} from 'lucide-react';

const NavLink: React.FC<{ href: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ href, children, icon }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href} 
      className={`group flex items-center gap-2 transition-all duration-200 px-3 py-2 rounded-xl text-sm font-semibold ${
        isActive 
          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-900/30 shadow-sm' 
          : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20'
      }`}
    >
      {icon && (
        <span className={`transition-colors ${
          isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'
        }`}>
          {icon}
        </span>
      )}
      {children}
    </Link>
  );
};

const MobileNavLink: React.FC<{ href: string; onClick?: () => void; children: React.ReactNode; icon?: React.ReactNode }> = ({ href, onClick, children, icon }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href} 
      onClick={onClick} 
      className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all ${
        isActive 
          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 border-l-4 border-indigo-500' 
          : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400'
      }`}
    >
      {icon && <span className={isActive ? 'text-indigo-500' : 'text-gray-400'}>{icon}</span>}
      {children}
    </Link>
  );
};

const DropdownNavLink: React.FC<{ children: React.ReactNode; isOpen: boolean; onToggle: () => void; icon?: React.ReactNode; isActive?: boolean }> = ({ children, isOpen, onToggle, icon, isActive }) => (
  <button
    onClick={onToggle}
    className={`group flex items-center gap-2 transition-colors duration-200 px-3 py-2 rounded-xl text-sm font-semibold ${
      isActive || isOpen
        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20'
        : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20'
    }`}
  >
    {icon && <span className={`${isActive || isOpen ? 'text-indigo-500' : 'text-gray-400'} group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors`}>{icon}</span>}
    {children}
    <ChevronDown className={`h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
  </button>
);

const DropdownItem: React.FC<{ href: string; onClick?: () => void; children: React.ReactNode; description?: string; icon?: React.ReactNode }> = ({ href, onClick, children, description, icon }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-start gap-3 w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
        isActive
          ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
          : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
      }`}
    >
      {icon && (
        <div className={`mt-0.5 transition-colors ${
          isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'
        }`}>
          {icon}
        </div>
      )}
      <div>
        <div className={`font-semibold transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>{children}</div>
        {description && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{description}</div>}
      </div>
    </Link>
  );
};

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [careerDropdownOpen, setCareerDropdownOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { canAccessAdmin } = useRoleAccess();
  const pathname = usePathname();
  
  const careerDropdownRef = useRef<HTMLDivElement>(null);

  const handleMobileNavClick = () => setIsOpen(false);
  const handleCareerToolClick = () => setCareerDropdownOpen(false);

  // Active state checks for dropdowns
  const isCareerActive = ['/code-playground', '/interview', '/resume-builder', '/ats-tools', '/my-resumes'].some(path => pathname.startsWith(path));
  const isAdminActive = ['/quiz/admin', '/admin', '/dashboard'].some(path => pathname.startsWith(path));


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (careerDropdownRef.current && !careerDropdownRef.current.contains(event.target as Node)) {
        setCareerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/50 dark:border-slate-800/50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300 transform group-hover:scale-105">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">EduAI</span>
            </Link>
          </div>
          
          <div className="hidden lg:block">
            <div className="ml-10 flex items-center space-x-2">
              <NavLink href="/">Home</NavLink>
              {isAuthenticated && <NavLink href="/dashboard">Dashboard</NavLink>}

              {/* Career Tools Dropdown */}
              <div className="relative" ref={careerDropdownRef}>
                <DropdownNavLink
                  isOpen={careerDropdownOpen}
                  isActive={isCareerActive}
                  onToggle={() => setCareerDropdownOpen(!careerDropdownOpen)}
                  icon={<Briefcase className="w-4 h-4" />}
                >
                  Career Tools
                </DropdownNavLink>

                {careerDropdownOpen && (
                  <div className="absolute left-0 mt-3 w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-500/10 border border-gray-200/50 dark:border-slate-700/50 z-50 p-2 animate-fade-in-up">
                    <div className="px-4 py-2 text-xs font-bold text-indigo-500 uppercase tracking-wider">Preparation</div>
                    <DropdownItem
                      href="/code-playground"
                      onClick={handleCareerToolClick}
                      description="Practice coding problems and algorithms"
                      icon={<Code className="w-5 h-5" />}
                    >
                      Coding Practice
                    </DropdownItem>
                    <DropdownItem
                      href="/interview"
                      onClick={handleCareerToolClick}
                      description="AI-powered mock interviews with real-time feedback"
                      icon={<UserCircle className="w-5 h-5" />}
                    >
                      Mock Interview
                    </DropdownItem>
                    <DropdownItem
                      href="/drives"
                      onClick={handleCareerToolClick}
                      description="Apply to latest job opportunities and placement drives"
                      icon={<Rocket className="w-5 h-5" />}
                    >
                      Placement Portal
                    </DropdownItem>

                    <div className="px-4 py-2 mt-2 text-xs font-bold text-indigo-500 uppercase tracking-wider border-t border-gray-100 dark:border-slate-800">Resume & ATS</div>
                    <DropdownItem
                      href="/resume-builder"
                      onClick={handleCareerToolClick}
                      description="Create professional resumes with multiple templates"
                      icon={<FileText className="w-5 h-5" />}
                    >
                      Resume Builder
                    </DropdownItem>
                    <DropdownItem
                      href="/ats-tools"
                      onClick={handleCareerToolClick}
                      description="Optimize your resume for Applicant Tracking Systems"
                      icon={<Target className="w-5 h-5" />}
                    >
                      ATS Tools
                    </DropdownItem>
                    {isAuthenticated && (
                      <DropdownItem
                        href="/my-resumes"
                        onClick={handleCareerToolClick}
                        description="View and manage your saved resumes"
                        icon={<FileText className="w-5 h-5" />}
                      >
                        My Resumes
                      </DropdownItem>
                    )}
                  </div>
                )}
              </div>

              <NavLink href="/games" icon={<Gamepad2 className="w-4 h-4" />}>Games</NavLink>
              <NavLink href="/alumni" icon={<Users className="w-4 h-4" />}>Alumni</NavLink>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700 ml-4">
                <ThemeToggleButton />

                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <div className="hidden xl:flex items-center px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50 rounded-lg">
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mr-1.5">Credits:</span>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        {user?.credits !== undefined ? user.credits : 0}
                      </span>
                    </div>
                    <UserProfile />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 lg:hidden">
            <ThemeToggleButton />
            {isAuthenticated && (
               <UserProfile />
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 shadow-xl overflow-y-auto max-h-[calc(100vh-5rem)]">
          <div className="px-4 pt-4 pb-8 space-y-2">
            <MobileNavLink href="/" onClick={handleMobileNavClick}>Home</MobileNavLink>
            {isAuthenticated && <MobileNavLink href="/dashboard" onClick={handleMobileNavClick}>Dashboard</MobileNavLink>}

            <div className="pt-4 pb-2">
              <div className={`px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isCareerActive ? 'text-indigo-500' : 'text-gray-400'}`}>
                <Briefcase className="w-4 h-4" /> Career Tools
              </div>
            </div>
            <div className={`space-y-1 pl-4 border-l-2 ml-6 ${isCareerActive ? 'border-indigo-500' : 'border-gray-100 dark:border-slate-800'}`}>
              <MobileNavLink href="/code-playground" onClick={handleMobileNavClick} icon={<Code className="w-5 h-5" />}>Coding Practice</MobileNavLink>
              <MobileNavLink href="/interview" onClick={handleMobileNavClick} icon={<UserCircle className="w-5 h-5" />}>Mock Interview</MobileNavLink>
              <MobileNavLink href="/drives" onClick={handleMobileNavClick} icon={<Rocket className="w-5 h-5" />}>Placement Portal</MobileNavLink>
              <MobileNavLink href="/resume-builder" onClick={handleMobileNavClick} icon={<FileText className="w-5 h-5" />}>Resume Builder</MobileNavLink>
              <MobileNavLink href="/ats-tools" onClick={handleMobileNavClick} icon={<Target className="w-5 h-5" />}>ATS Tools</MobileNavLink>
              {isAuthenticated && <MobileNavLink href="/my-resumes" onClick={handleMobileNavClick} icon={<FileText className="w-5 h-5" />}>My Resumes</MobileNavLink>}
            </div>

            <div className="pt-4 space-y-1">
              <MobileNavLink href="/games" onClick={handleMobileNavClick} icon={<Gamepad2 className="h-5 w-5" />}>Games</MobileNavLink>
              <MobileNavLink href="/alumni" onClick={handleMobileNavClick} icon={<Users className="h-5 w-5" />}>Alumni</MobileNavLink>
            </div>

            {isAuthenticated && user?.role === 'student' && (
              <MobileNavLink href="/quiz" onClick={handleMobileNavClick}>My Quizzes</MobileNavLink>
            )}


            {canAccessAdmin && (
              <>
                <div className="pt-6 pb-2 border-t border-gray-100 dark:border-slate-800 mt-6">
                  <div className={`px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isAdminActive ? 'text-indigo-500' : 'text-gray-400'}`}>
                    <Shield className="w-4 h-4" /> Admin Controls
                  </div>
                </div>
                <div className={`space-y-1 pl-4 border-l-2 ml-6 ${isAdminActive ? 'border-indigo-500' : 'border-indigo-100 dark:border-indigo-900'}`}>
                  <MobileNavLink href="/quiz/admin" onClick={handleMobileNavClick} icon={<Target className="w-5 h-5" />}>Quiz Admin</MobileNavLink>
                  <MobileNavLink href="/admin/users" onClick={handleMobileNavClick} icon={<Users className="w-5 h-5" />}>User Management</MobileNavLink>
                  <MobileNavLink href="/dashboard" onClick={handleMobileNavClick} icon={<BarChart className="w-5 h-5" />}>Admin Dashboard</MobileNavLink>
                  <MobileNavLink href="/settings" onClick={handleMobileNavClick} icon={<Settings className="w-5 h-5" />}>Global Settings</MobileNavLink>
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="pt-6 mt-6 border-t border-gray-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                <Link
                  href="/login"
                  onClick={handleMobileNavClick}
                  className="flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white px-4 py-3 rounded-xl font-semibold"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={handleMobileNavClick}
                  className="flex items-center justify-center bg-indigo-600 text-white px-4 py-3 rounded-xl font-semibold shadow-md"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
