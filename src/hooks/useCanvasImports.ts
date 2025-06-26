import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AIAnalysisService, AnalysisError, RateLimitError } from '../services/ai-analysis-service';
import type { 
  ImportedItem, 
  AnalysisResponse, 
  RateLimitInfo 
} from '../types/ai-analysis';

interface CanvasImportsState {
  importedNodes: any[];
  isLoading: boolean;
  error: string | null;
  isAnalyzing: boolean;
  analysisProgress: { completed: number; total: number } | null;
  rateLimitInfo: RateLimitInfo | null;
}

interface UseCanvasImportsReturn extends CanvasImportsState {
  // Data management
  refreshImports: () => Promise<void>;
  addToCanvas: (itemId: string, position?: { x: number; y: number }) => Promise<void>;
  removeFromCanvas: (itemId: string) => Promise<void>;
  updateNodePosition: (itemId: string, position: { x: number; y: number }) => Promise<void>;
  
  // AI Analysis functions
  analyzeNode: (itemId: string, forceReanalysis?: boolean) => Promise<AnalysisResponse>;
  analyzeAllNodes: (forceReanalysis?: boolean) => Promise<AnalysisResponse[]>;
  analyzeSelectedNodes: (itemIds: string[], forceReanalysis?: boolean) => Promise<AnalysisResponse[]>;
  
  // AI Status management
  updateNodeAIStatus: (itemId: string, status: 'pending' | 'analyzing' | 'completed' | 'failed') => Promise<void>;
  clearNodeAIInsights: (itemId: string) => Promise<void>;
  checkRateLimit: () => Promise<RateLimitInfo>;
  
  // Utility functions
  getNodesByAnalysisStatus: (status: 'pending' | 'analyzing' | 'completed' | 'failed') => any[];
  getNodesNeedingAnalysis: () => any[];
  dismissError: () => void;
}

export function useCanvasImports(): UseCanvasImportsReturn {
  const [state, setState] = useState<CanvasImportsState>({
    importedNodes: [],
    isLoading: false,
    error: null,
    isAnalyzing: false,
    analysisProgress: null,
    rateLimitInfo: null
  });

  // Load imported items and canvas positions
  const refreshImports = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Load imported items with their canvas positions
      const { data: canvasItems, error: canvasError } = await supabase
        .from('canvas_items')
        .select(`
          *,
          imported_items (
            id,
            title,
            content,
            content_type,
            word_count,
            ai_insights,
            ai_status,
            last_analyzed,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (canvasError) throw canvasError;

      // Transform to node format
      const nodes = (canvasItems || []).map(canvasItem => ({
        id: `imported-${canvasItem.item_id}`,
        type: 'imported',
        position: { 
          x: canvasItem.position_x, 
          y: canvasItem.position_y 
        },
        data: {
          ...canvasItem.imported_items,
          canvasItemId: canvasItem.id,
          // AI analysis data
          hasAIInsights: !!canvasItem.imported_items?.ai_insights,
          aiStatus: canvasItem.imported_items?.ai_status || 'pending',
          lastAnalyzed: canvasItem.imported_items?.last_analyzed,
          insights: canvasItem.imported_items?.ai_insights ? 
            AIAnalysisService.formatInsightsForDisplay(canvasItem.imported_items.ai_insights) : 
            null
        }
      }));

      setState(prev => ({ 
        ...prev, 
        importedNodes: nodes, 
        isLoading: false 
      }));

    } catch (error) {
      console.error('Error loading canvas imports:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load imports',
        isLoading: false 
      }));
    }
  }, []);

  // Add item to canvas
  const addToCanvas = useCallback(async (
    itemId: string, 
    position: { x: number; y: number } = { x: 100, y: 100 }
  ) => {
    try {
      const { error } = await supabase
        .from('canvas_items')
        .insert({
          item_id: itemId,
          position_x: position.x,
          position_y: position.y
        });

      if (error) throw error;
      await refreshImports();

    } catch (error) {
      console.error('Error adding to canvas:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to add to canvas'
      }));
    }
  }, [refreshImports]);

  // Remove item from canvas
  const removeFromCanvas = useCallback(async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('canvas_items')
        .delete()
        .eq('item_id', itemId);

      if (error) throw error;
      await refreshImports();

    } catch (error) {
      console.error('Error removing from canvas:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to remove from canvas'
      }));
    }
  }, [refreshImports]);

  // Update node position
  const updateNodePosition = useCallback(async (
    itemId: string, 
    position: { x: number; y: number }
  ) => {
    try {
      const { error } = await supabase
        .from('canvas_items')
        .update({
          position_x: position.x,
          position_y: position.y,
          updated_at: new Date().toISOString()
        })
        .eq('item_id', itemId);

      if (error) throw error;

      // Update local state immediately for better UX
      setState(prev => ({
        ...prev,
        importedNodes: prev.importedNodes.map(node =>
          node.data.id === itemId
            ? { ...node, position }
            : node
        )
      }));

    } catch (error) {
      console.error('Error updating position:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update position'
      }));
    }
  }, []);

  // Analyze single node
  const analyzeNode = useCallback(async (
    itemId: string, 
    forceReanalysis: boolean = false
  ): Promise<AnalysisResponse> => {
    setState(prev => ({ ...prev, error: null }));

    try {
      // Update status to analyzing
      await updateNodeAIStatus(itemId, 'analyzing');
      
      const response = await AIAnalysisService.analyzeItem(itemId, forceReanalysis);
      
      if (response.success) {
        await refreshImports(); // Refresh to get updated insights
      } else {
        await updateNodeAIStatus(itemId, 'failed');
        setState(prev => ({ 
          ...prev, 
          error: response.error || 'Analysis failed'
        }));
      }

      return response;

    } catch (error) {
      await updateNodeAIStatus(itemId, 'failed');
      
      if (error instanceof RateLimitError) {
        setState(prev => ({ 
          ...prev, 
          error: error.message,
          rateLimitInfo: error.rateLimitInfo
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Analysis failed'
        }));
      }

      return { success: false, error: error instanceof Error ? error.message : 'Analysis failed' };
    }
  }, [refreshImports]);

  // Analyze all nodes
  const analyzeAllNodes = useCallback(async (
    forceReanalysis: boolean = false
  ): Promise<AnalysisResponse[]> => {
    const itemIds = state.importedNodes.map(node => node.data.id);
    return analyzeSelectedNodes(itemIds, forceReanalysis);
  }, [state.importedNodes]);

  // Analyze selected nodes with batch processing
  const analyzeSelectedNodes = useCallback(async (
    itemIds: string[], 
    forceReanalysis: boolean = false
  ): Promise<AnalysisResponse[]> => {
    if (itemIds.length === 0) return [];

    setState(prev => ({ 
      ...prev, 
      isAnalyzing: true, 
      analysisProgress: { completed: 0, total: itemIds.length },
      error: null 
    }));

    try {
      // Check rate limit first
      const rateLimitInfo = await AIAnalysisService.checkRateLimit();
      setState(prev => ({ ...prev, rateLimitInfo }));

      if (!rateLimitInfo.allowed) {
        throw new RateLimitError(
          `Rate limit exceeded. You can make ${rateLimitInfo.hourly_limit - rateLimitInfo.hourly_count} more requests this hour.`,
          rateLimitInfo
        );
      }

      const results = await AIAnalysisService.analyzeItemsBatch(
        itemIds,
        forceReanalysis,
        (completed, total) => {
          setState(prev => ({ 
            ...prev, 
            analysisProgress: { completed, total }
          }));
        }
      );

      await refreshImports(); // Refresh to get all updated insights
      return results;

    } catch (error) {
      console.error('Batch analysis failed:', error);
      
      if (error instanceof RateLimitError) {
        setState(prev => ({ 
          ...prev, 
          error: error.message,
          rateLimitInfo: error.rateLimitInfo
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Batch analysis failed'
        }));
      }

      return [];

    } finally {
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        analysisProgress: null 
      }));
    }
  }, [refreshImports]);

  // Update AI status
  const updateNodeAIStatus = useCallback(async (
    itemId: string, 
    status: 'pending' | 'analyzing' | 'completed' | 'failed'
  ) => {
    try {
      await AIAnalysisService.updateAIStatus(itemId, status);
      
      // Update local state immediately
      setState(prev => ({
        ...prev,
        importedNodes: prev.importedNodes.map(node =>
          node.data.id === itemId
            ? { ...node, data: { ...node.data, aiStatus: status } }
            : node
        )
      }));

    } catch (error) {
      console.error('Error updating AI status:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update AI status'
      }));
    }
  }, []);

  // Clear AI insights
  const clearNodeAIInsights = useCallback(async (itemId: string) => {
    try {
      await AIAnalysisService.clearAIInsights(itemId);
      await refreshImports();

    } catch (error) {
      console.error('Error clearing AI insights:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to clear AI insights'
      }));
    }
  }, [refreshImports]);

  // Check rate limit
  const checkRateLimit = useCallback(async (): Promise<RateLimitInfo> => {
    try {
      const rateLimitInfo = await AIAnalysisService.checkRateLimit();
      setState(prev => ({ ...prev, rateLimitInfo }));
      return rateLimitInfo;

    } catch (error) {
      console.error('Error checking rate limit:', error);
      const fallbackInfo: RateLimitInfo = {
        allowed: false,
        hourly_count: 10,
        hourly_limit: 10,
        daily_count: 50,
        daily_limit: 50,
        reset_time: new Date(Date.now() + 3600000).toISOString()
      };
      setState(prev => ({ ...prev, rateLimitInfo: fallbackInfo }));
      return fallbackInfo;
    }
  }, []);

  // Utility functions
  const getNodesByAnalysisStatus = useCallback((
    status: 'pending' | 'analyzing' | 'completed' | 'failed'
  ) => {
    return state.importedNodes.filter(node => node.data.aiStatus === status);
  }, [state.importedNodes]);

  const getNodesNeedingAnalysis = useCallback(() => {
    return state.importedNodes.filter(node => 
      !node.data.aiStatus || 
      node.data.aiStatus === 'pending' || 
      node.data.aiStatus === 'failed'
    );
  }, [state.importedNodes]);

  const dismissError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load data on mount
  useEffect(() => {
    refreshImports();
  }, [refreshImports]);

  // Check rate limit periodically
  useEffect(() => {
    const interval = setInterval(checkRateLimit, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [checkRateLimit]);

  return {
    ...state,
    refreshImports,
    addToCanvas,
    removeFromCanvas,
    updateNodePosition,
    analyzeNode,
    analyzeAllNodes,
    analyzeSelectedNodes,
    updateNodeAIStatus,
    clearNodeAIInsights,
    checkRateLimit,
    getNodesByAnalysisStatus,
    getNodesNeedingAnalysis,
    dismissError
  };
}
