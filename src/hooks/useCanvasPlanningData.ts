import { useState, useEffect, useCallback } from 'react';
import { 
  canvasIntegrationService, 
  CanvasCharacterData
} from '../services/canvas-integration-service';

interface PlanningData {
  planningCharacters: CanvasCharacterData[];
  // TODO: Add plot points and world elements in future updates
  plotPoints: any[];
  worldBuildingLocations: any[];
}

interface UseCanvasPlanningDataReturn extends PlanningData {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  searchCharacters: (searchTerm: string) => Promise<CanvasCharacterData[]>;
  getCharactersByRole: (role: string) => Promise<CanvasCharacterData[]>;
  syncCharacterToPlanning: (character: CanvasCharacterData) => Promise<boolean>;
  createCharacterFromCanvas: (character: Partial<CanvasCharacterData>) => Promise<CanvasCharacterData | null>;
}

export const useCanvasPlanningData = (projectId?: string): UseCanvasPlanningDataReturn => {
  const [planningData, setPlanningData] = useState<PlanningData>({
    planningCharacters: [],
    plotPoints: [], // TODO: Implement plot integration
    worldBuildingLocations: [] // TODO: Implement world building integration
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlanningData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load characters from planning section
      const characters = await canvasIntegrationService.getPlanningCharacters(projectId);
      
      setPlanningData(prev => ({
        ...prev,
        planningCharacters: characters
      }));
    } catch (err) {
      console.error('Error loading planning data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load planning data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Load data on mount and when projectId changes
  useEffect(() => {
    loadPlanningData();
  }, [loadPlanningData]);

  const refresh = useCallback(async () => {
    await loadPlanningData();
  }, [loadPlanningData]);

  const searchCharacters = useCallback(async (searchTerm: string): Promise<CanvasCharacterData[]> => {
    try {
      return await canvasIntegrationService.searchPlanningCharacters(searchTerm, projectId);
    } catch (err) {
      console.error('Error searching characters:', err);
      return [];
    }
  }, [projectId]);

  const getCharactersByRole = useCallback(async (role: string): Promise<CanvasCharacterData[]> => {
    try {
      return await canvasIntegrationService.getPlanningCharactersByRole(role, projectId);
    } catch (err) {
      console.error('Error getting characters by role:', err);
      return [];
    }
  }, [projectId]);

  const syncCharacterToPlanning = useCallback(async (character: CanvasCharacterData): Promise<boolean> => {
    try {
      const result = await canvasIntegrationService.syncCharacterToPlanning(character);
      if (result) {
        // Refresh the data to reflect changes
        await refresh();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error syncing character:', err);
      return false;
    }
  }, [refresh]);

  const createCharacterFromCanvas = useCallback(async (
    character: Partial<CanvasCharacterData>
  ): Promise<CanvasCharacterData | null> => {
    try {
      const result = await canvasIntegrationService.createCharacterFromCanvas(character, projectId);
      if (result) {
        // Refresh the data to include the new character
        await refresh();
        
        // Return the character in Canvas format
        return {
          id: result.id,
          name: result.name,
          role: result.role,
          description: result.description,
          fromPlanning: true,
          planningId: result.id,
          traits: result.traits || [],
          age: result.age,
          occupation: result.occupation,
          completeness_score: result.completeness_score,
          background: result.background
        };
      }
      return null;
    } catch (err) {
      console.error('Error creating character from canvas:', err);
      return null;
    }
  }, [projectId, refresh]);

  return {
    ...planningData,
    loading,
    error,
    refresh,
    searchCharacters,
    getCharactersByRole,
    syncCharacterToPlanning,
    createCharacterFromCanvas
  };
};
