'use client';

import React, { useState } from 'react';
import { X, AlertCircle, Loader2, Edit3, Trash2 } from 'lucide-react';
import { SpeechTopic, normalizeTopic } from '@/lib/types';

interface EditTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: SpeechTopic | null;
  existingTopics: SpeechTopic[];
  onSaveTopic: (data: {
    studentName: string;
    topic: string;
    section?: string;
  }) => Promise<void>;
  onDeleteTopic?: (topic: SpeechTopic) => Promise<void>;
}

const EditTopicModalDialog: React.FC<Omit<EditTopicModalProps, 'isOpen'> & { topic: SpeechTopic }> = ({
  onClose,
  topic,
  existingTopics,
  onSaveTopic,
  onDeleteTopic,
}) => {
  const [studentName, setStudentName] = useState(topic.studentName || '');
  const [speechTopic, setSpeechTopic] = useState(topic.topic || '');
  const [section, setSection] = useState(topic.section || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Real-time client duplicate check (excluding the current user's own record!)
  const normalizedTyped = normalizeTopic(speechTopic);
  const matchedDuplicate =
    normalizedTyped.length > 2
      ? existingTopics.find(
          (t) => t.id !== topic.id && t.normalizedTopic === normalizedTyped
        )
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = studentName.trim();
    const trimmedTopic = speechTopic.trim();

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
      await onSaveTopic({
        studentName: trimmedName,
        topic: trimmedTopic,
        section: section.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update topic. Please try again.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteTopic) return;
    setIsSubmitting(true);
    try {
      await onDeleteTopic(topic);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove topic.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="edit-topic-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="edit-topic-modal"
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Edit Your Speech Topic
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                You can change your registered name or switch your topic anytime
              </p>
            </div>
          </div>
          <button
            id="close-edit-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delete confirmation banner */}
        {isConfirmingDelete ? (
          <div className="p-6 bg-rose-50/70 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/60">
            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200 mb-1">
              Withdraw this speech topic?
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300 mb-4 leading-relaxed">
              This will free up &ldquo;{topic.topic}&rdquo; so another student can register it.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition active:scale-95"
              >
                {isSubmitting ? 'Withdrawing...' : 'Yes, Withdraw Topic'}
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="edit-student-name"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-student-name"
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
                htmlFor="edit-speech-topic"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Speech Topic <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-zinc-400">
                Old topic will be freed up if changed
              </span>
            </div>
            <textarea
              id="edit-speech-topic"
              required
              rows={3}
              value={speechTopic}
              onChange={(e) => setSpeechTopic(e.target.value)}
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
              htmlFor="edit-section"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Class / Section <span className="text-xs font-normal text-zinc-400">(Optional)</span>
            </label>
            <input
              id="edit-section"
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. Section A, Period 3, or Comm 101"
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

          {/* Modal Footer */}
          <div className="flex items-center justify-between gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {onDeleteTopic && !isConfirmingDelete ? (
              <button
                id="withdraw-topic-btn"
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Withdraw Topic
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                id="cancel-edit-topic-btn"
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                id="submit-save-topic-btn"
                type="submit"
                disabled={isSubmitting || Boolean(matchedDuplicate)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditTopicModal: React.FC<EditTopicModalProps> = ({ isOpen, topic, ...props }) => {
  if (!isOpen || !topic) return null;
  return <EditTopicModalDialog key={topic.id} topic={topic} {...props} />;
};
