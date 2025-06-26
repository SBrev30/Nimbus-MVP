import React from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';

interface LibraryHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: 'title' | 'lastModified' | 'completion') => void;
  filterGenre: string;
  onFilterChange: (genre: string) => void;
  genres: string[];
  projectCount: number;
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
}: LibraryHeaderProps) {
  return (
    <div className="bg-white border-b border-[#C6C5C5] p-6">
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

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#889096]" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Genre Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#889096]" />
            <select
              value={filterGenre}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-[#889096]" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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