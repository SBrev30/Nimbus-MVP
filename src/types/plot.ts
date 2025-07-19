export interface PlotEvent {
  id: string;
  thread_id: string;
  title: string;
  description: string;
  chapter_reference?: string;
  tension_level: number; // 1-10
  event_type: 'setup' | 'conflict' | 'climax' | 'resolution';
  order_index: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PlotThread {
  id: string;
  project_id: string;
  user_id?: string;
  title: string;
  type: 'main' | 'subplot' | 'side_story' | 'character_arc';
  description?: string;
  color: string;
  tension_curve: number[];
  connected_character_ids: string[];
  connected_thread_ids: string[];
  completion_percentage: number;
  tags: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  
  // From view joins
  event_count?: number;
  avg_tension?: number;
  events?: PlotEvent[];
}

export interface PlotStatistics {
  total_threads: number;
  total_events: number;
  avg_completion: number;
  thread_type_counts: Record<string, number>;
}

export interface CreatePlotThreadRequest {
  project_id: string;
  title: string;
  type: PlotThread['type'];
  description?: string;
  color?: string;
  tags?: string[];
}

export interface UpdatePlotThreadRequest {
  title?: string;
  type?: PlotThread['type'];
  description?: string;
  color?: string;
  tension_curve?: number[];
  connected_character_ids?: string[];
  connected_thread_ids?: string[];
  completion_percentage?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CreatePlotEventRequest {
  thread_id: string;
  title: string;
  description?: string;
  chapter_reference?: string;
  tension_level?: number;
  event_type: PlotEvent['event_type'];
  order_index?: number;
}

export interface UpdatePlotEventRequest {
  title?: string;
  description?: string;
  chapter_reference?: string;
  tension_level?: number;
  event_type?: PlotEvent['event_type'];
  order_index?: number;
  metadata?: Record<string, any>;
}

export type PlotViewMode = 'threads' | 'timeline' | 'tension';

export interface PlotPageProps {
  onBack: () => void;
  projectId: string;
}

// Utility types for filtering and sorting
export type PlotThreadFilter = 'all' | PlotThread['type'];

export interface PlotThreadWithEvents extends PlotThread {
  events: PlotEvent[];
}

// Timeline view types
export interface TimelineEvent extends PlotEvent {
  thread_title: string;
  thread_type: PlotThread['type'];
  thread_color: string;
}

// Tension analysis types
export interface TensionPoint {
  x: number;
  y: number;
  threadId: string;
  threadTitle: string;
  color: string;
}

export interface TensionAnalysis {
  overall_tension: number[];
  thread_tensions: Record<string, number[]>;
  peak_moments: {
    thread_id: string;
    thread_title: string;
    peak_tension: number;
    point_index: number;
  }[];
}
