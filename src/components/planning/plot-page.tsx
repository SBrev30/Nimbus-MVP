import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus, BookOpen, Edit3, Trash2, Eye, Circle } from 'lucide-react';
import { SimpleSearchFilter, useSimpleFilter } from '../shared/simple-search-filter';
import { plotService } from '../../services/plot-service';
import type { PlotThread, CreatePlotThreadRequest, PlotPageProps } from '../../types/plot';

export function PlotPage({ onBack, projectId }: PlotPageProps) {
  const [plotThreads, setPlotThreads] = useState<PlotThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedThread, setSelectedThread] = useState<PlotThread | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Define filter options for plot thread types
  const typeFilterOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'main', label: 'Main Plot' },
    { value: 'subplot', label: 'Subplot' },
    { value: 'side_story', label: 'Side Story' },
    { value: 'character_arc', label: 'Character Arc' }
  ];

  // Use simplified filter hook
  const {
    searchTerm,
    setSearchTerm,
    filterValue: filterType,
    setFilterValue: setFilterType,
    filteredItems: filteredThreads,
    clearFilters,
    hasActiveFilters
  } = useSimpleFilter(
    plotThreads,
    (thread, search) => 
      thread.title?.toLowerCase().includes(search.toLowerCase()) ||
      thread.description?.toLowerCase().includes(search.toLowerCase()),
    (thread, filter) => filter === 'all' || thread.type === filter
  );

  // Load plot threads on component mount
  useEffect(() => {
    loadPlotThreads();
  }, [projectId]);

  const loadPlotThreads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await plotService.getPlotThreads(projectId);
      setPlotThreads(data);
    } catch (error) {
      console.error('Error loading plot threads:', error);
      setError('Failed to load plot threads. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateThread = useCallback(async (threadData: CreatePlotThreadRequest) => {
    try {
      const newThread = await plotService.createPlotThread({
        ...threadData,
        project_id: projectId
      });
      if (newThread) {
        setPlotThreads(prev => [newThread, ...prev]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating plot thread:', error);
      throw error; // Re-throw so modal can handle it
    }
  }, [projectId]);

  const handleDeleteThread = useCallback(async (threadId: string) => {
    if (!confirm('Are you sure you want to delete this plot thread? This action cannot be undone.')) {
      return;
    }

    try {
      await plotService.deletePlotThread(threadId);
      setPlotThreads(prev => prev.filter(thread => thread.id !== threadId));
    } catch (error) {
      console.error('Error deleting plot thread:', error);
      setError('Failed to delete plot thread. Please try again.');
    }
  }, []);

  const handleThreadClick = useCallback((thread: PlotThread) => {
    setSelectedThread(thread);
    // TODO: Open thread detail modal or navigate to thread detail page
  }, []);

  // Helper function for thread type colors
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'main':
        return 'bg-blue-100 text-blue-800';
      case 'subplot':
        return 'bg-green-100 text-green-800';
      case 'side_story':
        return 'bg-purple-100 text-purple-800';
      case 'character_arc':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate completeness score for display
  const calculateCompletion = useCallback((thread: any) => {
    return plotService.calculateThreadCompleteness(thread, thread.events || []);
  }, []);

  // Show error state
  if (error) {
    return (
      <div className="h-screen bg-[#f2eee2] flex flex-col font-inter">
        <div className="bg-white border-b border-[#C6C5C5] p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#889096]" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Plot Development</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Plot Threads</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadPlotThreads}
              className="px-4 py-2 bg-[#ff4e00] text-white rounded-lg hover:bg-[#ff4e00]/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen bg-[#f2eee2] flex flex-col font-inter">
        <div className="bg-white border-b border-[#C6C5C5] p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#889096]" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Plot Development</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#e8ddc1] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <BookOpen className="w-8 h-8 text-gray-700" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Plot Threads...</h2>
            <p className="text-gray-600">Please wait while we fetch your plot threads</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state when no plot threads exist
  if (plotThreads.length === 0) {
    return (
      <>
        <div className="h-screen bg-[#f2eee2] flex flex-col font-inter">
          {/* Header */}
          <div className="bg-white border-b border-[#C6C5C5] p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#889096]" />
              </button>
              
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">Plot Development</h1>
                <p className="text-[#889096] mt-1">
                  Create and manage your story's plot threads
                </p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-[#e8ddc1] rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-gray-700" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Build Your Plot</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Create engaging plot threads that weave together to form compelling narratives. Track tension, character connections, and story progression.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff4e00] hover:bg-[#ff4e00]/80 rounded-lg transition-colors font-semibold text-white"
              >
                <Plus className="w-5 h-5" />
                Create First Plot Thread
              </button>
              
              {/* Tips */}
              <div className="bg-[#e8ddc1] rounded-lg p-4 text-left mt-8">
                <h3 className="font-semibold text-gray-900 mb-3 text-center">Plot Development Tips</h3>
                <ul className="space-y-2 text-sm text-gray-800">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Start with your main plot thread
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Add subplots that support your main story
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Track tension levels throughout your story
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Connect plot threads with character arcs
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Plot Thread Creation Modal - TODO: Create this component */}
        {isModalOpen && (
          <PlotThreadModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleCreateThread}
          />
        )}
      </>
    );
  }

  // Show content when plot threads exist
  return (
    <>
      <div className="h-screen bg-[#f2eee2] flex flex-col font-inter">
        {/* Header */}
        <div className="bg-white border-b border-[#C6C5C5] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#889096]" />
              </button>
              
              <div className="flex-1">
                <nav className="flex items-center space-x-2 text-sm text-[#889096] font-semibold mb-2">
                  <button onClick={onBack} className="hover:text-gray-700 transition-colors">
                    Planning
                  </button>
                  <span className="text-[#889096]">›</span>
                  <span className="text-gray-900">Plot</span>
                </nav>
                
                <h1 className="text-2xl font-semibold text-gray-900">Plot Development</h1>
                <p className="text-[#889096] mt-1">
                  Managing {filteredThreads.length} plot thread{filteredThreads.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-semibold"
            >
              <Plus className="w-4 h-4" />
              New Plot Thread
            </button>
          </div>

          {/* Simplified Search and Filter */}
          <SimpleSearchFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search plot threads..."
            filterValue={filterType}
            onFilterChange={setFilterType}
            filterOptions={typeFilterOptions}
            onClear={clearFilters}
            showClearAll={hasActiveFilters}
            className="max-w-2xl"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="p-6">
            {filteredThreads.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {hasActiveFilters ? 'No plot threads match your filters' : 'No plot threads found'}
                  </h3>
                  <p className="text-[#889096] mb-4">
                    {hasActiveFilters ? 'Try adjusting your search or filters' : 'Create your first plot thread to start building your story'}
                  </p>
                  {hasActiveFilters ? (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Create First Plot Thread
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredThreads.map(thread => {
                  const completeness = calculateCompletion(thread);
                  return (
                    <div
                      key={thread.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {thread.color && (
                            <Circle 
                              className="w-3 h-3 flex-shrink-0" 
                              style={{ color: thread.color, fill: thread.color }}
                            />
                          )}
                          <h3 className="font-semibold text-gray-900 truncate">{thread.title}</h3>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleThreadClick(thread);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="View plot thread"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement edit functionality
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Edit plot thread"
                          >
                            <Edit3 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteThread(thread.id);
                            }}
                            className="p-1.5 hover:bg-red-100 rounded transition-colors"
                            title="Delete plot thread"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(thread.type)}`}>
                          {thread.type.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <div className="w-8 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-green-400 h-1.5 rounded-full" 
                              style={{ width: `${completeness}%` }}
                            ></div>
                          </div>
                          <span>{completeness}%</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{thread.description || 'No description'}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{thread.event_count || 0} events</span>
                          {thread.connected_character_ids && thread.connected_character_ids.length > 0 && (
                            <span>• {thread.connected_character_ids.length} characters</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(thread.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plot Thread Creation Modal - TODO: Create this component */}
      {isModalOpen && (
        <PlotThreadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateThread}
        />
      )}
    </>
  );
}

// Temporary modal component - should be created as a separate component
function PlotThreadModal({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: CreatePlotThreadRequest) => Promise<void>; 
}) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'main' as const,
    description: '',
    color: '#3B82F6',
    tags: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        title: formData.title,
        type: formData.type,
        description: formData.description,
        color: formData.color,
        tags: formData.tags,
        project_id: '' // Will be set by parent
      });
      onClose();
    } catch (error) {
      console.error('Error creating plot thread:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create Plot Thread</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent"
                placeholder="Enter plot thread title..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent"
              >
                <option value="main">Main Plot</option>
                <option value="subplot">Subplot</option>
                <option value="side_story">Side Story</option>
                <option value="character_arc">Character Arc</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent"
                rows={3}
                placeholder="Describe this plot thread..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              className="px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
