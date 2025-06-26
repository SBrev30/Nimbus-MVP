// =============================================================================
// AI ANALYSIS SERVICE
// File: src/services/aiAnalysisService.ts
// =============================================================================

import { supabase } from '../lib/supabase';
import type { 
  AnalysisRequest, 
  AnalysisResponse, 
  AIUsageStats,
  AIAnalysisProgress,
  BulkAnalysisRequest,
  ImportedItemWithAI 
} from '../types/ai-analysis';

class AIAnalysisService {
  private analysisQueue: Map<string, AIAnalysisProgress> = new Map();
  private readonly RATE_LIMIT_DELAY = 1000; // 1 second between requests
  private lastRequestTime = 0;

  /**
   * Analyze a single content item
   */
  async analyzeContent(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      // Check rate limiting
      await this.enforceRateLimit();
      
      // Check daily usage limit
      const usageStats = await this.getUsageStats();
      if (usageStats.remainingAnalyses <= 0) {
        throw new Error(`Daily analysis limit reached (${usageStats.dailyLimit}). Try again tomorrow.`);
      }

      // Update progress
      this.updateProgress(request.itemId, {
        itemId: request.itemId,
        status: 'analyzing',
        progress: 0,
        startTime: new Date().toISOString()
      });

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('analyze-content', {
        body: request
      });

      if (error) {
        throw new Error(error.message || 'Analysis failed');
      }

      // Update progress to completed
      this.updateProgress(request.itemId, {
        itemId: request.itemId,
        status: 'completed',
        progress: 100,
        startTime: this.analysisQueue.get(request.itemId)?.startTime || new Date().toISOString()
      });

      return data as AnalysisResponse;

    } catch (error) {
      // Update progress to failed
      this.updateProgress(request.itemId, {
        itemId: request.itemId,
        status: 'failed',
        progress: 0,
        startTime: this.analysisQueue.get(request.itemId)?.startTime || new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * Analyze multiple items in sequence
   */
  async analyzeBulk(request: BulkAnalysisRequest): Promise<{
    successful: AnalysisResponse[];
    failed: Array<{ itemId: string; error: string }>;
    progress: AIAnalysisProgress[];
  }> {
    const { itemIds, analysisType = 'full', maxConcurrent = 1 } = request;
    const successful: AnalysisResponse[] = [];
    const failed: Array<{ itemId: string; error: string }> = [];

    // Initialize progress for all items
    itemIds.forEach(itemId => {
      this.updateProgress(itemId, {
        itemId,
        status: 'pending',
        progress: 0,
        startTime: new Date().toISOString()
      });
    });

    // Process items sequentially (to avoid rate limits)
    for (let i = 0; i < itemIds.length; i++) {
      const itemId = itemIds[i];
      
      try {
        // Get item details
        const { data: item } = await supabase
          .from('imported_items')
          .select('*')
          .eq('id', itemId)
          .single();

        if (!item) {
          throw new Error('Item not found');
        }

        // Create analysis request
        const analysisRequest: AnalysisRequest = {
          itemId: item.id,
          content: item.content,
          contentType: item.content_type,
          analysisType
        };

        // Analyze item
        const result = await this.analyzeContent(analysisRequest);
        successful.push(result);

        // Add delay between requests
        if (i < itemIds.length - 1) {
          await this.delay(this.RATE_LIMIT_DELAY);
        }

      } catch (error) {
        failed.push({
          itemId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        this.updateProgress(itemId, {
          itemId,
          status: 'failed',
          progress: 0,
          startTime: this.analysisQueue.get(itemId)?.startTime || new Date().toISOString()
        });
      }
    }

    return {
      successful,
      failed,
      progress: Array.from(this.analysisQueue.values())
    };
  }

  /**
   * Get current usage statistics
   */
  async getUsageStats(): Promise<AIUsageStats> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Get current usage
      const { data: usage } = await supabase
        .from('ai_usage_tracking')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('usage_date', new Date().toISOString().split('T')[0])
        .single();

      const dailyLimit = 10; // Default daily limit
      const dailyUsage = usage?.analysis_count || 0;

      return {
        dailyUsage,
        dailyLimit,
        remainingAnalyses: Math.max(0, dailyLimit - dailyUsage),
        lastAnalysis: usage?.last_analysis_at,
        totalAnalyses: usage?.analysis_count || 0
      };

    } catch (error) {
      // Return default stats if error
      return {
        dailyUsage: 0,
        dailyLimit: 10,
        remainingAnalyses: 10,
        totalAnalyses: 0
      };
    }
  }

  /**
   * Get analysis progress for specific items
   */
  getAnalysisProgress(itemIds?: string[]): AIAnalysisProgress[] {
    if (!itemIds) {
      return Array.from(this.analysisQueue.values());
    }
    
    return itemIds
      .map(id => this.analysisQueue.get(id))
      .filter(Boolean) as AIAnalysisProgress[];
  }

  /**
   * Cancel analysis for specific item
   */
  cancelAnalysis(itemId: string): boolean {
    const progress = this.analysisQueue.get(itemId);
    if (progress && progress.status === 'analyzing') {
      this.updateProgress(itemId, {
        ...progress,
        status: 'failed',
        progress: 0
      });
      return true;
    }
    return false;
  }

  /**
   * Clear completed/failed analyses from queue
   */
  clearCompletedAnalyses(): void {
    for (const [itemId, progress] of this.analysisQueue.entries()) {
      if (progress.status === 'completed' || progress.status === 'failed') {
        this.analysisQueue.delete(itemId);
      }
    }
  }

  /**
   * Retry failed analysis
   */
  async retryAnalysis(itemId: string): Promise<AnalysisResponse> {
    const progress = this.analysisQueue.get(itemId);
    
    if (!progress || progress.status !== 'failed') {
      throw new Error('Cannot retry: analysis not in failed state');
    }

    // Get item details for retry
    const { data: item } = await supabase
      .from('imported_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (!item) {
      throw new Error('Item not found');
    }

    const request: AnalysisRequest = {
      itemId: item.id,
      content: item.content,
      contentType: item.content_type,
      analysisType: 'full'
    };

    return this.analyzeContent(request);
  }

  /**
   * Update item's AI status manually
   */
  async updateAIStatus(
    itemId: string, 
    status: ImportedItemWithAI['ai_status']
  ): Promise<void> {
    const { error } = await supabase
      .from('imported_items')
      .update({ ai_status: status })
      .eq('id', itemId);

    if (error) {
      throw new Error(`Failed to update AI status: ${error.message}`);
    }
  }

  /**
   * Dismiss specific insight from item
   */
  async dismissInsight(itemId: string, insightId: string): Promise<void> {
    try {
      // Get current item
      const { data: item } = await supabase
        .from('imported_items')
        .select('ai_insights')
        .eq('id', itemId)
        .single();

      if (!item) {
        throw new Error('Item not found');
      }

      // Filter out dismissed insight
      const updatedInsights = (item.ai_insights || []).filter(
        (insight: any) => insight.id !== insightId
      );

      // Update item
      const { error } = await supabase
        .from('imported_items')
        .update({ ai_insights: updatedInsights })
        .eq('id', itemId);

      if (error) {
        throw new Error(`Failed to dismiss insight: ${error.message}`);
      }

    } catch (error) {
      throw error;
    }
  }

  // Private helper methods

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      const waitTime = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
      await this.delay(waitTime);
    }
    
    this.lastRequestTime = Date.now();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private updateProgress(itemId: string, progress: AIAnalysisProgress): void {
    this.analysisQueue.set(itemId, progress);
  }

  /**
   * Get analysis history for user
   */
  async getAnalysisHistory(limit = 50): Promise<ImportedItemWithAI[]> {
    const { data, error } = await supabase
      .from('imported_items')
      .select('*')
      .not('ai_status', 'eq', 'unanalyzed')
      .order('last_analyzed', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get analysis history: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get items that need analysis
   */
  async getUnanalyzedItems(): Promise<ImportedItemWithAI[]> {
    const { data, error } = await supabase
      .from('imported_items')
      .select('*')
      .eq('ai_status', 'unanalyzed')
      .order('imported_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get unanalyzed items: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get analysis statistics
   */
  async getAnalysisStatistics(): Promise<{
    totalAnalyzed: number;
    byStatus: Record<string, number>;
    byContentType: Record<string, number>;
    averageInsightsPerItem: number;
  }> {
    const { data, error } = await supabase
      .from('imported_items')
      .select('ai_status, content_type, ai_insights')
      .not('ai_status', 'eq', 'unanalyzed');

    if (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }

    const stats = {
      totalAnalyzed: data.length,
      byStatus: {} as Record<string, number>,
      byContentType: {} as Record<string, number>,
      averageInsightsPerItem: 0
    };

    let totalInsights = 0;

    data.forEach(item => {
      // Count by status
      stats.byStatus[item.ai_status] = (stats.byStatus[item.ai_status] || 0) + 1;
      
      // Count by content type
      stats.byContentType[item.content_type] = (stats.byContentType[item.content_type] || 0) + 1;
      
      // Count insights
      totalInsights += (item.ai_insights || []).length;
    });

    stats.averageInsightsPerItem = data.length > 0 ? totalInsights / data.length : 0;

    return stats;
  }
}

// Export singleton instance
export const aiAnalysisService = new AIAnalysisService();
export default aiAnalysisService;
