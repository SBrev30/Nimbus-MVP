import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAutoSave } from '../hooks/useAutoSave';

interface EditorContent {
  title: string;
  content: string;
  wordCount: number;
  lastSaved: string; // ISO string format
}

interface Note {
  id: string;
  title: string;
  content: string;
  category: 'Person' | 'Place' | 'Plot' | 'Misc';
  createdAt: string; // ISO string format 
  updatedAt: string; // ISO string format };
}

interface AppDataContextType {
  // Editor state
  editorContent: EditorContent;
  setEditorContent: (content: EditorContent | ((prev: EditorContent) => EditorContent)) => void;
  chapterContents: Record<string, EditorContent>;
  setChapterContents: (contents: Record<string, EditorContent> | ((prev: Record<string, EditorContent>) => Record<string, EditorContent>)) => void;
  
  // Notes state
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  
  // Loading states
  isDataLoading: boolean;
  dataError: string | null;
  
  // Utility functions
  saveChapterContent: (chapterId: string, content: EditorContent) => void;
  getChapterContent: (chapterId: string) => EditorContent | null;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  // Lightweight default editor content
  const defaultEditorContent = useMemo((): EditorContent => ({
    title: 'New Chapter',
    content: '<p>Start writing here...</p>',
    wordCount: 0,
    lastSaved: new Date(),
  }), []);

  // Minimal default notes
  const defaultNotes = useMemo((): Note[] => ([
    {
      id: '1',
      title: 'Quick Note',
      content: 'Add your first note here...',
      category: 'Misc',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]), []);

  // State with lazy initialization
  const [editorContent, setEditorContent] = useLocalStorage<EditorContent>('editor-content', defaultEditorContent);
  const [chapterContents, setChapterContents] = useLocalStorage<Record<string, EditorContent>>('chapter-contents', {});
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', defaultNotes);
  const [isDataLoading, setIsDataLoading] = React.useState(false);
  const [dataError, setDataError] = React.useState<string | null>(null);

  // Optimized auto-save with longer intervals to reduce performance impact
  useAutoSave(editorContent, setEditorContent, 5000); // 5 seconds instead of 2

  // Memorized note operations
  const addNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {

      const newNote: Note = {
        ...noteData,
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes(prev => [...prev, newNote]);

  }, [setNotes]);

  const editNote = useCallback((id: string, updates: Partial<Note>) => {

      setNotes(prev => prev.map(note => 
        note.id === id 
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      ));
      
  }, [setNotes]);

  const deleteNote = useCallback((id: string) => {
    try {
      setNotes(prev => prev.filter(note => note.id !== id));
      setDataError(null);
    } catch (error) {
      console.error('Error deleting note:', error);
      setDataError('Failed to delete note');
    }
  }, [setNotes]);

  // Chapter content utilities
  const saveChapterContent = useCallback((chapterId: string, content: EditorContent) => {
    try {
      setChapterContents(prev => ({
        ...prev,
        [chapterId]: {
          ...content,
          lastSaved: new Date()
        }
      }));
      setDataError(null);
    } catch (error) {
      console.error('Error saving chapter content:', error);
      setDataError('Failed to save chapter');
    }
  }, [setChapterContents]);

  const getChapterContent = useCallback((chapterId: string): EditorContent | null => {
    try {
      return chapterContents[chapterId] || null;
    } catch (error) {
      console.error('Error getting chapter content:', error);
      setDataError('Failed to load chapter');
      return null;
    }
  }, [chapterContents]);

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    editorContent,
    setEditorContent,
    chapterContents,
    setChapterContents,
    notes,
    addNote,
    editNote,
    deleteNote,
    isDataLoading,
    dataError,
    saveChapterContent,
    getChapterContent,
  }), [
    editorContent,
    setEditorContent,
    chapterContents,
    setChapterContents,
    notes,
    addNote,
    editNote,
    deleteNote,
    isDataLoading,
    dataError,
    saveChapterContent,
    getChapterContent,
  ]);

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
}
