// src/services/canvas-integration-service.ts
import { supabase } from '../lib/supabase';
import { CanvasCharacterData, CanvasPlotData, CanvasLocationData } from '../hooks/useCanvasPlanningData';

export interface CanvasConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  connectionType: 'relationship' | 'plot_flow' | 'location_link' | 'thematic' | 'causal';
  strength: 'weak' | 'moderate' | 'strong';
  description?: string;
  metadata?: Record<string, any>;
}

export interface CanvasNodeData {
  id: string;
  type: 'character' | 'plot' | 'location' | 'theme' | 'conflict' | 'timeline' | 'research';
  name?: string;
  title?: string;
  description: string;
  fromPlanning: boolean;
  planningId?: string;
  position: { x: number; y: number };
  [key: string]: any;
}

class CanvasIntegrationService {
  // Connection Management
  async createConnection(connection: Omit<CanvasConnection, 'id'>): Promise<CanvasConnection | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const projectId = localStorage.getItem('currentProjectId') || 'default-project';

      const { data, error } = await supabase
        .from('canvas_connections')
        .insert({
          source_node_id: connection.sourceNodeId,
          target_node_id: connection.targetNodeId,
          connection_type: connection.connectionType,
          strength: connection.strength,
          description: connection.description,
          metadata: connection.metadata || {},
          user_id: user.id,
          project_id: projectId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating connection:', error);
        return null;
      }

      return {
        id: data.id,
        sourceNodeId: data.source_node_id,
        targetNodeId: data.target_node_id,
        connectionType: data.connection_type,
        strength: data.strength,
        description: data.description,
        metadata: data.metadata
      };
    } catch (err) {
      console.error('Error creating connection:', err);
      return null;
    }
  }

  async getConnections(nodeId?: string): Promise<CanvasConnection[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const projectId = localStorage.getItem('currentProjectId') || 'default-project';

      let query = supabase
        .from('canvas_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('project_id', projectId);

      if (nodeId) {
        query = query.or(`source_node_id.eq.${nodeId},target_node_id.eq.${nodeId}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching connections:', error);
        return [];
      }

      return (data || []).map(conn => ({
        id: conn.id,
        sourceNodeId: conn.source_node_id,
        targetNodeId: conn.target_node_id,
        connectionType: conn.connection_type,
        strength: conn.strength,
        description: conn.description,
        metadata: conn.metadata
      }));
    } catch (err) {
      console.error('Error fetching connections:', err);
      return [];
    }
  }

  async deleteConnection(connectionId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('canvas_connections')
        .delete()
        .eq('id', connectionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting connection:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error deleting connection:', err);
      return false;
    }
  }

  // Character Relationship Management
  async createCharacterRelationship(
    sourceCharacterId: string, 
    targetCharacterId: string, 
    relationshipType: string,
    description?: string
  ): Promise<boolean> {
    try {
      const connection = await this.createConnection({
        sourceNodeId: sourceCharacterId,
        targetNodeId: targetCharacterId,
        connectionType: 'relationship',
        strength: 'moderate',
        description: description || `${relationshipType} relationship`,
        metadata: {
          relationshipType,
          bidirectional: true
        }
      });

      return connection !== null;
    } catch (err) {
      console.error('Error creating character relationship:', err);
      return false;
    }
  }

  async getCharacterRelationships(characterId: string): Promise<CanvasConnection[]> {
    const connections = await this.getConnections(characterId);
    return connections.filter(conn => conn.connectionType === 'relationship');
  }

  // Plot Flow Management
  async createPlotFlow(
    sourceEventId: string,
    targetEventId: string,
    flowType: 'causes' | 'leads_to' | 'parallel' | 'prevents',
    description?: string
  ): Promise<boolean> {
    try {
      const connection = await this.createConnection({
        sourceNodeId: sourceEventId,
        targetNodeId: targetEventId,
        connectionType: 'plot_flow',
        strength: 'strong',
        description: description || `${flowType} connection`,
        metadata: {
          flowType,
          directional: true
        }
      });

      return connection !== null;
    } catch (err) {
      console.error('Error creating plot flow:', err);
      return false;
    }
  }

  // Canvas State Management
  async saveCanvasState(nodes: CanvasNodeData[], connections: CanvasConnection[]): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const projectId = localStorage.getItem('currentProjectId') || 'default-project';

      const canvasData = {
        nodes,
        connections,
        viewport: {
          x: 0,
          y: 0,
          zoom: 1
        },
        settings: {
          mode: 'exploratory',
          theme: 'light',
          grid_enabled: true,
          minimap_enabled: true
        }
      };

      const { error } = await supabase
        .from('canvas_states')
        .upsert({
          user_id: user.id,
          project_id: projectId,
          name: 'Main Canvas',
          canvas_data: canvasData,
          version: 1,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving canvas state:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error saving canvas state:', err);
      return false;
    }
  }

  async loadCanvasState(): Promise<{ nodes: CanvasNodeData[]; connections: CanvasConnection[] } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const projectId = localStorage.getItem('currentProjectId') || 'default-project';

      const { data, error } = await supabase
        .from('canvas_states')
        .select('canvas_data')
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .eq('name', 'Main Canvas')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading canvas state:', error);
        return null;
      }

      if (!data) {
        return { nodes: [], connections: [] };
      }

      const canvasData = data.canvas_data;
      return {
        nodes: canvasData.nodes || [],
        connections: canvasData.connections || []
      };
    } catch (err) {
      console.error('Error loading canvas state:', err);
      return null;
    }
  }

  // Navigation helpers
  navigateToCharacterPlanning(characterId: string): void {
    // Navigate to character planning page
    // You'll need to implement this based on your routing
    console.log('Navigate to character planning:', characterId);
    // Example: router.push(`/planning/characters/${characterId}`);
  }

  navigateToPlotPlanning(plotId: string): void {
    // Navigate to plot planning page
    console.log('Navigate to plot planning:', plotId);
    // Example: router.push(`/planning/plots/${plotId}`);
  }

  navigateToLocationPlanning(locationId: string): void {
    // Navigate to location planning page
    console.log('Navigate to location planning:', locationId);
    // Example: router.push(`/planning/locations/${locationId}`);
  }

  // Utility functions
  formatCharacterForCanvas(character: CanvasCharacterData): CanvasNodeData {
    return {
      id: character.id,
      type: 'character',
      name: character.name,
      description: character.description,
      fromPlanning: character.fromPlanning,
      planningId: character.id,
      position: { x: 0, y: 0 }, // Will be set by canvas
      role: character.role,
      age: character.age,
      occupation: character.occupation,
      fantasyClass: character.fantasyClass,
      completeness_score: character.completeness_score,
      traits: character.traits,
      relationships: character.relationships
    };
  }

  formatPlotForCanvas(plot: CanvasPlotData): CanvasNodeData {
    return {
      id: plot.id,
      type: 'plot',
      title: plot.title,
      description: plot.description,
      fromPlanning: plot.fromPlanning,
      planningId: plot.id,
      position: { x: 0, y: 0 },
      plotType: plot.type,
      significance: plot.significance,
      order: plot.order,
      chapter: plot.chapter
    };
  }

  formatLocationForCanvas(location: CanvasLocationData): CanvasNodeData {
    return {
      id: location.id,
      type: 'location',
      name: location.name,
      description: location.description,
      fromPlanning: location.fromPlanning,
      planningId: location.id,
      position: { x: 0, y: 0 },
      locationType: location.type,
      importance: location.importance,
      geography: location.geography,
      culture: location.culture,
      connectedCharacters: location.connectedCharacters
    };
  }

  // Sync helpers
  async syncCanvasToPlanning(): Promise<boolean> {
    try {
      console.log('Syncing canvas data to planning...');
      // This would implement bi-directional sync
      // For now, just return true as characters are already synced via the hook
      return true;
    } catch (err) {
      console.error('Error syncing canvas to planning:', err);
      return false;
    }
  }

  // Connection suggestions based on content analysis
  suggestConnections(nodes: CanvasNodeData[]): Array<{
    source: string;
    target: string;
    type: string;
    reason: string;
    confidence: number;
  }> {
    const suggestions: Array<{
      source: string;
      target: string;
      type: string;
      reason: string;
      confidence: number;
    }> = [];

    // Character-Character relationships based on shared descriptions
    const characters = nodes.filter(n => n.type === 'character');
    for (let i = 0; i < characters.length; i++) {
      for (let j = i + 1; j < characters.length; j++) {
        const char1 = characters[i];
        const char2 = characters[j];
        
        // Simple keyword matching for relationship suggestions
        const desc1 = (char1.description || '').toLowerCase();
        const desc2 = (char2.description || '').toLowerCase();
        
        if (desc1.includes(char2.name?.toLowerCase() || '') || 
            desc2.includes(char1.name?.toLowerCase() || '')) {
          suggestions.push({
            source: char1.id,
            target: char2.id,
            type: 'relationship',
            reason: 'Characters mentioned in each other\'s descriptions',
            confidence: 0.8
          });
        }
      }
    }

    // Character-Location connections
    const locations = nodes.filter(n => n.type === 'location');
    characters.forEach(char => {
      locations.forEach(loc => {
        const charDesc = (char.description || '').toLowerCase();
        const locName = (loc.name || '').toLowerCase();
        
        if (charDesc.includes(locName)) {
          suggestions.push({
            source: char.id,
            target: loc.id,
            type: 'location_link',
            reason: `${char.name} description mentions ${loc.name}`,
            confidence: 0.7
          });
        }
      });
    });

    return suggestions.slice(0, 10); // Return top 10 suggestions
  }
}

export const canvasIntegrationService = new CanvasIntegrationService();
