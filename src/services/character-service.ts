import { supabase, logSupabaseError } from '../lib/supabase';

export interface Character {
  id: string;
  project_id?: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description: string;
  background?: string;
  traits?: string[];
  physical_description?: string;
  age?: number;
  occupation?: string;
  completeness_score: number;
  tags: string[];
  character_data?: any; // JSONB field for additional data
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateCharacterData {
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description: string;
  background?: string;
  traits?: string[];
  physical_description?: string;
  age?: number;
  occupation?: string;
  tags?: string[];
  project_id?: string;
}

export interface UpdateCharacterData extends Partial<CreateCharacterData> {
  completeness_score?: number;
}

class CharacterService {
  async getCharacters(projectId?: string): Promise<Character[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        logSupabaseError(error, 'CharacterService.getCharacters');
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching characters:', error);
      throw error;
    }
  }

  async getCharacter(id: string): Promise<Character | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        logSupabaseError(error, 'CharacterService.getCharacter');
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching character:', error);
      throw error;
    }
  }

  async createCharacter(characterData: CreateCharacterData): Promise<Character> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newCharacter = {
        ...characterData,
        user_id: user.id,
        completeness_score: this.calculateCompletenessScore(characterData),
        tags: characterData.tags || [],
        traits: characterData.traits || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('characters')
        .insert([newCharacter])
        .select()
        .single();

      if (error) {
        logSupabaseError(error, 'CharacterService.createCharacter');
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  }

  async updateCharacter(id: string, updates: UpdateCharacterData): Promise<Character> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Recalculate completeness score if relevant fields are updated
      if (updates.name || updates.description || updates.background || updates.traits) {
        const currentCharacter = await this.getCharacter(id);
        if (currentCharacter) {
          const updatedCharacterData = { ...currentCharacter, ...updates };
          updateData.completeness_score = this.calculateCompletenessScore(updatedCharacterData);
        }
      }

      const { data, error } = await supabase
        .from('characters')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        logSupabaseError(error, 'CharacterService.updateCharacter');
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  }

  async deleteCharacter(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        logSupabaseError(error, 'CharacterService.deleteCharacter');
        throw error;
      }
    } catch (error) {
      console.error('Error deleting character:', error);
      throw error;
    }
  }

  async searchCharacters(query: string, projectId?: string): Promise<Character[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let supabaseQuery = supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,background.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (projectId) {
        supabaseQuery = supabaseQuery.eq('project_id', projectId);
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        logSupabaseError(error, 'CharacterService.searchCharacters');
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching characters:', error);
      throw error;
    }
  }

  async getCharactersByRole(role: string, projectId?: string): Promise<Character[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', role)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        logSupabaseError(error, 'CharacterService.getCharactersByRole');
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching characters by role:', error);
      throw error;
    }
  }

  private calculateCompletenessScore(character: Partial<Character | CreateCharacterData>): number {
    let score = 0;
    const maxScore = 100;

    // Basic info (40% of total score)
    if (character.name?.trim()) score += 15;
    if (character.description?.trim() && character.description.length > 20) score += 15;
    if (character.role) score += 10;

    // Extended info (40% of total score)
    if (character.background?.trim() && character.background.length > 50) score += 20;
    if (character.traits && character.traits.length > 0) score += 20;

    // Tags and organization (20% of total score)
    if ('tags' in character && character.tags && character.tags.length > 0) score += 20;

    return Math.min(score, maxScore);
  }
}

export const characterService = new CharacterService();