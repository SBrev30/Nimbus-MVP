// Master Canvas Types and Interfaces

export type CanvasMode = 'master' | 'exploratory';

export interface ConflictData {
  id: string;
  type: 'character' | 'timeline' | 'logic' | 'motivation';
  severity: 'high' | 'medium' | 'low';
  description: string;
  suggestedFix?: string;
  confidence: number; // AI confidence 0-1
  chapterId?: string;
  characterId?: string;
  userDismissed?: boolean;
  userFeedback?: string;
}

export interface ChapterNodeData {
  chapterNumber: number;
  title: string;
  summary: string;
  wordCount: number;
  mainCharacters: string[];
  plotEvents: PlotEvent[];
  conflicts: ConflictData[];
  significance: 'high' | 'medium' | 'low';
  status: 'outline' | 'draft' | 'revision' | 'final';
}

export interface PlotEvent {
  id: string;
  description: string;
  type: 'inciting_incident' | 'rising_action' | 'climax' | 'falling_action' | 'resolution';
  order: number;
}

export interface ProjectCanvasData {
  projectId: string;
  chapters: ChapterData[];
  characters: CharacterData[];
  outline?: OutlineData;
  lastModified: Date;
}

export interface ChapterData {
  id: string;
  number: number;
  title: string;
  content: string;
  wordCount: number;
  summary: string;
  characters: string[];
  scenes: SceneData[];
  plotEvents: PlotEvent[];
  status: 'outline' | 'draft' | 'revision' | 'final';
}

export interface CharacterData {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description: string;
  relationships: CharacterRelationship[];
  appearances: string[]; // Chapter IDs where character appears
}

export interface CharacterRelationship {
  characterId: string;
  type: 'friend' | 'enemy' | 'family' | 'romantic' | 'mentor' | 'rival';
  strength: number; // 1-10
  description: string;
}

export interface SceneData {
  id: string;
  title: string;
  summary: string;
  characters: string[];
  location?: string;
  order: number;
}

export interface OutlineData {
  structure: 'three_act' | 'heros_journey' | 'five_act' | 'custom';
  acts: ActData[];
}

export interface ActData {
  id: string;
  title: string;
  description: string;
  chapters: string[];
  plotPoints: PlotEvent[];
}

export interface AnalysisResults {
  conflicts: ConflictData[];
  overallScore: number; // 0-100
  recommendations: Recommendation[];
  characterArcs: CharacterArcAnalysis[];
  plotStructure: PlotStructureAnalysis;
}

export interface Recommendation {
  id: string;
  type: 'character' | 'plot' | 'structure' | 'pacing';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestedAction: string;
}

export interface CharacterArcAnalysis {
  characterId: string;
  arcType: 'positive' | 'negative' | 'flat';
  completeness: number; // 0-100
  keyMoments: ArcMoment[];
  issues: string[];
}

export interface ArcMoment {
  chapterId: string;
  type: 'introduction' | 'inciting_incident' | 'development' | 'crisis' | 'transformation' | 'resolution';
  description: string;
}

export interface PlotStructureAnalysis {
  structure: string;
  pacing: PacingAnalysis;
  plotHoles: PlotHole[];
  tensionCurve: TensionPoint[];
}

export interface PacingAnalysis {
  overallPace: 'too_slow' | 'appropriate' | 'too_fast';
  issues: PacingIssue[];
}

export interface PacingIssue {
  chapterId: string;
  type: 'slow_start' | 'rushed_middle' | 'anticlimactic_end' | 'pacing_inconsistency';
  description: string;
  suggestion: string;
}

export interface PlotHole {
  id: string;
  type: 'logical_inconsistency' | 'character_motivation' | 'timeline_error' | 'unresolved_thread';
  description: string;
  chaptersInvolved: string[];
  severity: 'high' | 'medium' | 'low';
  suggestedFix: string;
}

export interface TensionPoint {
  chapterId: string;
  tensionLevel: number; // 0-100
  events: string[];
}

export interface CanvasSession {
  id: string;
  userId: string;
  projectId: string;
  canvasType: CanvasMode;
  canvasData: any; // React Flow data
  createdAt: Date;
  updatedAt: Date;
  lastAccessed: Date;
}

export interface ProjectCanvasSnapshot {
  id: string;
  projectId: string;
  canvasData: any;
  analysisResults?: AnalysisResults;
  dataHash: string;
  createdAt: Date;
  expiresAt: Date;
}

// Canvas Generation Types
export interface CanvasGenerationResult {
  success: boolean;
  canvasData?: any;
  analysisResults?: AnalysisResults;
  error?: string;
  suggestion?: string;
  fallback?: any;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface CanvasLayoutOptions {
  algorithm: 'hierarchical' | 'force_directed' | 'timeline' | 'circular';
  spacing: number;
  direction: 'horizontal' | 'vertical';
  grouping: 'by_type' | 'by_chapter' | 'by_relationship';
}

export interface MasterCanvasContextData {
  projectData: ProjectCanvasData | null;
  analysisResults: AnalysisResults | null;
  isLoading: boolean;
  currentProject: string | null;
  canvasMode: CanvasMode;
  generateCanvas: (projectId: string, options?: CanvasLayoutOptions) => Promise<void>;
  switchMode: (mode: CanvasMode) => void;
  dismissConflict: (conflictId: string, feedback?: string) => Promise<void>;
  refreshAnalysis: () => Promise<void>;
}

// API Response Types
export interface MasterCanvasAPIResponse {
  canvasData: any;
  analysisResults: AnalysisResults;
  cacheKey: string;
}

export interface ConflictSummary {
  totalConflicts: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  recentlyAdded: ConflictData[];
  dismissed: number;
}

// Export all for convenience
export type {
  CanvasMode,
  ConflictData,
  ChapterNodeData,
  PlotEvent,
  ProjectCanvasData,
  ChapterData,
  CharacterData,
  CharacterRelationship,
  SceneData,
  OutlineData,
  ActData,
  AnalysisResults,
  Recommendation,
  CharacterArcAnalysis,
  ArcMoment,
  PlotStructureAnalysis,
  PacingAnalysis,
  PacingIssue,
  PlotHole,
  TensionPoint,
  CanvasSession,
  ProjectCanvasSnapshot,
  CanvasGenerationResult,
  NodePosition,
  CanvasLayoutOptions,
  MasterCanvasContextData,
  MasterCanvasAPIResponse,
  ConflictSummary
};
