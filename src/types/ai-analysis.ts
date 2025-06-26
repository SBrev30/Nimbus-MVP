// src/types/ai-analysis.ts

export interface AIInsight {
  type: string;
  summary: string;
  suggestions: string[];
  confidence: number;
  details?: Record<string, any>;
}

export interface AnalysisRequest {
  content: string;
  contentType: 'character' | 'plot' | 'research' | 'chapter';
  itemId: string;
}

export interface AnalysisResponse {
  success: boolean;
  insights?: AIInsight[];
  error?: string;
}

export type AIStatus = 'pending' | 'analyzing' | 'completed' | 'failed';

// Extend existing ImportedItem type
export interface ImportedItemWithAI {
  id: string;
  title: string;
  content: string;
  content_type: 'character' | 'plot' | 'research' | 'chapter';
  tags: string[];
  word_count: number;
  created_at: string;
  user_id: string;
  // AI fields
  ai_insights?: AIInsight[];
  ai_status: AIStatus;
  last_analyzed?: string;
}

export interface AIUsageRecord {
  id: string;
  user_id: string;
  analysis_type: string;
  tokens_used: number;
  item_id: string;
  created_at: string;
}
    super(message);
    this.name = 'RateLimitError';
  }
}
