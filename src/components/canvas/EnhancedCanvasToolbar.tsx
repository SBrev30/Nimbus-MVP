import React, { useState } from 'react';
import { 
  User, BookOpen, MapPin, Lightbulb, Zap, Calendar, FileText,
  Save, Upload, Sparkles, Cloud, CloudOff, Brain, Trash2,
  Download
} from 'lucide-react';

interface EnhancedCanvasToolbarProps {
  onCreateNode: (type: string) => void;
  onTemplate: (templateId: string) => void;
  onSave: () => void;
  onLoad: () => void;
  onLoadSample: (sampleId: string) => void;
  onClear: () => void;
  onExport?: (format: string) => void;
  lastSaved: Date | null;
  isSaving: boolean;
  selectedNodes: string[];
  onAnalyzeAI: () => void;
  isAnalyzing: boolean;
  syncStatus: string;
  isOnline: boolean;
  canvasMode: string;
  onModeChange: (mode: string) => void;
  hasNodes: boolean;
  nodeCount?: number;
  edgeCount?: number;
}

export const EnhancedCanvasToolbar: React.FC<EnhancedCanvasToolbarProps> = ({
  onCreateNode,
  onTemplate,
  onSave,
  onLoad,
  onLoadSample,
  onClear,
  onExport,
  lastSaved,
  isSaving,
  selectedNodes,
  onAnalyzeAI,
  isAnalyzing,
  syncStatus,
  isOnline,
  canvasMode,
  onModeChange,
  hasNodes,
  nodeCount = 0,
  edgeCount = 0
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const nodeTypes = [
    { type: 'character', icon: User, label: 'Character', color: 'bg-blue-100 text-blue-700' },
    { type: 'chapter', icon: BookOpen, label: 'Chapter', color: 'bg-green-100 text-green-700' },
    { type: 'location', icon: MapPin, label: 'Location', color: 'bg-purple-100 text-purple-700' },
    { type: 'idea', icon: Lightbulb, label: 'Idea', color: 'bg-yellow-100 text-yellow-700' },
    { type: 'plot', icon: Zap, label: 'Plot Point', color: 'bg-red-100 text-red-700' },
    { type: 'timeline', icon: Calendar, label: 'Timeline', color: 'bg-indigo-100 text-indigo-700' },
    { type: 'note', icon: FileText, label: 'Note', color: 'bg-gray-100 text-gray-700' }
  ];

  const templates = [
    { id: 'three-act', name: 'Three-Act Structure', description: 'Classic storytelling structure' },
    { id: 'heroes-journey', name: "Hero's Journey", description: 'Monomyth story structure' },
    { id: 'character-web', name: 'Character Relationship Web', description: 'Character connections' },
    { id: 'world-building', name: 'World Building Map', description: 'Fantasy/sci-fi world structure' }
  ];

  const samples = [
    { id: 'mystery-plot', name: 'Mystery Plot Example', description: 'Sample detective story structure' },
    { id: 'fantasy-world', name: 'Fantasy World', description: 'Example fantasy world map' },
    { id: 'character-arcs', name: 'Character Development', description: 'Sample character growth arcs' }
  ];

  const canvasModes = [
    { id: 'explore', name: 'Explore', icon: Sparkles, description: 'Free exploration mode' },
    { id: 'master', name: 'Master', icon: Brain, description: 'AI-generated master view' }
  ];

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never saved';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Node Creation */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 mr-4">
            {nodeTypes.map(({ type, icon: Icon, label, color }) => (
              <button
                key={type}
                onClick={() => onCreateNode(type)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${color}`}
                title={`Add ${label}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-300 mx-2" />

          {/* Templates & Samples */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Templates</span>
            </button>
            
            {showTemplates && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        onTemplate(template.id);
                        setShowTemplates(false);
                      }}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="font-medium text-gray-900">{template.name}</div>
                      <div className="text-sm text-gray-600">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSamples(!showSamples)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Samples</span>
            </button>
            
            {showSamples && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  {samples.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        onLoadSample(sample.id);
                        setShowSamples(false);
                      }}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="font-medium text-gray-900">{sample.name}</div>
                      <div className="text-sm text-gray-600">{sample.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Section - Canvas Mode & Stats */}
        <div className="flex items-center space-x-4">
          {/* Canvas Mode Selector */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {canvasModes.map(({ id, name, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => onModeChange(id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  canvasMode === id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={description}
              >
                <Icon className="w-4 h-4" />
                <span>{name}</span>
              </button>
            ))}
          </div>

          {/* Canvas Stats */}
          {hasNodes && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{nodeCount} nodes</span>
              <span>{edgeCount} connections</span>
              {selectedNodes.length > 0 && (
                <span className="text-blue-600">{selectedNodes.length} selected</span>
              )}
            </div>
          )}
        </div>

        {/* Right Section - Actions & Status */}
        <div className="flex items-center space-x-2">
          {/* AI Analysis */}
          <button
            onClick={onAnalyzeAI}
            disabled={isAnalyzing || !hasNodes}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isAnalyzing
                ? 'bg-purple-100 text-purple-700'
                : hasNodes
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Brain className={`w-4 h-4 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'AI Analysis'}</span>
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-300 mx-2" />

          {/* File Operations */}
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Save canvas"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} />
            <span className="hidden lg:inline">{isSaving ? 'Saving...' : 'Save'}</span>
          </button>

          <button
            onClick={onLoad}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Load canvas"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden lg:inline">Load</span>
          </button>

          {/* Export Menu */}
          {onExport && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden lg:inline">Export</span>
              </button>
              
              {showExportMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    {['PNG', 'SVG', 'PDF', 'JSON'].map((format) => (
                      <button
                        key={format}
                        onClick={() => {
                          onExport(format.toLowerCase());
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded-lg text-sm"
                      >
                        Export as {format}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clear Canvas */}
          {hasNodes && (
            <button
              onClick={onClear}
              className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear canvas"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden lg:inline">Clear</span>
            </button>
          )}

          {/* Sync Status */}
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Cloud className="w-4 h-4 text-green-600" title="Online" />
            ) : (
              <CloudOff className="w-4 h-4 text-red-600" title="Offline" />
            )}
            
            <div className="text-xs text-gray-500">
              <div>Last saved: {formatLastSaved(lastSaved)}</div>
              {syncStatus && (
                <div className="text-xs text-gray-400">{syncStatus}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Results */}
      {isAnalyzing && (
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
            <span className="text-purple-700 font-medium">Analyzing your story structure...</span>
          </div>
          <div className="mt-2 text-sm text-purple-600">
            Looking for plot holes, character inconsistencies, and narrative gaps.
          </div>
        </div>
      )}
    </div>
  );
};
