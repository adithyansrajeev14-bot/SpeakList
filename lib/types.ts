import { Timestamp } from 'firebase/firestore';

export interface SpeechTopic {
  id: string; // Document ID (usually equals the student's Firebase UID)
  userId: string;
  studentName: string;
  studentEmail: string;
  studentPhotoURL?: string;
  topic: string;
  normalizedTopic: string;
  section?: string;
  createdAt: Timestamp | number | { seconds: number; nanoseconds: number } | Date | null;
  updatedAt?: Timestamp | number | { seconds: number; nanoseconds: number } | Date | null;
}

export type FilterOption = 'all' | 'recent' | 'my';
export type SortOption = 'newest' | 'oldest' | 'name-asc' | 'topic-asc';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

/**
 * Normalizes speech topic text for case-insensitive, whitespace-trimmed duplicate checking.
 * e.g. "  Sleep   Paralysis " -> "sleep paralysis"
 */
export function normalizeTopic(topic: string): string {
  return topic
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Generates an initials string from a student's full name.
 */
export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Safely extracts milliseconds timestamp for reliable sorting and date rendering.
 */
export function getTimestampMillis(rawDate: SpeechTopic['createdAt']): number {
  if (!rawDate) return 0;
  if (typeof rawDate === 'number') return rawDate;
  if (rawDate instanceof Date) return rawDate.getTime();
  if (typeof rawDate === 'object' && rawDate !== null) {
    if ('toDate' in rawDate && typeof rawDate.toDate === 'function') {
      return rawDate.toDate().getTime();
    }
    if ('seconds' in rawDate && typeof (rawDate as { seconds: number }).seconds === 'number') {
      return (rawDate as { seconds: number }).seconds * 1000;
    }
  }
  return 0;
}

/**
 * Formats a Firebase timestamp or date into a readable string.
 */
export function formatTopicDate(rawDate: SpeechTopic['createdAt']): string {
  if (!rawDate) return 'Just now';
  try {
    const millis = getTimestampMillis(rawDate);
    if (!millis) return 'Just now';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(millis));
  } catch {
    return 'Recently';
  }
}
