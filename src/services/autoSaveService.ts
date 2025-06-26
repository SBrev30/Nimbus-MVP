// src/services/autoSaveService.ts
import { supabase } from '../lib/supabase';

export interface AutoSaveData {
  chapterId: string;
  content: string;
  title: string;
  wordCount: number;
  saveType?: 'auto' | 'manual' | 'backup';
}

export interface AutoSaveResult {
  success: boolean;
  savedAt?: Date;
  saveType?: string;
  wordCount?: number;
  error?: string;
}

export interface ContentDraft {
  id: string;
  chapterId: string;
  content: string;
  title: string;
  wordCount: number;
  saveType: 'auto' | 'manual' | 'backup';
  createdAt: Date;
}

class AutoSaveService {
  /**
   * Save chapter content using the optimized auto-save function
   */
  async saveChapterContent(data: AutoSaveData): Promise<AutoSaveResult> {
    try {
      const { data: result, error } = await supabase.rpc('handle_auto_save', {
        p_chapter_id: data.chapterId,
        p_content: data.content,
        p_title: data.title,
        p_word_count: data.wordCount,
        p_save_type: data.saveType || 'auto'
      });

      if (error) {
        console.error('Auto-save error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: result.success,
        savedAt: result.saved_at ? new Date(result.saved_at) : undefined,
        saveType: result.save_type,
        wordCount: result.word_count,
        error: result.error
      };
    } catch (error) {
      console.error('Auto-save service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get recent drafts for a chapter (for recovery)
   */
  async getChapterDrafts(chapterId: string, limit: number = 10): Promise<ContentDraft[]> {
    try {
      const { data, error } = await supabase
        .from('content_drafts')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching drafts:', error);
        return [];
      }

      return data.map(draft => ({
        id: draft.id,
        chapterId: draft.chapter_id,
        content: draft.content,
        title: draft.title,
        wordCount: draft.word_count,
        saveType: draft.save_type,
        createdAt: new Date(draft.created_at)
      }));
    } catch (error) {
      console.error('Error fetching chapter drafts:', error);
      return [];
    }
  }

  /**
   * Create a manual backup before major changes
   */
  async createBackup(data: AutoSaveData): Promise<AutoSaveResult> {
    return this.saveChapterContent({
      ...data,
      saveType: 'backup'
    });
  }

  /**
   * Get auto-save statistics for a user
   */
  async getAutoSaveStats(userId?: string): Promise<{
    totalSaves: number;
    autoSaves: number;
    manualSaves: number;
    lastSaveTime?: Date;
  }> {
    try {
      // Get current user if not provided
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }

      if (!userId) {
        return { totalSaves: 0, autoSaves: 0, manualSaves: 0 };
      }

      const { data, error } = await supabase
        .from('content_drafts')
        .select('save_type, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching auto-save stats:', error);
        return { totalSaves: 0, autoSaves: 0, manualSaves: 0 };
      }

      const stats = {
        totalSaves: data.length,
        autoSaves: data.filter(d => d.save_type === 'auto').length,
        manualSaves: data.filter(d => d.save_type === 'manual').length,
        lastSaveTime: data.length > 0 ? new Date(data[0].created_at) : undefined
      };

      return stats;
    } catch (error) {
      console.error('Error calculating auto-save stats:', error);
      return { totalSaves: 0, autoSaves: 0, manualSaves: 0 };
    }
  }

  /**
   * Check if there are any unsaved changes by comparing with last saved version
   */
  async hasUnsavedChanges(chapterId: string, currentContent: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('content, auto_saved_at, manual_saved_at')
        .eq('id', chapterId)
        .single();

      if (error || !data) {
        return true; // Assume unsaved if we can't check
      }

      // Compare content and check if there was a recent save
      const contentChanged = data.content !== currentContent;
      const recentSave = data.auto_saved_at || data.manual_saved_at;
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      return contentChanged || (recentSave && new Date(recentSave) < fiveMinutesAgo);
    } catch (error) {
      console.error('Error checking unsaved changes:', error);
      return true;
    }
  }

  /**
   * Recover content from a specific draft
   */
  async recoverFromDraft(draftId: string): Promise<{
    success: boolean;
    content?: string;
    title?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('content_drafts')
        .select('content, title')
        .eq('id', draftId)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: 'Draft not found'
        };
      }

      return {
        success: true,
        content: data.content,
        title: data.title
      };
    } catch (error) {
      console.error('Error recovering from draft:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Clean up old drafts manually (usually called by admin)
   */
  async cleanupOldDrafts(): Promise<{ success: boolean; deletedCount?: number }> {
    try {
      const { error } = await supabase.rpc('cleanup_old_drafts');

      if (error) {
        console.error('Error cleaning up drafts:', error);
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in cleanup function:', error);
      return { success: false };
    }
  }
}

export const autoSaveService = new AutoSaveService();
