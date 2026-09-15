'use client';

import React from 'react';
import { SpeechTopic, getInitials, formatTopicDate } from '@/lib/types';
import { Edit3, CheckCircle, Calendar, User, Trash2 } from 'lucide-react';

interface TopicRowProps {
  topic: SpeechTopic;
  isOwner: boolean;
  onEdit: (topic: SpeechTopic) => void;
  onDelete?: (topic: SpeechTopic) => void;
  index: number;
}

// Consistent background color palette for student avatar circles
const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
  'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300',
];

export const TopicRow: React.FC<TopicRowProps> = ({
  topic,
  isOwner,
  onEdit,
  onDelete,
  index,
}) => {
  const colorIndex = Math.abs(topic.studentName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % AVATAR_COLORS.length;
  const avatarColorClass = AVATAR_COLORS[colorIndex];

  return (
    <div
      id={`topic-row-${topic.id}`}
      className={`group relative rounded-xl transition-all duration-200 border ${
        isOwner
          ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/80 shadow-xs'
          : index % 2 === 0
          ? 'bg-white dark:bg-zinc-900/90 border-zinc-200/80 dark:border-zinc-800/80'
          : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60'
      } hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm`}
    >
      {/* 2-Column Responsive Layout:
          Desktop: Grid with 2 columns (Column 1: Student Name, Column 2: Speech Topic)
          Mobile: Stacked card preserving rich typography and no horizontal scroll */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 p-4 sm:p-5 items-center">
        {/* COLUMN 1: STUDENT NAME (Left column, 5 cols on md) */}
        <div className="md:col-span-5 flex items-center gap-3.5 min-w-0">
          {/* Avatar / Initials */}
          <div className="shrink-0 relative">
            {topic.studentPhotoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={topic.studentPhotoURL}
                alt={topic.studentName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-zinc-800 shadow-xs"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-zinc-800 ${avatarColorClass}`}
              >
                {getInitials(topic.studentName)}
              </div>
            )}
            {isOwner && (
              <span
                title="Your Registration"
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-zinc-900 flex items-center justify-center"
              >
                <User className="w-2 h-2 text-white" />
              </span>
            )}
          </div>

          {/* Student Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                id={`student-name-${topic.id}`}
                className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight truncate"
              >
                {topic.studentName}
              </span>

              {isOwner && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  You
                </span>
              )}

              {topic.section && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  {topic.section}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              <Calendar className="w-3 h-3" />
              <span>{formatTopicDate(topic.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* COLUMN 2: SPEECH TOPIC (Right column, 7 cols on md) */}
        <div className="md:col-span-7 flex items-start sm:items-center justify-between gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800/80">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 md:hidden">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Speech Topic
              </span>
            </div>
            <h4
              id={`speech-topic-${topic.id}`}
              className="text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-100 leading-snug break-words"
            >
              {topic.topic}
            </h4>
          </div>

          {/* Right actions & Badges */}
          <div className="shrink-0 flex items-center gap-2 self-center">
            {/* Status Badge */}
            <span
              id={`status-badge-${topic.id}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80"
            >
              <CheckCircle className="w-3 h-3" />
              <span className="hidden sm:inline">Claimed</span>
            </span>

            {/* Owner controls: Edit and Delete buttons ONLY shown if row belongs to current user */}
            {isOwner && (
              <div className="flex items-center gap-1 ml-1">
                <button
                  id={`edit-topic-btn-${topic.id}`}
                  onClick={() => onEdit(topic)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition active:scale-95 shadow-2xs"
                  aria-label="Edit your speech topic"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {onDelete && (
                  <button
                    id={`delete-topic-btn-${topic.id}`}
                    onClick={() => onDelete(topic)}
                    title="Withdraw topic"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    aria-label="Withdraw your speech topic"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
