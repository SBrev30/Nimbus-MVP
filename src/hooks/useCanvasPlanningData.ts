// src/hooks/useCanvasPlanningData.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface CanvasCharacterData {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'other';
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
  planningLocations: CanvasLocationData[];
}

export const useCanvasPlanningData = () => {
  const [planningData, setPlanningData] = useState<PlanningData>({
    planningCharacters: [],
    planningPlots: [],
    planningLocations: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user and project (you might need to adjust this based on your auth/project context)
  const getCurrentUserAndProject = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    // You might need to get project ID from context or localStorage
    const projectId = localStorage.getItem('currentProjectId') || 'default-project';
    return { user, projectId };
  }, []);

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
      setLoading(true);
      setError(null);

      const { user, projectId } = await getCurrentUserAndProject();
      if (!user) {
        console.warn('No authenticated user found');
        return;
      }

      // Fetch from your characters table - adjust table name based on your schema
      const { data: characters, error: charactersError } = await supabase
        .from('characters') // or whatever your characters table is named
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
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .order('name');

      if (charactersError) {
        throw charactersError;
      }

      const formattedCharacters: CanvasCharacterData[] = (characters || []).map(char => ({
        id: char.id,
        name: char.name || '',
        role: char.role || 'supporting',
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
      }));

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

  // Fetch plots from planning pages
  const loadPlots = useCallback(async () => {
    try {
      const { user, projectId } = await getCurrentUserAndProject();
      if (!user) return;

      // Fetch from your plots/chapters table - adjust based on your schema
      const { data: plots, error: plotsError } = await supabase
        .from('chapters') // or 'plots' or whatever your table is named
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
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .order('order');

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

  // Fetch locations from planning pages
  const loadLocations = useCallback(async () => {
    try {
      const { user, projectId } = await getCurrentUserAndProject();
      if (!user) return;

      // Fetch from your locations table - adjust based on your schema
      const { data: locations, error: locationsError } = await supabase
        .from('locations') // adjust table name
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
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .order('name');

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

  // Load all planning data
  const loadAllPlanningData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCharacters(),
        loadPlots(),
        loadLocations()
      ]);
    } catch (err) {
      console.error('Error loading planning data:', err);
      setError('Failed to load planning data');
    } finally {
      setLoading(false);
    }
  }, [loadCharacters, loadPlots, loadLocations]);

  // Auto-load data on mount
  useEffect(() => {
    loadAllPlanningData();
  }, [loadAllPlanningData]);

  // Refresh functions
  const refreshCharacters = useCallback(() => {
    return loadCharacters();
  }, [loadCharacters]);

  const refreshPlots = useCallback(() => {
    return loadPlots();
  }, [loadPlots]);

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

  // Get location by ID
  const getLocationById = useCallback((id: string): CanvasLocationData | null => {
    return planningData.planningLocations.find(loc => loc.id === id) || null;
  }, [planningData.planningLocations]);

  // Sync character data back to planning
  const syncCharacterToPlanning = useCallback(async (characterData: CanvasCharacterData): Promise<boolean> => {
    try {
      const { user, projectId } = await getCurrentUserAndProject();
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

  // Create new character in planning
  const createCharacterInPlanning = useCallback(async (characterData: Partial<CanvasCharacterData>): Promise<CanvasCharacterData | null> => {
    try {
      const { user, projectId } = await getCurrentUserAndProject();
      if (!user) return null;

      const { data, error } = await supabase
        .from('characters')
        .insert({
          name: characterData.name || 'New Character',
          role: characterData.role || 'supporting',
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
          project_id: projectId,
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
    planningLocations: planningData.planningLocations,
    
    // State
    loading,
    error,
    
    // Refresh functions
    refreshCharacters,
    refreshPlots,
    refreshLocations,
    refresh: refreshAll,
    
    // Search functions
    searchCharacters,
    searchPlots,
    searchLocations,
    
    // Getters
    getCharacterById,
    getPlotById,
    getLocationById,
    
    // Sync functions
    syncCharacterToPlanning,
    createCharacterInPlanning,
    
    // Stats
    stats: {
      characterCount: planningData.planningCharacters.length,
      plotCount: planningData.planningPlots.length,
      locationCount: planningData.planningLocations.length,
      totalItems: planningData.planningCharacters.length + planningData.planningPlots.length + planningData.planningLocations.length
    }
  };
};
