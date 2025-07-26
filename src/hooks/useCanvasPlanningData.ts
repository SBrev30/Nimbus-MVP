import { useState, useEffect, useCallback } from 'react';
import { characterService } from '../services/character-service';
import { plotService } from '../services/plot-service';
import { canvasIntegrationService } from '../services/canvas-integration-service';
import type { CanvasCharacterData, CanvasPlotData } from '../services/canvas-integration-service';

interface PlanningData {
  planningCharacters: CanvasCharacterData[];
  plotThreads: CanvasPlotData[];
  // Future: worldBuildingLocations: CanvasLocationData[];
}

interface UseCanvasPlanningDataReturn {
  // Data
  planningCharacters: CanvasCharacterData[];
  plotThreads: CanvasPlotData[];
  
  // Loading states
  loading: boolean;
  charactersLoading: boolean;
  plotsLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Search and filter
  searchCharacters: (query: string) => CanvasCharacterData[];
  searchPlots: (query: string) => CanvasPlotData[];
  
  // Refresh functions
  refresh: () => Promise<void>;
  refreshCharacters: () => Promise<void>;
  refreshPlots: () => Promise<void>;
}

export const useCanvasPlanningData = (projectId?: string): UseCanvasPlanningDataReturn => {
  const [planningData, setPlanningData] = useState<PlanningData>({
    planningCharacters: [],
    plotThreads: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [charactersLoading, setCharactersLoading] = useState(false);
  const [plotsLoading, setPlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load character data for canvas integration
  const loadCharacterData = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setCharactersLoading(true);
      setError(null);
      
      const characters = await canvasIntegrationService.getPlanningCharacters(projectId);
      setPlanningData(prev => ({ ...prev, planningCharacters: characters }));
    } catch (err) {
      console.error('Error loading character data:', err);
      setError('Failed to load character data');
    } finally {
      setCharactersLoading(false);
    }
  }, [projectId]);

  // Load plot data for canvas integration
  const loadPlotData = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setPlotsLoading(true);
      setError(null);
      
      const plots = await canvasIntegrationService.getPlanningPlots(projectId);
      setPlanningData(prev => ({ ...prev, plotThreads: plots }));
    } catch (err) {
      console.error('Error loading plot data:', err);
      setError('Failed to load plot data');
    } finally {
      setPlotsLoading(false);
    }
  }, [projectId]);

  // Load all planning data
  const loadAllData = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        loadCharacterData(),
        loadPlotData(),
      ]);
    } catch (err) {
      console.error('Error loading planning data:', err);
      setError('Failed to load planning data');
    } finally {
      setLoading(false);
    }
  }, [projectId, loadCharacterData, loadPlotData]);

  // Search functions
  const searchCharacters = useCallback((query: string): CanvasCharacterData[] => {
    if (!query.trim()) return planningData.planningCharacters;
    
    const lowercaseQuery = query.toLowerCase();
    return planningData.planningCharacters.filter(character =>
      character.name.toLowerCase().includes(lowercaseQuery) ||
      character.description.toLowerCase().includes(lowercaseQuery) ||
      character.role?.toLowerCase().includes(lowercaseQuery)
    );
  }, [planningData.planningCharacters]);

  const searchPlots = useCallback((query: string): CanvasPlotData[] => {
    if (!query.trim()) return planningData.plotThreads;
    
    const lowercaseQuery = query.toLowerCase();
    return planningData.plotThreads.filter(plot =>
      plot.name.toLowerCase().includes(lowercaseQuery) ||
      plot.description.toLowerCase().includes(lowercaseQuery) ||
      plot.status?.toLowerCase().includes(lowercaseQuery)
    );
  }, [planningData.plotThreads]);

  // Refresh functions
  const refresh = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  const refreshCharacters = useCallback(async () => {
    await loadCharacterData();
  }, [loadCharacterData]);

  const refreshPlots = useCallback(async () => {
    await loadPlotData();
  }, [loadPlotData]);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    // Data
    planningCharacters: planningData.planningCharacters,
    plotThreads: planningData.plotThreads,
    
    // Loading states
    loading,
    charactersLoading,
    plotsLoading,
    
    // Error state
    error,
    
    // Search and filter
    searchCharacters,
    searchPlots,
    
    // Refresh functions
    refresh,
    refreshCharacters,
    refreshPlots,
  };
};
