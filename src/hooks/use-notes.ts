import { useState, useEffect, useCallback } from 'react';
import { Note, NoteCategory } from '../types';
import { notesService, DeletedNote } from '../services/notes-service';

export interface UseNotesResult {
  notes: Note[];
  deletedNotes: DeletedNote[];
  loading: boolean;
  error: string | null;
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string, reason?: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  permanentlyDeleteNote: (id: string) => Promise<void>;
  searchNotes: (query: string) => Promise<Note[]>;
  refreshNotes: () => Promise<void>;
  refreshDeletedNotes: () => Promise<void>;
}

export function useNotes(): UseNotesResult {
  const [notes, setNotes] = useState<Note[]>([]);
  const [deletedNotes, setDeletedNotes] = useState<DeletedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notes from database
  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const notesData = await notesService.getNotes();
      setNotes(notesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load deleted notes for history
  const loadDeletedNotes = useCallback(async () => {
    try {
      const deletedData = await notesService.getDeletedNotes();
      setDeletedNotes(deletedData);
    } catch (err) {
      console.error('Error loading deleted notes:', err);
    }
  }, []);

  // Create a new note
  const createNote = useCallback(async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newNote = await notesService.createNote(noteData);
      setNotes(prev => [newNote, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
      throw err;
    }
  }, []);

  // Update an existing note
  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    try {
      setError(null);
      const updatedNote = await notesService.updateNote(id, updates);
      setNotes(prev => prev.map(note => note.id === id ? updatedNote : note));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
      throw err;
    }
  }, []);

  // Delete a note (soft delete)
  const deleteNote = useCallback(async (id: string, reason?: string) => {
    try {
      setError(null);
      await notesService.deleteNote(id, reason);
      setNotes(prev => prev.filter(note => note.id !== id));
      // Refresh deleted notes to show in history
      await loadDeletedNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    }
  }, [loadDeletedNotes]);

  // Restore a deleted note
  const restoreNote = useCallback(async (id: string) => {
    try {
      setError(null);
      const restoredNote = await notesService.restoreNote(id);
      setNotes(prev => [restoredNote, ...prev]);
      setDeletedNotes(prev => prev.filter(note => note.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore note');
      throw err;
    }
  }, []);

  // Permanently delete a note
  const permanentlyDeleteNote = useCallback(async (id: string) => {
    try {
      setError(null);
      await notesService.permanentlyDeleteNote(id);
      setDeletedNotes(prev => prev.filter(note => note.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to permanently delete note');
      throw err;
    }
  }, []);

  // Search notes
  const searchNotes = useCallback(async (query: string): Promise<Note[]> => {
    try {
      setError(null);
      return await notesService.searchNotes(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search notes');
      return [];
    }
  }, []);

  // Refresh functions
  const refreshNotes = useCallback(async () => {
    await loadNotes();
  }, [loadNotes]);

  const refreshDeletedNotes = useCallback(async () => {
    await loadDeletedNotes();
  }, [loadDeletedNotes]);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
    loadDeletedNotes();
  }, [loadNotes, loadDeletedNotes]);

  return {
    notes,
    deletedNotes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    restoreNote,
    permanentlyDeleteNote,
    searchNotes,
    refreshNotes,
    refreshDeletedNotes,
  };
}

// Hook for getting notes by category
export function useNotesByCategory(category: NoteCategory): {
  notes: Note[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const notesData = await notesService.getNotesByCategory(category);
      setNotes(notesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
      console.error('Error loading notes by category:', err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  const refresh = useCallback(async () => {
    await loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return {
    notes,
    loading,
    error,
    refresh,
  };
}
