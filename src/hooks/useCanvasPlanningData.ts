// src/hooks/useCanvasPlanningData.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface CanvasCharacterData {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor'; // ✅ FIXED: Changed 'other' to 'minor'
  description: string;
  age?: number;
  occupation?: string;
  motivation?: string;
  backstory?: string;
  appearance?: string;
  personality?: string;
  fantasyClass?: string;
  traits?: string[];
  relationships?: Array<{
    characterId: string;
    type: 'family' | 'friend' | 'enemy' | 'romantic' | 'other';
    description: string;
  }>;
  completeness_score?: number;
  fromPlanning: boolean;
}

export interface CanvasPlotData {
  id: string;
  title: string;
  type: 'event' | 'twist' | 'climax' | 'resolution' | 'rising_action' | 'falling_action';
  description: string;
  significance?: 'low' | 'medium' | 'high' | 'critical';
  order?: number;
  chapter?: string;
  fromPlanning: boolean;
}

// Enhanced Plot Thread Data for Canvas Integration
export interface CanvasPlotThreadData {
  id: string;
  title: string;
  type: 'main' | 'subplot' | 'side_story' | 'character_arc';
  description: string;
  color: string;
  completion_percentage: number;
  event_count: number;
  tension_curve: number[];
  tags: string[];
  connected_character_ids: string[];
  connected_thread_ids: string[];
  events?: Array<{
    id: string;
    title: string;
    description: string;
    event_type: string;
    tension_level: number;
    chapter_reference?: string;
    order_index: number;
  }>;
  fromPlanning: boolean;
  created_at: string;
  updated_at: string;
}

export interface CanvasLocationData {
  id: string;
  name: string;
  type: 'city' | 'building' | 'natural' | 'mystical' | 'country' | 'region';
  description: string;
  importance: 'critical' | 'high' | 'moderate' | 'low';
  geography?: {
    climate?: string;
    terrain?: string;
    size?: string;
  };
  culture?: {
    politics?: string;
    religion?: string;
    customs?: string;
  };
  connectedCharacters?: string[];
  fromPlanning: boolean;
}

interface PlanningData {
  planningCharacters: CanvasCharacterData[];
  planningPlots: CanvasPlotData[];
  plotThreads: CanvasPlotThreadData[];
  planningLocations: CanvasLocationData[];
  characterRelationships: any[]; // ✅ ADDED: For auto-connections
}

export const useCanvasPlanningData = (projectId?: string) => {
  const [planningData, setPlanningData] = useState<PlanningData>({
    planningCharacters: [],
    planningPlots: [],
    plotThreads: [],
    planningLocations: [],
    characterRelationships: [] // ✅ ADDED
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load data on mount and when projectId changes
  useEffect(() => {
    loadAllPlanningData();
  }, [projectId]);

  // Get current user and project (updated to handle proper project IDs)
  const getCurrentUserAndProject = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, projectId: null };

    // Use the provided projectId if available, otherwise get the user's projects
    let finalProjectId = projectId;
    
    if (!finalProjectId || finalProjectId === 'no-project') {
      // Get the user's projects to find a valid project ID
      const { data: projects } = await supabase
        .from('projects')
        .select('id, title')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      // Use the most recent project if available, otherwise null (for characters without project association)
      finalProjectId = projects && projects.length > 0 ? projects[0].id : null;
    }
    
    return { user, projectId: finalProjectId };
  }, [projectId]);

  // Calculate character completeness score
  const calculateCharacterCompleteness = useCallback((character: any): number => {
    const requiredFields = ['name', 'role', 'description'];
    const optionalFields = ['age', 'occupation', 'motivation', 'backstory', 'appearance', 'personality'];
    
    const requiredComplete = requiredFields.every(field => 
      character[field] && character[field].toString().trim().length > 0
    );
    const optionalComplete = optionalFields.filter(field => 
      character[field] && character[field].toString().trim().length > 0
    ).length;
    
    return requiredComplete ? (50 + (optionalComplete / optionalFields.length) * 50) : 0;
  }, []);

  // Fetch characters from planning pages
  const loadCharacters = useCallback(async () => {
    try {
      console.log('Loading characters from planning...');
      
      setLoading(true);
      setError(null);

      const { user, projectId: finalProjectId } = await getCurrentUserAndProject();
      if (!user) {
        console.warn('No authenticated user found');
        return;
      }

      console.log('User found:', user.id, 'Project ID:', finalProjectId);

      // Build query with optional project_id filter
      let query = supabase
        .from('characters')
        .select(`
          id,
          name,
          role,
          description,
          age,
          occupation,
          motivation,
          backstory,
          appearance,
          personality,
          fantasy_class,
          traits,
          relationships,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id);

      // Add project filter if projectId exists, otherwise include characters with null project_id
      if (finalProjectId) {
  query = query.eq('project_id', finalProjectId);
} else {
  query = query.is('project_id', null);
}

      console.log('Executing characters query...');
      
      const { data: characters, error: charactersError } = await query.order('name');

      if (charactersError) {
        throw charactersError;
      }

      console.log('Characters loaded from database:', characters?.length || 0);

      const formattedCharacters: CanvasCharacterData[] = (characters || []).map(char => {
        // ✅ SAFE ROLE MAPPING: Ensure role is valid for database constraint
        let role: 'protagonist' | 'antagonist' | 'supporting' | 'minor' = 'minor';
        if (['protagonist', 'antagonist', 'supporting', 'minor'].includes(char.role)) {
          role = char.role;
        } else {
          console.warn(`Invalid role "${char.role}" for character ${char.name}, defaulting to 'minor'`);
        }

        return {
          id: char.id,
          name: char.name || '',
          role: role, // ✅ SAFE: Always valid database role
          description: char.description || '',
          age: char.age,
          occupation: char.occupation || '',
          motivation: char.motivation || '',
          backstory: char.backstory || '',
          appearance: char.appearance || '',
          personality: char.personality || '',
          fantasyClass: char.fantasy_class || '',
          traits: char.traits || [],
          relationships: char.relationships || [],
          completeness_score: calculateCharacterCompleteness(char),
          fromPlanning: true
        };
      });

      console.log('Formatted characters:', formattedCharacters.length);

      setPlanningData(prev => ({
        ...prev,
        planningCharacters: formattedCharacters
      }));

    } catch (err) {
      console.error('Error loading characters:', err);
      console.error('Full error details:', err);
      setError('Failed to load characters from planning');
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserAndProject, calculateCharacterCompleteness]);

  // ✅ FIXED: Load character relationships for auto-connections
  const loadCharacterRelationships = useCallback(async () => {
    try {
      const { user, projectId: finalProjectId } = await getCurrentUserAndProject();
      if (!user) return;

      // ✅ FIX: Remove user_id filter since the table doesn't have this column
      let query = supabase
        .from('character_relationships')
        .select(`
          id,
          character_a_id,
          character_b_id,
          relationship_type,
          description,
          strength
        `);

      // Only filter by project_id since that's what the table has
      if (finalProjectId) {
        query = query.eq('project_id', finalProjectId);
      }

      const { data: relationships, error } = await query;

      if (error) {
        console.warn('Error loading character relationships:', error);
        return;
      }

      console.log('Character relationships loaded:', relationships?.length || 0);

      // Transform the data to match expected format for auto-connections
      const transformedRelationships = (relationships || []).map(rel => ({
        id: rel.id,
        character_id: rel.character_a_id, // Map character_a_id to character_id
        related_character_id: rel.character_b_id, // Map character_b_id to related_character_id
        relationship_type: rel.relationship_type,
        description: rel.description,
        strength: rel.strength
      }));

      setPlanningData(prev => ({
        ...prev,
        characterRelationships: transformedRelationships
      }));

    } catch (err) {
      console.warn('Failed to load character relationships:', err);
    }
  }, [getCurrentUserAndProject]);

  // Fetch plots from planning pages (original plots from chapters)
  const loadPlots = useCallback(async () => {
    try {
      const { user, projectId: finalProjectId } = await getCurrentUserAndProject();
      if (!user) return;

      // Build query with optional project_id filter
      let query = supabase
        .from('chapters')
        .select(`
          id,
          title,
          type,
          description,
          significance,
          order,
          chapter_number,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id);

      // Add project filter if projectId exists
      if (finalProjectId) {
        query = query.eq('project_id', finalProjectId);
      }

      const { data: plots, error: plotsError } = await query.order('order');

      if (plotsError) {
        throw plotsError;
      }

      const formattedPlots: CanvasPlotData[] = (plots || []).map(plot => ({
        id: plot.id,
        title: plot.title || '',
        type: plot.type || 'event',
        description: plot.description || '',
        significance: plot.significance || 'medium',
        order: plot.order || 0,
        chapter: plot.chapter_number?.toString(),
        fromPlanning: true
      }));

      setPlanningData(prev => ({
        ...prev,
        planningPlots: formattedPlots
      }));

    } catch (err) {
      console.error('Error loading plots:', err);
      setError('Failed to load plots from planning');
    }
  }, [getCurrentUserAndProject]);

  // Fetch plot threads from planning pages (enhanced plot management)
  const loadPlotThreads = useCallback(async () => {
    try {
      console.log('Loading plot threads from planning...');
      
      const { user, projectId: finalProjectId } = await getCurrentUserAndProject();
      if (!user) {
        console.warn('No authenticated user found for plot threads');
        return;
      }

      console.log('Loading plot threads for user:', user.id, 'Project:', finalProjectId);

      // Build query for plot threads using correct column names
      let threadsQuery = supabase
        .from('plot_threads')
        .select(`
          id,
          name,
          thread_type,
          description,
          status,
          start_tension,
          peak_tension,
          end_tension,
          connected_character_ids,
          color,
          metadata,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id);

      // Add project filter if projectId exists
      if (finalProjectId) {
        threadsQuery = threadsQuery.eq('project_id', finalProjectId);
      }

      const { data: threads, error: threadsError } = await threadsQuery.order('created_at');

      if (threadsError) {
        throw threadsError;
      }

      console.log('Plot threads loaded:', threads?.length || 0);

      // Load events for each thread
      const threadsWithEvents = await Promise.all(
        (threads || []).map(async (thread) => {
          const { data: events, error: eventsError } = await supabase
            .from('plot_events')
            .select(`
              id,
              name,
              description,
              event_type,
              tension_level,
              chapter_id,
              order_index
            `)
            .eq('plot_thread_id', thread.id)
            .order('order_index');

          if (eventsError) {
            console.warn(`Failed to load events for thread ${thread.id}:`, eventsError);
            return { ...thread, events: [], event_count: 0 };
          }

          return { 
            ...thread, 
            events: events || [], 
            event_count: events?.length || 0 
          };
        })
      );

      const formattedPlotThreads: CanvasPlotThreadData[] = threadsWithEvents.map(thread => {
        // Calculate completion percentage based on thread status and events
        let completion_percentage = 0;
        if (thread.status === 'completed') {
          completion_percentage = 100;
        } else if (thread.status === 'in_progress') {
          completion_percentage = 50;
        } else if (thread.status === 'planning') {
          completion_percentage = 20;
        }
        
        // Build tension curve from start, peak, end values
        const tension_curve = [];
        if (thread.start_tension !== undefined && thread.peak_tension !== undefined && thread.end_tension !== undefined) {
          tension_curve.push(thread.start_tension, thread.peak_tension, thread.end_tension);
        }

        return {
          id: thread.id,
          title: thread.name || '', // Map database 'name' to interface 'title'
          type: thread.thread_type || 'subplot', // Map database 'thread_type' to interface 'type'
          description: thread.description || '',
          color: thread.color || '#3B82F6',
          completion_percentage,
          event_count: thread.event_count,
          tension_curve,
          tags: thread.metadata?.tags || [],
          connected_character_ids: thread.connected_character_ids || [],
          connected_thread_ids: thread.metadata?.connected_thread_ids || [],
          events: (thread.events || []).map((event: any) => ({
            id: event.id,
            title: event.name, // Map database 'name' to interface 'title'
            description: event.description,
            event_type: event.event_type,
            tension_level: event.tension_level,
            chapter_reference: event.chapter_id,
            order_index: event.order_index
          })),
          fromPlanning: true,
          created_at: thread.created_at,
          updated_at: thread.updated_at
        };
      });

      console.log('Formatted plot threads:', formattedPlotThreads.length);

      setPlanningData(prev => ({
        ...prev,
        plotThreads: formattedPlotThreads
      }));

    } catch (err) {
      console.error('Error loading plot threads:', err);
      console.error('Full error details:', err);
      setError('Failed to load plot threads from planning');
    }
  }, [getCurrentUserAndProject]);

  // Fetch locations from planning pages
  const loadLocations = useCallback(async () => {
    try {
      const { user, projectId: finalProjectId } = await getCurrentUserAndProject();
      if (!user) return;

      // Build query with optional project_id filter
      let query = supabase
        .from('locations')
        .select(`
          id,
          name,
          type,
          description,
          importance,
          geography,
          culture,
          connected_characters,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id);

      // Add project filter if projectId exists, otherwise include locations with null project_id
      if (finalProjectId) {
  query = query.eq('project_id', finalProjectId);
} else {
  query = query.is('project_id', null);
}

      const { data: locations, error: locationsError } = await query.order('name');

      if (locationsError) {
        throw locationsError;
      }

      const formattedLocations: CanvasLocationData[] = (locations || []).map(loc => ({
        id: loc.id,
        name: loc.name || '',
        type: loc.type || 'building',
        description: loc.description || '',
        importance: loc.importance || 'moderate',
        geography: loc.geography || {},
        culture: loc.culture || {},
        connectedCharacters: loc.connected_characters || [],
        fromPlanning: true
      }));

      setPlanningData(prev => ({
        ...prev,
        planningLocations: formattedLocations
      }));

    } catch (err) {
      console.error('Error loading locations:', err);
      setError('Failed to load locations from planning');
    }
  }, [getCurrentUserAndProject]);

  // Load all planning data (updated to include character relationships)
  const loadAllPlanningData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCharacters(),
        loadCharacterRelationships(), // ✅ ADDED
        loadPlots(),
        loadPlotThreads(),
        loadLocations()
      ]);
    } catch (err) {
      console.error('Error loading planning data:', err);
      setError('Failed to load planning data');
    } finally {
      setLoading(false);
    }
  }, [loadCharacters, loadCharacterRelationships, loadPlots, loadPlotThreads, loadLocations]);

  // Refresh functions
  const refreshCharacters = useCallback(() => {
    return loadCharacters();
  }, [loadCharacters]);

  const refreshPlots = useCallback(() => {
    return loadPlots();
  }, [loadPlots]);

  const refreshPlotThreads = useCallback(() => {
    return loadPlotThreads();
  }, [loadPlotThreads]);

  const refreshLocations = useCallback(() => {
    return loadLocations();
  }, [loadLocations]);

  const refreshAll = useCallback(() => {
    return loadAllPlanningData();
  }, [loadAllPlanningData]);

  // Search functions
  const searchCharacters = useCallback((query: string): CanvasCharacterData[] => {
    if (!query.trim()) return planningData.planningCharacters;
    
    const lowerQuery = query.toLowerCase();
    return planningData.planningCharacters.filter(char =>
      char.name.toLowerCase().includes(lowerQuery) ||
      char.role.toLowerCase().includes(lowerQuery) ||
      char.description.toLowerCase().includes(lowerQuery)
    );
  }, [planningData.planningCharacters]);

  const searchPlots = useCallback((query: string): CanvasPlotData[] => {
    if (!query.trim()) return planningData.planningPlots;
    
    const lowerQuery = query.toLowerCase();
    return planningData.planningPlots.filter(plot =>
      plot.title.toLowerCase().includes(lowerQuery) ||
      plot.description.toLowerCase().includes(lowerQuery) ||
      plot.type.toLowerCase().includes(lowerQuery)
    );
  }, [planningData.planningPlots]);

  const searchPlotThreads = useCallback((query: string): CanvasPlotThreadData[] => {
    if (!query.trim()) return planningData.plotThreads;
    
    const lowerQuery = query.toLowerCase();
    return planningData.plotThreads.filter(thread =>
      thread.title.toLowerCase().includes(lowerQuery) ||
      thread.description.toLowerCase().includes(lowerQuery) ||
      thread.type.toLowerCase().includes(lowerQuery) ||
      (thread.tags && thread.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }, [planningData.plotThreads]);

  const searchLocations = useCallback((query: string): CanvasLocationData[] => {
    if (!query.trim()) return planningData.planningLocations;
    
    const lowerQuery = query.toLowerCase();
    return planningData.planningLocations.filter(loc =>
      loc.name.toLowerCase().includes(lowerQuery) ||
      loc.description.toLowerCase().includes(lowerQuery) ||
      loc.type.toLowerCase().includes(lowerQuery)
    );
  }, [planningData.planningLocations]);

  // Get character by ID
  const getCharacterById = useCallback((id: string): CanvasCharacterData | null => {
    return planningData.planningCharacters.find(char => char.id === id) || null;
  }, [planningData.planningCharacters]);

  // Get plot by ID
  const getPlotById = useCallback((id: string): CanvasPlotData | null => {
    return planningData.planningPlots.find(plot => plot.id === id) || null;
  }, [planningData.planningPlots]);

  // Get plot thread by ID
  const getPlotThreadById = useCallback((id: string): CanvasPlotThreadData | null => {
    return planningData.plotThreads.find(thread => thread.id === id) || null;
  }, [planningData.plotThreads]);

  // Get location by ID
  const getLocationById = useCallback((id: string): CanvasLocationData | null => {
    return planningData.planningLocations.find(loc => loc.id === id) || null;
  }, [planningData.planningLocations]);

  // Sync character data back to planning
  const syncCharacterToPlanning = useCallback(async (characterData: CanvasCharacterData): Promise<boolean> => {
    try {
      const { user } = await getCurrentUserAndProject();
      if (!user) return false;

      const { error } = await supabase
        .from('characters')
        .update({
          name: characterData.name,
          role: characterData.role,
          description: characterData.description,
          age: characterData.age,
          occupation: characterData.occupation,
          motivation: characterData.motivation,
          backstory: characterData.backstory,
          appearance: characterData.appearance,
          personality: characterData.personality,
          fantasy_class: characterData.fantasyClass,
          traits: characterData.traits,
          relationships: characterData.relationships,
          updated_at: new Date().toISOString()
        })
        .eq('id', characterData.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error syncing character:', error);
        return false;
      }

      // Refresh local data
      await refreshCharacters();
      return true;
    } catch (err) {
      console.error('Error syncing character to planning:', err);
      return false;
    }
  }, [getCurrentUserAndProject, refreshCharacters]);

  // Sync plot thread data back to planning
  const syncPlotThreadToPlanning = useCallback(async (threadData: CanvasPlotThreadData): Promise<boolean> => {
    try {
      const { user } = await getCurrentUserAndProject();
      if (!user) return false;

      const { error } = await supabase
        .from('plot_threads')
        .update({
          name: threadData.title, // Map interface 'title' to database 'name'
          thread_type: threadData.type, // Map interface 'type' to database 'thread_type'
          description: threadData.description,
          color: threadData.color,
          start_tension: threadData.tension_curve[0],
          peak_tension: threadData.tension_curve[1],
          end_tension: threadData.tension_curve[2],
          connected_character_ids: threadData.connected_character_ids,
          metadata: {
            tags: threadData.tags,
            connected_thread_ids: threadData.connected_thread_ids
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', threadData.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error syncing plot thread:', error);
        return false;
      }

      // Refresh local data
      await refreshPlotThreads();
      return true;
    } catch (err) {
      console.error('Error syncing plot thread to planning:', err);
      return false;
    }
  }, [getCurrentUserAndProject, refreshPlotThreads]);

  // Create new character in planning
  const createCharacterInPlanning = useCallback(async (characterData: Partial<CanvasCharacterData>): Promise<CanvasCharacterData | null> => {
    try {
      const { user, projectId: finalProjectId } = await getCurrentUserAndProject();
      if (!user) return null;

      // ✅ SAFE ROLE VALIDATION: Ensure role is valid before creating
      const validRoles = ['protagonist', 'antagonist', 'supporting', 'minor'];
      const role = validRoles.includes(characterData.role || '') ? characterData.role : 'minor';

      const { data, error } = await supabase
        .from('characters')
        .insert({
          name: characterData.name || 'New Character',
          role: role, // ✅ SAFE: Always valid database role
          description: characterData.description || '',
          age: characterData.age,
          occupation: characterData.occupation,
          motivation: characterData.motivation,
          backstory: characterData.backstory,
          appearance: characterData.appearance,
          personality: characterData.personality,
          fantasy_class: characterData.fantasyClass,
          traits: characterData.traits || [],
          relationships: characterData.relationships || [],
          user_id: user.id,
          project_id: finalProjectId, // Will be null if no project exists
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating character:', error);
        return null;
      }

      // Refresh local data
      await refreshCharacters();

      // Return formatted character data
      return {
        id: data.id,
        name: data.name,
        role: data.role,
        description: data.description,
        age: data.age,
        occupation: data.occupation || '',
        motivation: data.motivation || '',
        backstory: data.backstory || '',
        appearance: data.appearance || '',
        personality: data.personality || '',
        fantasyClass: data.fantasy_class || '',
        traits: data.traits || [],
        relationships: data.relationships || [],
        completeness_score: calculateCharacterCompleteness(data),
        fromPlanning: true
      };
    } catch (err) {
      console.error('Error creating character in planning:', err);
      return null;
    }
  }, [getCurrentUserAndProject, refreshCharacters, calculateCharacterCompleteness]);

  return {
    // Data
    planningCharacters: planningData.planningCharacters,
    planningPlots: planningData.planningPlots,
    plotThreads: planningData.plotThreads,
    plotPoints: planningData.plotThreads, // Alias for backward compatibility
    planningLocations: planningData.planningLocations,
    characterRelationships: planningData.characterRelationships, // ✅ ADDED: For auto-connections
    
    // State
    loading,
    error,
    
    // Refresh functions
    refreshCharacters,
    refreshPlots,
    refreshPlotThreads,
    refreshLocations,
    refresh: refreshAll,
    
    // Search functions
    searchCharacters,
    searchPlots,
    searchPlotThreads,
    searchLocations,
    
    // Getters
    getCharacterById,
    getPlotById,
    getPlotThreadById,
    getLocationById,
    
    // Sync functions
    syncCharacterToPlanning,
    syncPlotThreadToPlanning,
    createCharacterInPlanning,
    
    // Stats (updated to include plot threads)
    stats: {
      characterCount: planningData.planningCharacters.length,
      plotCount: planningData.planningPlots.length,
      plotThreadCount: planningData.plotThreads.length,
      locationCount: planningData.planningLocations.length,
      totalItems: planningData.planningCharacters.length + planningData.planningPlots.length + planningData.plotThreads.length + planningData.planningLocations.length
    }
  };
};
