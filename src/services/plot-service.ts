// src/services/plot-service.ts
import { supabase } from '../lib/supabase';
import type { 
  PlotThread, 
  PlotEvent, 
  CreatePlotThreadRequest, 
  UpdatePlotThreadRequest,
  CreatePlotEventRequest,
  UpdatePlotEventRequest,
  PlotStatistics 
} from '../types/plot';

export class PlotService {
  /**
   * Get all plot threads for a project
   */
  async getPlotThreads(projectId?: string): Promise<PlotThread[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const currentProjectId = projectId || localStorage.getItem('currentProjectId') || 'default-project';

      const { data, error } = await supabase
        .from('plot_threads')
        .select(`
          *,
          plot_events (
            id,
            title,
            description,
            chapter_reference,
            tension_level,
            event_type,
            order_index,
            metadata,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .eq('project_id', currentProjectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching plot threads:', error);
        throw new Error(`Failed to fetch plot threads: ${error.message}`);
      }

      return (data || []).map(thread => ({
        ...thread,
        events: thread.plot_events || [],
        event_count: thread.plot_events?.length || 0
      }));
    } catch (error) {
      console.error('Error in getPlotThreads:', error);
      throw error;
    }
  }

  /**
   * Get a specific plot thread by ID
   */
  async getPlotThreadById(threadId: string): Promise<PlotThread | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('plot_threads')
        .select(`
          *,
          plot_events (
            id,
            title,
            description,
            chapter_reference,
            tension_level,
            event_type,
            order_index,
            metadata,
            created_at,
            updated_at
          )
        `)
        .eq('id', threadId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching plot thread:', error);
        return null;
      }

      return {
        ...data,
        events: data.plot_events || [],
        event_count: data.plot_events?.length || 0
      };
    } catch (error) {
      console.error('Error in getPlotThreadById:', error);
      return null;
    }
  }

  /**
   * Create a new plot thread
   */
  async createPlotThread(threadData: CreatePlotThreadRequest): Promise<PlotThread | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate default color if not provided
      const defaultColors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#6366F1'];
      const defaultColor = threadData.color || defaultColors[Math.floor(Math.random() * defaultColors.length)];

      const newThread = {
        project_id: threadData.project_id,
        user_id: user.id,
        title: threadData.title,
        type: threadData.type,
        description: threadData.description || '',
        color: defaultColor,
        tension_curve: [1, 2, 3, 5, 7, 6, 4, 2], // Default tension curve
        connected_character_ids: [],
        connected_thread_ids: [],
        completion_percentage: 0,
        tags: threadData.tags || [],
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('plot_threads')
        .insert(newThread)
        .select()
        .single();

      if (error) {
        console.error('Error creating plot thread:', error);
        throw new Error(`Failed to create plot thread: ${error.message}`);
      }

      return {
        ...data,
        events: [],
        event_count: 0
      };
    } catch (error) {
      console.error('Error in createPlotThread:', error);
      throw error;
    }
  }

  /**
   * Update a plot thread
   */
  async updatePlotThread(threadId: string, updates: UpdatePlotThreadRequest): Promise<PlotThread | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('plot_threads')
        .update(updateData)
        .eq('id', threadId)
        .eq('user_id', user.id)
        .select(`
          *,
          plot_events (
            id,
            title,
            description,
            chapter_reference,
            tension_level,
            event_type,
            order_index,
            metadata,
            created_at,
            updated_at
          )
        `)
        .single();

      if (error) {
        console.error('Error updating plot thread:', error);
        throw new Error(`Failed to update plot thread: ${error.message}`);
      }

      return {
        ...data,
        events: data.plot_events || [],
        event_count: data.plot_events?.length || 0
      };
    } catch (error) {
      console.error('Error in updatePlotThread:', error);
      throw error;
    }
  }

  /**
   * Delete a plot thread and all its events
   */
  async deletePlotThread(threadId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First delete all events associated with this thread
      const { error: eventsError } = await supabase
        .from('plot_events')
        .delete()
        .eq('thread_id', threadId);

      if (eventsError) {
        console.error('Error deleting plot events:', eventsError);
        throw new Error(`Failed to delete plot events: ${eventsError.message}`);
      }

      // Then delete the thread itself
      const { error } = await supabase
        .from('plot_threads')
        .delete()
        .eq('id', threadId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting plot thread:', error);
        throw new Error(`Failed to delete plot thread: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in deletePlotThread:', error);
      throw error;
    }
  }

  /**
   * Search plot threads by title or description
   */
  async searchPlotThreads(query: string, projectId?: string): Promise<PlotThread[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const currentProjectId = projectId || localStorage.getItem('currentProjectId') || 'default-project';

      const { data, error } = await supabase
        .from('plot_threads')
        .select(`
          *,
          plot_events (
            id,
            title,
            description,
            chapter_reference,
            tension_level,
            event_type,
            order_index,
            metadata,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .eq('project_id', currentProjectId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error searching plot threads:', error);
        throw new Error(`Failed to search plot threads: ${error.message}`);
      }

      return (data || []).map(thread => ({
        ...thread,
        events: thread.plot_events || [],
        event_count: thread.plot_events?.length || 0
      }));
    } catch (error) {
      console.error('Error in searchPlotThreads:', error);
      throw error;
    }
  }

  /**
   * Get plot threads by type
   */
  async getPlotThreadsByType(type: PlotThread['type'], projectId?: string): Promise<PlotThread[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const currentProjectId = projectId || localStorage.getItem('currentProjectId') || 'default-project';

      const { data, error } = await supabase
        .from('plot_threads')
        .select(`
          *,
          plot_events (
            id,
            title,
            description,
            chapter_reference,
            tension_level,
            event_type,
            order_index,
            metadata,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .eq('project_id', currentProjectId)
        .eq('type', type)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching plot threads by type:', error);
        throw new Error(`Failed to fetch plot threads by type: ${error.message}`);
      }

      return (data || []).map(thread => ({
        ...thread,
        events: thread.plot_events || [],
        event_count: thread.plot_events?.length || 0
      }));
    } catch (error) {
      console.error('Error in getPlotThreadsByType:', error);
      throw error;
    }
  }

  /**
   * Get plot statistics for a project
   */
  async getPlotStatistics(projectId?: string): Promise<PlotStatistics> {
    try {
      const threads = await this.getPlotThreads(projectId);
      
      const totalThreads = threads.length;
      const totalEvents = threads.reduce((sum, thread) => sum + (thread.events?.length || 0), 0);
      const avgCompletion = totalThreads > 0 
        ? threads.reduce((sum, thread) => sum + thread.completion_percentage, 0) / totalThreads 
        : 0;

      const threadTypeCounts = threads.reduce((counts, thread) => {
        counts[thread.type] = (counts[thread.type] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

      return {
        total_threads: totalThreads,
        total_events: totalEvents,
        avg_completion: Math.round(avgCompletion),
        thread_type_counts: threadTypeCounts
      };
    } catch (error) {
      console.error('Error in getPlotStatistics:', error);
      throw error;
    }
  }

  /**
   * Create a plot event
   */
  async createPlotEvent(eventData: CreatePlotEventRequest): Promise<PlotEvent | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newEvent = {
        thread_id: eventData.thread_id,
        title: eventData.title,
        description: eventData.description || '',
        chapter_reference: eventData.chapter_reference,
        tension_level: eventData.tension_level || 5,
        event_type: eventData.event_type,
        order_index: eventData.order_index || 0,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('plot_events')
        .insert(newEvent)
        .select()
        .single();

      if (error) {
        console.error('Error creating plot event:', error);
        throw new Error(`Failed to create plot event: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in createPlotEvent:', error);
      throw error;
    }
  }

  /**
   * Update a plot event
   */
  async updatePlotEvent(eventId: string, updates: UpdatePlotEventRequest): Promise<PlotEvent | null> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('plot_events')
        .update(updateData)
        .eq('id', eventId)
        .select()
        .single();

      if (error) {
        console.error('Error updating plot event:', error);
        throw new Error(`Failed to update plot event: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updatePlotEvent:', error);
      throw error;
    }
  }

  /**
   * Delete a plot event
   */
  async deletePlotEvent(eventId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('plot_events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting plot event:', error);
        throw new Error(`Failed to delete plot event: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in deletePlotEvent:', error);
      throw error;
    }
  }

  /**
   * Calculate completeness score for a plot thread
   */
  calculateCompleteness(thread: PlotThread): number {
    let score = 0;
    
    // Basic info (40%)
    if (thread.title && thread.title.trim().length > 0) score += 15;
    if (thread.description && thread.description.trim().length > 20) score += 15;
    if (thread.type) score += 10;

    // Events (30%)
    const eventCount = thread.events?.length || 0;
    if (eventCount > 0) score += 10;
    if (eventCount >= 3) score += 10;
    if (eventCount >= 5) score += 10;

    // Connections (20%)
    if (thread.connected_character_ids && thread.connected_character_ids.length > 0) score += 10;
    if (thread.connected_thread_ids && thread.connected_thread_ids.length > 0) score += 10;

    // Tension curve (10%)
    if (thread.tension_curve && thread.tension_curve.length > 0) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Update plot thread completion percentage
   */
  async updateThreadCompletion(threadId: string): Promise<boolean> {
    try {
      const thread = await this.getPlotThreadById(threadId);
      if (!thread) return false;

      const completeness = this.calculateCompleteness(thread);
      
      await this.updatePlotThread(threadId, {
        completion_percentage: completeness
      });

      return true;
    } catch (error) {
      console.error('Error updating thread completion:', error);
      return false;
    }
  }
}
