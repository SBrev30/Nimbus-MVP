// Core application types for WritersBlock

export interface EditorContent {
  title: string;
  content: string;
  wordCount: number;
  lastSaved: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'Person' | 'Place' | 'Plot' | 'Misc';
  createdAt: Date;
  updatedAt: Date;
}

export type NoteCategory = 'All' | 'Person' | 'Place' | 'Plot' | 'Misc';

export interface Character {
  id: string;
  name: string;
  description: string;
  role: string;
  traits: string[];
  background: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlotPoint {
  id: string;
  title: string;
  description: string;
  sequence: number;
  status: 'planned' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface WorldBuildingElement {
  id: string;
  name: string;
  type: 'location' | 'culture' | 'magic-system' | 'technology' | 'other';
  description: string;
  details: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  genre: string;
  status: 'draft' | 'writing' | 'editing' | 'completed';
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  projectId: string;
  title: string;
  content: string;
  wordCount: number;
  sequence: number;
  status: 'draft' | 'writing' | 'editing' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
