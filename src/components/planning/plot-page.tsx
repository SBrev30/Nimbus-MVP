import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Filter, 
  Zap, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Target, 
  MoreHorizontal,
  Trash2,
  AlertCircle,
  X,
  Link,
  ExternalLink
} from 'lucide-react';
import { plotService } from '../../services/plot-service';
import { useCanvasPlanningData } from '../../hooks/useCanvasPlanningData';
import { CreatePlotThreadModal } from './create-plot-thread-modal';
import type { PlotPageProps, PlotThreadFilter, PlotViewMode } from '../../types/plot';
import type { PlotThread, PlotEvent } from '../../services/plot-service';

export function PlotPage({ onBack, projectId }: PlotPageProps) {
  const [plotThreads, setPlotThreads] = useState<PlotThread[]>([]);
  const [plotEvents, setPlotEvents] = useState<PlotEvent[]>([]);
  const [selectedThread, setSelectedThread] = useState<PlotThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<PlotThreadFilter>('all');
  const [viewMode, setViewMode] = useState<PlotViewMode>('threads');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Use canvas planning data hook for integration
  const { refresh: refreshCanvasData } = useCanvasPlanningData();

  // Load data on mount and when projectId changes
  useEffect(() => {
    if (projectId && projectId !== 'no-project') {
      loadPlotData();
    }
  }, [projectId]);

  const loadPlotData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [threads, events] = await Promise.all([
        plotService.getPlotThreads(projectId),
        plotService.getPlotEvents(undefined, projectId)
      ]);
      setPlotThreads(threads);
      setPlotEvents(events);
      
      // Refresh canvas integration data
      if (refreshCanvasData) {
        await refreshCanvasData();
      }
    } catch (err) {
      console.error('Error loading plot data:', err);
      setError('Failed to load plot data');
    } finally {
      setLoading(false);
    }
  };

  const createPlotThread = async (threadData: any) => {
    try {
      setCreating(true);
      setError(null);
      const newThread = await plotService.createPlotThread({
        ...threadData,
        project_id: projectId
      });
      
      if (newThread) {
        setPlotThreads(prev => [...prev, newThread]);
        setShowCreateModal(false);
        if (refreshCanvasData) {
          await refreshCanvasData(); // Refresh canvas integration
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating plot thread:', err);
      setError('Failed to create plot thread');
      return false;
    } finally {
      setCreating(false);
    }
  };

  const deletePlotThread = async (threadId: string) => {
    try {
      setDeleting(true);
      setError(null);
      await plotService.deletePlotThread(threadId);
      
      setPlotThreads(prev => prev.filter(thread => thread.id !== threadId));
      setPlotEvents(prev => prev.filter(event => event.plot_thread_id !== threadId));
      if (selectedThread?.id === threadId) {
        setSelectedThread(null);
      }
      setDeleteConfirm(null);
      if (refreshCanvasData) {
        await refreshCanvasData(); // Refresh canvas integration
      }
      return true;
    } catch (err) {
      console.error('Error deleting plot thread:', err);
      setError('Failed to delete plot thread');
      return false;
    } finally {
      setDeleting(false);
    }
  };

  const getFilteredThreads = (filter: PlotThreadFilter): PlotThread[] => {
    if (filter === 'all') return plotThreads;
    // Map the type system differences
    const filterMap: Record<PlotThreadFilter, string[]> = {
      'all': [],
      'main': ['main'],
      'subplot': ['subplot'],
      'character_arc': ['character_arc'],
      'side_story': ['other'] // Map side_story to other for compatibility
    };
    
    const targetTypes = filterMap[filter] || [filter];
    return plotThreads.filter(thread => targetTypes.includes(thread.thread_type));
  };

  const getThreadEvents = (threadId: string): PlotEvent[] => {
    return plotEvents.filter(event => event.plot_thread_id === threadId);
  };

  const calculateThreadCompleteness = (thread: PlotThread): number => {
    const threadEvents = getThreadEvents(thread.id);
    return plotService.calculateThreadCompleteness(thread, threadEvents);
  };

  const clearError = () => setError(null);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'main':
        return 'bg-blue-100 text-blue-800';
      case 'subplot':
        return 'bg-purple-100 text-purple-800';
      case 'character_arc':
        return 'bg-green-100 text-green-800';
      case 'theme':
        return 'bg-yellow-100 text-yellow-800';
      case 'mystery':
        return 'bg-indigo-100 text-indigo-800';
      case 'romance':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'main':
        return '🌍';
      case 'subplot':
        return '📖';
      case 'character_arc':
        return '👤';
      case 'theme':
        return '💭';
      case 'mystery':
        return '🔍';
      case 'romance':
        return '💕';
      default:
        return '📄';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'setup':
        return '🎬';
      case 'inciting_incident':
        return '🔥';
      case 'rising_action':
        return '📈';
      case 'climax':
        return '✨';
      case 'falling_action':
        return '📉';
      case 'resolution':
        return '✅';
      case 'twist':
        return '🌪️';
      case 'conflict':
        return '⚔️';
      default:
        return '📜';
    }
  };

  const renderTensionCurve = (thread: PlotThread) => {
    const { start_tension, peak_tension, end_tension } = thread;
    
    if (start_tension === undefined || peak_tension === undefined || end_tension === undefined) {
      return (
        <div className="w-full h-16 flex items-center justify-center text-gray-400 text-sm">
          No tension data
        </div>
      );
    }

    const tensionPoints = [start_tension, peak_tension, end_tension];
    const maxTension = Math.max(...tensionPoints, 10); // Ensure minimum scale
    const points = tensionPoints.map((tension, index) => {
      const x = (index / (tensionPoints.length - 1)) * 100;
      const y = 100 - (tension / maxTension) * 100;
      return `${x},${y}`;
    }).join(' ');

    const color = thread.color || '#3b82f6';
    const gradientId = `gradient-${thread.id}`;

    return (
      <svg className="w-full h-16" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        <polygon
          fill={`url(#${gradientId})`}
          points={`0,100 ${points} 100,100`}
        />
      </svg>
    );
  };

  // Timeline view implementation
  const renderTimelineView = () => {
    const sortedEvents = [...plotEvents].sort((a, b) => a.order_in_thread - b.order_in_thread);
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plot Timeline</h3>
        <div className="space-y-3">
          {sortedEvents.map((event, index) => {
            const thread = plotThreads.find(t => t.id === event.plot_thread_id);
            return (
              <div key={event.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getEventTypeIcon(event.event_type)}</span>
                    <h4 className="font-medium text-gray-900">{event.name}</h4>
                    {thread && (
                      <span 
                        className="px-2 py-1 text-xs rounded-full"
                        style={{ backgroundColor: thread.color + '20', color: thread.color }}
                      >
                        {thread.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Tension: {event.tension_level || 0}/10</span>
                    <span>Type: {event.event_type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {sortedEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-2xl mb-2">📅</div>
              <p>No events to display in timeline</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Tension view implementation
  const renderTensionView = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Tension Analysis</h3>
        
        {/* Overall Tension Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Thread Tension Curves</h4>
          <div className="space-y-4">
            {plotThreads.map(thread => (
              <div key={thread.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: thread.color }}
                    />
                    <span className="text-sm font-medium">{thread.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {thread.start_tension || 0} → {thread.peak_tension || 0} → {thread.end_tension || 0}
                  </span>
                </div>
                <div className="h-12">
                  {renderTensionCurve(thread)}
                </div>
              </div>
            ))}
            {plotThreads.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-2xl mb-2">📊</div>
                <p>No tension data to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Tension Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Avg Peak Tension</div>
            <div className="text-2xl font-bold text-gray-900">
              {plotThreads.length > 0 
                ? Math.round(plotThreads.reduce((sum, t) => sum + (t.peak_tension || 0), 0) / plotThreads.length)
                : 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Highest Tension</div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.max(...plotThreads.map(t => t.peak_tension || 0), 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Tension Range</div>
            <div className="text-2xl font-bold text-gray-900">
              {plotThreads.length > 0 
                ? Math.max(...plotThreads.map(t => t.peak_tension || 0)) - Math.min(...plotThreads.map(t => t.start_tension || 0))
                : 0}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredThreads = getFilteredThreads(filterType);
  const totalThreads = plotThreads.length;
  const completedThreads = plotThreads.filter(t => {
    const completeness = calculateThreadCompleteness(t);
    return completeness >= 80; // Consider 80%+ as completed
  }).length;
  const averageCompletion = totalThreads > 0 
    ? Math.round(plotThreads.reduce((sum, t) => sum + calculateThreadCompleteness(t), 0) / totalThreads)
    : 0;

  if (loading && plotThreads.length === 0) {
    return (
      <div className="h-screen bg-[#f2eee2] flex items-center justify-center font-inter">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#ff4e00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#889096]">Loading plot threads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#f2eee2] flex flex-col font-inter">
      {/* Header */}
      <div className="bg-white border-b border-[#C6C5C5] p-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#889096]" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">Plot Development</h1>
            <p className="text-[#889096] mt-1">
              Manage your story's plot threads and narrative structure with {filteredThreads.length} active plot threads
            </p>
          </div>

          {/* Canvas Integration Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Link className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">Canvas Ready</span>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 rounded-lg transition-colors font-semibold text-white disabled:opacity-50"
          >
            {creating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            New Plot Thread
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Statistics Row */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-900">{totalThreads}</div>
            <div className="text-sm text-blue-700">Total Threads</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-900">{completedThreads}</div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-900">{averageCompletion}%</div>
            <div className="text-sm text-purple-700">Avg. Progress</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-900">{plotEvents.length}</div>
            <div className="text-sm text-orange-700">Total Events</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#889096]" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as PlotThreadFilter)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types ({plotThreads.length})</option>
              <option value="main">Main Plot ({plotThreads.filter(t => t.thread_type === 'main').length})</option>
              <option value="subplot">Subplots ({plotThreads.filter(t => t.thread_type === 'subplot').length})</option>
              <option value="character_arc">Character Arcs ({plotThreads.filter(t => t.thread_type === 'character_arc').length})</option>
              <option value="side_story">Other ({plotThreads.filter(t => t.thread_type === 'other').length})</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-[#e8ddc1] rounded-lg p-1">
            <button
              onClick={() => setViewMode('threads')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'threads'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Threads
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('tension')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'tension'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tension
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'threads' ? (
          <>
            {/* Left Panel - Plot Threads */}
            <div className="w-1/3 border-r border-[#C6C5C5] overflow-y-auto p-6">
              {filteredThreads.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📖</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Plot Threads</h3>
                  <p className="text-[#889096] mb-4">
                    {filterType === 'all' 
                      ? 'Create your first plot thread to get started'
                      : `No ${filterType.replace('_', ' ')} threads found`}
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-white rounded-lg transition-colors"
                  >
                    Create Plot Thread
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredThreads.map(thread => {
                    const threadEvents = getThreadEvents(thread.id);
                    const completeness = calculateThreadCompleteness(thread);
                    
                    return (
                      <div
                        key={thread.id}
                        onClick={() => setSelectedThread(thread)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all relative group ${
                          selectedThread?.id === thread.id
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {/* Canvas Integration Badge */}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            <Link className="w-3 h-3" />
                            Canvas
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(thread.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                            disabled={deleting}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>

                        <div className="flex items-start justify-between mb-3 pr-16">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getTypeIcon(thread.thread_type)}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(thread.thread_type)}`}>
                              {thread.thread_type.replace('_', ' ').charAt(0).toUpperCase() + thread.thread_type.replace('_', ' ').slice(1)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">{completeness}%</div>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2">{thread.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{thread.description || 'No description'}</p>

                        {/* Tension Curve Preview */}
                        <div className="mb-3">
                          {renderTensionCurve(thread)}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${completeness}%`,
                                backgroundColor: thread.color || '#3b82f6'
                              }}
                            />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span>Events: {threadEvents.length}</span>
                          <span>Characters: {thread.connected_character_ids?.length || 0}</span>
                          <span>Status: {thread.status}</span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            thread.status === 'completed' ? 'bg-green-100 text-green-800' :
                            thread.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            thread.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {thread.status.replace('_', ' ').charAt(0).toUpperCase() + thread.status.replace('_', ' ').slice(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Panel - Thread Details */}
            <div className="w-2/3 overflow-y-auto p-6">
              {selectedThread ? (
                <div className="space-y-6">
                  {/* Thread Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getTypeIcon(selectedThread.thread_type)}</span>
                        <h2 className="text-xl font-semibold text-gray-900">{selectedThread.name}</h2>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(selectedThread.thread_type)}`}>
                          {selectedThread.thread_type.replace('_', ' ').charAt(0).toUpperCase() + selectedThread.thread_type.replace('_', ' ').slice(1)}
                        </span>
                        {/* Canvas Integration Badge */}
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          <Link className="w-3 h-3" />
                          Canvas Ready
                        </div>
                      </div>
                      <p className="text-[#889096]">{selectedThread.description || 'No description provided'}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
                        title="Add to Canvas"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Add to Canvas
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Completion</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{calculateThreadCompleteness(selectedThread)}%</div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-700">Events</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{getThreadEvents(selectedThread.id).length}</div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">Characters</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{selectedThread.connected_character_ids?.length || 0}</div>
                    </div>
                  </div>

                  {/* Tension Curve */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tension Curve</h3>
                    <div className="h-32">
                      {renderTensionCurve(selectedThread)}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Beginning ({selectedThread.start_tension || 0})</span>
                      <span>Peak ({selectedThread.peak_tension || 0})</span>
                      <span>End ({selectedThread.end_tension || 0})</span>
                    </div>
                  </div>

                  {/* Plot Events */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Plot Events</h3>
                      <button className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm">
                        <Plus className="w-4 h-4" />
                        Add Event
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(() => {
                        const threadEvents = getThreadEvents(selectedThread.id);
                        return threadEvents.length > 0 ? (
                          threadEvents.map((event) => (
                            <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-lg">{getEventTypeIcon(event.event_type)}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900">{event.name}</h4>
                                  {event.chapter_id && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                      Chapter {event.chapter_id}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{event.description || 'No description'}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>Tension: {event.tension_level || 0}/10</span>
                                  <span>Type: {event.event_type.replace('_', ' ')}</span>
                                  <span>Order: {event.order_in_thread}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <div className="text-2xl mb-2">📝</div>
                            <p>No events created yet</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Connected Elements */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Connected Characters</h3>
                      <div className="space-y-2">
                        {selectedThread.connected_character_ids && selectedThread.connected_character_ids.length > 0 ? (
                          selectedThread.connected_character_ids.map(characterId => (
                            <div key={characterId} className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span className="capitalize">{characterId.replace('-', ' ')}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No connected characters</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Thread Metadata</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            selectedThread.status === 'completed' ? 'bg-green-100 text-green-800' :
                            selectedThread.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            selectedThread.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedThread.status.replace('_', ' ').charAt(0).toUpperCase() + selectedThread.status.replace('_', ' ').slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="text-gray-900">{new Date(selectedThread.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Updated:</span>
                          <span className="text-gray-900">{new Date(selectedThread.updated_at).toLocaleDateString()}</span>
                        </div>
                        {selectedThread.color && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Color:</span>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: selectedThread.color }}
                              />
                              <span className="text-gray-900 text-xs font-mono">{selectedThread.color}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  {selectedThread.metadata && Object.keys(selectedThread.metadata).length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Metadata</h3>
                      <div className="space-y-2">
                        {Object.entries(selectedThread.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                            <span className="text-gray-900">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Plot Thread</h3>
                    <p className="text-[#889096] mb-4">Choose a plot thread to view events and connections</p>
                    <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      💡 <strong>Canvas Integration:</strong> Plot threads can be added to the visual canvas for better story visualization and connection mapping.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : viewMode === 'timeline' ? (
          <div className="w-full overflow-y-auto p-6">
            {renderTimelineView()}
          </div>
        ) : (
          <div className="w-full overflow-y-auto p-6">
            {renderTensionView()}
          </div>
        )}
      </div>

      {/* Create Thread Modal */}
      <CreatePlotThreadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createPlotThread}
        projectId={projectId}
        isLoading={creating}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Plot Thread</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this plot thread? This action cannot be undone and will also delete all associated plot events and canvas connections.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deletePlotThread(deleteConfirm)}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
