'use client';

import React, { useState } from 'react';
import { X, AlertCircle, Loader2, Sparkles, Hash, User, FileText, Bookmark } from 'lucide-react';
import { SpeechTopic, normalizeTopic, normalizeStudentNumber } from '@/lib/types';

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTopics: SpeechTopic[];
  defaultStudentName?: string;
  defaultStudentNumber?: string;
  onSubmitTopic: (data: {
    studentName: string;
    studentNumber: string;
    topic: string;
    section?: string;
  }) => Promise<void>;
}

const AddTopicModalDialog: React.FC<Omit<AddTopicModalProps, 'isOpen'>> = ({
  onClose,
  existingTopics,
  defaultStudentName = '',
  defaultStudentNumber = '',
  onSubmitTopic,
}) => {
  const [studentName, setStudentName] = useState(defaultStudentName);
  const [studentNumber, setStudentNumber] = useState(defaultStudentNumber);
  const [topic, setTopic] = useState('');
  const [section, setSection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Real-time duplicate topic check
  const normalizedTypedTopic = normalizeTopic(topic);
  const matchedDuplicateTopic =
    normalizedTypedTopic.length > 2
      ? existingTopics.find((t) => t.normalizedTopic === normalizedTypedTopic)
      : null;

  // Real-time student number already registered check
  const normalizedTypedNumber = normalizeStudentNumber(studentNumber);
  const matchedExistingNumber =
    normalizedTypedNumber.length > 2
      ? existingTopics.find(
          (t) => normalizeStudentNumber(t.studentNumber || t.userId || '') === normalizedTypedNumber
        )
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = studentName.trim();
    const trimmedNumber = studentNumber.trim();
    const trimmedTopic = topic.trim();

    if (!trimmedName) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!trimmedNumber) {
      setFormError('Please enter your student / phone / roll number.');
      return;
    }
    if (!trimmedTopic) {
      setFormError('Please enter your speech presentation topic.');
      return;
    }

    if (matchedDuplicateTopic) {
      setFormError(
        `This topic is already taken by ${matchedDuplicateTopic.studentName}. Please choose another one.`
      );
      return;
    }

    if (matchedExistingNumber) {
      setFormError(
        `A topic has already been registered with number "${trimmedNumber}" by ${matchedExistingNumber.studentName}. Each student can register one topic. You can edit your existing topic on the board.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitTopic({
        studentName: trimmedName,
        studentNumber: trimmedNumber,
        topic: trimmedTopic,
        section: section.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register topic. Please try again.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="add-topic-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="add-topic-modal"
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Register Speech Topic
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Enter your name and number to lock in your topic
              </p>
            </div>
          </div>
          <button
            id="close-add-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="student-full-name-input"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>Student Full Name</span>
                <span className="text-rose-500">*</span>
              </span>
            </label>
            <input
              id="student-full-name-input"
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
            />
          </div>

          {/* Student / Phone / Roll Number */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="student-number-input"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Student Number / Phone Number</span>
                  <span className="text-rose-500">*</span>
                </span>
              </label>
              <span className="text-[11px] text-zinc-400">
                Used to verify & edit your topic
              </span>
            </div>
            <input
              id="student-number-input"
              type="text"
              required
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              placeholder="e.g. 9876543210 or CS-2024-042"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                matchedExistingNumber
                  ? 'border-amber-400 dark:border-amber-600 focus:ring-amber-500/50'
                  : 'border-zinc-300 dark:border-zinc-700 focus:ring-indigo-500/50 focus:border-indigo-500'
              } bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 transition`}
            />
            {matchedExistingNumber && (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                This number already has a registered topic ({matchedExistingNumber.topic}).
              </p>
            )}
          </div>

          {/* Speech Presentation Topic */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="speech-topic-input"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Speech Presentation Topic</span>
                  <span className="text-rose-500">*</span>
                </span>
              </label>
              <span className="text-[11px] text-zinc-400">
                Must be unique in class
              </span>
            </div>
            <textarea
              id="speech-topic-input"
              required
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Impact of Artificial Intelligence on Climate Modeling"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                matchedDuplicateTopic
                  ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500/50'
                  : 'border-zinc-300 dark:border-zinc-700 focus:ring-indigo-500/50 focus:border-indigo-500'
              } bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 transition resize-none`}
            />

            {/* Instant Duplicate Warning */}
            {matchedDuplicateTopic && (
              <div className="mt-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    Topic already registered
                  </h5>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                    Someone in your class has already claimed this topic ({matchedDuplicateTopic.studentName}). Please choose another topic.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Optional Class / Section */}
          <div>
            <label
              htmlFor="speech-section-input"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              <span className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-zinc-400" />
                <span>Class / Section / Batch</span>
                <span className="text-xs font-normal text-zinc-400">(Optional)</span>
              </span>
            </label>
            <input
              id="speech-section-input"
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. Section B, Batch 2024, or Period 4"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
            />
          </div>

          {/* Form Error */}
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              id="cancel-add-topic-btn"
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              id="submit-register-topic-btn"
              type="submit"
              disabled={isSubmitting || Boolean(matchedDuplicateTopic) || Boolean(matchedExistingNumber)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register Topic</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AddTopicModal: React.FC<AddTopicModalProps> = ({ isOpen, ...props }) => {
  if (!isOpen) return null;
  return <AddTopicModalDialog {...props} />;
};
