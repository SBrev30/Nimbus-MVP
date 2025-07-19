import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
  PlotThread,
  PlotEvent,
  PlotStatistics,
  CreatePlotThreadRequest,
  UpdatePlotThreadRequest,
  CreatePlotEventRequest,
  UpdatePlotEventRequest,
  PlotThreadFilter,
  TimelineEvent
} from '../types/plot';

interface UsePlotManagementReturn {
  // Data
  plotThreads: PlotThread[];
  selectedThread: PlotThread | null;
  plotStatistics: PlotStatistics | null;
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Error handling
  error: string | null;
  
  // Thread operations
  loadPlotThreads: (projectId: string) => Promise<void>;
  createPlotThread: (data: CreatePlotThreadRequest) => Promise<PlotThread | null>;
  updatePlotThread: (threadId: string, data: UpdatePlotThreadRequest) => Promise<boolean>;
  deletePlotThread: (threadId: string) => Promise<boolean>;
  
  // Event operations
  createPlotEvent: (data: CreatePlotEventRequest) => Promise<PlotEvent | null>;
  updatePlotEvent: (eventId: string, data: UpdatePlotEventRequest) => Promise<boolean>;
  deletePlotEvent: (eventId: string) => Promise<boolean>;
  
  // Selection and filtering
  setSelectedThread: (thread: PlotThread | null) => void;
  getFilteredThreads: (filter: PlotThreadFilter) => PlotThread[];
  getTimelineEvents: () => TimelineEvent[];
  
  // Statistics
  loadPlotStatistics: (projectId: string) => Promise<void>;
  
  // Utility functions
  clearError: () => void;
  refreshData: (projectId: string) => Promise<void>;
}

export function usePlotManagement(): UsePlotManagementReturn {
  const [plotThreads, setPlotThreads] = useState<PlotThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<PlotThread | null>(null);
  const [plotStatistics, setPlotStatistics] = useState<PlotStatistics | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load plot threads with events
  const loadPlotThreads = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Load threads with event counts
      const { data: threads, error: threadsError } = await supabase
        .from('plot_threads_with_event_count')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (threadsError) throw threadsError;

      // Load events for each thread
      const threadsWithEvents = await Promise.all(
        (threads || []).map(async (thread) => {
          const { data: events, error: eventsError } = await supabase
            .from('plot_events')
            .select('*')
            .eq('thread_id', thread.id)
            .order('order_index', { ascending: true });

          if (eventsError) {
            console.warn(`Failed to load events for thread ${thread.id}:`, eventsError);
            return { ...thread, events: [] };
          }

          return { ...thread, events: events || [] };
        })
      );

      setPlotThreads(threadsWithEvents);
      
      // Set first thread as selected if none selected
      if (!selectedThread && threadsWithEvents.length > 0) {
        setSelectedThread(threadsWithEvents[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plot threads');
      console.error('Error loading plot threads:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedThread]);

  // Create new plot thread
  const createPlotThread = useCallback(async (data: CreatePlotThreadRequest): Promise<PlotThread | null> => {
    setCreating(true);
    setError(null);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const threadData = {
        ...data,
        user_id: user.user?.id,
        color: data.color || '#3B82F6',
        tags: data.tags || [],
        tension_curve: [],
        connected_character_ids: [],
        connected_thread_ids: [],
        completion_percentage: 0
      };

      const { data: newThread, error } = await supabase
        .from('plot_threads')
        .insert([threadData])
        .select()
        .single();

      if (error) throw error;

      // Add to local state with empty events
      const threadWithEvents = { ...newThread, events: [], event_count: 0, avg_tension: 0 };
      setPlotThreads(prev => [...prev, threadWithEvents]);
      setSelectedThread(threadWithEvents);
      
      return threadWithEvents;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plot thread');
      console.error('Error creating plot thread:', err);
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  // Update plot thread
  const updatePlotThread = useCallback(async (threadId: string, data: UpdatePlotThreadRequest): Promise<boolean> => {
    setUpdating(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('plot_threads')
        .update(data)
        .eq('id', threadId);

      if (error) throw error;

      // Update local state
      setPlotThreads(prev => 
        prev.map(thread => 
          thread.id === threadId ? { ...thread, ...data } : thread
        )
      );

      // Update selected thread if it's the one being updated
      if (selectedThread?.id === threadId) {
        setSelectedThread(prev => prev ? { ...prev, ...data } : null);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plot thread');
      console.error('Error updating plot thread:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  }, [selectedThread]);

  // Delete plot thread
  const deletePlotThread = useCallback(async (threadId: string): Promise<boolean> => {
    setDeleting(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('plot_threads')
        .delete()
        .eq('id', threadId);

      if (error) throw error;

      // Update local state
      setPlotThreads(prev => prev.filter(thread => thread.id !== threadId));
      
      // Clear selection if deleted thread was selected
      if (selectedThread?.id === threadId) {
        setSelectedThread(null);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete plot thread');
      console.error('Error deleting plot thread:', err);
      return false;
    } finally {
      setDeleting(false);
    }
  }, [selectedThread]);

  // Create plot event
  const createPlotEvent = useCallback(async (data: CreatePlotEventRequest): Promise<PlotEvent | null> => {
    setCreating(true);
    setError(null);
    
    try {
      // Get the highest order_index for this thread
      const { data: existingEvents } = await supabase
        .from('plot_events')
        .select('order_index')
        .eq('thread_id', data.thread_id)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrderIndex = data.order_index ?? ((existingEvents?.[0]?.order_index ?? 0) + 1);

      const eventData = {
        ...data,
        tension_level: data.tension_level || 5,
        order_index: nextOrderIndex
      };

      const { data: newEvent, error } = await supabase
        .from('plot_events')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPlotThreads(prev => 
        prev.map(thread => 
          thread.id === data.thread_id 
            ? { ...thread, events: [...(thread.events || []), newEvent] }
            : thread
        )
      );

      // Update selected thread if it's the one we're adding to
      if (selectedThread?.id === data.thread_id) {
        setSelectedThread(prev => 
          prev ? { ...prev, events: [...(prev.events || []), newEvent] } : null
        );
      }

      return newEvent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plot event');
      console.error('Error creating plot event:', err);
      return null;
    } finally {
      setCreating(false);
    }
  }, [selectedThread]);

  // Update plot event
  const updatePlotEvent = useCallback(async (eventId: string, data: UpdatePlotEventRequest): Promise<boolean> => {
    setUpdating(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('plot_events')
        .update(data)
        .eq('id', eventId);

      if (error) throw error;

      // Update local state
      setPlotThreads(prev => 
        prev.map(thread => ({
          ...thread,
          events: (thread.events || []).map(event => 
            event.id === eventId ? { ...event, ...data } : event
          )
        }))
      );

      // Update selected thread
      if (selectedThread) {
        setSelectedThread(prev => 
          prev ? {
            ...prev,
            events: (prev.events || []).map(event => 
              event.id === eventId ? { ...event, ...data } : event
            )
          } : null
        );
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plot event');
      console.error('Error updating plot event:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  }, [selectedThread]);

  // Delete plot event
  const deletePlotEvent = useCallback(async (eventId: string): Promise<boolean> => {
    setDeleting(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('plot_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      // Update local state
      setPlotThreads(prev => 
        prev.map(thread => ({
          ...thread,
          events: (thread.events || []).filter(event => event.id !== eventId)
        }))
      );

      // Update selected thread
      if (selectedThread) {
        setSelectedThread(prev => 
          prev ? {
            ...prev,
            events: (prev.events || []).filter(event => event.id !== eventId)
          } : null
        );
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete plot event');
      console.error('Error deleting plot event:', err);
      return false;
    } finally {
      setDeleting(false);
    }
  }, [selectedThread]);

  // Filter threads by type
  const getFilteredThreads = useCallback((filter: PlotThreadFilter): PlotThread[] => {
    if (filter === 'all') return plotThreads;
    return plotThreads.filter(thread => thread.type === filter);
  }, [plotThreads]);

  // Get timeline events across all threads
  const getTimelineEvents = useCallback((): TimelineEvent[] => {
    const timelineEvents: TimelineEvent[] = [];
    
    plotThreads.forEach(thread => {
      thread.events?.forEach(event => {
        timelineEvents.push({
          ...event,
          thread_title: thread.title,
          thread_type: thread.type,
          thread_color: thread.color
        });
      });
    });

    // Sort by order_index, then by created_at
    return timelineEvents.sort((a, b) => {
      if (a.order_index !== b.order_index) {
        return a.order_index - b.order_index;
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [plotThreads]);

  // Load plot statistics
  const loadPlotStatistics = useCallback(async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_plot_statistics', { project_uuid: projectId });

      if (error) throw error;

      if (data && data.length > 0) {
        setPlotStatistics({
          total_threads: Number(data[0].total_threads) || 0,
          total_events: Number(data[0].total_events) || 0,
          avg_completion: Number(data[0].avg_completion) || 0,
          thread_type_counts: data[0].thread_type_counts || {}
        });
      }
    } catch (err) {
      console.error('Error loading plot statistics:', err);
      // Don't set error state for statistics - it's not critical
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async (projectId: string) => {
    await Promise.all([
      loadPlotThreads(projectId),
      loadPlotStatistics(projectId)
    ]);
  }, [loadPlotThreads, loadPlotStatistics]);

  return {
    // Data
    plotThreads,
    selectedThread,
    plotStatistics,
    
    // Loading states
    loading,
    creating,
    updating,
    deleting,
    
    // Error handling
    error,
    
    // Thread operations
    loadPlotThreads,
    createPlotThread,
    updatePlotThread,
    deletePlotThread,
    
    // Event operations
    createPlotEvent,
    updatePlotEvent,
    deletePlotEvent,
    
    // Selection and filtering
    setSelectedThread,
    getFilteredThreads,
    getTimelineEvents,
    
    // Statistics
    loadPlotStatistics,
    
    // Utility functions
    clearError,
    refreshData
  };
}
