'use client';

import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  Mic,
  Moon,
  Sun,
  LogIn,
  LogOut,
  User as UserIcon,
  HelpCircle,
  Plus,
  Radio,
  ChevronDown,
} from 'lucide-react';
import { getInitials } from '@/lib/types';

interface HeaderProps {
  currentUser: User | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSignInWithGoogle: () => void;
  onQuickStudentSignIn: (name: string, email: string) => void;
  onSignOut: () => void;
  onOpenAddModal: () => void;
  onOpenSetupGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  theme,
  onToggleTheme,
  onSignInWithGoogle,
  onQuickStudentSignIn,
  onSignOut,
  onOpenAddModal,
  onOpenSetupGuide,
}) => {
  const [showQuickAuthModal, setShowQuickAuthModal] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    const email = quickEmail.trim() || `${quickName.toLowerCase().replace(/\s+/g, '')}@college.edu`;
    onQuickStudentSignIn(quickName.trim(), email);
    setShowQuickAuthModal(false);
    setQuickName('');
    setQuickEmail('');
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div
            id="brand-logo-container"
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5"
          >
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span id="brand-title" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                SpeakList
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live class topic board
              </span>
            </div>
            <p id="brand-tagline" className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              One Class. One Topic. No Confusion.
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Add topic shortcut */}
          <button
            id="header-add-topic-btn"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">+ Add Your Topic</span>
            <span className="xs:hidden">Add</span>
          </button>

          {/* Setup / Instructions guide */}
          <button
            id="header-guide-btn"
            onClick={onOpenSetupGuide}
            title="Setup & Deployment Guide"
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition border border-zinc-200/60 dark:border-zinc-800"
            aria-label="Setup guide"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Theme toggle */}
          <button
            id="header-theme-toggle"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition border border-zinc-200/60 dark:border-zinc-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-700" />}
          </button>

          {/* User Auth Section */}
          {currentUser ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
              >
                {currentUser.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Student'}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-300 dark:ring-zinc-700"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                    {getInitials(currentUser.displayName || currentUser.email || 'Student')}
                  </div>
                )}
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 max-w-[90px] truncate hidden md:inline-block">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || 'Student'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs text-zinc-400">Signed in as</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                        {currentUser.displayName || 'Student'}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {currentUser.email || 'No email provided'}
                      </p>
                    </div>

                    <button
                      id="dropdown-signout-btn"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                id="header-google-signin-btn"
                onClick={onSignInWithGoogle}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="hidden sm:inline">Sign In with Google</span>
                <span className="sm:hidden">Sign In</span>
              </button>

              {/* Quick test student sign-in fallback (especially helpful in iframe environments) */}
              <button
                id="quick-student-signin-btn"
                onClick={() => setShowQuickAuthModal(true)}
                title="Sign in with Student Name (Direct / Preview fallback)"
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <UserIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Student Sign-in Modal (for test environments & classroom convenience) */}
      {showQuickAuthModal && (
        <div
          id="quick-auth-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div
            id="quick-auth-modal"
            className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Sign In as Student
              </h3>
              <button
                onClick={() => setShowQuickAuthModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
              Sign in quickly using your student name or Google account. Ideal for testing multiple student registrations in your browser!
            </p>

            <button
              onClick={() => {
                setShowQuickAuthModal(false);
                onSignInWithGoogle();
              }}
              className="w-full mb-3 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              Sign in with Google Account
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-zinc-900 text-zinc-400">or enter student name</span>
              </div>
            </div>

            <form onSubmit={handleQuickSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="e.g. Adithyan S Rajeev"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  College Email (Optional)
                </label>
                <input
                  type="email"
                  value={quickEmail}
                  onChange={(e) => setQuickEmail(e.target.value)}
                  placeholder="e.g. student@college.edu"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAuthModal(false)}
                  className="flex-1 py-2 px-3 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
