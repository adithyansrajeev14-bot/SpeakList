'use client';

import React, { useState } from 'react';
import { X, Check, Copy, BookOpen, Key, Shield, Rocket, CheckCircle2 } from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const sampleEnvConfig = `NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abcdef..."`;

  const rulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /speechTopics/{docId} {
      allow read: if true;
      allow create: if isAuthenticated() 
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.studentName is string
        && request.resource.data.topic is string;
      allow update: if isOwner(resource.data.userId)
        && request.resource.data.userId == resource.data.userId;
      allow delete: if isOwner(resource.data.userId);
    }

    match /topicReservations/{normalizedTopic} {
      allow read: if true;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.userId);
    }
  }
}`;

  return (
    <div
      id="setup-guide-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="setup-guide-modal"
        className="w-full max-w-3xl max-h-[88vh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                SpeakList Setup & Deployment Guide
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Beginner-friendly steps for your college class speech registration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-zinc-700 dark:text-zinc-300">
          {/* Section 1: Firebase Project */}
          <div className="space-y-2">
            <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                1
              </span>
              Create Firebase Project & Enable Google Authentication
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-600 dark:text-zinc-400 ml-2">
              <li>Go to <strong className="text-zinc-800 dark:text-zinc-200">console.firebase.google.com</strong> and click <em>Add Project</em> (e.g. &ldquo;SpeakList-Class&rdquo;).</li>
              <li>Go to <strong>Authentication</strong> → <em>Get Started</em> → <strong>Sign-in method</strong> tab.</li>
              <li>Enable <strong>Google</strong> provider and save your project support email.</li>
            </ol>
          </div>

          {/* Section 2: Firestore Database */}
          <div className="space-y-2">
            <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                2
              </span>
              Create Cloud Firestore Database
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 ml-2">
              Navigate to <strong>Firestore Database</strong> in the left sidebar, click <strong>Create Database</strong>, select your region, and choose <strong>Production Mode</strong>.
            </p>
          </div>

          {/* Section 3: Register Web App & Config */}
          <div className="space-y-2">
            <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                3
              </span>
              Get Firebase Configuration
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 ml-2">
              In Project Settings, scroll to <em>Your apps</em>, click <strong>Web</strong> (<code>&lt;/&gt;</code>), and copy your config keys into your <code>.env.local</code> file:
            </p>
            <div className="relative mt-2">
              <pre className="p-3.5 rounded-xl bg-zinc-900 text-zinc-200 text-xs overflow-x-auto font-mono">
                {sampleEnvConfig}
              </pre>
              <button
                onClick={() => copyToClipboard(sampleEnvConfig, 'env')}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition text-xs flex items-center gap-1"
              >
                {copiedSection === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'env' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Section 4: Security Rules */}
          <div className="space-y-2">
            <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                4
              </span>
              Paste Firestore Security Rules
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 ml-2">
              In Firestore → <strong>Rules</strong> tab, paste the rules below to ensure only the student who owns a topic can edit it:
            </p>
            <div className="relative mt-2">
              <pre className="p-3.5 rounded-xl bg-zinc-900 text-zinc-200 text-xs overflow-x-auto font-mono max-h-48">
                {rulesCode}
              </pre>
              <button
                onClick={() => copyToClipboard(rulesCode, 'rules')}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition text-xs flex items-center gap-1"
              >
                {copiedSection === 'rules' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'rules' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Section 5: Testing Checklist */}
          <div className="space-y-2">
            <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                5
              </span>
              Classroom Testing Checklist
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Duplicate check:</strong> Try registering &ldquo;Sleep Paralysis&rdquo; twice with different cases/spaces.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Owner edit only:</strong> Switch accounts or open in incognito; verify Edit button only appears on your own row.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Excel download:</strong> Click &ldquo;Download Topic List&rdquo; at the bottom to get <code>Class_Speech_Topics.xlsx</code>.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Real-time sync:</strong> Watch topics appear instantly across mobile and laptop devices without refresh.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
