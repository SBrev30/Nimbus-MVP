import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  count?: number; // Optional count badge
}

interface SimpleSearchFilterProps {
  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;

  // Filter
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  showFilter?: boolean;

  // Clear functionality
  onClear?: () => void;
  showClearAll?: boolean;

  // Layout
  className?: string;
  compact?: boolean; // For smaller spaces
}

export function SimpleSearchFilter({
  // Search props
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  showSearch = true,

  // Filter props
  filterValue = 'all',
  onFilterChange,
  filterOptions = [],
  filterLabel = 'Filter',
  showFilter = true,

  // Clear props
  onClear,
  showClearAll = false,

  // Layout props
  className = '',
  compact = false
}: SimpleSearchFilterProps) {
  const hasActiveFilters = searchValue.length > 0 || filterValue !== 'all';

  return (
    <div className={`flex items-center gap-3 ${compact ? 'gap-2' : 'gap-4'} ${className}`}>
      {/* Search Input */}
      {showSearch && (
        <div className={`relative ${compact ? 'flex-1 min-w-0' : 'flex-1 max-w-md'}`}>
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className={`
              w-full pl-9 pr-4 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent
              transition-colors text-gray-900 placeholder-gray-500
              ${compact ? 'py-1.5 text-sm' : 'py-2'}
            `}
          />
        </div>
      )}

      {/* Filter Dropdown */}
      {showFilter && filterOptions.length > 0 && (
        <div className="flex items-center gap-2">
          <Filter className={`text-gray-400 ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
          <select
            value={filterValue}
            onChange={(e) => onFilterChange?.(e.target.value)}
            className={`
              border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent
              transition-colors bg-white text-gray-900
              ${compact ? 'px-2 py-1.5 text-sm' : 'px-3 py-2'}
            `}
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
                {option.count !== undefined && ` (${option.count})`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Clear All Button */}
      {showClearAll && hasActiveFilters && onClear && (
        <button
          onClick={onClear}
          className={`
            flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-gray-700 
            border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors
            ${compact ? 'text-xs' : 'text-sm'}
          `}
          title="Clear all filters"
        >
          <X className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          {!compact && <span>Clear</span>}
        </button>
      )}

      {/* Active Filter Indicator */}
      {hasActiveFilters && !showClearAll && (
        <div className={`w-2 h-2 bg-[#A5F7AC] rounded-full ${compact ? 'w-1.5 h-1.5' : ''}`} />
      )}
    </div>
  );
}

// Custom hook for managing search and filter state
export function useSimpleFilter<T>(
  items: T[],
  searchFn: (item: T, searchTerm: string) => boolean,
  filterFn: (item: T, filterValue: string) => boolean
) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterValue, setFilterValue] = React.useState('all');

  const filteredItems = React.useMemo(() => {
    return items.filter(item => {
      const matchesSearch = searchTerm === '' || searchFn(item, searchTerm);
      const matchesFilter = filterValue === 'all' || filterFn(item, filterValue);
      return matchesSearch && matchesFilter;
    });
  }, [items, searchTerm, filterValue, searchFn, filterFn]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterValue('all');
  };

  return {
    searchTerm,
    setSearchTerm,
    filterValue,
    setFilterValue,
    filteredItems,
    clearFilters,
    hasActiveFilters: searchTerm !== '' || filterValue !== 'all'
  };
}
