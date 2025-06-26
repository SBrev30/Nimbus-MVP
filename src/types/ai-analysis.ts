export interface AIInsight {
  id: string;
  type: 'conflict' | 'suggestion' | 'question' | 'improvement';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestion?: string;
  guidingQuestions?: string[];
  relatedNodes?: string[];
  confidence: number; // 0-100
  createdAt: string;
  category?: 'character' | 'plot' | 'worldbuilding' | 'consistency' | 'development';
}

export interface AnalysisRequest {
  itemId: string;
  content: string;
  contentType: 'character' | 'plot' | 'research' | 'chapter';
  analysisType?: 'full' | 'conflict_only' | 'suggestions_only';
  context?: {
    projectContent?: string;
    relatedItems?: string[];
  };
}

export interface AnalysisResponse {
  success: boolean;
  insights: AIInsight[];
  status: AIAnalysisStatus;
  processingTime: number;
  error?: string;
  usage: {
    tokensUsed: number;
    cost: number;
  };
}

export type AIAnalysisStatus = 
  | 'unanalyzed' 
  | 'analyzing' 
  | 'good' 
  | 'needs_attention' 
  | 'conflicts' 
  | 'error';

export interface AIAnalysisProgress {
  itemId: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  progress: number; // 0-100
  startTime: string;
  estimatedCompletion?: string;
}

export interface AIUsageStats {
  dailyUsage: number;
  dailyLimit: number;
  remainingAnalyses: number;
  lastAnalysis?: string;
  totalAnalyses: number;
}

export interface ContentAnalysisPrompt {
  contentType: 'character' | 'plot' | 'research' | 'chapter';
  prompt: string;
  maxTokens: number;
  temperature: number;
}

// Enhanced ImportedItem type with AI fields
export interface ImportedItemWithAI {
  id: string;
  title: string;
  content: string;
  content_type: 'character' | 'plot' | 'research' | 'chapter';
  word_count: number;
  tags: string[];
  source_file_name: string;
  imported_at: string;
  user_id: string;
  
  // AI Analysis fields
  ai_insights: AIInsight[];
  ai_status: AIAnalysisStatus;
  last_analyzed?: string;
  analysis_count: number;
}

// Canvas node data with AI information
export interface AIEnhancedNodeData {
  label: string;
  content: string;
  contentType: 'character' | 'plot' | 'research' | 'chapter';
  wordCount: number;
  importedItemId: string;
  
  // AI fields
  aiStatus: AIAnalysisStatus;
  aiInsights: AIInsight[];
  lastAnalyzed?: string;
  isAnalyzing?: boolean;
}

// Analysis configuration
export interface AnalysisConfig {
  enableAutoAnalysis: boolean;
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  focusAreas: {
    conflicts: boolean;
    suggestions: boolean;
    questions: boolean;
    improvements: boolean;
  };
  dailyLimit: number;
}

// Analysis queue item
export interface AnalysisQueueItem {
  id: string;
  itemId: string;
  priority: 'low' | 'normal' | 'high';
  addedAt: string;
  estimatedDuration: number; // seconds
  retryCount: number;
}

// Bulk analysis request
export interface BulkAnalysisRequest {
  itemIds: string[];
  analysisType?: 'full' | 'conflict_only' | 'suggestions_only';
  priority?: 'low' | 'normal' | 'high';
  maxConcurrent?: number;
}

// Analysis statistics
export interface AnalysisStats {
  totalAnalyses: number;
  averageProcessingTime: number;
  successRate: number;
  insightsByType: Record<AIInsight['type'], number>;
  insightsBySeverity: Record<AIInsight['severity'], number>;
  mostCommonIssues: Array<{
    category: string;
    count: number;
    examples: string[];
  }>;
}

export default {
  AIInsight,
  AnalysisRequest,
  AnalysisResponse,
  AIAnalysisStatus,
  AIAnalysisProgress,
  AIUsageStats,
  ContentAnalysisPrompt,
  ImportedItemWithAI,
  AIEnhancedNodeData,
  AnalysisConfig,
  AnalysisQueueItem,
  BulkAnalysisRequest,
  AnalysisStats
};
