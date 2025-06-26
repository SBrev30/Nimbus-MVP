import { supabase } from '../lib/supabase';

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  genre?: string;
  status: 'planning' | 'writing' | 'editing' | 'complete' | 'published';
  wordCountTarget: number;
  wordCountCurrent: number;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export const projectService = {
  /**
   * Get all projects for the current user
   */
  async getUserProjects(): Promise<Project[]> {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', authUser.user.id)
        .order('updated_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data.map(project => ({
        id: project.id,
        userId: project.user_id,
        title: project.title,
        description: project.description,
        genre: project.genre,
        status: project.status,
        wordCountTarget: project.word_count_target,
        wordCountCurrent: project.word_count_current,
        settings: project.settings,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }));
    } catch (error) {
      console.error('Error getting user projects:', error);
      return [];
    }
  },
  
  /**
   * Get a project by ID
   */
  async getProject(id: string): Promise<Project | null> {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', authUser.user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        genre: data.genre,
        status: data.status,
        wordCountTarget: data.word_count_target,
        wordCountCurrent: data.word_count_current,
        settings: data.settings,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error getting project:', error);
      return null;
    }
  },
  
  /**
   * Create a new project
   */
  async createProject(project: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Project | null> {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: authUser.user.id,
          title: project.title,
          description: project.description,
          genre: project.genre,
          status: project.status,
          word_count_target: project.wordCountTarget,
          word_count_current: project.wordCountCurrent,
          settings: project.settings
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        genre: data.genre,
        status: data.status,
        wordCountTarget: data.word_count_target,
        wordCountCurrent: data.word_count_current,
        settings: data.settings,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  },
  
  /**
   * Update a project
   */
  async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Project | null> {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        throw new Error('Not authenticated');
      }
      
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.genre !== undefined) updateData.genre = updates.genre;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.wordCountTarget !== undefined) updateData.word_count_target = updates.wordCountTarget;
      if (updates.wordCountCurrent !== undefined) updateData.word_count_current = updates.wordCountCurrent;
      if (updates.settings !== undefined) updateData.settings = updates.settings;
      
      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', authUser.user.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        genre: data.genre,
        status: data.status,
        wordCountTarget: data.word_count_target,
        wordCountCurrent: data.word_count_current,
        settings: data.settings,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  },
  
  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<boolean> {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        return false;
      }
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', authUser.user.id);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }
};