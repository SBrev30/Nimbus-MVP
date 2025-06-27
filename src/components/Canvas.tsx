import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  NodeTypes,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ImportedContentNode } from './ImportedContentNode';
import { useCanvasImports } from '../hooks/useCanvasImports';
import { Plus, Save, Trash2 } from 'lucide-react';

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  
  const { 
    importedNodes, 
    isLoading, 
    error, 
    updateNodePosition 
  } = useCanvasImports();

  // Register the imported content node type
  const nodeTypes: NodeTypes = useMemo(() => ({
    imported: ImportedContentNode
  }), []);

  // Combine regular nodes with imported nodes
  const allNodes = useMemo(() => {
    return [...nodes, ...importedNodes];
  }, [nodes, importedNodes]);

  // Handle node selection
  const onSelectionChange = useCallback(({ nodes }) => {
    setSelectedNodes(nodes.map((node: any) => node.id));
  }, []);

  // Handle node position changes
  const handleNodesChange = useCallback((changes: any[]) => {
    // Handle position updates for imported nodes
    changes.forEach(change => {
      if (change.type === 'position' && change.dragging === false) {
        const importedNode = importedNodes.find(n => n.id === change.id);
        if (importedNode && change.position) {
          const itemId = importedNode.data.importedItemId;
          updateNodePosition(itemId, change.position);
        }
      }
    });

    // Apply changes to regular nodes
    onNodesChange(changes.filter(change => 
      !importedNodes.some(n => n.id === change.id)
    ));
  }, [onNodesChange, importedNodes, updateNodePosition]);

  // Handle edge connections
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#6366F1' }
    }, eds));
  }, [setEdges]);

  // Delete selected nodes
  const deleteSelected = useCallback(() => {
    // Filter out imported nodes from selection
    const regularNodesToDelete = selectedNodes.filter(id => 
      !importedNodes.some(n => n.id === id)
    );
    
    // Delete regular nodes
    if (regularNodesToDelete.length > 0) {
      setNodes(nds => nds.filter(node => !regularNodesToDelete.includes(node.id)));
      setEdges(eds => eds.filter(edge => 
        !regularNodesToDelete.includes(edge.source) && !regularNodesToDelete.includes(edge.target)
      ));
    }
    
    // For imported nodes, we would need to call removeFromCanvas
    // This is not implemented here as it would require passing that function
  }, [selectedNodes, importedNodes, setNodes, setEdges]);

  return (
    <div className="h-screen w-full">
      <ReactFlow
        nodes={allNodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'imported':
                const contentType = node.data?.contentType;
                switch (contentType) {
                  case 'character': return '#93C5FD'; // blue-300
                  case 'plot': return '#86EFAC'; // green-300
                  case 'research': return '#D8B4FE'; // purple-300
                  case 'chapter': return '#FDBA74'; // orange-300
                  default: return '#E5E7EB'; // gray-300
                }
              default:
                return '#E5E7EB'; // gray-300
            }
          }}
        />
        
        <Panel position="top-right" className="bg-white p-2 rounded-lg shadow-md">
          <div className="flex flex-col gap-2">
            <button
              onClick={deleteSelected}
              disabled={selectedNodes.length === 0}
              className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete selected"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </Panel>
        
        {isLoading && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white py-2 px-4 rounded-full shadow-md">
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-sm">Loading canvas items...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 py-2 px-4 rounded-full shadow-md">
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {allNodes.length === 0 && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Canvas is Empty</h3>
              <p className="text-gray-600 mb-4">
                Add items from your library to start organizing your content visually.
              </p>
              <p className="text-sm text-gray-500">
                Go to the Library tab and click "Add to Canvas" on any item.
              </p>
            </div>
          </div>
        )}
      </ReactFlow>
    </div>
  );
}