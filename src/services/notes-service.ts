import { supabase } from '../lib/supabase';
import { Note, NoteCategory } from '../types';

export interface DeletedNote extends Note {
  deletedAt: Date;
  deletedReason?: string;
}

class NotesService {
  // Create a new note
  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const newNote = {
      ...note,
      user_id: user.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('notes')
      .insert([newNote])
      .select()
      .single();

    if (error) throw error;

    return this.formatNoteFromDb(data);
  }

  // Get all active notes for the current user
  async getNotes(): Promise<Note[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(this.formatNoteFromDb) || [];
  }

  // Get notes by category
  async getNotesByCategory(category: NoteCategory): Promise<Note[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('category', category)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(this.formatNoteFromDb) || [];
  }

  // Update a note
  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) throw error;

    return this.formatNoteFromDb(data);
  }

  // Soft delete a note (marks as deleted but keeps in database for history)
  async deleteNote(id: string, reason?: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // First get the note to add to history
    const { data: noteData, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.user.id)
      .single();

    if (fetchError) throw fetchError;

    // Mark note as deleted
    const { error: deleteError } = await supabase
      .from('notes')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.user.id);

    if (deleteError) throw deleteError;

    // Add to history
    await this.addToHistory({
      type: 'delete',
      target: 'note',
      title: noteData.title || 'Untitled Note',
      description: `Deleted note in ${noteData.category} category${reason ? `: ${reason}` : ''}`,
      details: {
        category: noteData.category,
        content: noteData.content?.substring(0, 100) + (noteData.content?.length > 100 ? '...' : ''),
      },
    });
  }

  // Get deleted notes for history page
  async getDeletedNotes(): Promise<DeletedNote[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.user.id)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) throw error;

    return data?.map((note) => ({
      ...this.formatNoteFromDb(note),
      deletedAt: new Date(note.deleted_at),
      deletedReason: note.deleted_reason,
    })) || [];
  }

  // Restore a deleted note
  async restoreNote(id: string): Promise<Note> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .update({
        deleted_at: null,
        deleted_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) throw error;

    // Add to history
    await this.addToHistory({
      type: 'create',
      target: 'note',
      title: data.title || 'Untitled Note',
      description: `Restored note in ${data.category} category`,
      details: {
        category: data.category,
      },
    });

    return this.formatNoteFromDb(data);
  }

  // Permanently delete a note
  async permanentlyDeleteNote(id: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);

    if (error) throw error;
  }

  // Search notes
  async searchNotes(query: string): Promise<Note[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.user.id)
      .is('deleted_at', null)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(this.formatNoteFromDb) || [];
  }

  // Private helper to add entries to history
  private async addToHistory(entry: {
    type: 'create' | 'edit' | 'delete';
    target: 'note' | 'chapter' | 'character' | 'project';
    title: string;
    description: string;
    details?: Record<string, any>;
  }): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { error } = await supabase
      .from('history_entries')
      .insert([{
        ...entry,
        user_id: user.user.id,
        timestamp: new Date().toISOString(),
      }]);

    if (error) {
      console.error('Failed to add history entry:', error);
      // Don't throw here as this is a secondary operation
    }
  }

  // Private helper to format note from database
  private formatNoteFromDb(dbNote: any): Note {
    return {
      id: dbNote.id,
      title: dbNote.title || '',
      content: dbNote.content || '',
      category: dbNote.category as NoteCategory,
      createdAt: new Date(dbNote.created_at),
      updatedAt: new Date(dbNote.updated_at),
    };
  }
}

export const notesService = new NotesService();
