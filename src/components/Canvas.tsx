import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  Node,
  Edge,
  Connection,
  NodeTypes,
  Position,
  Handle,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import './Canvas.css';

// Import contexts and hooks
import { useAuth } from '../contexts/AuthContext';
import { useCanvasPlanningData } from '../hooks/useCanvasPlanningData';
import { useUnifiedAutoSave } from '../hooks/useUnifiedAutoSave';

// Import AI components and services
import { AIAnalysisPanel } from './canvas/AIAnalysisPanel';
import { intelligentAIService } from '../services/intelligentAIService';

// Import enhanced components
import { EnhancedCanvasToolbar } from './canvas/toolbar/EnhancedCanvasToolbar';
import { CharacterPopup } from './canvas/CharacterPopup';

// Import node types from index file - these should include enhanced versions
import {
  CharacterNode,
  PlotNode,
  LocationNode,
  ThemeNode,
  ConflictNode,
  TimelineNode,
  ResearchNode,
  enhancedNodeTypes,
  createNodeData,
  nodeColors
} from './canvas/nodes';

// Import types
import { 
  CharacterNodeData, 
  PlotNodeData, 
  LocationNodeData,
  ThemeNodeData,
  ConflictNodeData,
  ResearchNodeData,
  TimelineNodeData,
  CanvasState 
} from './canvas/types';

// Direct imports for templates and samples
import { templates } from '../data/templates';
import { sampleStories } from '../data/sampleStories';

// Icons
import { ArrowLeft } from 'lucide-react';

// Define AIAnalysisResult interface
interface AIAnalysisResult {
  type: 'conflict' | 'suggestion' | 'question' | 'error';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  nodeId?: string;
}

// Enhanced TypeScript interfaces
interface NodeProps<T = any> {
  data: T;
  onDataChange: (newData: Partial<T>) => void;
}

interface CanvasProps {
  projectId?: string;
  onBack?: () => void;
}

// Main Canvas Flow Component
const CanvasFlow: React.FC<CanvasProps> = ({ projectId, onBack }) => {
  const { user } = useAuth();
   
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'pending'>('synced');
  const [canvasMode, setCanvasMode] = useState('explore');
  
  const [aiAnalysisResults, setAiAnalysisResults] = useState<AIAnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  
  const userId = user?.id || null;
  
  // Add planning data hook for debugging
  const planningData = useCanvasPlanningData();
  
  const reactFlowInstance = useReactFlow();
  const viewport = reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 };
  
  const canvasState: CanvasState = useMemo(() => ({
    nodes,
    edges,
    viewport,
    lastModified: Date.now()
  }), [nodes, edges, viewport]);

  const {
    lastSaved,
    isSaving,
    saveError,
    forceSave,
    loadData,
    isOnline
  } = useUnifiedAutoSave(canvasState, userId, {
    localKey: `enhanced-canvas-${userId}-${projectId || 'default'}`,
    delay: 2000,
    enableCloud: !!user,
    onSaveSuccess: (data) => {
      console.log('Canvas auto-saved successfully');
    },
    onSaveError: (error) => {
      console.error('Canvas auto-save failed:', error);
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  useEffect(() => {
    setHasChanges(true);
    if (nodes.length === 0 && edges.length === 0) {
      setHasChanges(false);
    }
  }, [nodes, edges]);

  // Debug planning data
  useEffect(() => {
    console.log('Canvas: Planning data updated:', {
      characters: planningData.planningCharacters.length,
      loading: planningData.loading,
      error: planningData.error
    });
  }, [planningData.planningCharacters, planningData.loading, planningData.error]);

  useEffect(() => {
    const loadCanvasData = async () => {
      try {
        const savedData = await loadData();
        if (savedData?.nodes && savedData?.edges) {
          setNodes(savedData.nodes);
          setEdges(savedData.edges);
          setHasChanges(false);
        }
      } catch (error) {
        console.error('Failed to load canvas data:', error);
      }
    };

    loadCanvasData();
  }, [loadData, setNodes, setEdges]);

  const handleNodeDataChange = useCallback((nodeId: string, newData: any) => {
    console.log('🔄 Node data change for:', nodeId, newData);
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, [setNodes]);

  // Fixed node types registration - ensure enhanced nodes with proper data change handlers
  const nodeTypes: NodeTypes = useMemo(() => {
    console.log('🎨 Registering node types with enhanced handlers');
    
    const enhancedTypes: NodeTypes = {};
    
    // Always use the enhanced character node with planning integration
    enhancedTypes.character = (props: any) => {
      console.log('🎭 Rendering CharacterNode with props:', props.id);
      return (
        <CharacterNode
          {...props}
          onDataChange={(newData: any) => {
            console.log('📝 CharacterNode data change:', props.id, newData);
            handleNodeDataChange(props.id, newData);
          }}
        />
      );
    };
    
    // Add other node types with proper handlers
    enhancedTypes.plot = (props: any) => (
      <PlotNode
        {...props}
        onDataChange={(newData: any) => handleNodeDataChange(props.id, newData)}
      />
    );
    
    enhancedTypes.location = (props: any) => (
      <LocationNode
        {...props}
        onDataChange={(newData: any) => handleNodeDataChange(props.id, newData)}
      />
    );
    
    enhancedTypes.theme = ThemeNode;
    enhancedTypes.conflict = ConflictNode;
    enhancedTypes.timeline = TimelineNode;
    enhancedTypes.research = ResearchNode;
    
    return enhancedTypes;
  }, [handleNodeDataChange]);

  const createNode = useCallback((type: string) => {
    if (!reactFlowInstance) return;
    
    const id = uuidv4();
    const position = reactFlowInstance.project({ x: 250, y: 250 });
    
    const newNode: Node = {
      id,
      type,
      position,
      data: createNodeData(type)
    };
    
    console.log('🆕 Creating new node:', type, id);
    setNodes((nds) => [...nds, newNode]);
  }, [reactFlowInstance, setNodes]);

  const handleAIAnalysis = useCallback(async () => {
    if (!nodes.length) return;
    
    setIsAnalyzing(true);
    setShowAIPanel(true);
    
    try {
      const results: AIAnalysisResult[] = [];
      
      const characterNodes = nodes.filter(n => n.type === 'character');
      if (characterNodes.length > 0) {
        for (const node of characterNodes) {
          try {
            const result = await intelligentAIService.analyzeCharacterNode(node.data);
            results.push(result);
          } catch (error) {
            console.error('Character analysis failed:', error);
            results.push({
              type: 'error',
              title: `Failed to analyze ${node.data.name || 'character'}`,
              description: 'An error occurred during AI analysis. Please try again.',
              severity: 'high',
              nodeId: node.id
            });
          }
        }
      }
      
      if (nodes.length > 3) {
        try {
          const coherenceResult = await intelligentAIService.analyzeStoryCoherence(nodes, edges);
          results.push(coherenceResult);
        } catch (error) {
          console.error('Story coherence analysis failed:', error);
        }
      }
      
      if (characterNodes.length > 1) {
        try {
          const relationshipResult = await intelligentAIService.suggestRelationships(characterNodes);
          results.push(relationshipResult);
        } catch (error) {
          console.error('Relationship analysis failed:', error);
        }
      }
      
      setAiAnalysisResults(results);
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [nodes, edges]);

  const handleSync = useCallback(async () => {
    console.log('🔄 Starting canvas sync...');
    setSyncStatus('syncing');
    
    try {
      await planningData.refresh();
      
      const updatedNodes = await Promise.all(
        nodes.map(async (node) => {
          if (node.data.fromPlanning && node.data.planningId) {
            if (node.type === 'character') {
              const updatedChar = planningData.planningCharacters.find(
                c => c.id === node.data.planningId
              );
              if (updatedChar) {
                console.log('🔄 Syncing character node:', node.id, 'with planning data:', updatedChar.name);
                return {
                  ...node,
                  data: {
                    ...node.data,
                    name: updatedChar.name,
                    role: updatedChar.role,
                    description: updatedChar.description,
                    completeness_score: updatedChar.completeness_score
                  }
                };
              }
            }
          }
          return node;
        })
      );
      
      setNodes(updatedNodes);
      await forceSave();
      
      setSyncStatus('synced');
      setLastSynced(new Date());
      setHasChanges(false);
      console.log('✅ Canvas sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
      setSyncStatus('error');
    }
  }, [planningData, nodes, forceSave, setNodes]);

  const loadTemplate = useCallback((templateId: string) => {
    try {
      const template = templates[templateId as keyof typeof templates];
      
      if (!template) {
        console.error(`Template "${templateId}" not found`);
        return;
      }

      setNodes([]);
      setEdges([]);
      
      const nodeIdMap = new Map<string, string>();
      
      const newNodes = template.nodes.map((node: any) => {
        const newId = uuidv4();
        nodeIdMap.set(node.id, newId);
        
        return {
          ...node,
          id: newId
        };
      });
      
      const newEdges = template.edges.map((edge: any) => {
        const newSourceId = nodeIdMap.get(edge.source) || edge.source;
        const newTargetId = nodeIdMap.get(edge.target) || edge.target;
        
        return {
          ...edge,
          id: uuidv4(),
          source: newSourceId,
          target: newTargetId
        };
      });
      
      setTimeout(() => {
        setNodes(newNodes);
        setEdges(newEdges);
        
        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ padding: 0.2 });
          }
        }, 100);
      }, 50);
      
    } catch (error) {
      console.error('Error loading template:', error);
    }
  }, [setNodes, setEdges, reactFlowInstance]);

  const loadSample = useCallback((sampleId: string) => {
    try {
      const sample = sampleStories[sampleId as keyof typeof sampleStories];
      
      if (!sample) {
        console.error(`Sample "${sampleId}" not found`);
        return;
      }

      const nodeIdMap = new Map<string, string>();

      const newNodes = (sample.nodes || []).map((node: any) => {
        const newId = uuidv4();
        nodeIdMap.set(node.id, newId);
        return { ...node, id: newId };
      });

      const newEdges = (sample.edges || []).map((edge: any) => {
        const newSourceId = nodeIdMap.get(edge.source) || edge.source;
        const newTargetId = nodeIdMap.get(edge.target) || edge.target;
        return {
          ...edge,
          id: uuidv4(),
          source: newSourceId,
          target: newTargetId
        };
      });

      setNodes(newNodes);
      setEdges(newEdges);
      
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2 });
        }
      }, 100);
    } catch (error) {
      console.error('Error loading sample data:', error);
    }
  }, [setNodes, setEdges, reactFlowInstance]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366F1', strokeWidth: 2 }
    }, eds));
  }, [setEdges]);

  const handleLoad = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data?.nodes && Array.isArray(data.nodes) && data?.edges && Array.isArray(data.edges)) {
              setNodes(data.nodes);
              setEdges(data.edges);
              if (data.viewport && reactFlowInstance) {
                reactFlowInstance.setViewport(data.viewport);
              }
            } else {
              throw new Error('Invalid canvas file format');
            }
          } catch (error) {
            console.error('Error loading file:', error);
            alert('Failed to load file: ' + (error instanceof Error ? error.message : 'Invalid file format'));
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [setNodes, setEdges, reactFlowInstance]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setHasChanges(false);
    setAiAnalysisResults([]);
  }, [setNodes, setEdges]);

  const handleExport = useCallback((format: string) => {
    const exportData = {
      nodes,
      edges,
      viewport: reactFlowInstance?.getViewport(),
      metadata: {
        projectId,
        exportedAt: new Date().toISOString(),
        nodeCount: nodes.length,
        edgeCount: edges.length
      }
    };

    switch (format) {
      case 'json':
        {
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `canvas-${projectId || 'default'}-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        break;
        }
      default:
        console.log(`Export format ${format} not yet implemented`);
    }
  }, [nodes, edges, reactFlowInstance, projectId]);

  const handleApplySuggestion = useCallback((suggestionId: string, data: any) => {
    console.log('Applying suggestion:', suggestionId, data);
    
    if (suggestionId.startsWith('relationship-')) {
      // Create edge between characters based on AI suggestion
      const suggestion = data;
      // Find character nodes and create connection
    }
  }, []);

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          className="bg-gray-50"
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
        >
          <Background 
            variant="dots" 
            gap={20} 
            size={1} 
            color="#d1d5db"
          />
          <Controls />
          <MiniMap 
            nodeColor={(node) => nodeColors[node.type as keyof typeof nodeColors] || '#f3f4f6'}
            nodeStrokeWidth={3}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>

        {/* Welcome Message */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200 max-w-md">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Enhanced Story Canvas
              </h3>
              <p className="text-gray-600 mb-4">
                Create and organize your story visually. Sync with your Planning Pages and use AI analysis to improve your narrative.
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Add story elements from the sidebar</p>
                <p>• Link nodes to Planning data with the ⚛ button</p>
                <p>• Use AI analysis for story insights</p>
                <p>• Connect elements with drag-and-drop</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Panel */}
        {showAIPanel && (
          <AIAnalysisPanel
            isOpen={showAIPanel}
            onClose={() => setShowAIPanel(false)}
            results={aiAnalysisResults}
            isAnalyzing={isAnalyzing}
            onApplySuggestion={handleApplySuggestion}
          />
        )}
      </div>

      {/* Enhanced Sidebar */}
      <EnhancedCanvasToolbar
        onCreateNode={createNode}
        onTemplate={loadTemplate}
        onSync={handleSync}
        onLoad={handleLoad}
        onLoadSample={loadSample}
        onClear={clearCanvas}
        onBack={onBack}
        onExport={handleExport}
        lastSynced={lastSynced}
        isSyncing={isSaving || syncStatus === 'syncing'}
        selectedNodes={[]} // TODO: Implement selection tracking
        onAnalyzeAI={handleAIAnalysis}
        isAnalyzing={isAnalyzing}
        syncStatus={syncStatus}
        isOnline={isOnline}
        canvasMode={canvasMode}
        onModeChange={setCanvasMode}
        hasNodes={nodes.length > 0}
        nodeCount={nodes.length}
        edgeCount={edges.length}
        hasChanges={hasChanges}
      />
    </div>
  );
};

// Main Canvas Component with Provider
const Canvas: React.FC<CanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <CanvasFlow {...props} />
    </ReactFlowProvider>
  );
};

export default Canvas;
