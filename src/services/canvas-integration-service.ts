// src/services/canvas-integration-service.ts - Enhanced Version
import { supabase } from '../lib/supabase';
import { characterService } from './character-service';
import { plotService } from './plot-service';
import { worldBuildingService } from './world-building-service';
import { themeService } from './theme-service';
import type { Character } from './character-service';
import type { PlotThread } from './plot-service';
import type { WorldElement } from './world-building-service';
import type { Theme } from './theme-service';

// Canvas Data Interfaces
export interface CanvasCharacterData {
  id: string;
  name: string;
  type: 'character';
  description: string;
  fromPlanning: boolean;
  planningId?: string;
  role?: string;
  completenessScore?: number;
  fantasyClass?: string;
  relationshipCount?: number;
}

export interface CanvasPlotData {
  id: string;
  name: string;
  type: 'plot';
  description: string;
  fromPlanning: boolean;
  planningId?: string;
  plotType?: string;
  completionPercentage?: number;
  tensionLevel?: number;
  connectedCharacters?: string[];
}

export interface CanvasLocationData {
  id: string;
  name: string;
  type: 'location';
  description: string;
  fromPlanning: boolean;
  planningId?: string;
  category?: string;
  connectedCharacters?: string[];
  worldElements?: number;
}

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

export type CanvasContentData = 
  | CanvasCharacterData 
  | CanvasPlotData 
  | CanvasLocationData
  | CanvasTimelineData
  | CanvasResearchData
  | CanvasConflictData
  | CanvasThemeData;

class EnhancedCanvasIntegrationService {
  // Character Integration (existing)
  async getPlanningCharacters(projectId?: string): Promise<CanvasCharacterData[]> {
    try {
      const characters = await characterService.getCharacters(projectId);
      return characters.map(character => this.formatCharacterForCanvas(character));
    } catch (error) {
      console.error('Error getting planning characters:', error);
      return [];
    }
  }

  private formatCharacterForCanvas(character: Character): CanvasCharacterData {
    return {
      id: character.id,
      name: character.name,
      type: 'character',
      description: character.description || `${character.role} character${character.fantasy_class ? ` (${character.fantasy_class})` : ''}`,
      fromPlanning: true,
      planningId: character.id,
      role: character.role,
      completenessScore: character.completeness_score,
      fantasyClass: character.fantasy_class || undefined,
      relationshipCount: character.relationships ? Object.keys(character.relationships).length : 0
    };
  }

  // Plot Integration (existing)
  async getPlanningPlots(projectId?: string): Promise<CanvasPlotData[]> {
    try {
      const plotThreads = await plotService.getPlotThreads(projectId);
      return plotThreads.map(plot => this.formatPlotForCanvas(plot));
    } catch (error) {
      console.error('Error getting planning plots:', error);
      return [];
    }
  }

  private formatPlotForCanvas(plot: PlotThread): CanvasPlotData {
    return {
      id: plot.id,
      name: plot.title,
      type: 'plot',
      description: plot.description || `${plot.plot_type} plot thread`,
      fromPlanning: true,
      planningId: plot.id,
      plotType: plot.plot_type,
      completionPercentage: plot.completion_percentage,
      tensionLevel: plot.current_tension_level,
      connectedCharacters: plot.connected_character_ids || []
    };
  }

  // Location Integration (existing)
  async getPlanningLocations(projectId?: string): Promise<CanvasLocationData[]> {
    try {
      const locations = await worldBuildingService.getWorldElementsByCategory('location', projectId);
      return locations.map(location => this.formatLocationForCanvas(location));
    } catch (error) {
      console.error('Error getting planning locations:', error);
      return [];
    }
  }

  private formatLocationForCanvas(location: WorldElement): CanvasLocationData {
    return {
      id: location.id,
      name: location.title,
      type: 'location',
      description: location.description || 'World building location',
      fromPlanning: true,
      planningId: location.id,
      category: location.category,
      connectedCharacters: location.connected_character_ids || [],
      worldElements: 1
    };
  }

  // NEW: Timeline Integration
  async getPlanningTimelines(projectId?: string): Promise<CanvasTimelineData[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get chapters for timeline structure
      let query = supabase
        .from('chapters')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data: chapters, error } = await query;
      if (error) throw error;

      // Group chapters by significance and create timeline nodes
      const timelineData: CanvasTimelineData[] = [];
      
      // Story beats timeline
      if (chapters && chapters.length > 0) {
        const criticalChapters = chapters.filter(ch => ch.significance === 'critical');
        const highChapters = chapters.filter(ch => ch.significance === 'high');
        
        if (criticalChapters.length > 0) {
          timelineData.push({
            id: `timeline-story-beats-${projectId || 'default'}`,
            name: 'Story Beats',
            type: 'timeline',
            description: `Major story beats and critical moments (${criticalChapters.length} critical chapters)`,
            fromPlanning: true,
            planningId: `story-beats-${projectId || 'default'}`,
            timelineType: 'story_beats',
            chapterCount: chapters.length,
            significanceLevel: 'critical',
            characterArcs: [] // Could be enhanced with character arc data
          });
        }

        if (highChapters.length > 0) {
          timelineData.push({
            id: `timeline-plot-progression-${projectId || 'default'}`,
            name: 'Plot Progression',
            type: 'timeline',
            description: `Plot development timeline (${chapters.length} chapters)`,
            fromPlanning: true,
            planningId: `plot-progression-${projectId || 'default'}`,
            timelineType: 'plot_progression',
            chapterCount: chapters.length,
            significanceLevel: 'high',
            characterArcs: []
          });
        }
      }

      return timelineData;
    } catch (error) {
      console.error('Error getting planning timelines:', error);
      return [];
    }
  }

  // NEW: Research Integration
  async getPlanningResearch(projectId?: string): Promise<CanvasResearchData[]> {
    try {
      const allElements = await worldBuildingService.getWorldElements(projectId);
      
      // Group by category for research organization
      const researchCategories = ['culture', 'technology', 'economy', 'hierarchy'];
      const researchData: CanvasResearchData[] = [];

      for (const category of researchCategories) {
        const elements = allElements.filter(el => el.category === category);
        if (elements.length > 0) {
          // Count connected content
          const connectedContent = new Set();
          elements.forEach(el => {
            if (el.connected_character_ids) {
              el.connected_character_ids.forEach(id => connectedContent.add(id));
            }
          });

          researchData.push({
            id: `research-${category}-${projectId || 'default'}`,
            name: `${category.charAt(0).toUpperCase() + category.slice(1)} Research`,
            type: 'research',
            description: `${elements.length} ${category} elements with research data`,
            fromPlanning: true,
            planningId: `${category}-research-${projectId || 'default'}`,
            researchCategory: category,
            elementCount: elements.length,
            connectedContent: Array.from(connectedContent) as string[]
          });
        }
      }

      return researchData;
    } catch (error) {
      console.error('Error getting planning research:', error);
      return [];
    }
  }

  // NEW: Conflict Integration
  async getPlanningConflicts(projectId?: string): Promise<CanvasConflictData[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get plot events for conflict data
      let plotQuery = supabase
        .from('plot_events')
        .select(`
          *,
          plot_threads (
            id,
            title,
            connected_character_ids
          )
        `)
        .eq('user_id', user.id);

      if (projectId) {
        plotQuery = plotQuery.eq('project_id', projectId);
      }

      const { data: plotEvents, error: plotError } = await plotQuery;
      if (plotError) throw plotError;

      // Get character relationships for interpersonal conflicts
      let relQuery = supabase
        .from('character_relationships')
        .select('*')
        .eq('user_id', user.id);

      if (projectId) {
        relQuery = relQuery.eq('project_id', projectId);
      }

      const { data: relationships, error: relError } = await relQuery;
      if (relError) throw relError;

      const conflictData: CanvasConflictData[] = [];

      // Process plot events for external conflicts
      if (plotEvents && plotEvents.length > 0) {
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
            id: `conflict-external-${projectId || 'default'}`,
            name: 'External Conflicts',
            type: 'conflict',
            description: `${conflictEvents.length} high-tension external conflicts`,
            fromPlanning: true,
            planningId: `external-conflicts-${projectId || 'default'}`,
            conflictType: 'external',
            tensionLevel: Math.round(avgTension),
            charactersInvolved: Array.from(allCharacters) as string[],
            plotThreads: conflictEvents.map(event => event.plot_thread_id).filter(Boolean)
          });
        }
      }

      // Process character relationships for interpersonal conflicts
      if (relationships && relationships.length > 0) {
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
            id: `conflict-interpersonal-${projectId || 'default'}`,
            name: 'Interpersonal Conflicts',
            type: 'conflict',
            description: `${conflictRelationships.length} character relationship conflicts`,
            fromPlanning: true,
            planningId: `interpersonal-conflicts-${projectId || 'default'}`,
            conflictType: 'interpersonal',
            tensionLevel: Math.round(10 - avgStrength), // Lower relationship strength = higher conflict tension
            charactersInvolved: Array.from(characters) as string[],
            plotThreads: []
          });
        }
      }

      return conflictData;
    } catch (error) {
      console.error('Error getting planning conflicts:', error);
      return [];
    }
  }

  // NEW: Theme Integration
  async getPlanningThemes(projectId?: string): Promise<CanvasThemeData[]> {
    try {
      const themes = await themeService.getThemes(projectId);
      return themes.map(theme => this.formatThemeForCanvas(theme));
    } catch (error) {
      console.error('Error getting planning themes:', error);
      return [];
    }
  }

  private formatThemeForCanvas(theme: Theme): CanvasThemeData {
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
  }

  // Enhanced method to get all planning content
  async getAllPlanningContent(projectId?: string): Promise<{
    characters: CanvasCharacterData[];
    plots: CanvasPlotData[];
    locations: CanvasLocationData[];
    timelines: CanvasTimelineData[];
    research: CanvasResearchData[];
    conflicts: CanvasConflictData[];
    themes: CanvasThemeData[];
  }> {
    try {
      const [characters, plots, locations, timelines, research, conflicts, themes] = await Promise.all([
        this.getPlanningCharacters(projectId),
        this.getPlanningPlots(projectId),
        this.getPlanningLocations(projectId),
        this.getPlanningTimelines(projectId),
        this.getPlanningResearch(projectId),
        this.getPlanningConflicts(projectId),
        this.getPlanningThemes(projectId)
      ]);

      return {
        characters,
        plots,
        locations,
        timelines,
        research,
        conflicts,
        themes
      };
    } catch (error) {
      console.error('Error getting all planning content:', error);
      return {
        characters: [],
        plots: [],
        locations: [],
        timelines: [],
        research: [],
        conflicts: [],
        themes: []
      };
    }
  }
}

export const enhancedCanvasIntegrationService = new EnhancedCanvasIntegrationService();
