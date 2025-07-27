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
import { useCanvasConnections } from '../hooks/useCanvasConnections';

// Import enhanced components
import { EnhancedCanvasToolbar } from './canvas/toolbar/EnhancedCanvasToolbar';
import { CharacterPopup } from './canvas/CharacterPopup';
import { Integration } from './Integration';
import { ConnectionControls } from './canvas/connection-controls';

// Import node types from index file
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

// Enhanced TypeScript interfaces
interface NodeProps<T = any> {
  data: T;
  onDataChange: (newData: Partial<T>) => void;
}

interface CanvasProps {
  projectId?: string;
  onBack?: () => void;
}

// ReactFlow Edge interface with auto-connection data
interface ReactFlowEdge extends Edge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: {
    stroke: string;
    strokeWidth: number;
    strokeDasharray?: string;
  };
  label?: string;
  data?: any; // For auto-connection metadata
}

// Main Canvas Flow Component
const CanvasFlow: React.FC<CanvasProps> = ({ projectId, onBack }) => {
  const { user } = useAuth();
   
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [userEdges, setUserEdges] = useState<ReactFlowEdge[]>([]); // Separate user-created edges
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'pending'>('synced');
  const [canvasMode, setCanvasMode] = useState('explore');
  
  // Integration modal state
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  
  const userId = user?.id || null;
  
  // Add planning data hook for debugging
  const planningData = useCanvasPlanningData(projectId);
  
  const reactFlowInstance = useReactFlow();
  const viewport = reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 };
  
  const canvasState: CanvasState = useMemo(() => ({
    nodes,
    edges,
    viewport,
    lastModified: Date.now()
  }), [nodes, edges, viewport]);

  // Add the auto-connections hook
  const {
    connectionSettings,
    autoEdges,
    connectionInsights,
    toggleConnectionType,
    refreshConnections
  } = useCanvasConnections(
    {
      planningCharacters: planningData.planningCharacters,
      planningLocations: planningData.planningLocations || [],
      characterRelationships: planningData.characterRelationships || []
    },
    nodes
  );

  // Combine user edges and auto edges
  const combinedEdges = useMemo(() => {
    return [...userEdges, ...autoEdges];
  }, [userEdges, autoEdges]);

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

  // Cleanup Old Canvas Data
  useEffect(() => {
    // Clean up nodes with invalid roles
    const updatedNodes = nodes.map(node => {
      if (node.type === 'character' && node.data.role === 'other') {
        console.log(`🔧 Fixing invalid role 'other' to 'minor' for character: ${node.data.name}`);
        return {
          ...node,
          data: { ...node.data, role: 'minor' }
        };
      }
      return node;
    });
    
    // Only update if changes were made
    const hasInvalidRoles = updatedNodes.some((node, i) => node !== nodes[i]);
    if (hasInvalidRoles) {
      console.log('🔧 Cleaning up character nodes with invalid roles');
      setNodes(updatedNodes);
    }
  }, [nodes, setNodes]);

  // Debug planning data
  useEffect(() => {
    console.log('Canvas: Planning data updated:', {
      characters: planningData.planningCharacters.length,
      plotThreads: planningData.plotThreads.length,
      locations: planningData.planningLocations.length,
      characterRelationships: planningData.characterRelationships?.length || 0,
      autoEdgesCount: autoEdges.length,
      loading: planningData.loading,
      error: planningData.error
    });
  }, [planningData.planningCharacters, planningData.plotThreads, planningData.planningLocations, planningData.characterRelationships, autoEdges.length, planningData.loading, planningData.error]);

  useEffect(() => {
    const loadCanvasData = async () => {
      try {
        const savedData = await loadData();
        if (savedData?.nodes && savedData?.edges) {
          setNodes(savedData.nodes);
          // Separate user edges from auto edges when loading
          const savedUserEdges = savedData.edges.filter((edge: any) => !edge.data?.source || edge.data.source === 'user_created');
          setUserEdges(savedUserEdges);
          setHasChanges(false);
        }
      } catch (error) {
        console.error('Failed to load canvas data:', error);
      }
    };
    loadCanvasData();
  }, [loadData, setNodes]);

  // Handle opening integrations modal
  const handleOpenIntegrations = useCallback(() => {
    setShowIntegrationsModal(true);
  }, []);

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

  // ✅ COMPLETE NODE TYPES REGISTRATION - All nodes with proper planning integration
  const nodeTypes: NodeTypes = useMemo(() => {
    console.log('🎨 Registering ALL node types with enhanced handlers');
    
    const nodeTypeRegistry: NodeTypes = {};
    
    // ✅ PLANNING INTEGRATION NODES - Pass projectId for planning data access
    nodeTypeRegistry.character = (props: any) => {
      console.log('🎭 Rendering CharacterNode with planning integration:', props.id);
      return (
        <CharacterNode
          {...props}
          projectId={projectId} // ✅ PLANNING INTEGRATION
          onDataChange={(newData: any) => {
            console.log('📝 CharacterNode data change:', props.id, newData);
            handleNodeDataChange(props.id, newData);
          }}
        />
      );
    };
    
    nodeTypeRegistry.plot = (props: any) => {
      console.log('📖 Rendering PlotNode with planning integration:', props.id);
      return (
        <PlotNode
          {...props}
          projectId={projectId} // ✅ PLANNING INTEGRATION
          onDataChange={(newData: any) => {
            console.log('📝 PlotNode data change:', props.id, newData);
            handleNodeDataChange(props.id, newData);
          }}
        />
      );
    };
    
    nodeTypeRegistry.location = (props: any) => {
      console.log('🗺️ Rendering LocationNode with planning integration:', props.id);
      return (
        <LocationNode
          {...props}
          projectId={projectId} // ✅ PLANNING INTEGRATION - FIXED!
          onDataChange={(newData: any) => {
            console.log('📝 LocationNode data change:', props.id, newData);
            handleNodeDataChange(props.id, newData);
          }}
        />
      );
    };
    
    // ✅ BASIC NODES - Standard implementation without planning integration
    nodeTypeRegistry.theme = (props: any) => {
      console.log('🎨 Rendering ThemeNode (basic):', props.id);
      return (
        <ThemeNode
          {...props}
          onDataChange={(newData: any) => {
            console.log('📝 ThemeNode data change:', props.id, newData);
            handleNodeDataChange(props.id, newData);
          }}
        />
      );
    };
    
    nodeTypeRegistry.conflict = (props: any) => {
      console.log('⚔️ Rendering ConflictNode (basic):', props.id);
      return (
        <ConflictNode
          {...props}
          onDataChange={(newData: any) => {
            console.log('📝 ConflictNode data change:', props.id, newData);
            handleNodeDataChange(props.id, newData);
          }}
        />
      );
    };
    
    nodeTypeRegistry.timeline = (props: any) => {
      console.log('📅 Rendering TimelineNode (basic):', props.id);
      return (
        <TimelineNode
          {...props}
          onDataChange={(newData: any) => {
            console.log('📝 TimelineNode data change:', props.id, newData);
            handleNodeDataChange(props.id, newData);
          }}
        />
      );
    };
    
    nodeTypeRegistry.research = (props: any) => {
      console.log('📚 Rendering ResearchNode (basic):', props.id);
      return (
        <ResearchNode
          {...props}
          onDataChange={(newData: any) => {
            console.log('📝 ResearchNode data change:', props.id, newData);
            handleNodeDataChange(props.id, newData);
          }}
        />
      );
    };
    
    return nodeTypeRegistry;
  }, [handleNodeDataChange, projectId]);

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

  // ✅ ENHANCED SYNC HANDLER - Support for ALL planning integration types
  const handleSync = useCallback(async () => {
    console.log('🔄 Starting canvas sync for all planning-integrated nodes...');
    setSyncStatus('syncing');
    
    try {
      await planningData.refresh();
      
      const updatedNodes = await Promise.all(
        nodes.map(async (node) => {
          if (node.data.fromPlanning && node.data.planningId) {
            
            // ✅ CHARACTER SYNC
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
            
            // ✅ PLOT THREAD SYNC
            if (node.type === 'plot') {
              const updatedPlotThread = planningData.plotThreads.find(
                p => p.id === node.data.planningId
              );
              if (updatedPlotThread) {
                console.log('🔄 Syncing plot node:', node.id, 'with planning data:', updatedPlotThread.title);
                return {
                  ...node,
                  data: {
                    ...node.data,
                    title: updatedPlotThread.title,
                    description: updatedPlotThread.description,
                    plotType: updatedPlotThread.type,
                    completion: updatedPlotThread.completion_percentage,
                    eventCount: updatedPlotThread.event_count,
                    color: updatedPlotThread.color,
                    tensionCurve: updatedPlotThread.tension_curve,
                    tags: updatedPlotThread.tags,
                    connectedCharacters: updatedPlotThread.connected_character_ids,
                    connectedThreads: updatedPlotThread.connected_thread_ids,
                    completeness_score: updatedPlotThread.completion_percentage
                  }
                };
              }
            }
            
            // ✅ LOCATION SYNC - NEW!
            if (node.type === 'location') {
              const updatedLocation = planningData.planningLocations.find(
                l => l.id === node.data.planningId
              );
              if (updatedLocation) {
                console.log('🔄 Syncing location node:', node.id, 'with planning data:', updatedLocation.name);
                return {
                  ...node,
                  data: {
                    ...node.data,
                    name: updatedLocation.name,
                    type: updatedLocation.type,
                    description: updatedLocation.description,
                    importance: updatedLocation.importance,
                    geography: updatedLocation.geography,
                    culture: updatedLocation.culture,
                    connectedCharacters: updatedLocation.connectedCharacters,
                    completeness_score: calculateLocationCompleteness(updatedLocation)
                  }
                };
              }
            }
          }
          return node;
        })
      );
      
      setNodes(updatedNodes);
      
      // Refresh auto-connections after sync
      refreshConnections();
      
      await forceSave();
      
      setSyncStatus('synced');
      setLastSynced(new Date());
      setHasChanges(false);
      console.log('✅ Canvas sync completed successfully for all node types');
    } catch (error) {
      console.error('❌ Sync failed:', error);
      setSyncStatus('error');
    }
  }, [planningData, nodes, forceSave, setNodes, refreshConnections]);

  // Helper function for location completeness calculation
  const calculateLocationCompleteness = useCallback((location: any) => {
    const requiredFields = ['name', 'type', 'description'];
    const optionalFields = ['geography', 'culture', 'connectedCharacters', 'importance'];
    
    const requiredComplete = requiredFields.every(field => location[field]);
    const optionalComplete = optionalFields.filter(field => {
      const value = location[field];
      if (field === 'geography' || field === 'culture') {
        return value && Object.keys(value).length > 0;
      }
      if (field === 'connectedCharacters') {
        return value && value.length > 0;
      }
      return value;
    }).length;
    
    return requiredComplete ? (50 + (optionalComplete / optionalFields.length) * 50) : 0;
  }, []);

  const loadTemplate = useCallback((templateId: string) => {
    try {
      const template = templates[templateId as keyof typeof templates];
      
      if (!template) {
        console.error(`Template "${templateId}" not found`);
        return;
      }

      setNodes([]);
      setUserEdges([]);
      
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
          target: newTargetId,
          data: { source: 'user_created' }
        };
      });
      
      setTimeout(() => {
        setNodes(newNodes);
        setUserEdges(newEdges);
        
        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ padding: 0.2 });
          }
        }, 100);
      }, 50);
      
    } catch (error) {
      console.error('Error loading template:', error);
    }
  }, [setNodes, reactFlowInstance]);

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
          target: newTargetId,
          data: { source: 'user_created' }
        };
      });

      setNodes(newNodes);
      setUserEdges(newEdges);
      
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2 });
        }
      }, 100);
    } catch (error) {
      console.error('Error loading sample data:', error);
    }
  }, [setNodes, reactFlowInstance]);

  // Updated onConnect to only affect user edges
  const onConnect = useCallback((params: Connection) => {
    const newEdge: ReactFlowEdge = {
      id: uuidv4(),
      source: params.source!,
      target: params.target!,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366F1', strokeWidth: 2 },
      data: { source: 'user_created' }
    };
    setUserEdges((eds) => [...eds, newEdge]);
  }, []);

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
              // Separate user edges when loading
              const loadedUserEdges = data.edges.filter((edge: any) => !edge.data?.source || edge.data.source === 'user_created');
              setUserEdges(loadedUserEdges);
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
  }, [setNodes, reactFlowInstance]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setUserEdges([]);
    setHasChanges(false);
  }, [setNodes]);

  const handleExport = useCallback((format: string) => {
    const exportData = {
      nodes,
      edges: combinedEdges, // Export all edges (user + auto)
      viewport: reactFlowInstance?.getViewport(),
      metadata: {
        projectId,
        exportedAt: new Date().toISOString(),
        nodeCount: nodes.length,
        edgeCount: combinedEdges.length,
        userEdgeCount: userEdges.length,
        autoEdgeCount: autoEdges.length,
        planningIntegrationNodes: nodes.filter(n => n.data.fromPlanning).length
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
  }, [nodes, combinedEdges, userEdges.length, autoEdges.length, reactFlowInstance, projectId]);

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

        {/* Connection Controls */}
        {nodes.length > 0 && (
          <ConnectionControls
            settings={connectionSettings}
            onToggle={toggleConnectionType}
            connectionCounts={{
              relationships: autoEdges.filter(e => e.data?.type === 'relationship').length,
              locations: autoEdges.filter(e => e.data?.type === 'location').length,
              plots: 0 // TODO: Implement plot connections
            }}
          />
        )}

        <ReactFlow
          nodes={nodes}
          edges={combinedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={(changes) => {
            // Only apply edge changes to user-created edges
            const userEdgeChanges = changes.filter(change => 
              userEdges.some(edge => edge.id === change.id)
            );
            if (userEdgeChanges.length > 0) {
              // Apply changes to userEdges
              const updatedUserEdges = userEdges.filter(edge => 
                !userEdgeChanges.some(change => change.id === edge.id && change.type === 'remove')
              );
              setUserEdges(updatedUserEdges);
            }
          }}
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
                Create and organize your story visually. Sync with your Planning Pages for seamless story development.
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Add story elements from the sidebar</p>
                <p>• Link Character, Plot & Location nodes to Planning data with ⚛ button</p>
                <p>• Character relationships appear automatically</p>
                <p>• Use connection controls to toggle relationship visibility</p>
                <p>• Use templates and samples to get started</p>
              </div>
            </div>
          </div>
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
        syncStatus={syncStatus}
        isOnline={isOnline}
        canvasMode={canvasMode}
        onModeChange={setCanvasMode}
        hasNodes={nodes.length > 0}
        nodeCount={nodes.length}
        edgeCount={combinedEdges.length}
        hasChanges={hasChanges}
      />

      {/* Integration Modal */}
      {showIntegrationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            <Integration onBack={() => setShowIntegrationsModal(false)} />
          </div>
        </div>
      )}
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
