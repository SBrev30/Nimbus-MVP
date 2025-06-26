// Canvas Node Type Definitions with Supabase Integration
export interface BaseNodeData {
  id?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  project_id?: string;
}

export interface CharacterNodeData extends BaseNodeData {
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description: string;
  image?: string;
  fantasyClass?: string;
  relationships?: string[];
  aiSuggested?: boolean;
  traits?: string[];
  backstory?: string;
  age?: number;
  occupation?: string;
  goals?: string[];
  fears?: string[];
  secrets?: string[];
}

export interface PlotNodeData extends BaseNodeData {
  title: string;
  type: 'event' | 'conflict' | 'resolution' | 'twist' | 'setup' | 'climax';
  description: string;
  chapter?: string;
  order?: number;
  significance?: 'critical' | 'major' | 'moderate' | 'minor';
  duration?: string;
  consequences?: string[];
  prerequisites?: string[];
}

export interface LocationNodeData extends BaseNodeData {
  name: string;
  type: 'city' | 'building' | 'natural' | 'mystical' | 'country' | 'region';
  description: string;
  importance: 'critical' | 'high' | 'moderate' | 'low';
  geography?: {
    climate: string;
    terrain: string;
    size: string;
    population?: string;
  };
  culture?: {
    politics: string;
    religion: string;
    customs: string;
    language?: string;
  };
  connectedCharacters?: string[];
  connectedEvents?: string[];
  atmosphere?: string;
  resources?: string[];
}

export interface ThemeNodeData extends BaseNodeData {
  title: string;
  type: 'central' | 'supporting' | 'minor' | 'subplot';
  description: string;
  development?: string;
  significance: 'critical' | 'high' | 'moderate' | 'low';
  relatedCharacters?: string[];
  symbolism?: string[];
  examples?: string[];
  resolution?: string;
}

export interface ConflictNodeData extends BaseNodeData {
  title: string;
  type: 'internal' | 'interpersonal' | 'societal' | 'environmental' | 'supernatural';
  description: string;
  parties: string[];
  resolution?: string;
  impact: 'critical' | 'high' | 'moderate' | 'low';
  stakes?: string;
  tensionLevel?: number; // 1-10 scale
  escalationPoints?: string[];
}

export interface TimelineNodeData extends BaseNodeData {
  title: string;
  type: 'event' | 'period' | 'milestone' | 'deadline';
  description: string;
  timeframe: string;
  duration?: string;
  order: number;
  significance: 'critical' | 'high' | 'medium' | 'low';
  connectedEvents?: string[];
  absoluteTime?: string; // ISO date string 
  relativeTime?: string; // "3 days after X"
}

export interface ResearchNodeData extends BaseNodeData {
  title: string;
  content: string;
  source?: string;
  tags: string[];
  category: 'worldbuilding' | 'character' | 'plot' | 'setting' | 'technology' | 'culture';
  credibility?: 'verified' | 'reliable' | 'speculative' | 'fictional';
  relevance?: 'critical' | 'high' | 'moderate' | 'low';
  attachments?: {
    type: 'image' | 'pdf' | 'link' | 'note';
    url: string;
    title: string;
  }[];
}

// Canvas State for Supabase Storage
export interface CanvasState {
  id?: string;
  user_id: string;
  project_id: string;
  name: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  settings: {
    mode: 'exploratory' | 'master';
    theme: 'light' | 'dark';
    grid_enabled: boolean;
    minimap_enabled: boolean;
  };
  created_at?: string;
  updated_at?: string;
  version: number; // For conflict resolution
}

export interface CanvasNode {
  id: string;
  type: 'character' | 'plot' | 'location' | 'theme' | 'conflict' | 'timeline' | 'research';
  position: { x: number; y: number };
  data: CharacterNodeData | PlotNodeData | LocationNodeData | ThemeNodeData | ConflictNodeData | TimelineNodeData | ResearchNodeData;
  width?: number;
  height?: number;
  selected?: boolean;
  dragging?: boolean;
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  type?: 'smoothstep' | 'straight' | 'step';
  label?: string;
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
data?: EdgeData; 
} 

export interface EdgeData { 
relationshipType: 'relationship' | 'plotFlow' | 'researchLink' | 'temporal' | 'causal' | 'thematic'; 
strength?: 'strong' | 'moderate' | 'weak'; 
direction?: 'bidirectional' | 'unidirectional'; 
description?: string; 
category?: string; 
credibility?: 'high' | 'medium' | 'low'; 
relevance?: 'critical' | 'high' | 'moderate' | 'low';
attachments?: { 
type: 'document' | 'image' | 'link';
url: string; 
title: string;
}[]; 
}
// Node Creation Templates
export const nodeTemplates = {
  character: (): CharacterNodeData => ({
    name: 'New Character',
    role: 'supporting',
    description: '',
    traits: [],
    relationships: [],
    aiSuggested: false
  }),
  
  plot: (): PlotNodeData => ({
    title: 'New Plot Point',
    type: 'event',
    description: '',
    significance: 'moderate',
    order: 0
  }),
  
  location: (): LocationNodeData => ({
    name: 'New Location',
    type: 'building',
    description: '',
    importance: 'moderate',
    connectedCharacters: []
  }),
  
  theme: (): ThemeNodeData => ({
    title: 'New Theme',
    type: 'supporting',
    description: '',
    significance: 'moderate',
    relatedCharacters: []
  }),
  
  conflict: (): ConflictNodeData => ({
    title: 'New Conflict',
    type: 'interpersonal',
    description: '',
    parties: [],
    impact: 'moderate'
  }),
  
  timeline: (): TimelineNodeData => ({
    title: 'New Timeline Event',
    type: 'event',
    description: '',
    timeframe: 'Present',
    order: 0,
    significance: 'medium'
  }),
  
  research: (): ResearchNodeData => ({
    title: 'New Research',
    content: '',
    tags: [],
    category: 'worldbuilding'
  })
};

// Supabase Table Definitions (for reference)
export const supabaseSchema = {
  canvas_states: `
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    canvas_data JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  `,
  
  canvas_nodes: `
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canvas_id UUID REFERENCES canvas_states(id) ON DELETE CASCADE,
    node_type TEXT NOT NULL,
    position JSONB NOT NULL,
    node_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  `,
  
  canvas_edges: `
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canvas_id UUID REFERENCES canvas_states(id) ON DELETE CASCADE,
    source_node_id UUID REFERENCES canvas_nodes(id) ON DELETE CASCADE,
    target_node_id UUID REFERENCES canvas_nodes(id) ON DELETE CASCADE,
    edge_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  `
};
