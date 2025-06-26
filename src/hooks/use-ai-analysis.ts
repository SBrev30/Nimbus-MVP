import { useState, useCallback, useRef } from 'react';
import { aiAnalysisService } from '../services/ai-analysis-service';
import type { 
  AIInsight, 
  AnalysisRequest, 
  AIAnalysisStatus,
  AnalysisType 
} from '../types/ai-analysis';

interface UseAIAnalysisReturn {
  // State
  isAnalyzing: boolean;
  insights: AIInsight[];
  analysisStatus: Record<string, AIAnalysisStatus>;
  error: string | null;
  
  // Actions
  analyzeContent: (nodeId: string, content: string, type: AnalysisType) => Promise<void>;
  analyzeAllNodes: (nodes: any[]) => Promise<void>;
  dismissInsight: (insightId: string) => Promise<void>;
  retryAnalysis: (nodeId: string) => Promise<void>;
  clearInsights: () => void;
  
  // Getters
  getNodeInsights: (nodeId: string) => AIInsight[];
  getInsightCount: (nodeId: string) => number;
  hasAnalysis: (nodeId: string) => boolean;
}

export function useAIAnalysis(): UseAIAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState<Record<string, AIAnalysisStatus>>({});
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of ongoing analyses to prevent duplicates
  const analysisQueue = useRef<Set<string>>(new Set());

  const updateNodeStatus = useCallback((nodeId: string, status: AIAnalysisStatus) => {
    setAnalysisStatus(prev => ({
      ...prev,
      [nodeId]: status
    }));
  }, []);

  const analyzeContent = useCallback(async (
    nodeId: string, 
    content: string, 
    type: AnalysisType
  ): Promise<void> => {
    // Prevent duplicate analyses
    const queueKey = `${nodeId}-${type}`;
    if (analysisQueue.current.has(queueKey)) {
      return;
    }

    try {
      analysisQueue.current.add(queueKey);
      setIsAnalyzing(true);
      setError(null);
      updateNodeStatus(nodeId, 'analyzing');

      const request: AnalysisRequest = {
        nodeId,
        content,
        type,
        timestamp: new Date()
      };

      const result = await aiAnalysisService.analyzeContent(request);

      if (result.success && result.insights) {
        // Add new insights
        setInsights(prev => {
          // Remove any existing insights for this node/type combination
          const filtered = prev.filter(
            insight => !(insight.nodeId === nodeId && insight.type === type)
          );
          return [...filtered, ...result.insights!];
        });
        
        updateNodeStatus(nodeId, 'completed');
      } else {
        updateNodeStatus(nodeId, 'error');
        setError(result.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      updateNodeStatus(nodeId, 'error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      analysisQueue.current.delete(queueKey);
      setIsAnalyzing(false);
    }
  }, [updateNodeStatus]);

  const analyzeAllNodes = useCallback(async (nodes: any[]): Promise<void> => {
    if (nodes.length === 0) return;

    setIsAnalyzing(true);
    setError(null);

    // Mark all nodes as pending
    nodes.forEach(node => {
      updateNodeStatus(node.id, 'pending');
    });

    try {
      // Process nodes in batches to avoid overwhelming the API
      const batchSize = 3;
      const batches = [];
      
      for (let i = 0; i < nodes.length; i += batchSize) {
        batches.push(nodes.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const promises = batch.map(async (node) => {
          try {
            // Determine analysis type based on node type or content
            const analysisType: AnalysisType = getAnalysisTypeForNode(node);
            const content = extractContentFromNode(node);
            
            if (content.trim()) {
              await analyzeContent(node.id, content, analysisType);
            } else {
              updateNodeStatus(node.id, 'skipped');
            }
          } catch (err) {
            console.error(`Failed to analyze node ${node.id}:`, err);
            updateNodeStatus(node.id, 'error');
          }
        });

        await Promise.allSettled(promises);
        
        // Small delay between batches
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (err) {
      console.error('Batch analysis error:', err);
      setError(err instanceof Error ? err.message : 'Batch analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzeContent, updateNodeStatus]);

  const dismissInsight = useCallback(async (insightId: string): Promise<void> => {
    try {
      await aiAnalysisService.dismissInsight(insightId);
      setInsights(prev => prev.filter(insight => insight.id !== insightId));
    } catch (err) {
      console.error('Failed to dismiss insight:', err);
      setError(err instanceof Error ? err.message : 'Failed to dismiss insight');
    }
  }, []);

  const retryAnalysis = useCallback(async (nodeId: string): Promise<void> => {
    // Find the last analysis request for this node
    const nodeInsights = insights.filter(insight => insight.nodeId === nodeId);
    if (nodeInsights.length === 0) return;

    const lastInsight = nodeInsights[nodeInsights.length - 1];
    const content = lastInsight.originalContent || '';
    
    // Clear existing insights for this node
    setInsights(prev => prev.filter(insight => insight.nodeId !== nodeId));
    
    // Retry the analysis
    await analyzeContent(nodeId, content, lastInsight.type);
  }, [insights, analyzeContent]);

  const clearInsights = useCallback(() => {
    setInsights([]);
    setAnalysisStatus({});
    setError(null);
  }, []);

  const getNodeInsights = useCallback((nodeId: string): AIInsight[] => {
    return insights.filter(insight => insight.nodeId === nodeId);
  }, [insights]);

  const getInsightCount = useCallback((nodeId: string): number => {
    return insights.filter(insight => insight.nodeId === nodeId).length;
  }, [insights]);

  const hasAnalysis = useCallback((nodeId: string): boolean => {
    return nodeId in analysisStatus;
  }, [analysisStatus]);

  return {
    // State
    isAnalyzing,
    insights,
    analysisStatus,
    error,
    
    // Actions
    analyzeContent,
    analyzeAllNodes,
    dismissInsight,
    retryAnalysis,
    clearInsights,
    
    // Getters
    getNodeInsights,
    getInsightCount,
    hasAnalysis
  };
}

// Helper functions
function getAnalysisTypeForNode(node: any): AnalysisType {
  // Determine analysis type based on node type or data
  if (node.type === 'character' || node.data?.type === 'Character') {
    return 'character';
  }
  if (node.type === 'plot' || node.data?.type === 'Plot') {
    return 'plot';
  }
  if (node.type === 'research' || node.data?.type === 'Research') {
    return 'research';
  }
  if (node.type === 'imported' && node.data?.contentType) {
    // Map imported content types to analysis types
    switch (node.data.contentType.toLowerCase()) {
      case 'character': return 'character';
      case 'plot': return 'plot';
      case 'research': return 'research';
      case 'chapter': return 'chapter';
      default: return 'general';
    }
  }
  
  // Default analysis type
  return 'general';
}

function extractContentFromNode(node: any): string {
  // Extract text content from various node structures
  if (node.data?.content) {
    if (typeof node.data.content === 'string') {
      return node.data.content;
    }
    if (typeof node.data.content === 'object') {
      // Handle rich text or structured content
      return JSON.stringify(node.data.content);
    }
  }
  
  if (node.data?.title) {
    return node.data.title;
  }
  
  if (node.data?.text) {
    return node.data.text;
  }
  
  if (node.data?.description) {
    return node.data.description;
  }
  
  // For imported nodes
  if (node.data?.originalContent) {
    return node.data.originalContent;
  }
  
  return '';
}
