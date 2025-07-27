// src/services/auto-connections-service.ts
export interface AutoConnection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'relationship' | 'location' | 'plot';
  relationshipType?: string;
  description?: string;
  strength?: number;
  source: 'planning_data' | 'user_created';
}

export interface CanvasEdgeData extends AutoConnection {
  animated?: boolean;
  style?: {
    stroke: string;
    strokeWidth: number;
    strokeDasharray?: string;
  };
  label?: string;
}

export class AutoConnectionsService {
  
  // Generate character-to-character relationships from planning data
  static generateCharacterConnections(
    characters: any[], 
    characterRelationships: any[]
  ): AutoConnection[] {
    const connections: AutoConnection[] = [];
    
    characterRelationships.forEach(rel => {
      // Only create connection if both characters exist on canvas
      const sourceExists = characters.find(c => c.id === rel.character_id);
      const targetExists = characters.find(c => c.id === rel.related_character_id);
      
      if (sourceExists && targetExists) {
        connections.push({
          id: `char-rel-${rel.character_id}-${rel.related_character_id}`,
          sourceId: rel.character_id,
          targetId: rel.related_character_id,
          type: 'relationship',
          relationshipType: rel.relationship_type,
          description: rel.description,
          strength: rel.strength,
          source: 'planning_data'
        });
      }
    });
    
    return connections;
  }
  
  // Generate character-to-location connections
  static generateLocationConnections(
    characters: any[],
    locations: any[]
  ): AutoConnection[] {
    const connections: AutoConnection[] = [];
    
    locations.forEach(location => {
      if (location.connected_characters && Array.isArray(location.connected_characters)) {
        location.connected_characters.forEach((charId: string) => {
          const characterExists = characters.find(c => c.id === charId);
          if (characterExists) {
            connections.push({
              id: `char-loc-${charId}-${location.id}`,
              sourceId: charId,
              targetId: location.id,
              type: 'location',
              description: `Associated with ${location.name}`,
              source: 'planning_data'
            });
          }
        });
      }
    });
    
    return connections;
  }
  
  // Convert auto-connections to ReactFlow edges
  static connectionsToEdges(connections: AutoConnection[]): CanvasEdgeData[] {
    return connections.map(conn => ({
      ...conn,
      animated: conn.type === 'relationship',
      style: {
        stroke: this.getConnectionColor(conn),
        strokeWidth: conn.type === 'relationship' ? 2 : 1,
        strokeDasharray: conn.source === 'planning_data' ? '5,5' : undefined
      },
      label: conn.relationshipType || conn.type
    }));
  }
  
  // Color coding for different connection types
  private static getConnectionColor(connection: AutoConnection): string {
    if (connection.type === 'relationship') {
      switch (connection.relationshipType) {
        case 'family': return '#10B981'; // Green
        case 'romantic': return '#EC4899'; // Pink
        case 'friend': return '#3B82F6'; // Blue
        case 'enemy': return '#EF4444'; // Red
        case 'professional': return '#8B5CF6'; // Purple
        case 'mentor': return '#F59E0B'; // Amber
        default: return '#6B7280'; // Gray
      }
    } else if (connection.type === 'location') {
      return '#6B7280'; // Gray for locations
    } else {
      return '#8B5CF6'; // Purple for plot connections
    }
  }
  
  // Generate insights for character connections
  static generateCharacterInsights(
    characterId: string, 
    connections: AutoConnection[]
  ): string[] {
    const insights: string[] = [];
    
    const relationships = connections.filter(
      c => (c.sourceId === characterId || c.targetId === characterId) && c.type === 'relationship'
    );
    const locations = connections.filter(
      c => (c.sourceId === characterId || c.targetId === characterId) && c.type === 'location'
    );
    
    if (relationships.length === 0) {
      insights.push("This character has no established relationships. Consider adding connections to other characters.");
    }
    
    if (locations.length === 0) {
      insights.push("This character isn't associated with any locations. Where do they spend their time?");
    }
    
    if (relationships.length > 6) {
      insights.push("This character has many relationships. Make sure each one serves the story.");
    }
    
    const enemyCount = relationships.filter(r => r.relationshipType === 'enemy').length;
    if (enemyCount > 2) {
      insights.push("This character has multiple enemies. This could create interesting conflict opportunities.");
    }
    
    const familyCount = relationships.filter(r => r.relationshipType === 'family').length;
    if (familyCount > 3) {
      insights.push("Large family presence. Consider how family dynamics affect this character's journey.");
    }
    
    return insights;
  }
}
