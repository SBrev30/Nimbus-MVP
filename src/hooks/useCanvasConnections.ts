// src/hooks/useCanvasConnections.ts
import { useState, useMemo, useCallback } from 'react';
import { AutoConnectionsService, AutoConnection, CanvasEdgeData } from '../services/auto-connections-service';

interface ConnectionSettings {
  relationships: boolean;
  locations: boolean;
  plots: boolean;
}

interface UseCanvasConnectionsReturn {
  connectionSettings: ConnectionSettings;
  autoEdges: CanvasEdgeData[];
  connectionInsights: Record<string, string[]>;
  toggleConnectionType: (type: keyof ConnectionSettings) => void;
  refreshConnections: () => void;
}

export const useCanvasConnections = (
  planningData: {
    planningCharacters: any[];
    planningLocations: any[];
    characterRelationships: any[];
  },
  canvasNodes: any[]
): UseCanvasConnectionsReturn => {
  
  const [connectionSettings, setConnectionSettings] = useState<ConnectionSettings>({
    relationships: true,
    locations: true,
    plots: false
  });

  // Get only characters/locations that exist as nodes on canvas
  const canvasCharacterIds = useMemo(() => 
    canvasNodes
      .filter(node => node.type === 'character' && node.data.fromPlanning)
      .map(node => node.data.planningId)
      .filter(Boolean), 
    [canvasNodes]
  );

  const canvasLocationIds = useMemo(() =>
    canvasNodes
      .filter(node => node.type === 'location' && node.data.fromPlanning)
      .map(node => node.data.planningId)
      .filter(Boolean),
    [canvasNodes]
  );

  // Filter planning data to only include items that are on canvas
  const canvasCharacters = useMemo(() =>
    planningData.planningCharacters.filter(char => 
      canvasCharacterIds.includes(char.id)
    ),
    [planningData.planningCharacters, canvasCharacterIds]
  );

  const canvasLocations = useMemo(() =>
    planningData.planningLocations.filter(loc => 
      canvasLocationIds.includes(loc.id)
    ),
    [planningData.planningLocations, canvasLocationIds]
  );

  // Generate all possible connections
  const allConnections = useMemo(() => {
    const connections: AutoConnection[] = [];

    // Character relationships
    if (connectionSettings.relationships) {
      const charConnections = AutoConnectionsService.generateCharacterConnections(
        canvasCharacters,
        planningData.characterRelationships
      );
      connections.push(...charConnections);
    }

    // Location connections
    if (connectionSettings.locations) {
      const locConnections = AutoConnectionsService.generateLocationConnections(
        canvasCharacters,
        canvasLocations
      );
      connections.push(...locConnections);
    }

    // TODO: Plot connections when implemented
    // if (connectionSettings.plots) {
    //   const plotConnections = AutoConnectionsService.generatePlotConnections(
    //     canvasCharacters,
    //     planningData.plotThreads
    //   );
    //   connections.push(...plotConnections);
    // }

    return connections;
  }, [
    canvasCharacters, 
    canvasLocations, 
    planningData.characterRelationships,
    connectionSettings
  ]);

  // Convert connections to ReactFlow edges
  const autoEdges = useMemo(() => {
    return AutoConnectionsService.connectionsToEdges(allConnections);
  }, [allConnections]);

  // Generate insights for each character
  const connectionInsights = useMemo(() => {
    const insights: Record<string, string[]> = {};
    
    canvasCharacterIds.forEach(charId => {
      insights[charId] = AutoConnectionsService.generateCharacterInsights(
        charId,
        allConnections
      );
    });

    return insights;
  }, [canvasCharacterIds, allConnections]);

  const toggleConnectionType = useCallback((type: keyof ConnectionSettings) => {
    setConnectionSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  }, []);

  const refreshConnections = useCallback(() => {
    // Force re-render by toggling state
    setConnectionSettings(prev => ({ ...prev }));
  }, []);

  return {
    connectionSettings,
    autoEdges,
    connectionInsights,
    toggleConnectionType,
    refreshConnections
  };
};
