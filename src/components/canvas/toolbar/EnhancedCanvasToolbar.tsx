import React, { useState } from 'react';
import { 
  User, BookOpen, MapPin, Lightbulb, Zap, Calendar, FileText,
  RefreshCw, Upload, Sparkles, Cloud, CloudOff, Brain, Trash2,
  Download, Plus, RotateCcw, ArrowLeft
} from 'lucide-react';

interface EnhancedCanvasToolbarProps {
  onCreateNode: (type: string) => void;
  onTemplate: (templateId: string) => void;
  onSync: () => void;
  onLoad: () => void;
  onLoadSample: (sampleId: string) => void;
  onClear: () => void;
  onBack: () => void;
  onExport?: (format: string) => void;
  lastSynced: Date | null;
  isSyncing: boolean;
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
  hasChanges?: boolean;
}

export const EnhancedCanvasToolbar: React.FC<EnhancedCanvasToolbarProps> = ({
  onCreateNode,
  onTemplate,
  onSync,
  onLoad,
  onLoadSample,
  onClear,
  onBack,
  onExport,
  lastSynced,
  isSyncing,
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
  hasChanges = false
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

  const sections = [
    { id: 'nodes', label: 'Elements' },
    { id: 'templates', label: 'Templates' },
    { id: 'samples', label: 'Samples' },
    { id: 'ai', label: 'AI Tools' },
  ];

  // Get sync status indicator
  const getSyncStatusIndicator = () => {
    if (isSyncing) {
      return { icon: RefreshCw, color: 'text-blue-600', label: 'Syncing...', spinning: true };
    }
    if (hasChanges) {
      return { icon: RefreshCw, color: 'text-orange-600', label: 'Changes to sync', spinning: false };
    }
    if (syncStatus === 'synced') {
      return { icon: Cloud, color: 'text-green-600', label: 'Synced', spinning: false };
    }
    if (syncStatus === 'error') {
      return { icon: CloudOff, color: 'text-red-600', label: 'Sync error', spinning: false };
    }
    return { icon: Cloud, color: 'text-gray-400', label: 'Ready to sync', spinning: false };
  };

  const statusIndicator = getSyncStatusIndicator();
  const StatusIcon = statusIndicator.icon;

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 w-80">
      {/* Header with Back Button */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to main view"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Visual Canvas</h2>
            <p className="text-sm text-gray-600">Plan your story visually</p>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <StatusIcon 
                className={`w-4 h-4 ${statusIndicator.color} ${statusIndicator.spinning ? 'animate-spin' : ''}`} 
              />
            ) : (
              <CloudOff className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Canvas Stats */}
        {hasNodes && (
          <div className="flex gap-4 text-xs text-gray-500">
            <span>{nodeCount} elements</span>
            <span>{edgeCount} connections</span>
            <span className="capitalize">{canvasMode} mode</span>
          </div>
        )}
      </div>

      {/* Section Tabs */}
      <div className="border-b border-gray-200">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-sm">{sample.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{sample.description}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">Clear canvas to load samples</p>
                <button
                  onClick={onClear}
                  className="mt-2 text-xs text-red-600 hover:text-red-700"
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
              className="w-full flex items-center justify-center gap-2 p-3 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Brain className={`w-4 h-4 ${isAnalyzing ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium">
                {isAnalyzing ? 'Analyzing...' : 'Analyze Story Structure'}
              </span>
            </button>
            {!hasNodes && (
              <p className="text-xs text-gray-500 text-center">
                Add story elements to enable AI analysis
              </p>
            )}
          </div>
        )}
      </div>

      {/* File Operations */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onSync}
            disabled={isSyncing}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors disabled:opacity-50 ${
              hasChanges 
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            title="Sync with Planning Pages"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="text-sm">{isSyncing ? 'Syncing...' : 'Sync'}</span>
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

        {/* Sync Status */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          {lastSynced && (
            <div>Last synced: {lastSynced.toLocaleTimeString()}</div>
          )}
          {hasChanges && !isSyncing && (
            <div className="text-orange-600 font-medium">
              Changes pending sync
            </div>
          )}
          <div className="text-gray-400">
            {statusIndicator.label}
          </div>
        </div>
      </div>
    </div>
  );
};
