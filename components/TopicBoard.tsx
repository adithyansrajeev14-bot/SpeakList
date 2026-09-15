'use client';

import React from 'react';
import { SpeechTopic, normalizeStudentNumber } from '@/lib/types';
import { TopicRow } from './TopicRow';
import { MicOff, Plus, User, FileText } from 'lucide-react';

interface TopicBoardProps {
  topics: SpeechTopic[];
  loading: boolean;
  currentStudentNumber: string | null;
  onEditTopic: (topic: SpeechTopic) => void;
  onDeleteTopic: (topic: SpeechTopic) => void;
  onOpenAddModal: () => void;
  searchQuery: string;
}

export const TopicBoard: React.FC<TopicBoardProps> = ({
  topics,
  loading,
  currentStudentNumber,
  onEditTopic,
  onDeleteTopic,
  onOpenAddModal,
  searchQuery,
}) => {
  const normalizedCurrent = currentStudentNumber
    ? normalizeStudentNumber(currentStudentNumber)
    : null;

  return (
    <section id="topic-board-section" className="mb-10">
      {/* Table / Board Wrapper */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        {/* DESKTOP 2-COLUMN HEADER */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <div className="md:col-span-5 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span>Student Name & Number</span>
          </div>
          <div className="md:col-span-7 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Speech Presentation Topic</span>
            </div>
            <span className="text-[11px] font-normal text-zinc-400 lowercase">
              status & actions
            </span>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="p-4 sm:p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-18 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 animate-pulse flex items-center px-4 justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  <div className="space-y-1.5">
                    <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-700 rounded-sm" />
                    <div className="w-20 h-3 bg-zinc-200 dark:bg-zinc-700 rounded-sm" />
                  </div>
                </div>
                <div className="w-48 h-4 bg-zinc-200 dark:bg-zinc-700 rounded-sm hidden sm:block" />
              </div>
            ))}
          </div>
        )}

        {/* TOPIC ROWS LIST */}
        {!loading && topics.length > 0 && (
          <div id="topics-list-container" className="p-3 sm:p-4 space-y-2.5">
            {topics.map((topic, index) => {
              const rowNormalized = normalizeStudentNumber(topic.studentNumber || topic.userId || '');
              const isOwner = Boolean(normalizedCurrent && rowNormalized === normalizedCurrent);

              return (
                <TopicRow
                  key={topic.id}
                  topic={topic}
                  index={index}
                  isOwner={isOwner}
                  onEdit={onEditTopic}
                  onDelete={onDeleteTopic}
                />
              );
            })}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && topics.length === 0 && (
          <div id="topic-board-empty" className="py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mx-auto mb-4">
              <MicOff className="w-7 h-7" />
            </div>
            {searchQuery ? (
              <>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                  No matching speech topics found
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-4">
                  No registered presentation topics or students match &ldquo;{searchQuery}&rdquo;. Try another search term.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                  No topics registered yet.
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-5">
                  Be the first student to choose a speech topic.
                </p>
                <button
                  id="empty-add-topic-btn"
                  onClick={onOpenAddModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add Your Topic
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
