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

// Import the enhanced auto-save hook
import { useUnifiedAutoSave } from '../hooks/useUnifiedAutoSave';

// Modular Component Imports
import { CharacterNode } from './canvas/nodes/CharacterNode';
import { PlotNode } from './canvas/nodes/PlotNode';
import { LocationNode } from './canvas/nodes/LocationNode';
import { ThemeNode } from './canvas/nodes/ThemeNode';
import { ConflictNode } from './canvas/nodes/ConflictNode';
import { ResearchNode } from './canvas/nodes/ResearchNode';
import { TimelineNode } from './canvas/nodes/TimelineNode';

import { EnhancedCanvasToolbar } from './canvas/toolbar/EnhancedCanvasToolbar';
import { PrimaryToolbar } from './canvas/toolbar/PrimaryToolbar';
import { VisualizationSelector } from './canvas/toolbar/VisualizationSelector';

// Import types and utilities
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

// Direct imports - files exist
import { templates } from '../data/templates';
import { sampleStories } from '../data/sampleStories';
import { CharacterPopup } from './canvas/CharacterPopup';

// AI Service fallback
const aiService = {
  analyzeStoryStructure: async (nodes: any[], edges: any[]) => {
    console.log('AI Analysis would analyze:', { nodes, edges });
    return { analysis: 'Mock analysis - AI service not available' };
  }
};

// Connection Types and Labels
const ConnectionTypes = {
  RELATIONSHIP: 'relationship',
  PLOT_FLOW: 'plot_flow',
  RESEARCH_LINK: 'research_link',
  THEME_CONNECTION: 'theme_connection',
  CONFLICT_RELATION: 'conflict_relation',
  TIMELINE_SEQUENCE: 'timeline_sequence',
  GENERAL: 'general'
};

const ConnectionLabels = {
  // Character relationships
  FRIEND: 'Friend',
  ENEMY: 'Enemy',
  FAMILY: 'Family',
  LOVE: 'Romance',
  MENTOR: 'Mentor',
  
  // Plot connections
  CAUSES: 'Causes',
  LEADS_TO: 'Leads to',
  PREVENTS: 'Prevents',
  RESOLVES: 'Resolves',
  
  // Theme connections
  EMBODIES: 'Embodies',
  EXPLORES: 'Explores',
  CHALLENGES: 'Challenges',
  
  // Research connections
  SUPPORTS: 'Supports',
  REFERENCES: 'References',
  INSPIRES: 'Inspires'
};

// Additional View Components
const TimelineView = ({ nodes, edges, onNodeClick }: any) => {
  const timelineNodes = nodes.filter((n: Node) => 
    n.type === 'timeline' || n.type === 'plot'
  ).sort((a: any, b: any) => (a.data.order || 0) - (b.data.order || 0));

  return (
    <div className="flex-1 p-8 bg-white">
      <h3 className="text-lg font-semibold mb-4">Timeline View</h3>
      <div className="space-y-4">
        {timelineNodes.map((node: Node) => (
          <div
            key={node.id}
            onClick={() => onNodeClick(node.id)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{node.data.title || node.data.name}</div>
              <div className="text-sm text-gray-500">{node.data.timeframe || 'Unknown'}</div>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {node.data.description || 'No description'}
            </div>
            {node.data.significance && (
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  node.data.significance === 'critical' ? 'bg-red-100 text-red-800' :
                  node.data.significance === 'high' ? 'bg-orange-100 text-orange-800' :
                  node.data.significance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {node.data.significance}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const RelationshipView = ({ edges, nodes, onEdgeClick }: any) => {
  return (
    <div className="flex-1 p-8 bg-white">
      <h3 className="text-lg font-semibold mb-4">Relationship Analysis</h3>
      <div className="space-y-4">
        {edges.map((edge: Edge) => {
          const sourceNode = nodes.find((n: Node) => n.id === edge.source);
          const targetNode = nodes.find((n: Node) => n.id === edge.target);
          return (
            <div
              key={edge.id}
              onClick={() => onEdgeClick(edge.id)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="font-medium">
                {sourceNode?.data.name || sourceNode?.data.title} → {targetNode?.data.name || targetNode?.data.title}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Connection: {edge.label || 'Unspecified'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {sourceNode?.type} to {targetNode?.type}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InfluenceMapView = ({ nodes, edges, onNodeClick }: any) => {
  const characterNodes = nodes.filter((n: Node) => n.type === 'character');
  
  const getNodeConnections = (nodeId: string) => {
    return edges.filter((e: Edge) => e.source === nodeId || e.target === nodeId).length;
  };

  return (
    <div className="flex-1 p-8 bg-white">
      <h3 className="text-lg font-semibold mb-4">Character Influence Map</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characterNodes.map((node: Node) => {
          const connections = getNodeConnections(node.id);
          
          return (
            <div
              key={node.id}
              onClick={() => onNodeClick(node.id)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="font-medium">{node.data.name}</div>
              <div className="text-sm text-gray-600 mt-1 capitalize">
                {node.data.role}
              </div>
              <div className="text-sm text-blue-600 mt-2">
                {connections} connections
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(connections * 20, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Auto-save Status Bar Component
const AutoSaveStatusBar = ({ 
  lastSaved, 
  isSaving, 
  saveError, 
  cloudSyncStatus, 
  forceSave, 
  clearError, 
  retrySave, 
  onExport, 
  onImport 
}: any) => {
  return (
    <div className="autosave-status-bar">
      <div className="status-indicators">
        <span className={`sync-status ${cloudSyncStatus}`}>
          {cloudSyncStatus === 'synced' && '✓ Synced'}
          {cloudSyncStatus === 'syncing' && '⟳ Syncing...'}
          {cloudSyncStatus === 'error' && '⚠ Sync Error'}
          {cloudSyncStatus === 'offline' && '⚪ Offline'}
        </span>
        {lastSaved && (
          <span className="last-saved">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}
        {isSaving && <span className="saving-indicator">Saving...</span>}
      </div>
      
      {saveError && (
        <div className="error-bar">
          <span>Save failed: {saveError}</span>
          <button onClick={retrySave} className="retry-btn">Retry</button>
          <button onClick={clearError} className="close-btn">×</button>
        </div>
      )}
      
      <div className="manual-actions">
        <button onClick={forceSave} disabled={isSaving}>
          Force Save
        </button>
        <button onClick={onExport}>Export</button>
        <label className="import-btn">
          Import
          <input
            type="file"
            accept=".json"
            onChange={onImport}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );
};

// Template loading utilities
const generateNewNodeId = () => uuidv4();
const generateNewEdgeId = () => uuidv4();

// Main Canvas Flow Component
const CanvasFlow = () => {
  // State Management
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [visualizationMode, setVisualizationMode] = useState('canvas');
  
  // Character popup state
  const [showCharacterPopup, setShowCharacterPopup] = useState(false);
  const [popupCharacter, setPopupCharacter] = useState<any>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  
  // Canvas mode and analysis
  const [canvasMode, setCanvasMode] = useState<'exploratory' | 'master'>('exploratory');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Default user ID - in a real app, this would come from authentication
  const userId = 'default-user';
  
  // Canvas state for auto-save
  const viewport = reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 };
  const canvasState = useMemo(() => ({
    nodes,
    edges,
    viewport,
    lastModified: Date.now()
  });

  // Enhanced auto-save hook
  const {
    lastSaved,
    isSaving,
    saveError,
    cloudSyncStatus,
    forceSave,
    loadData,
    clearError,
    retrySave,
    isOnline
  } = useUnifiedAutoSave(canvasState, userId, {
    localKey: `enhanced-canvas-${userId}`,
    delay: 2000,
    enableCloud: true,
    onSaveSuccess: (data) => {
      console.log('Canvas auto-saved successfully at:', new Date());
    },
    onSaveError: (error) => {
      console.error('Canvas auto-save failed:', error);
    }
  });
  
  const reactFlowInstance = useReactFlow();

  // Update canvas state when nodes or edges change
  useEffect(() => {
    setCanvasState({
      nodes,
      edges,
      viewport: { x: 0, y: 0, zoom: 1 },
      lastModified: Date.now()
    });
  }, [nodes, edges]);

  // Load canvas data on mount
  useEffect(() => {
    const loadCanvasData = async () => {
      try {
        const savedData = await loadData();
        if (savedData && savedData.nodes && savedData.edges) {
          setNodes(savedData.nodes);
          setEdges(savedData.edges);
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

  // Node Types with enhanced components
  const nodeTypes: NodeTypes = useMemo(() => ({
    character: (props: any) => (
      <CharacterNode
        {...props}
        onDataChange={(newData) => handleNodeDataChange(props.id, newData)}
      />
    ),
    plot: (props: any) => (
      <PlotNode
        {...props}
        onDataChange={(newData) => handleNodeDataChange(props.id, newData)}
      />
    ),
    location: (props: any) => (
      <LocationNode
        {...props}
        onDataChange={(newData) => handleNodeDataChange(props.id, newData)}
      />
    ),
    theme: (props: any) => (
      <ThemeNode
        {...props}
        onDataChange={(newData) => handleNodeDataChange(props.id, newData)}
      />
    ),
    conflict: (props: any) => (
      <ConflictNode
        {...props}
        onDataChange={(newData) => handleNodeDataChange(props.id, newData)}
      />
    ),
    research: (props: any) => (
      <ResearchNode
        {...props}
        onDataChange={(newData) => handleNodeDataChange(props.id, newData)}
      />
    ),
    timeline: (props: any) => (
      <TimelineNode
        {...props}
        onDataChange={(newData) => handleNodeDataChange(props.id, newData)}
      />
    ),
  }), [handleNodeDataChange]);

  // AI Analysis Function
  const analyzeWithAI = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await aiService.analyzeStoryStructure(nodes, edges);
      console.log('AI Analysis:', analysis);
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [nodes, edges]);

  // Export canvas data
  const exportCanvas = useCallback(() => {
    const dataStr = JSON.stringify(canvasState, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enhanced-canvas-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [canvasState]);

  // Import canvas data
  const importCanvas = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData.nodes && importedData.edges) {
          setNodes(importedData.nodes);
          setEdges(importedData.edges);
        }
      } catch (error) {
        console.error('Failed to import canvas data:', error);
      }
    };
    reader.readAsText(file);
  }, [setNodes, setEdges]);

  // Event Handlers
  const handleCharacterClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'character') {
      setPopupCharacter(node.data);
      setPopupPosition({ 
        x: event.clientX, 
        y: event.clientY 
      });
      setShowCharacterPopup(true);
    }
  }, []);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366F1', strokeWidth: 2 }
    }, eds));
  }, [setEdges]);

  const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
    const nodeIds = selectedNodes.map(node => node.id);
    setSelectedNodes(nodeIds);
    
    if (selectedNodes.length > 0) {
      const firstNode = selectedNodes[0];
      setToolbarPosition({
        x: firstNode.position.x + (firstNode.width || 200) / 2,
        y: firstNode.position.y
      });
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  }, []);

  // Node creation with proper TypeScript interfaces
  const getDefaultNodeData = (type: string) => {
    switch (type) {
      case 'character':
        return {
          name: 'New Character',
          role: 'supporting' as const,
          description: 'Character description...',
          traits: [],
          relationships: [],
          aiSuggested: false
        } as CharacterNodeData;
      case 'plot':
        return {
          title: 'New Plot Point',
          type: 'event' as const,
          description: 'Plot description...',
          significance: 'moderate' as const,
          order: nodes.filter(n => n.type === 'plot').length + 1
        } as PlotNodeData;
      case 'location':
        return {
          name: 'New Location',
          type: 'building' as const,
          description: 'Location description...',
          importance: 'moderate' as const,
          connectedCharacters: []
        } as LocationNodeData;
      case 'theme':
        return {
          title: 'New Theme',
          type: 'supporting' as const,
          description: 'Theme description...',
          significance: 'moderate' as const,
          relatedCharacters: []
        } as ThemeNodeData;
      case 'conflict':
        return {
          title: 'New Conflict',
          type: 'interpersonal' as const,
          description: 'Conflict description...',
          parties: [],
          impact: 'moderate' as const,
          currentStatus: 'emerging' as const,
          escalation: 5
        } as ConflictNodeData;
      case 'research':
        return {
          title: 'New Research',
          content: 'Research content...',
          tags: [],
          category: 'worldbuilding' as const
        } as ResearchNodeData;
      case 'timeline':
        return {
          title: 'New Timeline Event',
          type: 'event' as const,
          description: 'Event description...',
          timeframe: 'Present',
          significance: 'medium' as const,
          order: nodes.filter(n => n.type === 'timeline').length + 1
        } as TimelineNodeData;
      default:
        return {};
    }
  };

  const createNode = useCallback((type: string) => {
    const id = uuidv4();
    const position = reactFlowInstance.project({ x: 250, y: 250 });
    
    const newNode: Node = {
      id,
      type,
      position,
      data: getDefaultNodeData(type)
    };
    
    setNodes((nds) => [...nds, newNode]);
  }, [reactFlowInstance, setNodes, nodes]);

  // Template loading with proper UUID regeneration
  const loadTemplate = useCallback((templateId: string) => {
    console.log('Loading template:', templateId);
    
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
        const newId = generateNewNodeId();
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
          id: generateNewEdgeId(),
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
  const loadSampleData = useCallback(() => {
    try {
      const sampleData = sampleStories?.mysteryNovel || { nodes: [], edges: [] };
      setNodes(sampleData.nodes);
      setEdges(sampleData.edges);
      
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2 });
        }
      }, 100);
    } catch (error) {
      console.error('Error loading sample data:', error);
    }
  }, [setNodes, setEdges, reactFlowInstance]);

  const handleToolbarAction = useCallback((action: string) => {
    switch (action) {
      case 'delete':
        setNodes((nds) => nds.filter(node => !selectedNodes.includes(node.id)));
        setEdges((eds) => eds.filter(edge => 
          !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
        ));
        setSelectedNodes([]);
        setShowToolbar(false);
        break;
      case 'duplicate':
        const nodesToDuplicate = nodes.filter(node => selectedNodes.includes(node.id));
        const duplicatedNodes = nodesToDuplicate.map(node => ({
          ...node,
          id: uuidv4(),
          position: {
            x: node.position.x + 50,
            y: node.position.y + 50
          }
        }));
        setNodes((nds) => [...nds, ...duplicatedNodes]);
        break;
    }
  }, [selectedNodes, nodes, setNodes, setEdges]);

  const handleSave = useCallback(() => {
    return forceSave();
  }, [forceSave]);

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
            if (data.nodes && data.edges) {
              setNodes(data.nodes);
              setEdges(data.edges);
            }
          } catch (error) {
            console.error('Error loading file:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [setNodes, setEdges]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodes([]);
    setShowToolbar(false);
  }, [setNodes, setEdges]);

  const handleNodeClick = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNodes([nodeId]);
      if (visualizationMode !== 'canvas') {
        setVisualizationMode('canvas');
      }
      if (reactFlowInstance) {
        reactFlowInstance.setCenter(node.position.x, node.position.y, { zoom: 1.2 });
      }
    }
  }, [nodes, visualizationMode, reactFlowInstance]);

  const handleEdgeClick = useCallback((edgeId: string) => {
    console.log('Edge clicked:', edgeId);
  }, []);

  return (
    <div className="canvas-container">
      {/* Auto-save Status Bar */}
      <AutoSaveStatusBar
        lastSaved={lastSaved}
        isSaving={isSaving}
        saveError={saveError}
        cloudSyncStatus={cloudSyncStatus}
        forceSave={forceSave}
        clearError={clearError}
        retrySave={retrySave}
        onExport={exportCanvas}
        onImport={importCanvas}
      />

      <div className="h-screen bg-[#F9FAFB] flex font-inter relative">
        {/* Enhanced Canvas Toolbar */}
        <div className="w-80 bg-white border-r border-[#C6C5C5] p-4 overflow-y-auto">
          <EnhancedCanvasToolbar
            onCreateNode={createNode}
            onTemplate={loadTemplate}
            onSave={handleSave}
            onLoad={handleLoad}
            onLoadSample={loadSampleData}
            onClear={clearCanvas}
            lastSaved={lastSaved}
            isSaving={isSaving}
            onAnalyzeAI={analyzeWithAI}
            isAnalyzing={isAnalyzing}
            syncStatus={cloudSyncStatus}
            isOnline={isOnline}
            canvasMode={canvasMode}
            onModeChange={setCanvasMode}
            hasNodes={nodes.length > 0}
            selectedNodes={selectedNodes}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Visualization Mode Selector */}
          <div className="bg-white border-b border-gray-200 p-4">
            <VisualizationSelector
              currentMode={visualizationMode}
              onModeChange={setVisualizationMode}
            />
          </div>

          {/* Main Visualization Area */}
          <div className="flex-1 relative">
            {visualizationMode === 'canvas' && (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onSelectionChange={onSelectionChange}
                onNodeClick={handleCharacterClick}
                nodeTypes={nodeTypes}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                className="bg-[#F9FAFB]"
                nodesDraggable={canvasMode === 'exploratory'}
                nodesConnectable={canvasMode === 'exploratory'}
                elementsSelectable={true}
              >
                <Background color="#E2E8F0" size={1} />
                <Controls />
                <MiniMap 
                  nodeColor={(node) => {
                    switch (node.type) {
                      case 'character': return '#A5F7AC';
                      case 'plot': return '#FEE2E2';
                      case 'research': return '#E0E7FF';
                      case 'location': return '#DDD6FE';
                      case 'theme': return '#FEF3C7';
                      case 'conflict': return '#FECACA';
                      case 'timeline': return '#E0F2FE';
                      default: return '#F3F4F6';
                    }
                  }}
                />
              </ReactFlow>
            )}

            {visualizationMode === 'timeline' && (
              <TimelineView
                nodes={nodes}
                edges={edges}
                onNodeClick={handleNodeClick}
              />
            )}

            {visualizationMode === 'relationships' && (
              <RelationshipView
                edges={edges}
                nodes={nodes}
                onEdgeClick={handleEdgeClick}
              />
            )}

            {visualizationMode === 'influence' && (
              <InfluenceMapView
                nodes={nodes}
                edges={edges}
                onNodeClick={handleNodeClick}
              />
            )}

            {/* Primary Toolbar */}
            {showToolbar && visualizationMode === 'canvas' && (
              <PrimaryToolbar
                selectedNodes={selectedNodes}
                onAction={handleToolbarAction}
                position={toolbarPosition}
              />
            )}

            {/* Character Popup */}
            {showCharacterPopup && popupCharacter && CharacterPopup && (
              <CharacterPopup
                character={popupCharacter}
                position={popupPosition}
                onClose={() => setShowCharacterPopup(false)}
                onExpand={() => {
                  setShowCharacterPopup(false);
                  console.log('Navigate to character profile');
                }}
              />
            )}

            {/* Welcome Message */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200 max-w-md">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Enhanced Visual Story Canvas
                  </h3>
                  <p className="text-[#889096] mb-4">
                    Create and visualize your story with multiple view modes, AI insights, and advanced node types.
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>• Switch between Canvas, Timeline, and Analysis views</p>
                    <p>• Add characters, plots, locations, themes, conflicts</p>
                    <p>• Use AI analysis for story structure insights</p>
                    <p>• Try story templates or load sample stories</p>
                    <p>• Explore character influence and relationship mapping</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Canvas Component with Provider
const Canvas = () => {
  return (
    <ReactFlowProvider>
      <CanvasFlow />
    </ReactFlowProvider>
  );
};

// Export as default instead of named export
export default Canvas;
