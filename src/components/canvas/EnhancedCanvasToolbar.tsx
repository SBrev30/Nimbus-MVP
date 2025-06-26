import React, { useState } from 'react';
import {
  Plus,
  User,
  BookOpen,
  FileText,
  Network,
  Save,
  Upload,
  Brain,
  Cloud,
  CloudOff,
  Zap,
  TrendingUp,
  Users,
  MoreHorizontal,
  Lightbulb,
  Target,
  RefreshCw
} from 'lucide-react';

interface EnhancedCanvasToolbarProps {
  onCreateNode: (type: string) => void;
  onTemplate: (templateId: string) => void;
  onSave: () => void;
  onLoad: () => void;
  lastSaved: Date | null;
  isSaving: boolean;
  selectedNodes: string[];
  onAnalyzeAI: (analysisType?: string) => void;
  isAnalyzing: boolean;
  syncStatus: string;
  isOnline: boolean;
  onShowAIPanel: () => void;
  aiResults: any[];
}

export const EnhancedCanvasToolbar: React.FC<EnhancedCanvasToolbarProps> = ({
  onCreateNode,
  onTemplate,
  onSave,
  onLoad,
  lastSaved,
  isSaving,
  selectedNodes,
  onAnalyzeAI,
  isAnalyzing,
  syncStatus,
  isOnline,
  onShowAIPanel,
  aiResults
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAIOptions, setShowAIOptions] = useState(false);

  const templates = [
    {
      id: 'character-web',
      name: 'Character Web',
      description: 'Central character with relationship connections',
      icon: <Network size={16} />,
      color: 'blue'
    },
    {
      id: 'three-act-structure',
      name: 'Three-Act Structure',
      description: 'Classic story structure with setup, confrontation, resolution',
      icon: <BookOpen size={16} />,
      color: 'purple'
    },
    {
      id: 'heros-journey',
      name: "Hero's Journey",
      description: "Campbell's monomyth structure",
      icon: <User size={16} />,
      color: 'yellow'
    },
    {
      id: 'research-board',
      name: 'Research Board',
      description: 'Organized research and world-building workspace',
      icon: <FileText size={16} />,
      color: 'green'
    }
  ];

  const aiAnalysisOptions = [
    {
      id: 'auto',
      name: 'Smart Analysis',
      description: 'AI automatically analyzes all story elements',
      icon: <Brain size={16} />,
      color: 'indigo'
    },
    {
      id: 'character',
      name: 'Character Analysis',
      description: 'Analyze character development and traits',
      icon: <Users size={16} />,
      color: 'green'
    },
    {
      id: 'story-coherence',
      name: 'Story Coherence',
      description: 'Check plot consistency and identify holes',
      icon: <TrendingUp size={16} />,
      color: 'blue'
    },
    {
      id: 'relationships',
      name: 'Suggest Relations',
      description: 'Recommend character and plot connections',
      icon: <Users size={16} />,
      color: 'pink'
    },
    {
      id: 'character-arcs',
      name: 'Character Arcs',
      description: 'Analyze character development through story',
      icon: <Zap size={16} />,
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
      purple: 'bg-purple-100 hover:bg-purple-200 text-purple-800',
      yellow: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
      green: 'bg-green-100 hover:bg-green-200 text-green-800',
      indigo: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800',
      pink: 'bg-pink-100 hover:bg-pink-200 text-pink-800',
      orange: 'bg-orange-100 hover:bg-orange-200 text-orange-800'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 hover:bg-gray-200 text-gray-800';
  };

  const hasAIResults = aiResults && aiResults.length > 0;
  const successfulAnalyses = hasAIResults ? aiResults.filter(r => r.success).length : 0;

  return (
    <div className="canvas-toolbar h-full overflow-y-auto">
      {/* Add Node Section */}
      <div className="toolbar-section">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Plus size={16} />
          Add Elements
        </h4>
        <div className="grid grid-cols-1 gap-2">
          <button 
            onClick={() => onCreateNode('character')}
            className="flex items-center gap-3 px-3 py-3 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors text-sm font-medium"
          >
            <User size={18} />
            <div className="text-left">
              <div className="font-medium">Character</div>
              <div className="text-xs opacity-75">Add a story character</div>
            </div>
          </button>
          <button 
            onClick={() => onCreateNode('plot')}
            className="flex items-center gap-3 px-3 py-3 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors text-sm font-medium"
          >
            <BookOpen size={18} />
            <div className="text-left">
              <div className="font-medium">Plot Point</div>
              <div className="text-xs opacity-75">Add story events</div>
            </div>
          </button>
          <button 
            onClick={() => onCreateNode('research')}
            className="flex items-center gap-3 px-3 py-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg transition-colors text-sm font-medium"
          >
            <FileText size={18} />
            <div className="text-left">
              <div className="font-medium">Research</div>
              <div className="text-xs opacity-75">Add notes & references</div>
            </div>
          </button>
        </div>
      </div>

      {/* Templates Section */}
      <div className="toolbar-section">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Target size={16} />
            Templates
          </h4>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
        
        {showTemplates ? (
          <div className="space-y-2">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => {
                  onTemplate(template.id);
                  setShowTemplates(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-sm ${getColorClasses(template.color)}`}
              >
                {template.icon}
                <div className="text-left flex-1">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs opacity-75">{template.description}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onTemplate('character-web')}
              className="flex flex-col items-center gap-1 px-2 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors text-xs font-medium"
            >
              <Network size={16} />
              Character Web
            </button>
            <button 
              onClick={() => onTemplate('three-act-structure')}
              className="flex flex-col items-center gap-1 px-2 py-3 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-colors text-xs font-medium"
            >
              <BookOpen size={16} />
              Three-Act
            </button>
          </div>
        )}
      </div>

      {/* AI Analysis Section */}
      <div className="toolbar-section">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Brain size={16} />
            AI Assistant
            {hasAIResults && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                {successfulAnalyses}
              </span>
            )}
          </h4>
          <button
            onClick={() => setShowAIOptions(!showAIOptions)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>

        {/* Quick AI Actions */}
        <div className="space-y-2 mb-3">
          <button 
            onClick={() => onAnalyzeAI()}
            disabled={isAnalyzing}
            className="w-full flex items-center gap-3 px-3 py-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isAnalyzing ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Brain size={18} />
            )}
            <div className="text-left flex-1">
              <div className="font-medium">
                {isAnalyzing ? 'Analyzing...' : 'Smart Analysis'}
              </div>
              <div className="text-xs opacity-75">
                {isAnalyzing ? 'AI is working...' : 'Auto-analyze all elements'}
              </div>
            </div>
          </button>

          {hasAIResults && (
            <button 
              onClick={onShowAIPanel}
              className="w-full flex items-center gap-3 px-3 py-3 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors text-sm font-medium"
            >
              <Lightbulb size={18} />
              <div className="text-left flex-1">
                <div className="font-medium">View Results</div>
                <div className="text-xs opacity-75">{successfulAnalyses} analyses ready</div>
              </div>
            </button>
          )}
        </div>

        {/* Specific AI Options */}
        {showAIOptions && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-600 mb-2">Specific Analysis:</div>
            {aiAnalysisOptions.slice(1).map(option => (
              <button
                key={option.id}
                onClick={() => {
                  onAnalyzeAI(option.id);
                  setShowAIOptions(false);
                }}
                disabled={isAnalyzing}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${getColorClasses(option.color)} disabled:opacity-50`}
              >
                {option.icon}
                <div className="text-left flex-1">
                  <div className="font-medium text-xs">{option.name}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Save/Load Section */}
      <div className="toolbar-section">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Save size={16} />
          Save & Load
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onSave}
            disabled={isSaving}
            className="flex flex-col items-center gap-2 px-3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Save size={16} />
            <span className="text-xs">{isSaving ? 'Saving...' : 'Export'}</span>
          </button>
          <button 
            onClick={onLoad}
            className="flex flex-col items-center gap-2 px-3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm font-medium"
          >
            <Upload size={16} />
            <span className="text-xs">Import</span>
          </button>
        </div>
        
        {lastSaved && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Cloud Sync Status */}
      <div className="toolbar-section">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Cloud size={16} className="text-green-500" />
            ) : (
              <CloudOff size={16} className="text-red-500" />
            )}
            <div>
              <div className="text-sm font-medium text-gray-700">
                {isOnline ? 'Online' : 'Offline'}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {syncStatus}
              </div>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${
            syncStatus === 'synced' ? 'bg-green-500' :
            syncStatus === 'syncing' ? 'bg-yellow-500' :
            syncStatus === 'error' ? 'bg-red-500' :
            'bg-gray-500'
          }`} />
        </div>
      </div>

      {/* Usage Stats (if AI results available) */}
      {hasAIResults && (
        <div className="toolbar-section">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp size={16} />
            Analysis Summary
          </h4>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{successfulAnalyses}</div>
              <div className="text-xs text-blue-600">Completed</div>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {hasAIResults ? Math.round(aiResults.reduce((acc, r) => acc + r.confidence, 0) / aiResults.length * 100) : 0}%
              </div>
              <div className="text-xs text-green-600">Confidence</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
