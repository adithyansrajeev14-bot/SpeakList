'use client';

import React from 'react';
import { Search, X, ArrowUpDown, Clock, UserCheck, Layers } from 'lucide-react';
import { FilterOption, SortOption } from '@/lib/types';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: FilterOption;
  onFilterChange: (f: FilterOption) => void;
  activeSort: SortOption;
  onSortChange: (s: SortOption) => void;
  totalCount: number;
  filteredCount: number;
  hasMyTopic: boolean;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  activeSort,
  onSortChange,
  totalCount,
  filteredCount,
  hasMyTopic,
}) => {
  return (
    <div
      id="search-filter-container"
      className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs mb-6 space-y-4"
    >
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          id="topic-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search student name or speech topic..."
          className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
        />
        {searchQuery && (
          <button
            id="clear-search-btn"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters & Sorting Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-100 dark:border-zinc-800">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5" role="tablist">
          <button
            id="filter-all-topics"
            role="tab"
            aria-selected={activeFilter === 'all'}
            onClick={() => onFilterChange('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeFilter === 'all'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            All Topics
            <span className="ml-1 opacity-75 font-normal">({totalCount})</span>
          </button>

          <button
            id="filter-recent-topics"
            role="tab"
            aria-selected={activeFilter === 'recent'}
            onClick={() => onFilterChange('recent')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeFilter === 'recent'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Recently Added
          </button>

          <button
            id="filter-my-topic"
            role="tab"
            aria-selected={activeFilter === 'my'}
            onClick={() => onFilterChange('my')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeFilter === 'my'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            My Topic
            {hasMyTopic && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block ml-0.5" />
            )}
          </button>
        </div>

        {/* Sort dropdown & Result Counter */}
        <div className="flex items-center gap-3 ml-auto">
          {searchQuery && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
              Showing {filteredCount} of {totalCount}
            </span>
          )}

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <label htmlFor="topic-sort-select" className="sr-only">Sort topics</label>
            <select
              id="topic-sort-select"
              value={activeSort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="py-1.5 pl-2.5 pr-8 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name A–Z</option>
              <option value="topic-asc">Topic A–Z</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
