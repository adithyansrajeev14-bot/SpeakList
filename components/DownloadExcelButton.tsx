'use client';

import React, { useState } from 'react';
import { SpeechTopic, formatTopicDate } from '@/lib/types';
import { Download, FileSpreadsheet, Loader2, Check } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DownloadExcelButtonProps {
  topics: SpeechTopic[];
  onShowToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const DownloadExcelButton: React.FC<DownloadExcelButtonProps> = ({
  topics,
  onShowToast,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadedRecently, setDownloadedRecently] = useState(false);

  const handleDownloadExcel = async () => {
    if (topics.length === 0) {
      onShowToast(
        'info',
        'No Topics to Export',
        'There are no registered speech presentation topics in the class yet.'
      );
      return;
    }

    setIsExporting(true);
    try {
      // Sort alphabetically by student name for clean presentation
      const sortedTopics = [...topics].sort((a, b) =>
        a.studentName.localeCompare(b.studentName, undefined, { sensitivity: 'base' })
      );

      // Create data rows with requested columns:
      // 1. Sl. No.
      // 2. Student Name
      // 3. Speech Topic
      // 4. Registration Date
      // 5. Class / Section (bonus if present)
      const data = sortedTopics.map((item, index) => ({
        'Sl. No.': index + 1,
        'Student Name': item.studentName,
        'Speech Topic': item.topic,
        'Registration Date': formatTopicDate(item.createdAt),
        'Class / Section': item.section || '—',
      }));

      // Create Worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Set nice column widths
      worksheet['!cols'] = [
        { wch: 10 }, // Sl. No.
        { wch: 28 }, // Student Name
        { wch: 42 }, // Speech Topic
        { wch: 24 }, // Registration Date
        { wch: 18 }, // Class / Section
      ];

      // Create Workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Class Speech Topics');

      // Export file
      XLSX.writeFile(workbook, 'Class_Speech_Topics.xlsx');

      setDownloadedRecently(true);
      setTimeout(() => setDownloadedRecently(false), 4000);

      onShowToast(
        'success',
        'Excel File Downloaded',
        `Successfully exported ${topics.length} speech topics to Class_Speech_Topics.xlsx`
      );
    } catch (err: unknown) {
      console.error('Failed to export Excel:', err);
      onShowToast(
        'error',
        'Export Failed',
        'Could not generate the Excel file. Please try again.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section
      id="excel-download-section"
      className="w-full mt-12 py-10 px-6 sm:px-8 rounded-3xl bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center shadow-xs"
    >
      <div className="max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-2xs">
          <FileSpreadsheet className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Download Topic List
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Export the latest class speech topics as an Excel file.
          </p>
        </div>

        <div className="pt-2">
          <button
            id="download-excel-btn"
            onClick={handleDownloadExcel}
            disabled={isExporting}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 shadow-sm hover:shadow-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing Excel Sheet...</span>
              </>
            ) : downloadedRecently ? (
              <>
                <Check className="w-4 h-4" />
                <span>Downloaded Class_Speech_Topics.xlsx</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download Topic List (.xlsx)</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Compatible with Microsoft Excel, Google Sheets, Apple Numbers & LibreOffice.
        </p>
      </div>
    </section>
  );
};
