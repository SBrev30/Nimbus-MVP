export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'Person' | 'Place' | 'Plot' | 'Misc';
  createdAt: Date;
  updatedAt: Date;
}

export interface EditorContent {
  title: string;
  content: string;
  wordCount: number;
  lastSaved: Date;
}

export type NoteCategory = 'All' | 'Person' | 'Place' | 'Plot' | 'Misc';