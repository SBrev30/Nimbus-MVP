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

// TypeScript interfaces for component props
interface NodeProps<T = any> {
  data: T;
  onDataChange: (newData: Partial<T>) => void;
}

interface PlanningCharacter {
  id: string;
  name: string;
  role: string;
}

interface PlotPoint {
  id: string;
  title: string;
  type: string;
}

interface WorldBuildingLocation {
  id: string;
  name: string;
  type: string;
}

interface DropdownData {
  planningCharacters: PlanningCharacter[];
  plotPoints: PlotPoint[];
  worldBuildingLocations: WorldBuildingLocation[];
}

// Custom hook for managing planning data
const usePlanningData = (): DropdownData => {
  // In a real app, this would fetch from context or API
  const planningCharacters: PlanningCharacter[] = [
    { id: '1', name: 'John Doe', role: 'protagonist' },
    { id: '2', name: 'Jane Smith', role: 'antagonist' },
    { id: '3', name: 'Bob Wilson', role: 'supporting' },
    { id: '4', name: 'Alice Cooper', role: 'mentor' },
    { id: '5', name: 'Tom Hardy', role: 'comic relief' }
  ];

  const plotPoints: PlotPoint[] = [
    { id: '1', title: 'Opening Hook', type: 'setup' },
    { id: '2', title: 'Inciting Incident', type: 'event' },
    { id: '3', title: 'First Plot Point', type: 'turning_point' },
    { id: '4', title: 'Midpoint', type: 'turning_point' },
    { id: '5', title: 'Climax', type: 'climax' },
    { id: '6', title: 'Rising Action', type: 'event' },
    { id: '7', title: 'Falling Action', type: 'event' },
    { id: '8', title: 'Resolution', type: 'resolution' }
  ];

  const worldBuildingLocations: WorldBuildingLocation[] = [
    { id: '1', name: 'The Capital City', type: 'city' },
    { id: '2', name: 'Ancient Forest', type: 'wilderness' },
    { id: '3', name: 'Royal Palace', type: 'building' },
    { id: '4', name: 'Hidden Cave', type: 'landmark' },
    { id: '5', name: 'Mountain Pass', type: 'landmark' },
    { id: '6', name: 'Tavern Inn', type: 'building' },
    { id: '7', name: 'Dark Swamp', type: 'wilderness' },
    { id: '8', name: 'Port Town', type: 'city' }
  ];

  return {
    planningCharacters,
    plotPoints,
    worldBuildingLocations
  };
};

// Enhanced Node Components with proper TypeScript interfaces
const SimpleCharacterNode = ({ data, onDataChange }: NodeProps<CharacterNodeData>) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { planningCharacters } = usePlanningData();

  const handleCharacterSelect = (character: PlanningCharacter) => {
    onDataChange({
      name: character.name,
      role: character.role as any,
      fromPlanning: true,
      planningId: character.id
    });
    setShowDropdown(false);
  };

  return (
    <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 min-w-[150px] shadow-sm relative">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="font-semibold text-green-800 text-sm">{data.name || 'Character'}</div>
      <div className="text-xs text-green-600 mt-1">{data.role || 'Role'}</div>
      
      {!data.fromPlanning && (
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="absolute top-1 right-1 text-xs bg-green-200 hover:bg-green-300 rounded px-1"
        >
          📋
        </button>
      )}

      {showDropdown && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[140px]">
          <div className="p-2 text-xs font-medium text-gray-700 border-b">From Planning:</div>
          {planningCharacters.map((char) => (
            <button
              key={char.id}
              onClick={() => handleCharacterSelect(char)}
              className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 flex flex-col"
            >
              <span className="font-medium">{char.name}</span>
              <span className="text-gray-500">{char.role}</span>
            </button>
          ))}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
};

const SimplePlotNode = ({ data, onDataChange }: NodeProps<PlotNodeData>) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { plotPoints } = usePlanningData();

  const handlePlotSelect = (plot: PlotPoint) => {
    onDataChange({
      title: plot.title,
      type: plot.type as any,
      fromPlanning: true,
      planningId: plot.id
    });
    setShowDropdown(false);
  };

  return (
    <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3 min-w-[150px] shadow-sm relative">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="font-semibold text-blue-800 text-sm">{data.title || 'Plot Point'}</div>
      <div className="text-xs text-blue-600 mt-1">{data.type || 'Event'}</div>
      
      {!data.fromPlanning && (
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="absolute top-1 right-1 text-xs bg-blue-200 hover:bg-blue-300 rounded px-1"
        >
          📋
        </button>
      )}

      {showDropdown && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[140px]">
          <div className="p-2 text-xs font-medium text-gray-700 border-b">From Plot:</div>
          {plotPoints.map((plot) => (
            <button
              key={plot.id}
              onClick={() => handlePlotSelect(plot)}
              className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 flex flex-col"
            >
              <span className="font-medium">{plot.title}</span>
              <span className="text-gray-500">{plot.type}</span>
            </button>
          ))}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
};

const SimpleLocationNode = ({ data, onDataChange }: NodeProps<LocationNodeData>) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { worldBuildingLocations } = usePlanningData();

  const handleLocationSelect = (location: WorldBuildingLocation) => {
    onDataChange({
      name: location.name,
      type: location.type as any,
      fromPlanning: true,
      planningId: location.id
    });
    setShowDropdown(false);
  };

  return (
    <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-3 min-w-[150px] shadow-sm relative">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="font-semibold text-purple-800 text-sm">{data.name || 'Location'}</div>
      <div className="text-xs text-purple-600 mt-1">{data.type || 'Place'}</div>
      
      {!data.fromPlanning && (
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="absolute top-1 right-1 text-xs bg-purple-200 hover:bg-purple-300 rounded px-1"
        >
          📋
        </button>
      )}

      {showDropdown && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[140px]">
          <div className="p-2 text-xs font-medium text-gray-700 border-b">From World Building:</div>
          {worldBuildingLocations.map((location) => (
            <button
              key={location.id}
              onClick={() => handleLocationSelect(location)}
              className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 flex flex-col"
            >
              <span className="font-medium">{location.name}</span>
              <span className="text-gray-500">{location.type}</span>
            </button>
          ))}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
};

const SimpleThemeNode = ({ data, onDataChange }: NodeProps<ThemeNodeData>) => (
  <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3 min-w-[150px] shadow-sm">
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="font-semibold text-yellow-800 text-sm">{data.title || 'Theme'}</div>
    <div className="text-xs text-yellow-600 mt-1">{data.type || 'Concept'}</div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

const SimpleConflictNode = ({ data, onDataChange }: NodeProps<ConflictNodeData>) => (
  <div className="bg-red-100 border-2 border-red-300 rounded-lg p-3 min-w-[150px] shadow-sm">
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="font-semibold text-red-800 text-sm">{data.title || 'Conflict'}</div>
    <div className="text-xs text-red-600 mt-1">{data.type || 'Issue'}</div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

const SimpleResearchNode = ({ data, onDataChange }: NodeProps<ResearchNodeData>) => (
  <div className="bg-indigo-100 border-2 border-indigo-300 rounded-lg p-3 min-w-[150px] shadow-sm">
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="font-semibold text-indigo-800 text-sm">{data.title || 'Research'}</div>
    <div className="text-xs text-indigo-600 mt-1">{data.category || 'Notes'}</div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

const SimpleTimelineNode = ({ data, onDataChange }: NodeProps<TimelineNodeData>) => (
  <div className="bg-cyan-100 border-2 border-cyan-300 rounded-lg p-3 min-w-[150px] shadow-sm">
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="font-semibold text-cyan-800 text-sm">{data.title || 'Timeline Event'}</div>
    <div className="text-xs text-cyan-600 mt-1">{data.timeframe || 'When'}</div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

// Interface for menu component props
interface SimplifiedMenuProps {
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onCreateNode: (type: string) => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  onLoadTemplate: (templateId: string) => void;
  onLoadSample: (sampleId: string) => void;
  lastSaved: Date | null;
  isSaving: boolean;
}

// Simplified Menu Component with Templates and Samples
const SimplifiedMenu = ({ 
  isCollapsed, 
  onToggleCollapsed,
  onCreateNode,
  onSave,
  onLoad,
  onClear,
  onLoadTemplate,
  onLoadSample,
  lastSaved,
  isSaving
}: SimplifiedMenuProps) => {
  const [activeTab, setActiveTab] = useState('elements');
  
  const nodeTypes = [
    { type: 'character', label: 'Character', color: 'green' },
    { type: 'plot', label: 'Plot', color: 'blue' },
    { type: 'location', label: 'Location', color: 'purple' },
    { type: 'theme', label: 'Theme', color: 'yellow' },
    { type: 'conflict', label: 'Conflict', color: 'red' },
    { type: 'research', label: 'Research', color: 'indigo' },
    { type: 'timeline', label: 'Timeline', color: 'cyan' }
  ];

  const templateList = [
    { id: 'heroJourney', name: "Hero's Journey", description: 'Classic monomyth structure' },
    { id: 'threeAct', name: 'Three-Act Structure', description: 'Traditional screenplay format' },
    { id: 'mysteryStructure', name: 'Mystery Structure', description: 'Detective story template' },
    { id: 'romanceStructure', name: 'Romance Arc', description: 'Love story progression' }
  ];

  const sampleList = [
    { id: 'mysteryNovel', name: 'Mystery Novel', description: 'Complete detective story example' },
    { id: 'fantasyEpic', name: 'Fantasy Epic', description: 'High fantasy adventure' },
    { id: 'sciFiThriller', name: 'Sci-Fi Thriller', description: 'Futuristic thriller story' }
  ];

  return (
    <div className={`bg-white border-l border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-72'
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
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 m-2 rounded-lg p-1">
            {[
              { id: 'elements', label: 'Elements' },
              { id: 'templates', label: 'Templates' },
              { id: 'samples', label: 'Samples' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'elements' && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Add Elements</h3>
                <div className="grid grid-cols-2 gap-2">
                  {nodeTypes.map(({ type, label, color }) => (
                    <button
                      key={type}
                      onClick={() => onCreateNode(type)}
                      className={`p-3 text-xs rounded-lg border-2 border-${color}-300 bg-${color}-100 hover:bg-${color}-200 transition-colors flex items-center justify-center font-medium`}
                    >
                      <span className={`text-${color}-800`}>{label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-xs text-blue-700 font-medium mb-1">💡 Tip</div>
                  <div className="text-xs text-blue-600">
                    Click the 📋 button on nodes to link them to your Planning data!
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Story Templates</h3>
                <div className="space-y-2">
                  {templateList.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => onLoadTemplate(template.id)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'samples' && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Sample Stories</h3>
                <div className="space-y-2">
                  {sampleList.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => onLoadSample(sample.id)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-sm">{sample.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{sample.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={onSave}
                disabled={isSaving}
                className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={onLoad}
                className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Load
              </button>
              <button
                onClick={onClear}
                className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Clear All
              </button>
            </div>
            
            {lastSaved && (
              <div className="text-xs text-gray-500 mt-3">
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
      <SimpleCharacterNode
        {...props}
        onDataChange={(newData: any) => handleNodeDataChange(props.id, newData)}
      />
    ),
    plot: (props: any) => (
      <SimplePlotNode
        {...props}
        onDataChange={(newData: any) => handleNodeDataChange(props.id, newData)}
      />
    ),
    location: (props: any) => (
      <SimpleLocationNode
        {...props}
        onDataChange={(newData: any) => handleNodeDataChange(props.id, newData)}
      />
    ),
    theme: SimpleThemeNode,
    conflict: SimpleConflictNode,
    research: SimpleResearchNode,
    timeline: SimpleTimelineNode,
  }), [handleNodeDataChange]);

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
        onLoadTemplate={loadTemplate}
        onLoadSample={loadSample}
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
