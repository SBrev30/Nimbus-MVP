import React, { useState, useEffect } from 'react';
import { Clock, FileText, Users, RotateCcw, Trash2, Eye, Search, Filter, Download, StickyNote, FolderOpen } from 'lucide-react';

interface HistoryEntry {
  id: string;
  type: 'chapter' | 'note' | 'character' | 'project';
  title: string;
  action: 'created' | 'updated' | 'deleted';
  content?: string;
  timestamp: Date;
  wordCount?: number;
  chapterNumber?: number;
  metadata?: Record<string, unknown>;
}

interface HistoryFilter {
  type: 'all' | 'chapter' | 'note' | 'character' | 'project';
  action: 'all' | 'created' | 'updated' | 'deleted';
  dateRange: 'all' | 'today' | 'week' | 'month';
}

const History: React.FC = () => {
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<HistoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<HistoryFilter>({
    type: 'all',
    action: 'all',
    dateRange: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Load history from storage on mount
  useEffect(() => {
    loadHistoryData();
  }, []);

  // Filter entries whenever filter or search changes
  useEffect(() => {
    applyFilters();
  }, [historyEntries, filter, searchQuery]);

  const loadHistoryData = async () => {
    setIsLoading(true);
    try {
      // Load from localStorage first, then enhance with any cloud data
      const localHistory = localStorage.getItem('app-history');
      const entries: HistoryEntry[] = localHistory ? JSON.parse(localHistory) : [];
      
      // Validate entries structure
      if (!Array.isArray(entries)) {
        throw new Error('Invalid history data format');
      }
      
      // Convert date strings back to Date objects
      const processedEntries = entries.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      })).filter(entry =>
        entry.id &&
        entry.type &&
        entry.title &&
        entry.action &&
        entry.timestamp instanceof Date &&
        !isNaN(entry.timestamp.getTime())
      );

      setHistoryEntries(processedEntries);
    } catch (error) {
      console.error('Failed to load history:', error);
      setHistoryEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...historyEntries];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(query) ||
        entry.content?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filter.type !== 'all') {
      filtered = filtered.filter(entry => entry.type === filter.type);
    }

    // Apply action filter
    if (filter.action !== 'all') {
      filtered = filtered.filter(entry => entry.action === filter.action);
    }

    // Apply date range filter
    if (filter.dateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (filter.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(entry => entry.timestamp >= startDate);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredEntries(filtered);
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'chapter':
        return <FileText className="w-4 h-4" />;
      case 'character':
        return <Users className="w-4 h-4" />;
      case 'note':
        return <StickyNote className="w-4 h-4" />;
      case 'project':
        return <FolderOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'text-green-600 bg-green-50';
      case 'updated':
        return 'text-blue-600 bg-blue-50';
      case 'deleted':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${Math.floor(hours)}h ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  // Add state to control the confirmation modal
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Trigger the confirmation modal instead of browser confirm
  const clearHistory = () => {
    setShowClearConfirm(true);
  };

  // Perform the actual clear when user confirms
  const confirmClearHistory = () => {
    setHistoryEntries([]);
    localStorage.removeItem('app-history');
    setShowClearConfirm(false);
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(historyEntries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `writersblock-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#A5F7AC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#889096]">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-t-[17px] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-[#A5F7AC]" />
            <h1 className="text-xl font-semibold text-gray-900">History</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-[#A5F7AC] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={exportHistory}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
              title="Export History"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={clearHistory}
              className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-red-600"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filter.type}
                  onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value as HistoryFilter['type'] }))}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5F7AC]"
                >
                  <option value="all">All Types</option>
                  <option value="chapter">Chapters</option>
                  <option value="character">Characters</option>
                  <option value="note">Notes</option>
                  <option value="project">Projects</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={filter.action}
                  onChange={(e) => setFilter(prev => ({ ...prev, action: e.target.value as any }))}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5F7AC]"
                >
                  <option value="all">All Actions</option>
                  <option value="created">Created</option>
                  <option value="updated">Updated</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={filter.dateRange}
                  onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value as any }))}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A5F7AC]"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No history found</h3>
              <p className="text-gray-600">
                {searchQuery || filter.type !== 'all' || filter.action !== 'all' || filter.dateRange !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Your editing history will appear here as you work on your project'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                      {getEntryIcon(entry.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {entry.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(entry.action)}`}>
                          {entry.action}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {entry.type === 'chapter' && entry.chapterNumber && `Chapter ${entry.chapterNumber} • `}
                        {entry.wordCount && `${entry.wordCount} words • `}
                        {formatTimestamp(entry.timestamp)}
                      </p>
                      {entry.content && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {entry.content.substring(0, 120)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntry(entry);
                    }}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">History Entry Details</h2>
               <h2 className="text-lg font-semibold text-gray-900">History Entry Details</h2>
               <button
                 onClick={() => setSelectedEntry(null)}
                 className="text-gray-400 hover:text-gray-600 transition-colors"
                 aria-label="Close modal"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <p className="text-gray-900">{selectedEntry.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <p className="text-gray-900 capitalize">{selectedEntry.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(selectedEntry.action)}`}>
                      {selectedEntry.action}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                  <p className="text-gray-900">{selectedEntry.timestamp.toLocaleString()}</p>
                </div>
                {selectedEntry.wordCount && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Word Count</label>
                    <p className="text-gray-900">{selectedEntry.wordCount} words</p>
                  </div>
                )}
                {selectedEntry.content && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content Preview</label>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedEntry.content}</p>
                    </div>
                  </div>
                )}
                {selectedEntry.metadata && Object.keys(selectedEntry.metadata).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      {Object.entries(selectedEntry.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1">
                          <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="text-gray-900">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
