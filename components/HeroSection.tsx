'use client';

import React from 'react';
import { Plus, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface HeroSectionProps {
  onOpenAddModal: () => void;
  hasUserRegistered: boolean;
  onScrollToMyTopic: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenAddModal,
  hasUserRegistered,
  onScrollToMyTopic,
}) => {
  return (
    <section id="hero-section" className="pt-10 pb-8 sm:pt-14 sm:pb-10 text-center relative overflow-hidden">
      {/* Subtle background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Subtle pill indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/80 mb-5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Speech Presentation Registration</span>
          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Enter Name & Number</span>
        </div>

        {/* Main Heading */}
        <h1
          id="hero-heading"
          className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4"
        >
          Class Speech Topics
        </h1>

        {/* Subheading */}
        <p
          id="hero-subheading"
          className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed mb-8"
        >
          Choose your topic. Make it yours. Keep the class organized.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            id="hero-add-topic-btn"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-md hover:shadow-lg shadow-indigo-600/20 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>+ Add Your Topic</span>
          </button>

          {hasUserRegistered && (
            <button
              id="hero-view-my-topic-btn"
              onClick={onScrollToMyTopic}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xs transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>View / Edit My Topic</span>
            </button>
          )}
        </div>

        {/* Micro highlights */}
        <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto mt-8 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Lock</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Protected by Number</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Excel Export</span>
          </div>
        </div>
      </div>
    </section>
  );
};
