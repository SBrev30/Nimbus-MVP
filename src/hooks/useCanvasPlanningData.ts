// src/hooks/useCanvasPlanningData.ts - Complete Enhanced Version
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

// Existing interfaces (from your current file)
export interface CanvasCharacterData {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
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
  source?: 'locations' | 'world_elements'; // Track data source
  fromPlanning: boolean;
}

// NEW: Timeline data interface
export interface CanvasTimelineData {
  id: string;
  name: string;
  type: 'timeline';
  description: string;
  fromPlanning: boolean;
  planningId?: string;
  timelineType?: 'story_beats' | 'character_arc' | 'plot_progression';
  chapterCount?: number;
  significanceLevel?: 'low' | 'medium' | 'high' | 'critical';
  characterArcs?: string[];
}

// NEW: Research data interface
export interface CanvasResearchData {
  id: string;
  name: string;
  type: 'research';
  description: string;
  fromPlanning: boolean;
  planningId?: string;
  researchCategory?: string;
  elementCount?: number;
  connectedContent?: string[];
}

// NEW: Conflict data interface
export interface CanvasConflictData {
  id: string;
  name: string;
  type: 'conflict';
  description: string;
  fromPlanning: boolean;
  planningId?: string;
  conflictType?: 'internal' | 'external' | 'interpersonal' | 'societal';
  tensionLevel?: number;
  charactersInvolved?: string[];
  plotThreads?: string[];
}

// NEW: Theme data interface
export interface CanvasThemeData {
  id: string;
  name: string;
  type: 'theme';
  description: string;
  fromPlanning: boolean;
  planningId?: string;
  themeType?: 'major' | 'minor' | 'motif';
  completenessScore?: number;
  connectionCount?: number;
  characterConnections?: number;
  plotConnections?: number;
}

// Enhanced planning data interface
interface PlanningData {
  // Existing content types
  planningCharacters: CanvasCharacterData[];
  planningPlots: CanvasPlotData[];
  plotThreads: CanvasPlotThreadData[];
  planningLocations: CanvasLocationData[];
  characterRelationships: any[];
  
  // NEW: Additional content types
  planningTimelines: CanvasTimelineData[];
  planningResearch: CanvasResearchData[];
  planningConflicts: CanvasConflictData[];
  planningThemes: CanvasThemeData[];
}

// Search filters interface
interface SearchFilters {
  query?: string;
  contentType?: 'character' | 'plot' | 'location' | 'timeline' | 'research' | 'conflict' | 'theme' | 'all';
  completenessMin?: number;
  hasConnections?: boolean;
}

export const useCanvasPlanningData = (projectId?: string) => {
  const [planningData, setPlanningData] = useState<PlanningData>({
    planningCharacters: [],
    planningPlots: [],
    plotThreads: [],
    planningLocations: [],
    characterRelationships: [],
    planningTimelines: [],
    planningResearch: [],
    planningConflicts: [],
    planningThemes: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Get current user and project
  const getCurrentUserAndProject = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, projectId: null };

    let finalProjectId = projectId;
    
    if (!finalProjectId || finalProjectId === 'no-project') {
      const { data: projects } = await supabase
        .from('projects')
        .select('id, title')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

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

  // EXISTING: Load characters (unchanged from your current implementation)
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
        let role: 'protagonist' | 'antagonist' | 'supporting' | 'minor' = 'minor';
        if (['protagonist', 'antagonist', 'supporting', 'minor'].includes(char.role)) {
          role = char.role;
        } else {
          console.warn(`Invalid role "${char.role}" for character ${char.name}, defaulting to 'minor'`);
        }

        return {
          id: char.id,
          name: char.name || '',
          role: role,
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
      setError('Failed to load characters from planning');
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserAndProject, calculateCharacterCompleteness]);

  // EXISTING: Load character relationships (unchanged)
  const loadCharacterRelationships = useCallback(async () => {
    try {
      const { user, projectId: finalProjectId } = await getCurrentUserAndProject();
      if (!user) return;

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

      if (finalProjectId) {
        query = query.eq('project_id', finalProjectId);
      }

      const { data: relationships, error } = await query;

      if (error) {
        console.warn('Error loading character relationships:', error);
        return;
      }

      console.log('Character relationships loaded:', relationships?.length || 0);

      const transformedRelationships = (relationships || []).map(rel => ({
        id: rel.id,
        character_id: rel.character_a_id,
        related_character_id: rel.character_b_id,
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

  // EXISTING: Load plots (unchanged)
  const loadPlots = useCallback(async () => {
    try {
      const { user, projectId: finalProjectId } = await getCurrentUserAndProject();
      if (!user) return;

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

  // FIXED: Load plot threads with proper foreign key handling
  const loadPlotThreads = useCallback(async () => {
    try {
      console.log('Loading plot threads from planning...');
      
      const { user, projectId: finalProjectId } = await getCurrentUserAndProject();
      if (!user) {
        console.warn('No authenticated user found for plot threads');
        return;
      }

      console.log('Loading plot threads for user:', user.id, 'Project:', finalProjectId);

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

      if (finalProjectId) {
        threadsQuery = threadsQuery.eq('project_id', finalProjectId);
      }

      const { data: threads, error: threadsError } = await threadsQuery.order('created_at');

      if (threadsError) {
        throw threadsError;
      }

      console.log('Plot threads loaded:', threads?.length || 0);

      const threadsWithEvents = await Promise.all(
        (threads || []).map(async (thread) => {
          // FIXED: Use the correct foreign key column for plot_events relationship
          // Try plot_thread_id first (newer column), fallback to thread_id if that fails
          let { data: events, error: eventsError } = await supabase
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

          // If plot_thread_id column doesn't work or returns empty, try thread_id
          if (eventsError?.message?.includes('column') || (!events || events.length === 0)) {
            console.log('Trying thread_id column for plot events...');
            const { data: eventsAlt, error: eventsErrorAlt } = await supabase
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
              .eq('thread_id', thread.id)
              .order('order_index');

            events = eventsAlt;
            eventsError = eventsErrorAlt;
          }

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
        let completion_percentage = 0;
        if (thread.status === 'completed') {
          completion_percentage = 100;
        } else if (thread.status === 'in_progress') {
          completion_percentage = 50;
        } else if (thread.status === 'planning') {
          completion_percentage = 20;
        }
        
        const tension_curve = [];
        if (thread.start_tension !== undefined && thread.peak_tension !== undefined && thread.end_tension !== undefined) {
          tension_curve.push(thread.start_tension, thread.peak_tension, thread.end_tension);
        }

        return {
          id: thread.id,
          title: thread.name || '',
          type: thread.thread_type || 'subplot',
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
            title: event.name,
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
      setError('Failed to load plot threads from planning');
    }
  }, [getCurrentUserAndProject]);

  // FIXED: Load locations from both locations table AND world_elements table
  const loadLocations = useCallback(async () => {
    try {
      console.log('Loading locations from both sources...');
      
      const { user, projectId: finalProjectId } = await getCurrentUserAndProject();
      if (!user) return;

      const allLocations: CanvasLocationData[] = [];

      // 1. Load from dedicated locations table
      console.log('Loading from locations table...');
      let locationsQuery = supabase
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

      if (finalProjectId) {
        locationsQuery = locationsQuery.eq('project_id', finalProjectId);
      } else {
        locationsQuery = locationsQuery.is('project_id', null);
      }

      const { data: locations, error: locationsError } = await locationsQuery.order('name');

      if (locationsError) {
        console.warn('Error loading from locations table:', locationsError);
      } else {
        console.log('Locations from locations table:', locations?.length || 0);
        
        const formattedLocations: CanvasLocationData[] = (locations || []).map(loc => ({
          id: loc.id,
          name: loc.name || '',
          type: loc.type || 'building',
          description: loc.description || '',
          importance: loc.importance || 'moderate',
          geography: loc.geography || {},
          culture: loc.culture || {},
          connectedCharacters: loc.connected_characters || [],
          source: 'locations',
          fromPlanning: true
        }));

        allLocations.push(...formattedLocations);
      }

      // 2. FIXED: Load from world_elements table without connected_character_ids column
      // Query only existing columns - connected_character_ids does not exist
      console.log('Loading from world_elements table...');
      let worldElementsQuery = supabase
        .from('world_elements')
        .select(`
          id,
          title,
          description,
          category,
          details,
          connections,
          metadata,
          image_urls,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .eq('category', 'location');

      if (finalProjectId) {
        worldElementsQuery = worldElementsQuery.eq('project_id', finalProjectId);
      } else {
        worldElementsQuery = worldElementsQuery.is('project_id', null);
      }

      const { data: worldElements, error: worldElementsError } = await worldElementsQuery.order('title');

      if (worldElementsError) {
        console.warn('Error loading from world_elements table:', worldElementsError);
      } else {
        console.log('World elements (locations):', worldElements?.length || 0);
        
        // Transform world elements to location format
        const worldElementLocations: CanvasLocationData[] = (worldElements || []).map(element => {
          // Parse details JSON for geography and culture info
          let geography = {};
          let culture = {};
          let type: CanvasLocationData['type'] = 'building';
          let importance: CanvasLocationData['importance'] = 'moderate';
          let connectedCharacters: string[] = []; // Default since column doesn't exist
        
          // Try to extract connected characters from available data
          if (element.connections) {
            try {
              const connections = typeof element.connections === 'string' 
                ? JSON.parse(element.connections) 
                : element.connections;
              
              if (connections.character_ids && Array.isArray(connections.character_ids)) {
                connectedCharacters = connections.character_ids;
              }
            } catch (parseError) {
              console.warn('Failed to parse connections:', parseError);
            }
          }
          
          // Also check metadata for character connections
          if (element.metadata && !connectedCharacters.length) {
            try {
              const metadata = typeof element.metadata === 'string' 
                ? JSON.parse(element.metadata) 
                : element.metadata;
              
              if (metadata.connected_character_ids && Array.isArray(metadata.connected_character_ids)) {
                connectedCharacters = metadata.connected_character_ids;
              }
            } catch (parseError) {
              console.warn('Failed to parse metadata:', parseError);
            }
          }
          
          if (element.details) {
            try {
              const parsedDetails = typeof element.details === 'string' 
                ? JSON.parse(element.details) 
                : element.details;
              
              // Extract geography information
              if (parsedDetails.geography || parsedDetails.climate || parsedDetails.terrain) {
                geography = {
                  climate: parsedDetails.geography?.climate || parsedDetails.climate,
                  terrain: parsedDetails.geography?.terrain || parsedDetails.terrain,
                  size: parsedDetails.geography?.size || parsedDetails.size
                };
              }
              
              // Extract culture information
              if (parsedDetails.culture || parsedDetails.politics || parsedDetails.religion) {
                culture = {
                  politics: parsedDetails.culture?.politics || parsedDetails.politics,
                  religion: parsedDetails.culture?.religion || parsedDetails.religion,
                  customs: parsedDetails.culture?.customs || parsedDetails.customs
                };
              }
              
              // Infer type from details
              if (parsedDetails.type) {
                const validTypes = ['city', 'building', 'natural', 'mystical', 'country', 'region'];
                if (validTypes.includes(parsedDetails.type)) {
                  type = parsedDetails.type;
                }
              }
              
              // Infer importance
              if (parsedDetails.importance) {
                const validImportance = ['critical', 'high', 'moderate', 'low'];
                if (validImportance.includes(parsedDetails.importance)) {
                  importance = parsedDetails.importance;
                }
              }

              // FIXED: Check for connected_character_ids in details JSON
              // Since table doesn't have the column, it might be stored in details
              if (parsedDetails.connected_character_ids && Array.isArray(parsedDetails.connected_character_ids)) {
                connectedCharacters = parsedDetails.connected_character_ids;
              }
              
              // Also check for character_connections or similar
              if (parsedDetails.character_connections && Array.isArray(parsedDetails.character_connections)) {
                connectedCharacters = parsedDetails.character_connections;
              }
            } catch (parseError) {
              console.warn('Failed to parse world element details:', parseError);
            }
          }

          return {
            id: element.id,
            name: element.title || '',
            type,
            description: element.description || '',
            importance,
            geography,
            culture,
            connectedCharacters, // Use extracted character connections
            source: 'world_elements',
            fromPlanning: true
          };
        });

        allLocations.push(...worldElementLocations);
      }

      console.log('Total locations loaded:', allLocations.length);

      setPlanningData(prev => ({
        ...prev,
        planningLocations: allLocations
      }));

    } catch (err) {
      console.error('Error loading locations:', err);
      setError('Failed to load locations from planning');
    }
  }, [getCurrentUserAndProject]);

  // NEW: Load timelines from chapters
  const loadTimelines = useCallback(async () => {
    try {
      console.log('Loading timelines from chapters...');
      
      const { user, projectId: finalProjectId } = await getCurrentUserAndProject();
      if (!user) return;

      let query = supabase
        .from('chapters')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true });

      if (finalProjectId) {
        query = query.eq('project_id', finalProjectId);
      }

      const { data: chapters, error } = await query;
      if (error) throw error;

      const timelineData: CanvasTimelineData[] = [];
      
      if (chapters && chapters.length > 0) {
        const criticalChapters = chapters.filter(ch => ch.significance === 'critical');
        const highChapters = chapters.filter(ch => ch.significance === 'high');
        
        if (criticalChapters.length > 0) {
          timelineData.push({
            id: `timeline-story-beats-${finalProjectId || 'default'}`,
            name: 'Story Beats',
            type: 'timeline',
            description: `Major story beats and critical moments (${criticalChapters.length} critical chapters)`,
            fromPlanning: true,
            planningId: `story-beats-${finalProjectId || 'default'}`,
            timelineType: 'story_beats',
            chapterCount: chapters.length,
            significanceLevel: 'critical',
            characterArcs: []
          });
        }

        if (highChapters.length > 0) {
          timelineData.push({
            id: `timeline-plot-progression-${finalProjectId || 'default'}`,
            name: 'Plot Progression',
            type: 'timeline',
            description: `Plot development timeline (${chapters.length} chapters)`,
            fromPlanning: true,
            planningId: `plot-progression-${finalProjectId || 'default'}`,
            timelineType: 'plot_progression',
            chapterCount: chapters.length,
            significanceLevel: 'high',
            characterArcs: []
          });
        }
      }

      console.log('Timelines generated:', timelineData.length);

      setPlanningData(prev => ({
        ...prev,
        planningTimelines: timelineData
      }));

    } catch (err) {
      console.error('Error loading timelines:', err);
    }
  }, [getCurrentUserAndProject]);

  // NEW: Load research from world elements
  const loadResearch = useCallback(async () => {
    try {
      console.log('Loading research from world elements...');
      
      const { user, projectId: finalProjectId } = await getCurrentUserAndProject();
      if (!user) return;

      let query = supabase
        .from('world_elements')
        .select('*')
        .eq('user_id', user.id);

      if (finalProjectId) {
        query = query.eq('project_id', finalProjectId);
      }

      const { data: allElements, error } = await query;
      if (error) throw error;

      const researchCategories = ['culture', 'technology', 'economy', 'hierarchy'];
      const researchData: CanvasResearchData[] = [];

      for (const category of researchCategories) {
        const elements = (allElements || []).filter(el => el.category === category);
        if (elements.length > 0) {
          const connectedContent = new Set();
          elements.forEach(el => {
            // Extract character connections from connections or metadata
            if (el.connections?.character_ids) {
              el.connections.character_ids.forEach((id: string) => connectedContent.add(id));
            }
            if (el.metadata?.connected_character_ids) {
              el.metadata.connected_character_ids.forEach((id: string) => connectedContent.add(id));
            }
          });

          researchData.push({
            id: `research-${category}-${finalProjectId || 'default'}`,
            name: `${category.charAt(0).toUpperCase() + category.slice(1)} Research`,
            type: 'research',
            description: `${elements.length} ${category} elements with research data`,
            fromPlanning: true,
            planningId: `${category}-research-${finalProjectId || 'default'}`,
            researchCategory: category,
            elementCount: elements.length,
            connectedContent: Array.from(connectedContent) as string[]
          });
        }
      }

      console.log('Research collections generated:', researchData.length);

      setPlanningData(prev => ({
        ...prev,
        planningResearch: researchData
      }));

    } catch (err) {
      console.error('Error loading research:', err);
    }
  }, [getCurrentUserAndProject]);

  // FIXED: Load conflicts from plot events and character relationships
  const loadConflicts = useCallback(async () => {
    try {
      console.log('Loading conflicts from plot events and relationships...');
      
      const { user, projectId: finalProjectId } = await getCurrentUserAndProject();
      if (!user) return;

      const conflictData: CanvasConflictData[] = [];

      // FIXED: Specify exact foreign key relationship to avoid ambiguity
      // Database has BOTH thread_id AND plot_thread_id columns
      // Using plot_thread_id as it's the primary relationship
      let plotQuery = supabase
        .from('plot_events')
        .select(`
          *,
          plot_threads!plot_events_plot_thread_id_fkey (
            id,
            name,
            connected_character_ids
          )
        `)
        .eq('user_id', user.id);

      if (finalProjectId) {
        plotQuery = plotQuery.eq('project_id', finalProjectId);
      }

      const { data: plotEvents, error: plotError } = await plotQuery;
      if (plotError) {
        console.warn('Error loading plot events:', plotError);
      } else if (plotEvents && plotEvents.length > 0) {
        const conflictEvents = plotEvents.filter(event => 
          event.event_type === 'conflict' && event.tension_level >= 6
        );

        if (conflictEvents.length > 0) {
          const avgTension = conflictEvents.reduce((sum, event) => sum + event.tension_level, 0) / conflictEvents.length;
          const allCharacters = new Set();
          conflictEvents.forEach(event => {
            if (event.plot_threads?.connected_character_ids) {
              event.plot_threads.connected_character_ids.forEach((id: string) => allCharacters.add(id));
            }
          });

          conflictData.push({
            id: `conflict-external-${finalProjectId || 'default'}`,
            name: 'External Conflicts',
            type: 'conflict',
            description: `${conflictEvents.length} high-tension external conflicts`,
            fromPlanning: true,
            planningId: `external-conflicts-${finalProjectId || 'default'}`,
            conflictType: 'external',
            tensionLevel: Math.round(avgTension),
            charactersInvolved: Array.from(allCharacters) as string[],
            plotThreads: conflictEvents.map(event => event.plot_thread_id).filter(Boolean)
          });
        }
      }

      // Get character relationships for interpersonal conflicts
      let relQuery = supabase
        .from('character_relationships')
        .select('*');

      if (finalProjectId) {
        relQuery = relQuery.eq('project_id', finalProjectId);
      }

      const { data: relationships, error: relError } = await relQuery;
      if (relError) {
        console.warn('Error loading relationships:', relError);
      } else if (relationships && relationships.length > 0) {
        const conflictRelationships = relationships.filter(rel => 
          rel.relationship_type?.includes('enemy') || 
          rel.relationship_type?.includes('rival') ||
          rel.strength < 4
        );

        if (conflictRelationships.length > 0) {
          const avgStrength = conflictRelationships.reduce((sum, rel) => sum + (rel.strength || 5), 0) / conflictRelationships.length;
          const characters = new Set();
          conflictRelationships.forEach(rel => {
            characters.add(rel.character_a_id);
            characters.add(rel.character_b_id);
          });

          conflictData.push({
            id: `conflict-interpersonal-${finalProjectId || 'default'}`,
            name: 'Interpersonal Conflicts',
            type: 'conflict',
            description: `${conflictRelationships.length} character relationship conflicts`,
            fromPlanning: true,
            planningId: `interpersonal-conflicts-${finalProjectId || 'default'}`,
            conflictType: 'interpersonal',
            tensionLevel: Math.round(10 - avgStrength), // Lower relationship strength = higher conflict tension
            charactersInvolved: Array.from(characters) as string[],
            plotThreads: []
          });
        }
      }

      console.log('Conflicts generated:', conflictData.length);

      setPlanningData(prev => ({
        ...prev,
        planningConflicts: conflictData
      }));

    } catch (err) {
      console.error('Error loading conflicts:', err);
    }
  }, [getCurrentUserAndProject]);

  // NEW: Load themes from themes table
  const loadThemes = useCallback(async () => {
    try {
      console.log('Loading themes from planning...');
      
      const { user, projectId: finalProjectId } = await getCurrentUserAndProject();
      if (!user) return;

      let query = supabase
        .from('themes')
        .select('*')
        .eq('user_id', user.id);

      if (finalProjectId) {
        query = query.eq('project_id', finalProjectId);
      }

      const { data: themes, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.warn('Error loading themes (table may not exist yet):', error);
        setPlanningData(prev => ({
          ...prev,
          planningThemes: []
        }));
        return;
      }

      console.log('Themes loaded:', themes?.length || 0);

      const formattedThemes: CanvasThemeData[] = (themes || []).map(theme => {
        const characterConnections = theme.character_connections?.length || 0;
        const plotConnections = theme.plot_connections?.length || 0;
        const locationConnections = theme.location_connections?.length || 0;
        const totalConnections = characterConnections + plotConnections + locationConnections;

        return {
          id: theme.id,
          name: theme.title,
          type: 'theme',
          description: theme.description || `${theme.theme_type} theme`,
          fromPlanning: true,
          planningId: theme.id,
          themeType: theme.theme_type,
          completenessScore: theme.completeness_score,
          connectionCount: totalConnections,
          characterConnections,
          plotConnections
        };
      });

      setPlanningData(prev => ({
        ...prev,
        planningThemes: formattedThemes
      }));

    } catch (err) {
      console.error('Error loading themes:', err);
    }
  }, [getCurrentUserAndProject]);

  // Load all planning data
  const loadAllPlanningData = useCallback(async () => {
    console.log('🔄 Loading all planning data for project:', projectId);
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadCharacters(),
        loadCharacterRelationships(),
        loadPlots(),
        loadPlotThreads(),
        loadLocations(),
        loadTimelines(),
        loadResearch(),
        loadConflicts(),
        loadThemes()
      ]);
      
      setLastRefresh(new Date());
      console.log('✅ All planning data loaded successfully');
      
    } catch (err) {
      console.error('❌ Error loading planning data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load planning data');
    } finally {
      setLoading(false);
    }
  }, [loadCharacters, loadCharacterRelationships, loadPlots, loadPlotThreads, loadLocations, loadTimelines, loadResearch, loadConflicts, loadThemes, projectId]);

  // Auto-load data on mount and when projectId changes
  useEffect(() => {
    loadAllPlanningData();
  }, [loadAllPlanningData]);

  // Search and filter functionality
  const searchContent = useCallback((filters: SearchFilters) => {
    const { query = '', contentType = 'all', completenessMin = 0, hasConnections } = filters;
    
    let allContent: Array<CanvasCharacterData | CanvasPlotData | CanvasLocationData | CanvasTimelineData | CanvasResearchData | CanvasConflictData | CanvasThemeData> = [];
    
    // Collect content based on type filter
    if (contentType === 'all' || contentType === 'character') {
      allContent.push(...planningData.planningCharacters);
    }
    if (contentType === 'all' || contentType === 'plot') {
      allContent.push(...planningData.planningPlots);
      allContent.push(...planningData.plotThreads);
    }
    if (contentType === 'all' || contentType === 'location') {
      allContent.push(...planningData.planningLocations);
    }
    if (contentType === 'all' || contentType === 'timeline') {
      allContent.push(...planningData.planningTimelines);
    }
    if (contentType === 'all' || contentType === 'research') {
      allContent.push(...planningData.planningResearch);
    }
    if (contentType === 'all' || contentType === 'conflict') {
      allContent.push(...planningData.planningConflicts);
    }
    if (contentType === 'all' || contentType === 'theme') {
      allContent.push(...planningData.planningThemes);
    }

    // Apply filters
    return allContent.filter(item => {
      // Text search
      if (query) {
        const searchText = `${item.name || (item as any).title} ${item.description}`.toLowerCase();
        if (!searchText.includes(query.toLowerCase())) {
          return false;
        }
      }

      // Completeness filter
      const completeness = 'completeness_score' in item ? item.completeness_score || 0 : 
                          'completenessScore' in item ? item.completenessScore || 0 : 100;
      if (completeness < completenessMin) {
        return false;
      }

      // Connections filter
      if (hasConnections !== undefined) {
        const hasAnyConnections = 
          ('relationships' in item && (item.relationships?.length || 0) > 0) ||
          ('connectedCharacters' in item && (item.connectedCharacters?.length || 0) > 0) ||
          ('connectionCount' in item && (item.connectionCount || 0) > 0) ||
          ('connectedContent' in item && (item.connectedContent?.length || 0) > 0) ||
          ('charactersInvolved' in item && (item.charactersInvolved?.length || 0) > 0);
        
        if (hasConnections && !hasAnyConnections) {
          return false;
        }
        if (!hasConnections && hasAnyConnections) {
          return false;
        }
      }

      return true;
    });
  }, [planningData]);

  // Get content by specific type
  const getContentByType = useCallback((type: SearchFilters['contentType']) => {
    return searchContent({ contentType: type });
  }, [searchContent]);

  // Get incomplete content for development tracking
  const getIncompleteContent = useCallback((threshold = 80) => {
    return searchContent({ completenessMin: 0 }).filter(item => {
      const completeness = 'completeness_score' in item ? item.completeness_score || 0 : 
                          'completenessScore' in item ? item.completenessScore || 0 : 100;
      return completeness < threshold;
    });
  }, [searchContent]);

  // Get highly connected content
  const getHighlyConnectedContent = useCallback(() => {
    return searchContent({ hasConnections: true }).sort((a, b) => {
      const getConnectionCount = (item: any) => {
        if ('relationships' in item) return item.relationships?.length || 0;
        if ('connectedCharacters' in item) return item.connectedCharacters?.length || 0;
        if ('connectionCount' in item) return item.connectionCount || 0;
        if ('connectedContent' in item) return item.connectedContent?.length || 0;
        if ('charactersInvolved' in item) return item.charactersInvolved?.length || 0;
        return 0;
      };
      
      return getConnectionCount(b) - getConnectionCount(a);
    });
  }, [searchContent]);

  // Existing search functions (unchanged)
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

  // FIXED: Sync location to appropriate planning table
  // Store character connections in appropriate fields that exist
  const syncLocationToPlanning = useCallback(async (locationData: CanvasLocationData): Promise<boolean> => {
    try {
      const { user } = await getCurrentUserAndProject();
      if (!user) return false;

      if (locationData.source === 'locations') {
        // Sync to locations table
        const { error } = await supabase
          .from('locations')
          .update({
            name: locationData.name,
            type: locationData.type,
            description: locationData.description,
            importance: locationData.importance,
            geography: locationData.geography,
            culture: locationData.culture,
            connected_characters: locationData.connectedCharacters,
            updated_at: new Date().toISOString()
          })
          .eq('id', locationData.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error syncing location:', error);
          return false;
        }
      } else if (locationData.source === 'world_elements') {
        // FIXED: Store connected_character_ids in connections or metadata
        // Since the world_elements table doesn't have connected_character_ids column
        const connections = {
          character_ids: locationData.connectedCharacters || []
        };
        
        const details = {
          type: locationData.type,
          importance: locationData.importance,
          geography: locationData.geography,
          culture: locationData.culture,
          connected_character_ids: locationData.connectedCharacters // Also store in details for compatibility
        };

        const { error } = await supabase
          .from('world_elements')
          .update({
            title: locationData.name,
            description: locationData.description,
            details: JSON.stringify(details), // Store as JSON string
            connections: connections, // Store connections separately
            updated_at: new Date().toISOString()
          })
          .eq('id', locationData.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error syncing world element location:', error);
          return false;
        }
      }

      // Refresh local data
      await loadLocations();
      return true;
    } catch (err) {
      console.error('Error syncing location to planning:', err);
      return false;
    }
  }, [getCurrentUserAndProject, loadLocations]);

  // Existing sync functions (unchanged)
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

      await loadCharacters();
      return true;
    } catch (err) {
      console.error('Error syncing character to planning:', err);
      return false;
    }
  }, [getCurrentUserAndProject, loadCharacters]);

  const syncPlotThreadToPlanning = useCallback(async (threadData: CanvasPlotThreadData): Promise<boolean> => {
    try {
      const { user } = await getCurrentUserAndProject();
      if (!user) return false;

      const { error } = await supabase
        .from('plot_threads')
        .update({
          name: threadData.title,
          thread_type: threadData.type,
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

      await loadPlotThreads();
      return true;
    } catch (err) {
      console.error('Error syncing plot thread to planning:', err);
      return false;
    }
  }, [getCurrentUserAndProject, loadPlotThreads]);

  // Create new character in planning (unchanged)
  const createCharacterInPlanning = useCallback(async (characterData: Partial<CanvasCharacterData>): Promise<CanvasCharacterData | null> => {
    try {
      const { user, projectId: finalProjectId } = await getCurrentUserAndProject();
      if (!user) return null;

      const validRoles = ['protagonist', 'antagonist', 'supporting', 'minor'];
      const role = validRoles.includes(characterData.role || '') ? characterData.role : 'minor';

      const { data, error } = await supabase
        .from('characters')
        .insert({
          name: characterData.name || 'New Character',
          role: role,
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
          project_id: finalProjectId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating character:', error);
        return null;
      }

      await loadCharacters();

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
  }, [getCurrentUserAndProject, loadCharacters, calculateCharacterCompleteness]);

  // Statistics
  const statistics = useMemo(() => {
    const totalContent = 
      planningData.planningCharacters.length +
      planningData.planningPlots.length +
      planningData.plotThreads.length +
      planningData.planningLocations.length +
      planningData.planningTimelines.length +
      planningData.planningResearch.length +
      planningData.planningConflicts.length +
      planningData.planningThemes.length;

    const completenessScores = [
      ...planningData.planningCharacters.map(c => c.completeness_score || 0),
      ...planningData.planningThemes.map(t => t.completenessScore || 0)
    ];

    const averageCompleteness = completenessScores.length > 0 
      ? completenessScores.reduce((sum, score) => sum + score, 0) / completenessScores.length 
      : 0;

    return {
      totalContent,
      averageCompleteness: Math.round(averageCompleteness),
      contentBreakdown: {
        characters: planningData.planningCharacters.length,
        plots: planningData.planningPlots.length,
        plotThreads: planningData.plotThreads.length,
        locations: planningData.planningLocations.length,
        timelines: planningData.planningTimelines.length,
        research: planningData.planningResearch.length,
        conflicts: planningData.planningConflicts.length,
        themes: planningData.planningThemes.length
      },
      lastRefresh
    };
  }, [planningData, lastRefresh]);

  // Individual getters (for backward compatibility)
  const getCharacterById = useCallback((id: string): CanvasCharacterData | null => {
    return planningData.planningCharacters.find(char => char.id === id) || null;
  }, [planningData.planningCharacters]);

  const getPlotById = useCallback((id: string): CanvasPlotData | null => {
    return planningData.planningPlots.find(plot => plot.id === id) || null;
  }, [planningData.planningPlots]);

  const getPlotThreadById = useCallback((id: string): CanvasPlotThreadData | null => {
    return planningData.plotThreads.find(thread => thread.id === id) || null;
  }, [planningData.plotThreads]);

  const getLocationById = useCallback((id: string): CanvasLocationData | null => {
    return planningData.planningLocations.find(loc => loc.id === id) || null;
  }, [planningData.planningLocations]);

  // Individual refresh functions
  const refreshCharacters = useCallback(() => loadCharacters(), [loadCharacters]);
  const refreshPlots = useCallback(() => loadPlots(), [loadPlots]);
  const refreshPlotThreads = useCallback(() => loadPlotThreads(), [loadPlotThreads]);
  const refreshLocations = useCallback(() => loadLocations(), [loadLocations]);
  const refreshTimelines = useCallback(() => loadTimelines(), [loadTimelines]);
  const refreshResearch = useCallback(() => loadResearch(), [loadResearch]);
  const refreshConflicts = useCallback(() => loadConflicts(), [loadConflicts]);
  const refreshThemes = useCallback(() => loadThemes(), [loadThemes]);
  const refreshAll = useCallback(() => loadAllPlanningData(), [loadAllPlanningData]);

  return {
    // Data - Existing
    planningCharacters: planningData.planningCharacters,
    planningPlots: planningData.planningPlots,
    plotThreads: planningData.plotThreads,
    plotPoints: planningData.plotThreads, // Alias for backward compatibility
    planningLocations: planningData.planningLocations,
    characterRelationships: planningData.characterRelationships,
    
    // Data - NEW
    planningTimelines: planningData.planningTimelines,
    planningResearch: planningData.planningResearch,
    planningConflicts: planningData.planningConflicts,
    planningThemes: planningData.planningThemes,
    
    // State
    loading,
    error,
    lastRefresh,
    
    // Individual loaders - NEW
    loadCharacters,
    loadPlots,
    loadPlotThreads,
    loadLocations,
    loadTimelines,
    loadResearch,
    loadConflicts,
    loadThemes,
    
    // Refresh functions - Existing
    refreshCharacters,
    refreshPlots,
    refreshPlotThreads,
    refreshLocations,
    refresh: refreshAll,
    
    // Refresh functions - NEW
    refreshTimelines,
    refreshResearch,
    refreshConflicts,
    refreshThemes,
    
    // Search functions - Existing
    searchCharacters,
    searchPlots,
    searchPlotThreads,
    searchLocations,
    
    // Search functions - NEW
    searchContent,
    getContentByType,
    getIncompleteContent,
    getHighlyConnectedContent,
    
    // Getters - Existing
    getCharacterById,
    getPlotById,
    getPlotThreadById,
    getLocationById,
    
    // Sync functions - Existing
    syncCharacterToPlanning,
    syncPlotThreadToPlanning,
    createCharacterInPlanning,
    
    // Sync functions - NEW
    syncLocationToPlanning,
    
    // Stats - Enhanced
    statistics,
    stats: {
      characterCount: planningData.planningCharacters.length,
      plotCount: planningData.planningPlots.length,
      plotThreadCount: planningData.plotThreads.length,
      locationCount: planningData.planningLocations.length,
      timelineCount: planningData.planningTimelines.length,
      researchCount: planningData.planningResearch.length,
      conflictCount: planningData.planningConflicts.length,
      themeCount: planningData.planningThemes.length,
      totalItems: planningData.planningCharacters.length + 
                  planningData.planningPlots.length + 
                  planningData.plotThreads.length + 
                  planningData.planningLocations.length +
                  planningData.planningTimelines.length +
                  planningData.planningResearch.length +
                  planningData.planningConflicts.length +
                  planningData.planningThemes.length
    }
  };
};
