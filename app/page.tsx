'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  updateProfile,
  signOut,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
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
  normalizeTopic,
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

export default function SpeakListPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [topics, setTopics] = useState<SpeechTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

  // Theme initialization & sync
  useEffect(() => {
    const savedTheme = localStorage.getItem('speaklist-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

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

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Firebase Firestore real-time listener
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
          'Live sync issue',
          'Could not sync latest topics. Please check your network connection.'
        );
      }
    );
    return () => unsubscribe();
  }, [showToast]);

  // Auth operations
  const handleSignInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('success', 'Signed In with Google', 'You can now register or manage your speech topic.');
    } catch (err: unknown) {
      console.warn('Google sign-in popup error/blocked:', err);
      showToast(
        'info',
        'Google Sign-In Popup Notice',
        'If popups are blocked by your browser or inside this preview, use the Student ID icon next to Sign In to continue quickly.'
      );
    }
  };

  const handleQuickStudentSignIn = async (name: string, email: string) => {
    try {
      const userCredential = await signInAnonymously(auth);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name,
        });
        setCurrentUser({
          ...userCredential.user,
          displayName: name,
          email: email,
        } as User);
        showToast('success', `Signed in as ${name}`, 'You are now ready to register your speech topic.');
      }
    } catch (err: unknown) {
      console.error('Student sign-in error:', err);
      showToast('error', 'Sign In Failed', 'Could not complete sign-in. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('info', 'Signed Out', 'You have been signed out.');
    } catch (err: unknown) {
      console.error('Sign out error:', err);
    }
  };

  // Does the signed-in user already have a registered topic?
  const myRegisteredTopic = useMemo(() => {
    if (!currentUser) return null;
    return topics.find((t) => t.userId === currentUser.uid) || null;
  }, [currentUser, topics]);

  // Add modal trigger
  const handleOpenAddModal = () => {
    if (myRegisteredTopic) {
      // User already has a topic -> open their edit modal instead
      setSelectedEditTopic(myRegisteredTopic);
      setIsEditModalOpen(true);
      showToast(
        'info',
        'Existing Topic Found',
        'You already have a topic registered. You can edit it here.'
      );
      return;
    }
    setIsAddModalOpen(true);
  };

  // Register topic submission
  const handleRegisterTopic = async (data: {
    studentName: string;
    topic: string;
    section?: string;
  }) => {
    if (!currentUser) {
      throw new Error('Please sign in before registering a topic.');
    }

    await registerSpeechTopic({
      userId: currentUser.uid,
      studentName: data.studentName,
      studentEmail: currentUser.email || '',
      studentPhotoURL: currentUser.photoURL || undefined,
      topic: data.topic,
      section: data.section,
    });

    showToast(
      'success',
      'Topic Registered Successfully',
      `Your presentation topic "${data.topic}" is now officially claimed on the class board.`
    );
  };

  // Edit topic trigger
  const handleOpenEditModal = (topic: SpeechTopic) => {
    setSelectedEditTopic(topic);
    setIsEditModalOpen(true);
  };

  // Save topic updates
  const handleSaveTopic = async (data: {
    studentName: string;
    topic: string;
    section?: string;
  }) => {
    if (!currentUser || !selectedEditTopic) {
      throw new Error('Authentication required.');
    }

    await updateSpeechTopic({
      userId: currentUser.uid,
      studentName: data.studentName,
      topic: data.topic,
      section: data.section,
    });

    showToast('success', 'Your topic has been updated', 'Your speech topic changes are now live.');
  };

  // Delete/withdraw topic
  const handleDeleteTopic = async (topic: SpeechTopic) => {
    if (!currentUser) return;
    await deleteSpeechTopic(currentUser.uid);
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

    // 1. Search Query filter (matches student name, topic, or section)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.studentName.toLowerCase().includes(q) ||
          item.topic.toLowerCase().includes(q) ||
          (item.section && item.section.toLowerCase().includes(q))
      );
    }

    // 2. Tab Filter
    if (activeFilter === 'my') {
      if (currentUser) {
        result = result.filter((item) => item.userId === currentUser.uid);
      } else {
        result = [];
      }
    } else if (activeFilter === 'recent') {
      // Recent: first 8 or within last 48 hours
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
  }, [topics, searchQuery, activeFilter, activeSort, currentUser]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Header */}
      <Header
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSignInWithGoogle={handleSignInWithGoogle}
        onQuickStudentSignIn={handleQuickStudentSignIn}
        onSignOut={handleSignOut}
        onOpenAddModal={handleOpenAddModal}
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
          currentUserId={currentUser ? currentUser.uid : null}
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
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition underline underline-offset-2"
            >
              Setup & Firebase Rules Guide
            </button>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span>Real-time Sync Active</span>
          </div>
        </div>
      </footer>

      {/* Add Topic Modal */}
      <AddTopicModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentUser={currentUser}
        existingTopics={topics}
        onSignInRequired={handleSignInWithGoogle}
        onSubmitTopic={handleRegisterTopic}
      />

      {/* Edit Topic Modal */}
      <EditTopicModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        topic={selectedEditTopic}
        existingTopics={topics}
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
