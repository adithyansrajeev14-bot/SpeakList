'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  subscribeToSpeechTopics,
  registerSpeechTopic,
  updateSpeechTopic,
  deleteSpeechTopic,
} from '@/lib/firestore-service';
import {
  SpeechTopic,
  FilterOption,
  SortOption,
  ToastMessage,
  normalizeStudentNumber,
  getTimestampMillis,
} from '@/lib/types';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { StatsCards } from '@/components/StatsCards';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { TopicBoard } from '@/components/TopicBoard';
import { AddTopicModal } from '@/components/AddTopicModal';
import { EditTopicModal } from '@/components/EditTopicModal';
import { DownloadExcelButton } from '@/components/DownloadExcelButton';
import { SetupGuideModal } from '@/components/SetupGuideModal';
import { ToastNotification } from '@/components/ToastNotification';

const STORAGE_STUDENT_NUMBER_KEY = 'speaklist_student_number';
const STORAGE_STUDENT_NAME_KEY = 'speaklist_student_name';

export default function SpeakListPage() {
  const [topics, setTopics] = useState<SpeechTopic[]>([]);
  const [loading, setLoading] = useState(true);

  // Client-saved student identity (Name + Number) stored locally on the device
  const [savedStudentNumber, setSavedStudentNumber] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_STUDENT_NUMBER_KEY) || '';
    }
    return '';
  });
  const [savedStudentName, setSavedStudentName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_STUDENT_NAME_KEY) || '';
    }
    return '';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('speaklist-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  });

  // Search, Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [activeSort, setActiveSort] = useState<SortOption>('newest');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditTopic, setSelectedEditTopic] = useState<SpeechTopic | null>(null);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (type: 'success' | 'error' | 'info', title: string, description?: string) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
      setToasts((prev) => [...prev, { id, type, title, description }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync DOM dark class when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('speaklist-theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return nextTheme;
    });
  };

  // Firebase Firestore real-time subscription
  useEffect(() => {
    const unsubscribe = subscribeToSpeechTopics(
      (updatedTopics) => {
        setTopics(updatedTopics);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        setLoading(false);
        showToast(
          'error',
          'Live sync notice',
          'Could not connect to live class topics. Retrying automatically...'
        );
      }
    );
    return () => unsubscribe();
  }, [showToast]);

  // Topic registered by this device / student number
  const myRegisteredTopic = useMemo(() => {
    if (!savedStudentNumber) return null;
    const norm = normalizeStudentNumber(savedStudentNumber);
    return (
      topics.find(
        (t) =>
          normalizeStudentNumber(t.studentNumber || t.userId || '') === norm
      ) || null
    );
  }, [savedStudentNumber, topics]);

  // Open add modal
  const handleOpenAddModal = () => {
    if (myRegisteredTopic) {
      setSelectedEditTopic(myRegisteredTopic);
      setIsEditModalOpen(true);
      showToast(
        'info',
        'Existing Topic Found',
        `You have already registered "${myRegisteredTopic.topic}". You can modify it here.`
      );
      return;
    }
    setIsAddModalOpen(true);
  };

  // Clear or switch student session on shared device
  const handleClearSavedStudent = () => {
    localStorage.removeItem(STORAGE_STUDENT_NUMBER_KEY);
    localStorage.removeItem(STORAGE_STUDENT_NAME_KEY);
    setSavedStudentNumber('');
    setSavedStudentName('');
    showToast('info', 'Student Session Cleared', 'You can now register for another student.');
  };

  // Register topic submission
  const handleRegisterTopic = async (data: {
    studentName: string;
    studentNumber: string;
    topic: string;
    section?: string;
  }) => {
    await registerSpeechTopic(data);

    // Save student details to device storage
    localStorage.setItem(STORAGE_STUDENT_NUMBER_KEY, data.studentNumber);
    localStorage.setItem(STORAGE_STUDENT_NAME_KEY, data.studentName);
    setSavedStudentNumber(data.studentNumber);
    setSavedStudentName(data.studentName);

    showToast(
      'success',
      'Topic Registered Successfully',
      `"${data.topic}" has been locked in for ${data.studentName}.`
    );
  };

  // Edit topic trigger
  const handleOpenEditModal = (topic: SpeechTopic) => {
    setSelectedEditTopic(topic);
    setIsEditModalOpen(true);
  };

  // Save topic updates
  const handleSaveTopic = async (data: {
    id: string;
    studentName: string;
    studentNumber: string;
    topic: string;
    section?: string;
  }) => {
    await updateSpeechTopic(data);

    // Keep device identity synced
    localStorage.setItem(STORAGE_STUDENT_NUMBER_KEY, data.studentNumber);
    localStorage.setItem(STORAGE_STUDENT_NAME_KEY, data.studentName);
    setSavedStudentNumber(data.studentNumber);
    setSavedStudentName(data.studentName);

    showToast('success', 'Topic Updated', 'Your speech topic changes are now live.');
  };

  // Delete / withdraw topic
  const handleDeleteTopic = async (topic: SpeechTopic, verificationNumber?: string) => {
    await deleteSpeechTopic(topic.id, verificationNumber || savedStudentNumber);

    const normSaved = normalizeStudentNumber(savedStudentNumber);
    const normDeleted = normalizeStudentNumber(topic.studentNumber || topic.userId || '');
    if (normSaved === normDeleted) {
      localStorage.removeItem(STORAGE_STUDENT_NUMBER_KEY);
      localStorage.removeItem(STORAGE_STUDENT_NAME_KEY);
      setSavedStudentNumber('');
      setSavedStudentName('');
    }

    showToast(
      'info',
      'Topic Withdrawn',
      `"${topic.topic}" has been released and is now available for other students.`
    );
  };

  // Scroll directly to user's registered row
  const handleScrollToMyTopic = () => {
    if (!myRegisteredTopic) return;
    setActiveFilter('my');
    setTimeout(() => {
      const element = document.getElementById(`topic-row-${myRegisteredTopic.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Filter and Sort Processing
  const filteredAndSortedTopics = useMemo(() => {
    let result = [...topics];

    // 1. Search Query filter (matches student name, student number, topic, or section)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.studentName.toLowerCase().includes(q) ||
          (item.studentNumber && item.studentNumber.toLowerCase().includes(q)) ||
          item.topic.toLowerCase().includes(q) ||
          (item.section && item.section.toLowerCase().includes(q))
      );
    }

    // 2. Tab Filter
    if (activeFilter === 'my') {
      if (savedStudentNumber) {
        const norm = normalizeStudentNumber(savedStudentNumber);
        result = result.filter(
          (item) =>
            normalizeStudentNumber(item.studentNumber || item.userId || '') === norm
        );
      } else {
        result = [];
      }
    } else if (activeFilter === 'recent') {
      result = result.slice(0, 10);
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (activeSort === 'name-asc') {
        return a.studentName.localeCompare(b.studentName, undefined, { sensitivity: 'base' });
      }
      if (activeSort === 'topic-asc') {
        return a.topic.localeCompare(b.topic, undefined, { sensitivity: 'base' });
      }
      if (activeSort === 'oldest') {
        const timeA = getTimestampMillis(a.createdAt);
        const timeB = getTimestampMillis(b.createdAt);
        return timeA - timeB;
      }
      // default: newest
      const timeA = getTimestampMillis(a.createdAt);
      const timeB = getTimestampMillis(b.createdAt);
      return timeB - timeA;
    });

    return result;
  }, [topics, searchQuery, activeFilter, activeSort, savedStudentNumber]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        registeredStudentName={savedStudentName || (myRegisteredTopic ? myRegisteredTopic.studentName : undefined)}
        registeredStudentNumber={savedStudentNumber || (myRegisteredTopic ? myRegisteredTopic.studentNumber : undefined)}
        onOpenAddModal={handleOpenAddModal}
        onOpenEditMyTopic={() => {
          if (myRegisteredTopic) handleOpenEditModal(myRegisteredTopic);
        }}
        onClearSavedStudent={savedStudentNumber ? handleClearSavedStudent : undefined}
        onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Hero Section */}
        <HeroSection
          onOpenAddModal={handleOpenAddModal}
          hasUserRegistered={Boolean(myRegisteredTopic)}
          onScrollToMyTopic={handleScrollToMyTopic}
        />

        {/* Dynamic Live Statistics */}
        <StatsCards topics={topics} loading={loading} />

        {/* Search, Filter & Sort Bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          totalCount={topics.length}
          filteredCount={filteredAndSortedTopics.length}
          hasMyTopic={Boolean(myRegisteredTopic)}
        />

        {/* Main 2-Column Topic Board */}
        <TopicBoard
          topics={filteredAndSortedTopics}
          loading={loading}
          currentStudentNumber={savedStudentNumber || null}
          onEditTopic={handleOpenEditModal}
          onDeleteTopic={handleDeleteTopic}
          onOpenAddModal={handleOpenAddModal}
          searchQuery={searchQuery}
        />

        {/* Download Topic List Excel Feature */}
        <DownloadExcelButton topics={topics} onShowToast={showToast} />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800/80 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} SpeakList • College Speech Topic Registration</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSetupGuideOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition underline underline-offset-2 cursor-pointer"
            >
              Setup & Rules Guide
            </button>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span>Real-time Live Sync</span>
          </div>
        </div>
      </footer>

      {/* Add Topic Modal */}
      <AddTopicModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        existingTopics={topics}
        defaultStudentName={savedStudentName}
        defaultStudentNumber={savedStudentNumber}
        onSubmitTopic={handleRegisterTopic}
      />

      {/* Edit Topic Modal */}
      <EditTopicModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        topic={selectedEditTopic}
        existingTopics={topics}
        savedStudentNumber={savedStudentNumber}
        onSaveTopic={handleSaveTopic}
        onDeleteTopic={handleDeleteTopic}
      />

      {/* Setup Guide Modal */}
      <SetupGuideModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
      />

      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
