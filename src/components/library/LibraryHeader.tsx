import React from 'react';
import { SortAsc } from 'lucide-react';
import { SimpleSearchFilter } from '../shared/simple-search-filter';

interface LibraryHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: 'title' | 'lastModified' | 'completion') => void;
  filterGenre: string;
  onFilterChange: (genre: string) => void;
  genres: string[];
  projectCount: number;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function LibraryHeader({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  filterGenre,
  onFilterChange,
  genres,
  projectCount,
  onClearFilters,
  hasActiveFilters = false
}: LibraryHeaderProps) {
  // Convert genres to filter options
  const genreFilterOptions = genres.map(genre => ({
    value: genre,
    label: genre === 'all' ? 'All Genres' : genre
  }));

  return (
    <div className="bg-[#f2eee2] border-b border-[#C6C5C5] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Title and Stats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 font-inter">
              Your Writing Projects
            </h1>
            <p className="text-[#889096] mt-1">
              {projectCount} {projectCount === 1 ? 'project' : 'projects'}
            </p>
          </div>
        </div>

        {/* Simplified Search and Filters */}
        <div className="flex items-center gap-4">
          <SimpleSearchFilter
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search projects..."
            filterValue={filterGenre}
            onFilterChange={onFilterChange}
            filterOptions={genreFilterOptions}
            onClear={onClearFilters}
            showClearAll={hasActiveFilters}
            className="flex-1"
          />

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-[#889096]" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent"
            >
              <option value="lastModified">Last Modified</option>
              <option value="title">Title</option>
              <option value="completion">Completion</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
