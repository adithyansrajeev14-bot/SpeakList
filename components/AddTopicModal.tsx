'use client';

import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { X, AlertCircle, Loader2, Sparkles, LogIn } from 'lucide-react';
import { SpeechTopic, normalizeTopic } from '@/lib/types';

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  existingTopics: SpeechTopic[];
  onSignInRequired: () => void;
  onSubmitTopic: (data: {
    studentName: string;
    topic: string;
    section?: string;
  }) => Promise<void>;
}

const AddTopicModalDialog: React.FC<Omit<AddTopicModalProps, 'isOpen'>> = ({
  onClose,
  currentUser,
  existingTopics,
  onSignInRequired,
  onSubmitTopic,
}) => {
  const [studentName, setStudentName] = useState(currentUser?.displayName || '');
  const [topic, setTopic] = useState('');
  const [section, setSection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Real-time client duplicate check
  const normalizedTypedTopic = normalizeTopic(topic);
  const matchedDuplicate =
    normalizedTypedTopic.length > 2
      ? existingTopics.find((t) => t.normalizedTopic === normalizedTypedTopic)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!currentUser) {
      onSignInRequired();
      return;
    }

    const trimmedName = studentName.trim();
    const trimmedTopic = topic.trim();

    if (!trimmedName) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!trimmedTopic) {
      setFormError('Please enter your speech presentation topic.');
      return;
    }

    if (matchedDuplicate) {
      setFormError(
        'Someone in your class has already registered this topic. Please choose another one.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitTopic({
        studentName: trimmedName,
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
                Register Your Speech Topic
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Lock in your presentation topic for the class board
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

        {/* Not Signed In Banner */}
        {!currentUser && (
          <div className="mx-6 mt-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
            <LogIn className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                Authentication Required
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
                Please sign in so you can manage and edit your topic later.
              </p>
              <button
                type="button"
                onClick={onSignInRequired}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition shadow-xs"
              >
                Sign In with Google
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="student-full-name-input"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="student-full-name-input"
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
            />
          </div>

          {/* Speech Topic */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="speech-topic-input"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Speech Topic <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-zinc-400">
                Must be unique across class
              </span>
            </div>
            <textarea
              id="speech-topic-input"
              required
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your speech presentation topic"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                matchedDuplicate
                  ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500/50'
                  : 'border-zinc-300 dark:border-zinc-700 focus:ring-indigo-500/50 focus:border-indigo-500'
              } bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 transition resize-none`}
            />

            {/* Instant Duplicate Warning */}
            {matchedDuplicate && (
              <div className="mt-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    Topic already taken
                  </h5>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                    Someone in your class has already registered this topic ({matchedDuplicate.studentName}). Please choose another one.
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
              Class / Section <span className="text-xs font-normal text-zinc-400">(Optional)</span>
            </label>
            <input
              id="speech-section-input"
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. Section A, Period 3, or Comm 101"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
            />
          </div>

          {/* General Form Error */}
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
              disabled={isSubmitting || Boolean(matchedDuplicate)}
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
