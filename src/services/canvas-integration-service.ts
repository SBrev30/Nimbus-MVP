import { characterService, Character } from './character-service';

export interface CanvasCharacterData {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description: string;
  fromPlanning: boolean;
  planningId?: string;
  traits?: string[];
  age?: number;
  occupation?: string;
  completeness_score?: number;
  background?: string;
}

class CanvasIntegrationService {
  /**
   * Get all characters from planning section formatted for Canvas
   */
  async getPlanningCharacters(projectId?: string): Promise<CanvasCharacterData[]> {
    try {
      const characters = await characterService.getCharacters(projectId);
      
      return characters.map(this.formatCharacterForCanvas);
    } catch (error) {
      console.error('Error fetching planning characters:', error);
      return [];
    }
  }

  /**
   * Get a specific character by ID
   */
  async getPlanningCharacter(characterId: string): Promise<CanvasCharacterData | null> {
    try {
      const character = await characterService.getCharacter(characterId);
      if (!character) return null;
      
      return this.formatCharacterForCanvas(character);
    } catch (error) {
      console.error('Error fetching planning character:', error);
      return null;
    }
  }

  /**
   * Format character from planning service to Canvas format
   */
  private formatCharacterForCanvas(character: Character): CanvasCharacterData {
    return {
      id: character.id,
      name: character.name,
      role: character.role,
      description: character.description,
      fromPlanning: true,
      planningId: character.id,
      traits: character.traits || [],
      age: character.age,
      occupation: character.occupation,
      completeness_score: character.completeness_score,
      background: character.background
    };
  }

  /**
   * Search characters by name or role
   */
  async searchPlanningCharacters(
    searchTerm: string, 
    projectId?: string
  ): Promise<CanvasCharacterData[]> {
    try {
      const characters = await characterService.searchCharacters(searchTerm, projectId);
      return characters.map(this.formatCharacterForCanvas);
    } catch (error) {
      console.error('Error searching planning characters:', error);
      return [];
    }
  }

  /**
   * Get characters by specific role
   */
  async getPlanningCharactersByRole(
    role: string, 
    projectId?: string
  ): Promise<CanvasCharacterData[]> {
    try {
      const characters = await characterService.getCharactersByRole(role, projectId);
      return characters.map(this.formatCharacterForCanvas);
    } catch (error) {
      console.error('Error fetching characters by role:', error);
      return [];
    }
  }

  /**
   * Sync Canvas character node data back to planning
   */
  async syncCharacterToPlanning(
    canvasCharacter: CanvasCharacterData
  ): Promise<Character | null> {
    try {
      if (!canvasCharacter.planningId) {
        console.warn('Cannot sync character without planningId');
        return null;
      }

      const updateData = {
        name: canvasCharacter.name,
        role: canvasCharacter.role,
        description: canvasCharacter.description,
        traits: canvasCharacter.traits,
        age: canvasCharacter.age,
        occupation: canvasCharacter.occupation,
        background: canvasCharacter.background
      };

      return await characterService.updateCharacter(
        canvasCharacter.planningId,
        updateData
      );
    } catch (error) {
      console.error('Error syncing character to planning:', error);
      return null;
    }
  }

  /**
   * Create new character in planning from Canvas
   */
  async createCharacterFromCanvas(
    canvasCharacter: Partial<CanvasCharacterData>,
    projectId?: string
  ): Promise<Character | null> {
    try {
      const createData = {
        name: canvasCharacter.name || 'New Character',
        role: canvasCharacter.role || 'supporting',
        description: canvasCharacter.description || '',
        traits: canvasCharacter.traits || [],
        age: canvasCharacter.age,
        occupation: canvasCharacter.occupation,
        background: canvasCharacter.background,
        project_id: projectId,
        tags: [] // Start with empty tags
      };

      return await characterService.createCharacter(createData);
    } catch (error) {
      console.error('Error creating character from canvas:', error);
      return null;
    }
  }
}

export const canvasIntegrationService = new CanvasIntegrationService();
