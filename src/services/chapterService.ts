import { supabase } from '../lib/supabase';

export interface Chapter {
  id: string;
  projectId: string;
  title: string;
  content: string;
  summary?: string;
  wordCount: number;
  orderIndex: number;
  status: 'outline' | 'draft' | 'revision' | 'final';
  createdAt: string;
  updatedAt: string;
}

export const chapterService = {
  /**
   * Get all chapters for the current authenticated user across all projects
   * Used by WelcomeModal to find the most recent chapter
   */
  async getAllChapters(): Promise<Chapter[]> {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('chapters')
        .select(`
          *,
          projects!inner(
            user_id,
            title
          )
        `)
        .eq('projects.user_id', authUser.user.id)
        .order('updated_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return (data || []).map(chapter => ({
        id: chapter.id,
        projectId: chapter.project_id,
        title: chapter.title,
        content: chapter.content,
        summary: chapter.summary,
        wordCount: chapter.word_count,
        orderIndex: chapter.order_index,
        status: chapter.status,
        createdAt: chapter.created_at,
        updatedAt: chapter.updated_at
      }));
    } catch (error) {
      console.error('Error getting all chapters:', error);
      return [];
    }
  },

  /**
   * Get all chapters for a project
   */
  async getProjectChapters(projectId: string): Promise<Chapter[]> {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      return data.map(chapter => ({
        id: chapter.id,
        projectId: chapter.project_id,
        title: chapter.title,
        content: chapter.content,
        summary: chapter.summary,
        wordCount: chapter.word_count,
        orderIndex: chapter.order_index,
        status: chapter.status,
        createdAt: chapter.created_at,
        updatedAt: chapter.updated_at
      }));
    } catch (error) {
      console.error('Error getting project chapters:', error);
      return [];
    }
  },
  
  /**
   * Get a chapter by ID
   */
  async getChapter(id: string): Promise<Chapter | null> {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('chapters')
        .select(`
          *,
          projects!inner(user_id)
        `)
        .eq('id', id)
        .eq('projects.user_id', authUser.user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        id: data.id,
        projectId: data.project_id,
        title: data.title,
        content: data.content,
        summary: data.summary,
        wordCount: data.word_count,
        orderIndex: data.order_index,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error getting chapter:', error);
      return null;
    }
  },
  
  /**
   * Create a new chapter
   */
  async createChapter(chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Chapter | null> {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        throw new Error('Not authenticated');
      }
      
      // Verify user owns the project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', chapter.projectId)
        .eq('user_id', authUser.user.id)
        .single();
      
      if (projectError || !projectData) {
        throw new Error('Project not found or access denied');
      }
      
      // Get the highest order index to place new chapter at the end
      let orderIndex = chapter.orderIndex;
      if (orderIndex === undefined) {
        const { data: chaptersData } = await supabase
          .from('chapters')
          .select('order_index')
          .eq('project_id', chapter.projectId)
          .order('order_index', { ascending: false })
          .limit(1);
        
        orderIndex = chaptersData && chaptersData.length > 0 
          ? chaptersData[0].order_index + 1 
          : 1;
      }
      
      // Calculate word count if not provided
      const wordCount = chapter.wordCount || this.countWords(chapter.content);
      
      const { data, error } = await supabase
        .from('chapters')
        .insert({
          project_id: chapter.projectId,
          title: chapter.title,
          content: chapter.content,
          summary: chapter.summary,
          word_count: wordCount,
          order_index: orderIndex,
          status: chapter.status
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update project word count
      await this.updateProjectWordCount(chapter.projectId);
      
      return {
        id: data.id,
        projectId: data.project_id,
        title: data.title,
        content: data.content,
        summary: data.summary,
        wordCount: data.word_count,
        orderIndex: data.order_index,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error creating chapter:', error);
      return null;
    }
  },
  
  /**
   * Update a chapter
   */
  async updateChapter(id: string, updates: Partial<Omit<Chapter, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>): Promise<Chapter | null> {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        throw new Error('Not authenticated');
      }
      
      // Get the chapter to check project ownership and calculate word count
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select(`
          *,
          projects!inner(user_id)
        `)
        .eq('id', id)
        .eq('projects.user_id', authUser.user.id)
        .single();
      
      if (chapterError || !chapterData) {
        throw new Error('Chapter not found or access denied');
      }
      
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.content !== undefined) {
        updateData.content = updates.content;
        // Recalculate word count when content changes
        updateData.word_count = this.countWords(updates.content);
      }
      if (updates.summary !== undefined) updateData.summary = updates.summary;
      if (updates.wordCount !== undefined) updateData.word_count = updates.wordCount;
      if (updates.orderIndex !== undefined) updateData.order_index = updates.orderIndex;
      if (updates.status !== undefined) updateData.status = updates.status;
      
      const { data, error } = await supabase
        .from('chapters')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update project word count if content or word count changed
      if (updates.content !== undefined || updates.wordCount !== undefined) {
        await this.updateProjectWordCount(data.project_id);
      }
      
      return {
        id: data.id,
        projectId: data.project_id,
        title: data.title,
        content: data.content,
        summary: data.summary,
        wordCount: data.word_count,
        orderIndex: data.order_index,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error updating chapter:', error);
      return null;
    }
  },
  
  /**
   * Delete a chapter
   */
  async deleteChapter(id: string): Promise<boolean> {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        return false;
      }
      
      // Get the chapter to check project ownership
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select(`
          project_id,
          projects!inner(user_id)
        `)
        .eq('id', id)
        .eq('projects.user_id', authUser.user.id)
        .single();
      
      if (chapterError || !chapterData) {
        throw new Error('Chapter not found or access denied');
      }
      
      const projectId = chapterData.project_id;
      
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update project word count
      await this.updateProjectWordCount(projectId);
      
      return true;
    } catch (error) {
      console.error('Error deleting chapter:', error);
      return false;
    }
  },
  
  /**
   * Reorder chapters
   */
  async reorderChapters(projectId: string, chapterIds: string[]): Promise<boolean> {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        return false;
      }
      
      // Verify user owns the project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', authUser.user.id)
        .single();
      
      if (projectError || !projectData) {
        throw new Error('Project not found or access denied');
      }
      
      // Update each chapter's order index
      for (let i = 0; i < chapterIds.length; i++) {
        const { error } = await supabase
          .from('chapters')
          .update({ order_index: i + 1 })
          .eq('id', chapterIds[i])
          .eq('project_id', projectId);
        
        if (error) {
          throw error;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error reordering chapters:', error);
      return false;
    }
  },
  
  /**
   * Count words in text
   */
  countWords(text: string): number {
    if (!text) return 0;
    
    // Remove HTML tags if present
    const cleanText = text.replace(/<[^>]*>/g, ' ');
    
    // Split by whitespace and filter out empty strings
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    
    return words.length;
  },
  
  /**
   * Update project word count based on chapters
   */
  async updateProjectWordCount(projectId: string): Promise<boolean> {
    try {
      // Get all chapters for the project
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('word_count')
        .eq('project_id', projectId);
      
      if (chaptersError) {
        throw chaptersError;
      }
      
      // Calculate total word count
      const totalWordCount = chapters.reduce((sum, chapter) => sum + (chapter.word_count || 0), 0);
      
      // Update project word count
      const { error: updateError } = await supabase
        .from('projects')
        .update({ word_count_current: totalWordCount })
        .eq('id', projectId);
      
      if (updateError) {
        throw updateError;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating project word count:', error);
      return false;
    }
  }
};
