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
import { 
  Database, 
  LayoutDashboard, 
  Settings, 
  BarChart3, 
  BookOpen, 
  FileText, 
  DollarSign, 
  Gift, 
  Smartphone, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Bell,
  User,
  ExternalLink,
  Minus,
  Plus,
  Save,
  Upload,
  Download,
  Trash2,
  Copy,
  Play,
  Zap,
  Users,
  MapPin,
  Layers,
  Clock,
  Brain,
  Palette,
  Globe,
  Cloud,
  CloudOff
} from 'lucide-react';

// Nimbus Note Logo Component
const NimbusLogo = ({ size = 24 }: { size?: number }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-${size/4} h-${size/4} bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center`}>
      <Cloud className={`w-${size/6} h-${size/6} text-white`} />
    </div>
    <span className="font-bold text-gray-900">Nimbus Note</span>
  </div>
);

// Enhanced Canvas Sidebar Component
const EnhancedCanvasSidebar = ({ 
  onCreateNode,
  onTemplate,
  onSave,
  onLoad,
  onLoadSample,
  onClear,
  lastSaved,
  isSaving,
  onAnalyzeAI,
  isAnalyzing,
  syncStatus,
  isOnline,
  canvasMode,
  onModeChange,
  hasNodes,
  selectedNodes
}: any) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['create-nodes', 'canvas-settings']);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isExpanded = (itemId: string) => expandedItems.includes(itemId);

  const nodeTypes = [
    { id: 'character', label: 'Character', icon: Users, color: 'bg-green-100 text-green-800' },
    { id: 'plot', label: 'Plot Point', icon: BookOpen, color: 'bg-red-100 text-red-800' },
    { id: 'location', label: 'Location', icon: MapPin, color: 'bg-purple-100 text-purple-800' },
    { id: 'theme', label: 'Theme', icon: Palette, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'conflict', label: 'Conflict', icon: Zap, color: 'bg-orange-100 text-orange-800' },
    { id: 'research', label: 'Research', icon: Database, color: 'bg-blue-100 text-blue-800' },
    { id: 'timeline', label: 'Timeline', icon: Clock, color: 'bg-cyan-100 text-cyan-800' }
  ];

  const templates = [
    { id: 'mystery', label: 'Mystery Novel' },
    { id: 'fantasy', label: 'Fantasy Adventure' },
    { id: 'romance', label: 'Romance Story' },
    { id: 'scifi', label: 'Sci-Fi Thriller' },
    { id: 'blank', label: 'Blank Canvas' }
  ];

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'synced': return <Cloud className="w-4 h-4 text-green-500" />;
      case 'syncing': return <Cloud className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'error': return <CloudOff className="w-4 h-4 text-red-500" />;
      default: return <CloudOff className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-80'
    } flex flex-col h-full`}>
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isCollapsed ? (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-white" />
              </div>
            ) : (
              <NimbusLogo size={32} />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              {getSyncStatusIcon()}
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="mt-2 text-sm text-gray-500">Visual Story Canvas</div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          
          {/* Canvas Overview */}
          <li>
            <button className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg bg-gray-100 text-gray-900">
              <div className="flex items-center space-x-3">
                <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Canvas Overview</span>}
              </div>
            </button>
          </li>

          {/* Create Nodes Section */}
          <li>
            <button
              onClick={() => toggleExpanded('create-nodes')}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
            >
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Create Elements</span>}
              </div>
              {!isCollapsed && (
                <div className="flex-shrink-0">
                  {isExpanded('create-nodes') ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              )}
            </button>

            {!isCollapsed && isExpanded('create-nodes') && (
              <ul className="mt-1 ml-8 space-y-1">
                {nodeTypes.map((nodeType) => (
                  <li key={nodeType.id}>
                    <button
                      onClick={() => onCreateNode(nodeType.id)}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                    >
                      <nodeType.icon className="w-4 h-4 flex-shrink-0" />
                      <span>{nodeType.label}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${nodeType.color}`}>
                        {nodeType.id}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Templates */}
          <li>
            <button
              onClick={() => toggleExpanded('templates')}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
            >
              <div className="flex items-center space-x-3">
                <Layers className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Templates</span>}
              </div>
              {!isCollapsed && (
                <div className="flex-shrink-0">
                  {isExpanded('templates') ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              )}
            </button>

            {!isCollapsed && isExpanded('templates') && (
              <ul className="mt-1 ml-8 space-y-1">
                {templates.map((template) => (
                  <li key={template.id}>
                    <button
                      onClick={() => onTemplate(template.id)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                    >
                      {template.label}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={onLoadSample}
                    className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                  >
                    Load Sample Story
                  </button>
                </li>
              </ul>
            )}
          </li>

          {/* Analysis Tools */}
          <li>
            <button
              onClick={() => toggleExpanded('analysis')}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
            >
              <div className="flex items-center space-x-3">
                <Brain className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">AI Analysis</span>}
              </div>
              {!isCollapsed && (
                <div className="flex-shrink-0">
                  {isExpanded('analysis') ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              )}
            </button>

            {!isCollapsed && isExpanded('analysis') && (
              <ul className="mt-1 ml-8 space-y-1">
                <li>
                  <button
                    onClick={onAnalyzeAI}
                    disabled={isAnalyzing || !hasNodes}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Story'}</span>
                  </button>
                </li>
              </ul>
            )}
          </li>

          {/* File Operations */}
          <li>
            <button
              onClick={() => toggleExpanded('file-ops')}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">File Operations</span>}
              </div>
              {!isCollapsed && (
                <div className="flex-shrink-0">
                  {isExpanded('file-ops') ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              )}
            </button>

            {!isCollapsed && isExpanded('file-ops') && (
              <ul className="mt-1 ml-8 space-y-1">
                <li>
                  <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Canvas'}</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={onLoad}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Load Canvas</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={onClear}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Canvas</span>
                  </button>
                </li>
              </ul>
            )}
          </li>

          {/* Canvas Settings */}
          <li>
            <button
              onClick={() => toggleExpanded('canvas-settings')}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
            >
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Canvas Settings</span>}
              </div>
              {!isCollapsed && (
                <div className="flex-shrink-0">
                  {isExpanded('canvas-settings') ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              )}
            </button>

            {!isCollapsed && isExpanded('canvas-settings') && (
              <ul className="mt-1 ml-8 space-y-1">
                <li>
                  <div className="px-3 py-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="canvasMode"
                        checked={canvasMode === 'exploratory'}
                        onChange={() => onModeChange('exploratory')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-600">Exploratory Mode</span>
                    </label>
                  </div>
                </li>
                <li>
                  <div className="px-3 py-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="canvasMode"
                        checked={canvasMode === 'master'}
                        onChange={() => onModeChange('master')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-600">Master Mode</span>
                    </label>
                  </div>
                </li>
              </ul>
            )}
          </li>

          {/* Help & Support */}
          <li>
            <button className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150">
              <div className="flex items-center space-x-3">
                <HelpCircle className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Help & Support</span>}
              </div>
            </button>
          </li>
        </ul>
      </nav>

      {/* Status Bar */}
      {!isCollapsed && (
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              {getSyncStatusIcon()}
              <span className="text-gray-600">
                {syncStatus === 'synced' && 'Synced'}
                {syncStatus === 'syncing' && 'Syncing...'}
                {syncStatus === 'error' && 'Sync Error'}
                {syncStatus === 'offline' && 'Offline'}
              </span>
            </div>
            {lastSaved && (
              <span className="text-gray-500 text-xs">
                {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          {selectedNodes.length > 0 && (
            <div className="mt-2 text-xs text-blue-600">
              {selectedNodes.length} element{selectedNodes.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      )}

      {/* Bottom section */}
      <div className="border-t border-gray-200">
        {/* User profile */}
        <div className="p-3">
          <div className={`flex items-center space-x-3 p-3 rounded-lg bg-gray-50 ${
            isCollapsed ? 'justify-center' : ''
          }`}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">U</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">User</div>
                <div className="text-sm text-gray-500">Creator</div>
              </div>
            )}
            {!isCollapsed && (
              <div className="flex space-x-1">
                <button className="p-1 hover:bg-gray-200 rounded">
                  <Bell className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <User className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <Settings className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Collapse/Expand button */}
        <div className="p-3">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150"
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4 rotate-90" />
            ) : (
              <div className="flex items-center space-x-2">
                <Minus className="w-4 h-4" />
                <span className="font-medium">Collapse</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Canvas Component (simplified for demo)
const CanvasFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [visualizationMode, setVisualizationMode] = useState('canvas');
  const [canvasMode, setCanvasMode] = useState<'exploratory' | 'master'>('exploratory');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date());
  const [isSaving, setIsSaving] = useState(false);

  // Mock functions for demo
  const createNode = useCallback((type: string) => {
    const id = uuidv4();
    const newNode: Node = {
      id,
      type: 'default',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `New ${type}` }
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
    }, 1000);
  }, []);

  const handleAnalyzeAI = useCallback(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      alert('AI Analysis complete! (Demo)');
    }, 2000);
  }, []);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
    setSelectedNodes(selectedNodes.map(node => node.id));
  }, []);

  return (
    <div className="h-screen bg-[#F9FAFB] flex font-inter">
      {/* Enhanced Canvas Sidebar */}
      <EnhancedCanvasSidebar
        onCreateNode={createNode}
        onTemplate={(id: string) => alert(`Loading template: ${id}`)}
        onSave={handleSave}
        onLoad={() => alert('Load dialog would open')}
        onLoadSample={() => alert('Loading sample data...')}
        onClear={() => {
          setNodes([]);
          setEdges([]);
        }}
        lastSaved={lastSaved}
        isSaving={isSaving}
        onAnalyzeAI={handleAnalyzeAI}
        isAnalyzing={isAnalyzing}
        syncStatus="synced"
        isOnline={true}
        canvasMode={canvasMode}
        onModeChange={setCanvasMode}
        hasNodes={nodes.length > 0}
        selectedNodes={selectedNodes}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Visualization Mode Selector */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex space-x-4">
            {['canvas', 'timeline', 'relationships', 'influence'].map((mode) => (
              <button
                key={mode}
                onClick={() => setVisualizationMode(mode)}
                className={`px-4 py-2 rounded-lg capitalize font-medium transition-colors ${
                  visualizationMode === mode
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
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
              connectionLineType={ConnectionLineType.SmoothStep}
              fitView
              className="bg-[#F9FAFB]"
              nodesDraggable={canvasMode === 'exploratory'}
              nodesConnectable={canvasMode === 'exploratory'}
              elementsSelectable={true}
            >
              <Background color="#E2E8F0" size={1} />
              <Controls />
              <MiniMap />
            </ReactFlow>
          )}

          {visualizationMode !== 'canvas' && (
            <div className="flex-1 p-8 bg-white">
              <h3 className="text-lg font-semibold mb-4 capitalize">{visualizationMode} View</h3>
              <p className="text-gray-600">
                {visualizationMode === 'timeline' && 'Timeline visualization of your story events.'}
                {visualizationMode === 'relationships' && 'Character and element relationship analysis.'}
                {visualizationMode === 'influence' && 'Character influence mapping and network analysis.'}
              </p>
            </div>
          )}

          {/* Welcome Message */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200 max-w-md">
                <div className="text-4xl mb-4">☁️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome to Nimbus Note
                </h3>
                <p className="text-[#889096] mb-4">
                  Create and visualize your story with our enhanced visual canvas.
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• Use the sidebar to create story elements</p>
                  <p>• Try templates for quick starts</p>
                  <p>• Switch between different view modes</p>
                  <p>• Analyze your story with AI insights</p>
                </div>
              </div>
            </div>
          )}
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

export default Canvas;
