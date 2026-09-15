'use client';

import React from 'react';
import { Users, FileText, CheckCircle2 } from 'lucide-react';
import { SpeechTopic } from '@/lib/types';

interface StatsCardsProps {
  topics: SpeechTopic[];
  loading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ topics, loading }) => {
  const totalStudents = topics.length;
  // Unique normalized topics
  const uniqueTopicsCount = new Set(topics.map((t) => t.normalizedTopic)).size;

  return (
    <section id="stats-section" className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1: Total Students */}
        <div
          id="stat-card-students"
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-4 transition hover:border-zinc-300 dark:hover:border-zinc-700"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/60">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Total Students Registered
            </p>
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {loading ? (
                <span className="inline-block w-12 h-7 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-md" />
              ) : (
                `${totalStudents} ${totalStudents === 1 ? 'Student' : 'Students'}`
              )}
            </h3>
          </div>
        </div>

        {/* Stat 2: Total Topics Taken */}
        <div
          id="stat-card-topics"
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-4 transition hover:border-zinc-300 dark:hover:border-zinc-700"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Total Topics Taken
            </p>
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {loading ? (
                <span className="inline-block w-12 h-7 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-md" />
              ) : (
                `${uniqueTopicsCount} ${uniqueTopicsCount === 1 ? 'Topic' : 'Topics'}`
              )}
            </h3>
          </div>
        </div>

        {/* Stat 3: Registration Status */}
        <div
          id="stat-card-status"
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-4 transition hover:border-zinc-300 dark:hover:border-zinc-700"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/60">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Available Topic Status
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                Live Registration
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
