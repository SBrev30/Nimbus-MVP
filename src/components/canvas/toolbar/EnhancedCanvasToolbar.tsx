import React, { useState } from 'react';
import { 
  User, BookOpen, MapPin, Lightbulb, Zap, Calendar, FileText,
  Save, Upload, Sparkles, Cloud, CloudOff, Brain, Trash2,
  Download, Plus, RotateCcw
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
  edgeCount = 0,
}) => {
  const [activeSection, setActiveSection] = useState('nodes');

  const nodeTypes = [
    { type: 'character', label: 'Character', icon: User, color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' },
    { type: 'plot', label: 'Plot', icon: BookOpen, color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
    { type: 'location', label: 'Location', icon: MapPin, color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' },
    { type: 'theme', label: 'Theme', icon: Lightbulb, color: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100' },
    { type: 'conflict', label: 'Conflict', icon: Zap, color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' },
    { type: 'timeline', label: 'Timeline', icon: Calendar, color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' },
    { type: 'research', label: 'Research', icon: FileText, color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' },
  ];

  const templates = [
    { id: 'character-web', title: 'Character Web', description: 'Central character with relationship connections' },
    { id: 'three-act-structure', title: 'Three-Act Structure', description: 'Classic story structure with setup, confrontation, resolution' },
    { id: 'heros-journey', title: "Hero's Journey", description: "Campbell's monomyth structure" },
    { id: 'research-board', title: 'Research Board', description: 'Organized research nodes with tagging system' },
  ];

  const sampleStories = [
    { id: 'mystery-investigation', title: 'Mystery Investigation', description: 'Supernatural mystery with investigative journalist' },
    { id: 'fantasy-adventure', title: 'Fantasy Adventure', description: 'Epic fantasy with multiple characters and locations' },
    { id: 'sci-fi-thriller', title: 'Sci-Fi Thriller', description: 'Future dystopia with political intrigue' },
  ];

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 w-80">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Enhanced Canvas</h2>
            <p className="text-sm text-gray-600">Visual story planning</p>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Cloud className="w-4 h-4 text-green-500" />
            ) : (
              <CloudOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-gray-500 capitalize">{syncStatus}</span>
          </div>
        </div>
        
        {/* Canvas Stats */}
        {hasNodes && (
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span>{nodeCount} nodes</span>
            <span>{edgeCount} connections</span>
            {selectedNodes.length > 0 && <span>{selectedNodes.length} selected</span>}
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => onModeChange('exploratory')}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              canvasMode === 'exploratory'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Exploratory
          </button>
          <button
            onClick={() => onModeChange('master')}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              canvasMode === 'master'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Master View
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'nodes', label: 'Nodes' },
          { id: 'templates', label: 'Templates' },
          { id: 'samples', label: 'Samples' },
          { id: 'ai', label: 'AI Tools' }
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 py-3 px-2 text-xs font-medium transition-colors ${
              activeSection === section.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Nodes Section */}
        {activeSection === 'nodes' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Add Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              {nodeTypes.map(({ type, label, icon: Icon, color }) => (
                <button
                  key={type}
                  onClick={() => onCreateNode(type)}
                  className={`p-3 border rounded-lg transition-colors ${color}`}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs font-medium block">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Templates Section */}
        {activeSection === 'templates' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Story Templates</h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onTemplate(template.id)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-sm">{template.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sample Stories Section */}
        {activeSection === 'samples' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Sample Stories</h3>
            {!hasNodes ? (
              <div className="space-y-2">
                {sampleStories.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => onLoadSample(sample.id)}
                    className="w-full text-left p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="font-medium text-sm text-green-900">{sample.title}</div>
                    <div className="text-xs text-green-700 mt-1">{sample.description}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">Clear the canvas to load sample stories</p>
                <button
                  onClick={onClear}
                  className="mt-2 px-3 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded text-xs"
                >
                  Clear Canvas
                </button>
              </div>
            )}
          </div>
        )}

        {/* AI Tools Section */}
        {activeSection === 'ai' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">AI Analysis</h3>
            <button
              onClick={onAnalyzeAI}
              disabled={isAnalyzing || !hasNodes}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Brain className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isAnalyzing ? 'Analyzing...' : 'Analyze Story'}
              </span>
            </button>
            
            {!hasNodes && (
              <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                Add story elements to enable AI analysis
              </p>
            )}
            
            {selectedNodes.length > 0 && (
              <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
                <strong>{selectedNodes.length}</strong> elements selected for analysis
              </div>
            )}
            
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
              AI analysis provides insights into character development, plot holes, story structure, and thematic consistency.
            </div>
          </div>
        )}
      </div>

      {/* File Operations */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span className="text-sm">{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
          <button
            onClick={onLoad}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">Load</span>
          </button>
        </div>

        {/* Secondary Actions */}
        {hasNodes && (
          <div className="flex gap-2">
            {onExport && (
              <button
                onClick={() => onExport('json')}
                className="flex-1 flex items-center justify-center gap-1 py-1 px-2 bg-gray-50 text-gray-600 rounded text-xs hover:bg-gray-100 transition-colors"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
            )}
            <button
              onClick={onClear}
              className="flex-1 flex items-center justify-center gap-1 py-1 px-2 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
        )}

        {/* Status */}
        {lastSaved && (
          <div className="text-xs text-gray-500 text-center">
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};
