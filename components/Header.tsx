'use client';

import React from 'react';
import {
  Mic,
  Moon,
  Sun,
  Plus,
  BookOpen,
  UserCheck,
  RotateCcw,
} from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  registeredStudentName?: string;
  registeredStudentNumber?: string;
  onOpenAddModal: () => void;
  onOpenEditMyTopic?: () => void;
  onClearSavedStudent?: () => void;
  onOpenSetupGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  registeredStudentName,
  registeredStudentNumber,
  onOpenAddModal,
  onOpenEditMyTopic,
  onClearSavedStudent,
  onOpenSetupGuide,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 border-b border-zinc-200 dark:border-zinc-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25 shrink-0">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-white">
                SpeakList
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                Class Portal
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden xs:block">
              Speech Topic Registration
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Registered student status pill */}
          {registeredStudentName && (
            <div className="flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <button
                onClick={onOpenEditMyTopic}
                className="font-medium text-emerald-900 dark:text-emerald-200 hover:underline max-w-[120px] sm:max-w-[160px] truncate text-left"
                title={`Registered as ${registeredStudentName} (${registeredStudentNumber})`}
              >
                {registeredStudentName}
              </button>
              {onClearSavedStudent && (
                <button
                  onClick={onClearSavedStudent}
                  title="Switch or reset device student session"
                  className="p-0.5 rounded-full hover:bg-emerald-200/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 transition"
                  aria-label="Switch student"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Add topic CTA in navbar */}
          <button
            id="nav-add-topic-btn"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-xs hover:shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Register Topic</span>
            <span className="xs:hidden">Register</span>
          </button>

          {/* Setup Guide Dialog Button */}
          <button
            id="setup-guide-btn"
            onClick={onOpenSetupGuide}
            title="Setup & Rules Guide"
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Setup guide"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Dark/Light mode toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
