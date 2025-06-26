// src/types/ai-analysis.ts

export interface AIInsight {
  summary: string;
  keyPoints: string[];
  themes: string[];
  conflicts?: string[];
  characters?: string[];
  actionItems?: string[];
  completeness?: {
    score: number;
    missingElements: string[];
    suggestions: string[];
  };
  connections?: {
    relatedTo: string[];
    contradictions: string[];
  };
  metadata: {
    analyzedAt: string;
    tokensUsed: number;
    confidence: number;
    version: string;
  };
}

export interface AnalysisRequest {
  itemId: string;
  forceReanalysis?: boolean;
}

export interface AnalysisResponse {
  success: boolean;
  insights?: AIInsight;
  error?: string;
  rateLimitInfo?: RateLimitInfo;
  cached?: boolean;
}

export interface RateLimitInfo {
  allowed: boolean;
  hourly_count: number;
  hourly_limit: number;
  daily_count: number;
  daily_limit: number;
  reset_time: string;
}

export interface AIUsageTracking {
  id: string;
  user_id: string;
  analysis_type: 'content_analysis' | 'character_analysis' | 'plot_analysis' | 'research_analysis';
  item_id?: string;
  tokens_used: number;
  cost_credits: number;
  request_timestamp: string;
  response_time_ms?: number;
  success: boolean;
  error_message?: string;
  rate_limit_window: string;
  created_at: string;
}

// Update existing ImportedItem interface
export interface ImportedItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  content_type: 'character' | 'plot' | 'research' | 'chapter';
  word_count: number;
  imported_from?: string;
  created_at: string;
  updated_at: string;
  // New AI analysis fields
  ai_insights?: AIInsight;
  ai_status?: 'pending' | 'analyzing' | 'completed' | 'failed';
  last_analyzed?: string;
}

export type AnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed';
export type ContentType = 'character' | 'plot' | 'research' | 'chapter';
export type AnalysisType = 'content_analysis' | 'character_analysis' | 'plot_analysis' | 'research_analysis';

// Error types
export class AnalysisError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AnalysisError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string, public rateLimitInfo: RateLimitInfo) {
    super(message);
    this.name = 'RateLimitError';
  }
}
