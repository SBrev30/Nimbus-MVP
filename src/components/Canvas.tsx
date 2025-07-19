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
import { intelligentAIService, AIAnalysisResult } from '../services/intelligentAIService';

// Import enhanced components from the documents
import { EnhancedCanvasToolbar } from './canvas/toolbar/EnhancedCanvasToolbar';
import { CharacterPopup } from './canvas/CharacterPopup';

// Import advanced node types
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
import { Atom, ArrowLeft, Brain } from 'lucide-react';

// Enhanced TypeScript interfaces
interface NodeProps<T = any> {
  data: T;
  onDataChange: (newData: Partial<T>) => void;
}

interface CanvasProps {
  projectId?: string;
  onBack?: () => void;
}

// Enhanced node components with planning integration
const EnhancedCharacterNode = ({ data, onDataChange }: NodeProps<CharacterNodeData>) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const { planningCharacters, loading } = useCanvasPlanningData();

  const handleCharacterSelect = (character: any) => {
    onDataChange({
      name: character.name,
      role: character.role,
      description: character.description,
      fromPlanning: true,
      planningId: character.id,
      traits: character.traits || [],
      age: character.age,
      occupation: character.occupation,
      completeness_score: character.completeness_score
    });
    setShowDropdown(false);
  };

  const handleNodeClick = (event: React.MouseEvent) => {
    if (data.fromPlanning) {
      const rect = event.currentTarget.getBoundingClientRect();
      setPopupPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
      setShowPopup(true);
    }
  };

  const getCompletionColor = (score: number = 0) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <>
      <div 
        className="bg-green-100 border-2 border-green-300 rounded-lg p-3 min-w-[180px] shadow-sm relative cursor-pointer transition-all hover:shadow-md"
        onClick={handleNodeClick}
      >
        <Handle type="target" position={Position.Top} className="w-2 h-2" />
        
        {/* Header with completion indicator */}
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-green-800 text-sm flex items-center gap-2">
            {data.name || 'Character'}
            {data.fromPlanning && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-green-600">Linked</span>
              </div>
            )}
          </div>
          
          {!data.fromPlanning && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="text-xs bg-green-200 hover:bg-green-300 rounded p-1 transition-colors"
              title="Link to Planning Character"
            >
              <Atom className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Character info */}
        <div className="text-xs text-green-600 mb-1 capitalize">{data.role || 'Role'}</div>
        
        {/* Completion bar for planning characters */}
        {data.fromPlanning && data.completeness_score !== undefined && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-green-700">Completeness</span>
              <span className="text-green-600">{Math.round(data.completeness_score)}%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${getCompletionColor(data.completeness_score)}`}
                style={{ width: `${data.completeness_score}%` }}
              />
            </div>
          </div>
        )}

        {/* Description preview */}
        {data.description && (
          <div className="text-xs text-green-700 line-clamp-2">
            {data.description}
          </div>
        )}

        {/* Planning dropdown */}
        {showDropdown && (
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[160px] max-h-48 overflow-y-auto">
            <div className="p-2 text-xs font-medium text-gray-700 border-b">
              {loading ? 'Loading...' : 'From Planning:'}
            </div>
            {!loading && planningCharacters.length === 0 && (
              <div className="p-2 text-xs text-gray-500">No characters found</div>
            )}
            {planningCharacters.map((char) => (
              <button
                key={char.id}
                onClick={() => handleCharacterSelect(char)}
                className="w-full text-left px-2 py-2 text-xs hover:bg-gray-100 flex flex-col border-b border-gray-100 last:border-b-0"
              >
                <span className="font-medium">{char.name}</span>
                <span className="text-gray-500 capitalize">{char.role}</span>
                {char.completeness_score !== undefined && (
                  <div className="mt-1 flex items-center gap-1">
                    <div className="w-8 bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${getCompletionColor(char.completeness_score)}`}
                        style={{ width: `${char.completeness_score}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{Math.round(char.completeness_score)}%</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        
        <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
      </div>

      {/* Character popup */}
      {showPopup && data.fromPlanning && (
        <CharacterPopup
          character={{
            id: data.planningId || data.id || '',
            name: data.name || '',
            role: data.role || '',
            description: data.description || '',
            fantasyClass: data.fantasyClass,
            relationships: data.relationships || []
          }}
          position={popupPosition}
          onClose={() => setShowPopup(false)}
          onExpand={() => {
            // TODO: Navigate to character detail view
            console.log('Expand character:', data.planningId);
            setShowPopup(false);
          }}
        />
      )}
    </>
  );
};

// Enhanced Plot Node with planning integration
const EnhancedPlotNode = ({ data, onDataChange }: NodeProps<PlotNodeData>) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { plotPoints, loading } = useCanvasPlanningData();

  const handlePlotSelect = (plot: any) => {
    onDataChange({
      title: plot.title,
      type: plot.type,
      description: plot.description,
      fromPlanning: true,
      planningId: plot.id
    });
    setShowDropdown(false);
  };

  const getSignificanceColor = (significance: string = 'moderate') => {
    switch (significance) {
      case 'critical': return 'border-red-400 bg-red-50';
      case 'major': return 'border-orange-400 bg-orange-50'; 
      case 'moderate': return 'border-blue-400 bg-blue-50';
      case 'minor': return 'border-gray-400 bg-gray-50';
      default: return 'border-blue-400 bg-blue-50';
    }
  };

  return (
    <div className={`rounded-lg p-3 min-w-[180px] shadow-sm relative border-2 ${getSignificanceColor(data.significance)}`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-blue-800 text-sm flex items-center gap-2">
          {data.title || 'Plot Point'}
          {data.fromPlanning && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-xs text-blue-600">Linked</span>
            </div>
          )}
        </div>
        
        {!data.fromPlanning && (
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="text-xs bg-blue-200 hover:bg-blue-300 rounded p-1 transition-colors"
            title="Link to Planning Plot"
          >
            <Atom className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="text-xs text-blue-600 mb-1 capitalize">{data.type || 'Event'}</div>
      
      {data.significance && (
        <div className={`text-xs px-2 py-1 rounded mb-2 ${
          data.significance === 'critical' ? 'bg-red-100 text-red-700' :
          data.significance === 'major' ? 'bg-orange-100 text-orange-700' :
          data.significance === 'moderate' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {data.significance} significance
        </div>
      )}

      {data.description && (
        <div className="text-xs text-blue-700 line-clamp-2">
          {data.description}
        </div>
      )}

      {showDropdown && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[160px] max-h-48 overflow-y-auto">
          <div className="p-2 text-xs font-medium text-gray-700 border-b">
            {loading ? 'Loading...' : 'From Plot:'}
          </div>
          {!loading && plotPoints.length === 0 && (
            <div className="p-2 text-xs text-gray-500">No plot points found</div>
          )}
          {plotPoints.map((plot) => (
            <button
              key={plot.id}
              onClick={() => handlePlotSelect(plot)}
              className="w-full text-left px-2 py-2 text-xs hover:bg-gray-100 flex flex-col border-b border-gray-100 last:border-b-0"
            >
              <span className="font-medium">{plot.title}</span>
              <span className="text-gray-500 capitalize">{plot.type}</span>
            </button>
          ))}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
};

// Enhanced Location Node with planning integration  
const EnhancedLocationNode = ({ data, onDataChange }: NodeProps<LocationNodeData>) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { worldBuildingLocations, loading } = useCanvasPlanningData();

  const handleLocationSelect = (location: any) => {
    onDataChange({
      name: location.name,
      type: location.type,
      description: location.description,
      fromPlanning: true,
      planningId: location.id
    });
    setShowDropdown(false);
  };

  const getImportanceColor = (importance: string = 'moderate') => {
    switch (importance) {
      case 'critical': return 'border-red-400 bg-red-50';
      case 'high': return 'border-orange-400 bg-orange-50';
      case 'moderate': return 'border-purple-400 bg-purple-50';
      case 'low': return 'border-gray-400 bg-gray-50';
      default: return 'border-purple-400 bg-purple-50';
    }
  };

  return (
    <div className={`rounded-lg p-3 min-w-[180px] shadow-sm relative border-2 ${getImportanceColor(data.importance)}`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-purple-800 text-sm flex items-center gap-2">
          {data.name || 'Location'}
          {data.fromPlanning && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="text-xs text-purple-600">Linked</span>
            </div>
          )}
        </div>
        
        {!data.fromPlanning && (
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="text-xs bg-purple-200 hover:bg-purple-300 rounded p-1 transition-colors"
            title="Link to World Building"
          >
            <Atom className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="text-xs text-purple-600 mb-1 capitalize">{data.type || 'Place'}</div>
      
      {data.importance && (
        <div className={`text-xs px-2 py-1 rounded mb-2 ${
          data.importance === 'critical' ? 'bg-red-100 text-red-700' :
          data.importance === 'high' ? 'bg-orange-100 text-orange-700' :
          data.importance === 'moderate' ? 'bg-purple-100 text-purple-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {data.importance} importance
        </div>
      )}

      {data.description && (
        <div className="text-xs text-purple-700 line-clamp-2">
          {data.description}
        </div>
      )}

      {showDropdown && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[160px] max-h-48 overflow-y-auto">
          <div className="p-2 text-xs font-medium text-gray-700 border-b">
            {loading ? 'Loading...' : 'From World Building:'}
          </div>
          {!loading && worldBuildingLocations.length === 0 && (
            <div className="p-2 text-xs text-gray-500">No locations found</div>
          )}
          {worldBuildingLocations.map((location) => (
            <button
              key={location.id}
              onClick={() => handleLocationSelect(location)}
              className="w-full text-left px-2 py-2 text-xs hover:bg-gray-100 flex flex-col border-b border-gray-100 last:border-b-0"
            >
              <span className="font-medium">{location.name}</span>
              <span className="text-gray-500 capitalize">{location.type}</span>
            </button>
          ))}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
};

// Main Canvas Flow Component
const CanvasFlow: React.FC<CanvasProps> = ({ projectId, onBack }) => {
  // Get authenticated user
  const { user } = useAuth();
   
  // State Management
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'pending'>('synced');
  const [canvasMode, setCanvasMode] = useState('explore');
  
  // AI Analysis State
  const [aiAnalysisResults, setAiAnalysisResults] = useState<AIAnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  
  // Use authenticated user ID or fallback
  const userId = user?.id || 'anonymous';
  
  // Get react flow instance and viewport
  const reactFlowInstance = useReactFlow();
  const viewport = reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 };
  
  // Canvas state for auto-save
  const canvasState: CanvasState = useMemo(() => ({
    nodes,
    edges,
    viewport,
    lastModified: Date.now()
  }), [nodes, edges, viewport]);

  // Enhanced auto-save hook
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

  // Track changes for sync status
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Load planning data
  const planningData = useCanvasPlanningData(projectId);

  // Update changes state when nodes/edges change
  useEffect(() => {
    setHasChanges(true);
    if (nodes.length === 0 && edges.length === 0) {
      setHasChanges(false);
    }
  }, [nodes, edges]);

  // Load canvas data on mount
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

  // Node data change handler
  const handleNodeDataChange = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, [setNodes]);

  // Enhanced Node Types with planning integration
  const nodeTypes: NodeTypes = useMemo(() => ({
    character: (props: any) => (
      <EnhancedCharacterNode
        {...props}
        onDataChange={(newData: any) => handleNodeDataChange(props.id, newData)}
      />
    ),
    plot: (props: any) => (
      <EnhancedPlotNode
        {...props}
        onDataChange={(newData: any) => handleNodeDataChange(props.id, newData)}
      />
    ),
    location: (props: any) => (
      <EnhancedLocationNode
        {...props}
        onDataChange={(newData: any) => handleNodeDataChange(props.id, newData)}
      />
    ),
    theme: ThemeNode,
    conflict: ConflictNode,
    timeline: TimelineNode,
    research: ResearchNode,
  }), [handleNodeDataChange]);

  // Node creation with enhanced data
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
    
    setNodes((nds) => [...nds, newNode]);
  }, [reactFlowInstance, setNodes]);

  // AI Analysis function
  const handleAIAnalysis = useCallback(async () => {
    if (!nodes.length) return;
    
    setIsAnalyzing(true);
    setShowAIPanel(true);
    
    try {
      const results: AIAnalysisResult[] = [];
      
      // Character analysis
      const characterNodes = nodes.filter(n => n.type === 'character');
      if (characterNodes.length > 0) {
        for (const node of characterNodes) {
          try {
            const result = await intelligentAIService.analyzeCharacterNode(node.data);
            results.push(result);
          } catch (error) {
            console.error('Character analysis failed:', error);
          }
        }
      }
      
      // Story coherence analysis
      if (nodes.length > 3) {
        try {
          const coherenceResult = await intelligentAIService.analyzeStoryCoherence(nodes, edges);
          results.push(coherenceResult);
        } catch (error) {
          console.error('Story coherence analysis failed:', error);
        }
      }
      
      // Relationship analysis
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

  // Sync with Planning Pages
  const handleSync = useCallback(async () => {
    setSyncStatus('syncing');
    
    try {
      // Refresh planning data
      await planningData.refresh();
      
      // Update nodes that are linked to planning data
      const updatedNodes = await Promise.all(
        nodes.map(async (node) => {
          if (node.data.fromPlanning && node.data.planningId) {
            // Fetch updated data from planning
            if (node.type === 'character') {
              const updatedChar = planningData.planningCharacters.find(
                c => c.id === node.data.planningId
              );
              if (updatedChar) {
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
            // Add similar logic for plot and location nodes
          }
          return node;
        })
      );
      
      setNodes(updatedNodes);
      
      // Force save the current state
      await forceSave();
      
      setSyncStatus('synced');
      setLastSynced(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }
  }, [planningData, nodes, forceSave, setNodes]);

  // Template loading
  const loadTemplate = useCallback((templateId: string) => {
    try {
      const template = templates[templateId as keyof typeof templates];
      
      if (!template) {
        console.error(`Template "${templateId}" not found`);
        return;
      }

      // Clear existing nodes and edges
      setNodes([]);
      setEdges([]);
      
      // Create ID mapping for regeneration
      const nodeIdMap = new Map<string, string>();
      
      // Generate new nodes with fresh UUIDs
      const newNodes = template.nodes.map((node: any) => {
        const newId = uuidv4();
        nodeIdMap.set(node.id, newId);
        
        return {
          ...node,
          id: newId
        };
      });
      
      // Generate new edges with updated node references
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
      
      // Set nodes and edges with delay for proper rendering
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

  // Load sample data
  const loadSample = useCallback((sampleId: string) => {
    try {
      const sample = sampleStories[sampleId as keyof typeof sampleStories];
      
      if (!sample) {
        console.error(`Sample "${sampleId}" not found`);
        return;
      }

      // Create ID mapping for regeneration
      const nodeIdMap = new Map<string, string>();

      // Generate new nodes with fresh UUIDs
      const newNodes = (sample.nodes || []).map((node: any) => {
        const newId = uuidv4();
        nodeIdMap.set(node.id, newId);
        return { ...node, id: newId };
      });

      // Generate new edges with updated node references
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

  // Connection handler
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366F1', strokeWidth: 2 }
    }, eds));
  }, [setEdges]);

  // File operations
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

  // AI suggestion handler
  const handleApplySuggestion = useCallback((suggestionId: string, data: any) => {
    // Implementation for applying AI suggestions
    console.log('Applying suggestion:', suggestionId, data);
    
    if (suggestionId.startsWith('relationship-')) {
      // Create edge between characters based on AI suggestion
      const suggestion = data;
      // Find character nodes and create connection
      // This would involve finding the nodes and creating an edge
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
