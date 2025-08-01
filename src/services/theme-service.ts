// src/services/theme-service.ts
import { supabase } from '../lib/supabase';

export interface Theme {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string;
  theme_type: 'major' | 'minor' | 'motif';
  character_connections: {
    characterId: string;
    howThemeManifests: string;
    motivationAlignment: string;
  }[];
  plot_connections: {
    plotThreadId: string;
    themeRelevance: 'high' | 'medium' | 'low';
    howPlotExpressesTheme: string;
  }[];
  location_connections: {
    locationId: string;
    symbolicMeaning: string;
  }[];
  development_notes: string;
  completeness_score: number;
  created_at: string;
  updated_at: string;
}

export interface CreateThemeData {
  title: string;
  description: string;
  theme_type: 'major' | 'minor' | 'motif';
  character_connections?: Theme['character_connections'];
  plot_connections?: Theme['plot_connections'];
  location_connections?: Theme['location_connections'];
  development_notes?: string;
  project_id?: string;
}

export interface UpdateThemeData {
  title?: string;
  description?: string;
  theme_type?: 'major' | 'minor' | 'motif';
  character_connections?: Theme['character_connections'];
  plot_connections?: Theme['plot_connections'];
  location_connections?: Theme['location_connections'];
  development_notes?: string;
}

class ThemeService {
  async getThemes(projectId?: string): Promise<Theme[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('themes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching themes:', error);
      throw error;
    }
  }

  async getThemeById(id: string): Promise<Theme | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching theme:', error);
      throw error;
    }
  }

  async createTheme(data: CreateThemeData): Promise<Theme> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const completenessScore = this.calculateCompletenessScore({
        title: data.title,
        description: data.description,
        character_connections: data.character_connections || [],
        plot_connections: data.plot_connections || [],
        location_connections: data.location_connections || [],
        development_notes: data.development_notes || ''
      });

      const { data: theme, error } = await supabase
        .from('themes')
        .insert({
          ...data,
          user_id: user.id,
          completeness_score: completenessScore,
          character_connections: data.character_connections || [],
          plot_connections: data.plot_connections || [],
          location_connections: data.location_connections || []
        })
        .select()
        .single();

      if (error) throw error;
      return theme;
    } catch (error) {
      console.error('Error creating theme:', error);
      throw error;
    }
  }

  async updateTheme(id: string, updates: UpdateThemeData): Promise<Theme> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current theme to calculate completeness
      const currentTheme = await this.getThemeById(id);
      if (!currentTheme) throw new Error('Theme not found');

      const updatedData = { ...currentTheme, ...updates };
      const completenessScore = this.calculateCompletenessScore(updatedData);

      const { data, error } = await supabase
        .from('themes')
        .update({
          ...updates,
          completeness_score: completenessScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  }

  async deleteTheme(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('themes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting theme:', error);
      throw error;
    }
  }

  async searchThemes(query: string, projectId?: string): Promise<Theme[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let supabaseQuery = supabase
        .from('themes')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (projectId) {
        supabaseQuery = supabaseQuery.eq('project_id', projectId);
      }

      const { data, error } = await supabaseQuery;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching themes:', error);
      throw error;
    }
  }

  async getThemesByType(type: Theme['theme_type'], projectId?: string): Promise<Theme[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('themes')
        .select('*')
        .eq('user_id', user.id)
        .eq('theme_type', type)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching themes by type:', error);
      throw error;
    }
  }

  private calculateCompletenessScore(theme: Partial<Theme>): number {
    let score = 0;
    const maxScore = 100;

    // Basic information (40%)
    if (theme.title?.trim()) score += 15;
    if (theme.description?.trim()) score += 25;

    // Connections (45%)
    if (theme.character_connections && theme.character_connections.length > 0) score += 15;
    if (theme.plot_connections && theme.plot_connections.length > 0) score += 15;
    if (theme.location_connections && theme.location_connections.length > 0) score += 15;

    // Development notes (15%)
    if (theme.development_notes?.trim()) score += 15;

    return Math.min(score, maxScore);
  }

  async addCharacterConnection(themeId: string, connection: Theme['character_connections'][0]): Promise<Theme> {
    const theme = await this.getThemeById(themeId);
    if (!theme) throw new Error('Theme not found');

    const updatedConnections = [...theme.character_connections, connection];
    return this.updateTheme(themeId, { character_connections: updatedConnections });
  }

  async removeCharacterConnection(themeId: string, characterId: string): Promise<Theme> {
    const theme = await this.getThemeById(themeId);
    if (!theme) throw new Error('Theme not found');

    const updatedConnections = theme.character_connections.filter(
      conn => conn.characterId !== characterId
    );
    return this.updateTheme(themeId, { character_connections: updatedConnections });
  }

  async addPlotConnection(themeId: string, connection: Theme['plot_connections'][0]): Promise<Theme> {
    const theme = await this.getThemeById(themeId);
    if (!theme) throw new Error('Theme not found');

    const updatedConnections = [...theme.plot_connections, connection];
    return this.updateTheme(themeId, { plot_connections: updatedConnections });
  }

  async removePlotConnection(themeId: string, plotThreadId: string): Promise<Theme> {
    const theme = await this.getThemeById(themeId);
    if (!theme) throw new Error('Theme not found');

    const updatedConnections = theme.plot_connections.filter(
      conn => conn.plotThreadId !== plotThreadId
    );
    return this.updateTheme(themeId, { plot_connections: updatedConnections });
  }
}

export const themeService = new ThemeService();
