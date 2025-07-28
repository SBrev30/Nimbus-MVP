import React, { useState, useEffect } from 'react';
import { Clock, Edit, Plus, Trash2, FileText, User, MapPin, Zap, RotateCcw, X } from 'lucide-react';
import { SimpleSearchFilter, useSimpleFilter } from './shared/simple-search-filter';
import { useNotes } from '../hooks/use-notes';
import { DeletedNote } from '../services/notes-service';

interface HistoryEntry {
  id: string;
  type: 'create' | 'edit' | 'delete';
  target: 'chapter' | 'character' | 'note' | 'project';
  title: string;
  description: string;
  timestamp: Date;
  details?: {
    wordCountChange?: number;
    charactersAffected?: string[];
    tagsModified?: string[];
    category?: string;
    content?: string;
  };
}

interface HistoryProps {
  onBack: () => void;
}

const History: React.FC<HistoryProps> = ({ onBack }) => {
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showDeletedNotes, setShowDeletedNotes] = useState(false);
  const [selectedNote, setSelectedNote] = useState<DeletedNote | null>(null);

  const { deletedNotes, restoreNote, permanentlyDeleteNote, refreshDeletedNotes } = useNotes();

  // Define filter options for activity types
  const typeFilterOptions = [
    { value: 'all', label: 'All Actions' },
    { value: 'create', label: 'Created' },
    { value: 'edit', label: 'Edited' },
    { value: 'delete', label: 'Deleted' }
  ];

  // Use simplified filter hook for search and type filtering
  const {
    searchTerm,
    setSearchTerm,
    filterValue: typeFilter,
    setFilterValue: setTypeFilter,
    filteredItems: typeFilteredEntries,
    clearFilters,
    hasActiveFilters
  } = useSimpleFilter(
    historyEntries,
    (entry, search) => 
      entry.title.toLowerCase().includes(search.toLowerCase()) ||
      entry.description.toLowerCase().includes(search.toLowerCase()),
    (entry, filter) => filter === 'all' || entry.type === filter
  );

  // Apply time filter after type filter
  const filteredEntries = typeFilteredEntries.filter(entry => {
    if (timeFilter === 'all') return true;
    
    const now = new Date();
    const cutoff = new Date();
    
    switch (timeFilter) {
      case 'today':
        cutoff.setHours(0, 0, 0, 0);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
    }
    
    return entry.timestamp >= cutoff;
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const clearAllFilters = () => {
    clearFilters();
    setTimeFilter('all');
  };

  const hasAnyActiveFilters = hasActiveFilters || timeFilter !== 'all';

  useEffect(() => {
    loadHistoryData();
    refreshDeletedNotes();
  }, [refreshDeletedNotes]);

  const loadHistoryData = async () => {
    setIsLoading(true);
    
    // Simulate loading from local storage or API
    // In a real implementation, this would load from your history_entries table
    const mockHistory: HistoryEntry[] = [
      {
        id: '1',
        type: 'edit',
        target: 'chapter',
        title: 'Chapter 3: The Discovery',
        description: 'Updated character dialogue and added 347 words',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        details: {
          wordCountChange: 347,
          charactersAffected: ['Sarah', 'Marcus']
        }
      },
      {
        id: '2',
        type: 'create',
        target: 'character',
        title: 'Elena Rodriguez',
        description: 'Created new supporting character with background',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        details: {
          tagsModified: ['detective', 'mentor']
        }
      },
      {
        id: '3',
        type: 'edit',
        target: 'note',
        title: 'World Building: Magic System',
        description: 'Refined magic system rules and limitations',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        details: {
          tagsModified: ['magic', 'rules', 'limitations']
        }
      },
      {
        id: '4',
        type: 'create',
        target: 'chapter',
        title: 'Chapter 12: Resolution',
        description: 'Started new chapter with opening scene',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        details: {
          wordCountChange: 523
        }
      },
    ];

    // Add deleted notes to history
    const noteHistoryEntries: HistoryEntry[] = deletedNotes.map(note => ({
      id: `note-${note.id}`,
      type: 'delete' as const,
      target: 'note' as const,
      title: note.title || 'Untitled Note',
      description: `Deleted note from ${note.category} category${note.deletedReason ? `: ${note.deletedReason}` : ''}`,
      timestamp: note.deletedAt,
      details: {
        category: note.category,
        content: note.content?.substring(0, 100) + (note.content && note.content.length > 100 ? '...' : ''),
      }
    }));

    const allHistory = [...mockHistory, ...noteHistoryEntries];

    // Simulate network delay
    setTimeout(() => {
      setHistoryEntries(allHistory);
      setIsLoading(false);
    }, 800);
  };

  const handleRestoreNote = async (noteId: string) => {
    try {
      await restoreNote(noteId);
      await refreshDeletedNotes();
      await loadHistoryData(); // Refresh history to remove restored note
      setSelectedNote(null);
    } catch (error) {
      console.error('Failed to restore note:', error);
    }
  };

  const handlePermanentDelete = async (noteId: string) => {
    try {
      await permanentlyDeleteNote(noteId);
      await refreshDeletedNotes();
      await loadHistoryData(); // Refresh history to remove permanently deleted note
      setSelectedNote(null);
    } catch (error) {
      console.error('Failed to permanently delete note:', error);
    }
  };

  const getIcon = (type: HistoryEntry['type'], target: HistoryEntry['target']) => {
    const iconProps = { className: "w-4 h-4" };
    
    if (type === 'create') {
      return <Plus {...iconProps} className="w-4 h-4 text-green-600" />;
    } else if (type === 'delete') {
      return <Trash2 {...iconProps} className="w-4 h-4 text-red-600" />;
    } else {
      return <Edit {...iconProps} className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTargetIcon = (target: HistoryEntry['target']) => {
    const iconProps = { className: "w-4 h-4 text-gray-500" };
    
    switch (target) {
      case 'chapter':
        return <FileText {...iconProps} />;
      case 'character':
        return <User {...iconProps} />;
      case 'note':
        return <MapPin {...iconProps} />;
      case 'project':
        return <Zap {...iconProps} />;
      default:
        return <FileText {...iconProps} />;
    }
  };

  const getTypeColor = (type: HistoryEntry['type']) => {
    switch (type) {
      case 'create':
        return 'bg-green-50 border-green-200';
      case 'delete':
        return 'bg-red-50 border-red-200';
      case 'edit':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const getDeletedNoteFromId = (entryId: string): DeletedNote | undefined => {
    const noteId = entryId.replace('note-', '');
    return deletedNotes.find(note => note.id === noteId);
  };

  return (
    <div className="flex-1 bg-[#f2eee2] rounded-t-[17px] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
            <p className="text-gray-600 mt-1">Track your writing progress and recover deleted notes</p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00] text-white rounded-lg transition-colors"
          >
            Back to Settings
          </button>
        </div>
      </div>

      {/* Simplified Search and Filters */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4 mb-4">
          <SimpleSearchFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search activity..."
            filterValue={typeFilter}
            onFilterChange={setTypeFilter}
            filterOptions={typeFilterOptions}
            onClear={clearAllFilters}
            showClearAll={hasAnyActiveFilters}
            className="flex-1"
          />

          {/* Time Filter */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">Past week</option>
              <option value="month">Past month</option>
            </select>
          </div>

          {/* Show Deleted Notes Toggle */}
          <button
            onClick={() => setShowDeletedNotes(!showDeletedNotes)}
            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
              showDeletedNotes 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {showDeletedNotes ? 'Hide' : 'Show'} Deleted Notes ({deletedNotes.length})
          </button>

          <div className="text-sm text-gray-500">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#ff4e00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading history...</p>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {hasAnyActiveFilters ? 'No activity matches your filters' : 'No activity found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {hasAnyActiveFilters 
                  ? 'Try adjusting your search or filters to see more results.'
                  : 'Your writing activity will appear here as you work.'
                }
              </p>
              {hasAnyActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`border rounded-lg p-4 transition-shadow hover:shadow-md ${getTypeColor(entry.type)}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      {getIcon(entry.type, entry.target)}
                      {getTargetIcon(entry.target)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {entry.title}
                        </h3>
                        <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{entry.description}</p>
                      
                      {entry.details && (
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {entry.details.wordCountChange && (
                            <span className="flex items-center space-x-1">
                              <FileText className="w-3 h-3" />
                              <span>
                                {entry.details.wordCountChange > 0 ? '+' : ''}
                                {entry.details.wordCountChange} words
                              </span>
                            </span>
                          )}
                          
                          {entry.details.charactersAffected && (
                            <span className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>
                                Characters: {entry.details.charactersAffected.join(', ')}
                              </span>
                            </span>
                          )}
                          
                          {entry.details.category && (
                            <span className="flex items-center space-x-1">
                              <span className="w-3 h-3 text-center">#</span>
                              <span>Category: {entry.details.category}</span>
                            </span>
                          )}

                          {entry.details.content && (
                            <span className="flex items-center space-x-1">
                              <FileText className="w-3 h-3" />
                              <span>"{entry.details.content}"</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions for deleted notes */}
                      {entry.type === 'delete' && entry.target === 'note' && entry.id.startsWith('note-') && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              const noteId = entry.id.replace('note-', '');
                              handleRestoreNote(noteId);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Restore Note
                          </button>
                          <button
                            onClick={() => {
                              const deletedNote = getDeletedNoteFromId(entry.id);
                              if (deletedNote) setSelectedNote(deletedNote);
                            }}
                            className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load More Button (if needed) */}
            {filteredEntries.length >= 10 && (
              <div className="mt-6 text-center">
                <button className="px-4 py-2 text-gray-600 bg-[#e8ddc1] hover:bg-gray-200 rounded-lg transition-colors">
                  Load More History
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Deleted Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Deleted Note Details</h3>
              <button
                onClick={() => setSelectedNote(null)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Title:</label>
                <p className="text-sm text-gray-900">{selectedNote.title || 'Untitled Note'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Category:</label>
                <span className="ml-2 px-2 py-1 bg-gray-100 text-xs rounded">{selectedNote.category}</span>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Content:</label>
                <div className="mt-1 p-3 bg-gray-50 rounded text-sm text-gray-900 max-h-32 overflow-y-auto">
                  {selectedNote.content || 'No content'}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Deleted:</label>
                <p className="text-sm text-gray-600">{formatTimestamp(selectedNote.deletedAt)}</p>
              </div>
              
              {selectedNote.deletedReason && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Reason:</label>
                  <p className="text-sm text-gray-600">{selectedNote.deletedReason}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleRestoreNote(selectedNote.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Restore Note
              </button>
              <button
                onClick={() => handlePermanentDelete(selectedNote.id)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {historyEntries.filter(e => e.type === 'create').length}
            </div>
            <div className="text-sm text-gray-600">Items Created</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {historyEntries.filter(e => e.type === 'edit').length}
            </div>
            <div className="text-sm text-gray-600">Items Edited</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {historyEntries.filter(e => e.type === 'delete' && e.target === 'note').length}
            </div>
            <div className="text-sm text-gray-600">Notes Deleted</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {historyEntries.reduce((total, entry) => 
                total + (entry.details?.wordCountChange || 0), 0
              )}
            </div>
            <div className="text-sm text-gray-600">Words Added</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
