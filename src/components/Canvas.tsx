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

// AI Service fallback
const aiService = {
  analyzeStoryStructure: async (nodes: any[], edges: any[]) => {
    console.log('AI Analysis would analyze:', { nodes, edges });
    return { analysis: 'Mock analysis - AI service not available' };
  }
};

// Simplified Node Components
const SimpleCharacterNode = ({ data, onDataChange }: any) => (
  <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 min-w-[150px] shadow-sm">
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="font-semibold text-green-800 text-sm">{data.name || 'Character'}</div>
    <div className="text-xs text-green-600 mt-1">{data.role || 'Role'}</div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

const SimplePlotNode = ({ data, onDataChange }: any) => (
  <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3 min-w-[150px] shadow-sm">
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="font-semibold text-blue-800 text-sm">{data.title || 'Plot Point'}</div>
    <div className="text-xs text-blue-600 mt-1">{data.type || 'Event'}</div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

const SimpleLocationNode = ({ data, onDataChange }: any) => (
  <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-3 min-w-[150px] shadow-sm">
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="font-semibold text-purple-800 text-sm">{data.name || 'Location'}</div>
    <div className="text-xs text-purple-600 mt-1">{data.type || 'Place'}</div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

const SimpleThemeNode = ({ data, onDataChange }: any) => (
  <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3 min-w-[150px] shadow-sm">
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="font-semibold text-yellow-800 text-sm">{data.title || 'Theme'}</div>
    <div className="text-xs text-yellow-600 mt-1">{data.type || 'Concept'}</div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

const SimpleConflictNode = ({ data, onDataChange }: any) => (
  <div className="bg-red-100 border-2 border-red-300 rounded-lg p-3 min-w-[150px] shadow-sm">
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="font-semibold text-red-800 text-sm">{data.title || 'Conflict'}</div>
    <div className="text-xs text-red-600 mt-1">{data.type || 'Issue'}</div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

const SimpleResearchNode = ({ data, onDataChange }: any) => (
  <div className="bg-indigo-100 border-2 border-indigo-300 rounded-lg p-3 min-w-[150px] shadow-sm">
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="font-semibold text-indigo-800 text-sm">{data.title || 'Research'}</div>
    <div className="text-xs text-indigo-600 mt-1">{data.category || 'Notes'}</div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

const SimpleTimelineNode = ({ data, onDataChange }: any) => (
  <div className="bg-cyan-100 border-2 border-cyan-300 rounded-lg p-3 min-w-[150px] shadow-sm">
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="font-semibold text-cyan-800 text-sm">{data.title || 'Timeline Event'}</div>
    <div className="text-xs text-cyan-600 mt-1">{data.timeframe || 'When'}</div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

// Simplified Menu Component
const SimplifiedMenu = ({ 
  isCollapsed, 
  onToggleCollapsed,
  onCreateNode,
  onSave,
  onLoad,
  onClear,
  lastSaved,
  isSaving
}: any) => {
  const nodeTypes = [
    { type: 'character', label: 'Character', icon: '👤', color: 'green' },
    { type: 'plot', label: 'Plot', icon: '📖', color: 'blue' },
    { type: 'location', label: 'Location', icon: '📍', color: 'purple' },
    { type: 'theme', label: 'Theme', icon: '💭', color: 'yellow' },
    { type: 'conflict', label: 'Conflict', icon: '⚔️', color: 'red' },
    { type: 'research', label: 'Research', icon: '📚', color: 'indigo' },
    { type: 'timeline', label: 'Timeline', icon: '⏰', color: 'cyan' }
  ];

  return (
    <div className={`bg-white border-l border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-64'
    } flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">Story Canvas</h2>
        )}
        <button
          onClick={onToggleCollapsed}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Node Creation Section */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              {nodeTypes.map(({ type, label, icon, color }) => (
                <button
                  key={type}
                  onClick={() => onCreateNode(type)}
                  className={`p-2 text-xs rounded-lg border-2 border-${color}-300 bg-${color}-100 hover:bg-${color}-200 transition-colors flex flex-col items-center gap-1`}
                >
                  <span className="text-lg">{icon}</span>
                  <span className={`text-${color}-800 font-medium`}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions Section */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={onSave}
                disabled={isSaving}
                className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={onLoad}
                className="w-full p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Load
              </button>
              <button
                onClick={onClear}
                className="w-full p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Status Section */}
          <div className="p-4 mt-auto">
            {lastSaved && (
              <div className="text-xs text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Main Canvas Flow Component
const CanvasFlow = () => {
  // State Management
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  
  // Default user ID - in a real app, this would come from authentication
  const userId = 'default-user';
  
  // Get react flow instance and viewport
  const reactFlowInstance = useReactFlow();
  const viewport = reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 };
  
  // Canvas state for auto-save - automatically updates when dependencies change
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

  // Load canvas data on mount
  useEffect(() => {
    const loadCanvasData = async () => {
      try {
        const savedData = await loadData();
        if (savedData?.nodes && savedData?.edges) {
          setNodes(savedData.nodes);
          setEdges(savedData.edges);
        }
      } catch (error) {
        console.error('Failed to load canvas data:', error);
      }
    };

    loadCanvasData();
  }, [loadData, setNodes, setEdges]);

  // Node Types with simplified components
  const nodeTypes: NodeTypes = useMemo(() => ({
    character: SimpleCharacterNode,
    plot: SimplePlotNode,
    location: SimpleLocationNode,
    theme: SimpleThemeNode,
    conflict: SimpleConflictNode,
    research: SimpleResearchNode,
    timeline: SimpleTimelineNode,
  }), []);

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
    if (!reactFlowInstance) return;
    
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

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366F1', strokeWidth: 2 }
    }, eds));
  }, [setEdges]);

  const handleSave = useCallback(async () => {
    try {
      // Force save to storage
      await forceSave();

      // Also offer file download
      const dataToSave = {
        nodes,
        edges,
        viewport: reactFlowInstance?.getViewport(),
        timestamp: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `canvas-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save canvas');
    }
  }, [forceSave, nodes, edges, reactFlowInstance]);

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
            // Validate the loaded data structure
            if (
              data?.nodes &&
              Array.isArray(data.nodes) &&
              data?.edges &&
              Array.isArray(data.edges)
            ) {
              setNodes(data.nodes);
              setEdges(data.edges);
              // Restore viewport if available
              if (data.viewport && reactFlowInstance) {
                reactFlowInstance.setViewport(data.viewport);
              }
            } else {
              throw new Error('Invalid canvas file format');
            }
          } catch (error) {
            console.error('Error loading file:', error);
            alert(
              'Failed to load file: ' +
                (error instanceof Error ? error.message : 'Invalid file format')
            );
          }
        };
        reader.onerror = () => {
          alert('Failed to read file');
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [setNodes, setEdges, reactFlowInstance]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Main Canvas Area */}
      <div className="flex-1 relative">
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
            nodeColor={(node) => {
              switch (node.type) {
                case 'character': return '#dcfce7';
                case 'plot': return '#dbeafe';
                case 'research': return '#e0e7ff';
                case 'location': return '#f3e8ff';
                case 'theme': return '#fef3c7';
                case 'conflict': return '#fee2e2';
                case 'timeline': return '#cffafe';
                default: return '#f3f4f6';
              }
            }}
          />
        </ReactFlow>

        {/* Welcome Message */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200 max-w-md">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Visual Story Canvas
              </h3>
              <p className="text-gray-600 mb-4">
                Create and visualize your story elements with an intuitive node-based interface.
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Add characters, plots, locations, and themes</p>
                <p>• Connect elements to show relationships</p>
                <p>• Use the menu on the right to get started</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Side Menu */}
      <SimplifiedMenu
        isCollapsed={isMenuCollapsed}
        onToggleCollapsed={() => setIsMenuCollapsed(!isMenuCollapsed)}
        onCreateNode={createNode}
        onSave={handleSave}
        onLoad={handleLoad}
        onClear={clearCanvas}
        lastSaved={lastSaved}
        isSaving={isSaving}
      />
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

export default Canvas;
