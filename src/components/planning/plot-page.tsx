import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus, BookOpen, Edit3, Trash2, Eye, Circle } from 'lucide-react';
import { SimpleSearchFilter, useSimpleFilter } from '../shared/simple-search-filter';
import { plotService } from '../../services/plot-service';
import { CreatePlotThreadModal } from './create-plot-thread-modal';
import { PlotThreadDetailModal } from './plot-thread-detail-modal';
import type { PlotThread, CreatePlotThreadRequest, PlotPageProps } from '../../types/plot';

export function PlotPage({ onBack, projectId }: PlotPageProps) {
  const [plotThreads, setPlotThreads] = useState<PlotThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedThread, setSelectedThread] = useState<PlotThread | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [threadToEdit, setThreadToEdit] = useState<PlotThread | null>(null);

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [threadToView, setThreadToView] = useState<PlotThread | null>(null);

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

  const handleCreateThread = useCallback(async (threadData: CreatePlotThreadRequest): Promise<PlotThread | null> => {
    try {
      setIsCreating(true);
      const newThread = await plotService.createPlotThread({
        ...threadData,
        project_id: projectId
      });
      if (newThread) {
        setPlotThreads(prev => [newThread, ...prev]);
        setIsModalOpen(false);
        return newThread;
      }
      return null;
    } catch (error) {
      console.error('Error creating plot thread:', error);
      throw error; // Re-throw so modal can handle it
    } finally {
      setIsCreating(false);
    }
  }, [projectId]);

  const handleEditThread = useCallback(async (threadData: CreatePlotThreadRequest): Promise<PlotThread | null> => {
    if (!threadToEdit) return null;
    
    try {
      setIsCreating(true);
      const updatedThread = await plotService.updatePlotThread(threadToEdit.id, {
        title: threadData.title,
        type: threadData.type,
        description: threadData.description,
        color: threadData.color,
        tags: threadData.tags
      });
      
      if (updatedThread) {
        setPlotThreads(prev => prev.map(thread => 
          thread.id === threadToEdit.id ? updatedThread : thread
        ));
        setEditModalOpen(false);
        setThreadToEdit(null);
        return updatedThread;
      }
      return null;
    } catch (error) {
      console.error('Error updating plot thread:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [threadToEdit]);

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
    setThreadToView(thread);
    setDetailModalOpen(true);
  }, []);

  const handleViewThread = useCallback((e: React.MouseEvent, thread: PlotThread) => {
    e.stopPropagation();
    setThreadToView(thread);
    setDetailModalOpen(true);
  }, []);

  const handleEditClick = useCallback((e: React.MouseEvent, thread: PlotThread) => {
    e.stopPropagation();
    setThreadToEdit(thread);
    setEditModalOpen(true);
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

        {/* Create Plot Thread Modal */}
        {isModalOpen && (
          <CreatePlotThreadModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateThread}
            projectId={projectId}
            isLoading={isCreating}
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
                      onClick={() => handleThreadClick(thread)}
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
                            onClick={(e) => handleViewThread(e, thread)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="View plot thread"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => handleEditClick(e, thread)}
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

      {/* Create Plot Thread Modal */}
      {isModalOpen && (
        <CreatePlotThreadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateThread}
          projectId={projectId}
          isLoading={isCreating}
        />
      )}

      {/* Edit Plot Thread Modal */}
      {editModalOpen && threadToEdit && (
        <CreatePlotThreadModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setThreadToEdit(null);
          }}
          onSubmit={handleEditThread}
          projectId={projectId}
          isLoading={isCreating}
          initialData={{
            title: threadToEdit.title,
            type: threadToEdit.type,
            description: threadToEdit.description || '',
            color: threadToEdit.color || '#3B82F6',
            tags: threadToEdit.tags || []
          }}
          isEditing={true}
        />
      )}

      {/* Plot Thread Detail Modal */}
      {detailModalOpen && (
        <PlotThreadDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setThreadToView(null);
          }}
          thread={threadToView}
        />
      )}
    </>
  );
}
