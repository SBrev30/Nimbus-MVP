import React, { useState } from 'react';
import { 
  User, BookOpen, MapPin, Lightbulb, Zap, Calendar, FileText,
  RefreshCw, Upload, Cloud, CloudOff, Brain, Trash2,
  Download, ChevronDown, ChevronUp, PanelRightClose,
  Plus, Sparkles
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

// Enhanced Tooltip Component
const Tooltip = ({ content, children, position = 'left' }: { 
  content: string; 
  children: React.ReactNode;
  position?: 'right' | 'left' | 'top' | 'bottom';
}) => {
  const positionClasses = {
    right: 'left-16 top-1/2 transform -translate-y-1/2',
    left: 'right-16 top-1/2 transform -translate-y-1/2',
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2'
  };

  return (
    <div className="relative group">
      {children}
      <div className={`absolute ${positionClasses[position]} px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[300] whitespace-nowrap shadow-lg`}>
        {content}
        {/* Arrow for tooltip */}
        {position === 'left' && (
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
        )}
      </div>
    </div>
  );
};

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
  // Toolbar collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Accordion sections state
  const [expandedSections, setExpandedSections] = useState<string[]>(['elements']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isSectionExpanded = (sectionId: string) => expandedSections.includes(sectionId);

  const nodeTypes = [
    { type: 'character', label: 'Character', icon: User, color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' },
    { type: 'plot', label: 'Plot', icon: BookOpen, color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
    { type: 'location', label: 'Location', icon: MapPin, color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' },
    { type: 'theme', label: 'Theme', icon: Lightbulb, color: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100' },
    { type: 'conflict', label: 'Conflict', icon: Zap, color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' },
    { type: 'timeline', label: 'Timeline', icon: Calendar, color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' },
    { type: 'research', label: 'Research', icon: FileText, color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' },
  ];

  // Use IDs that actually exist in templates.ts
  const templates = [
    { id: 'heroJourney', title: 'Hero\'s Journey', description: 'Classic monomyth structure' },
    { id: 'threeAct', title: 'Three-Act Structure', description: 'Setup, confrontation, resolution' },
    { id: 'mysteryStructure', title: 'Mystery Structure', description: 'Detective story template' },
    { id: 'fantasyQuest', title: 'Fantasy Quest', description: 'Epic fantasy adventure' },
  ];

  // UPDATED: Remove Neural Echo (sciFiThriller) sample story
  const sampleStories = [
    { id: 'mysteryNovel', title: 'Lighthouse Mystery', description: 'Detective mystery story' },
    { id: 'fantasyEpic', title: 'Shattered Crown', description: 'Fantasy epic adventure' },
  ];

  // Get sync status indicator
  const getSyncStatusIndicator = () => {
    if (isSyncing) {
      return { icon: RefreshCw, color: 'text-blue-600', label: 'Syncing...', spinning: true };
    }
    if (hasChanges) {
      return { icon: RefreshCw, color: 'text-orange-600', label: 'Changes pending', spinning: false };
    }
    if (syncStatus === 'synced') {
      return { icon: Cloud, color: 'text-green-600', label: 'Synced', spinning: false };
    }
    if (syncStatus === 'error') {
      return { icon: CloudOff, color: 'text-red-600', label: 'Sync error', spinning: false };
    }
    return { icon: Cloud, color: 'text-gray-400', label: 'Ready', spinning: false };
  };

  const statusIndicator = getSyncStatusIndicator();
  const StatusIcon = statusIndicator.icon;

  // Accordion Section Component
  const AccordionSection = ({ 
    id, 
    title, 
    children, 
    icon: Icon 
  }: { 
    id: string; 
    title: string; 
    children: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
  }) => {
    const isExpanded = isSectionExpanded(id);
    
    return (
      <div className="border-b border-gray-100 last:border-b-0">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150"
        >
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="w-4 h-4 text-gray-600" />}
            <span className="font-medium text-gray-900 text-sm">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4">
            {children}
          </div>
        )}
      </div>
    );
  };

  if (isCollapsed) {
    return (
      <div className="h-full flex flex-col bg-white border-l border-gray-200 w-16">
        {/* Collapsed Header - REMOVED back button arrow */}
        <div className="p-2 border-b border-gray-200 flex flex-col items-center space-y-2">
          <Tooltip content={statusIndicator.label}>
            <div className="p-2">
              <StatusIcon 
                className={`w-4 h-4 ${statusIndicator.color} ${statusIndicator.spinning ? 'animate-spin' : ''}`} 
              />
            </div>
          </Tooltip>
        </div>

        {/* Collapsed Quick Actions */}
        <div className="flex-1 py-2">
          <div className="space-y-1 px-2">
            {nodeTypes.slice(0, 4).map(({ type, label, icon: Icon }) => (
              <Tooltip key={type} content={`Add ${label}`}>
                <button
                  onClick={() => onCreateNode(type)}
                  className="w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-600 mx-auto" />
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Collapsed Footer */}
        <div className="p-2 border-t border-gray-200 space-y-1">
          {/* UPDATED: Only show sync button when there are changes or sync is needed */}
          {hasChanges && (
            <Tooltip content="Sync with Planning">
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="w-full p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 mx-auto ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </Tooltip>
          )}
          
          <Tooltip content="Expand Toolbar">
            <button 
              onClick={() => setIsCollapsed(false)}
              className="w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <PanelRightClose className="w-4 h-4 text-gray-600 mx-auto rotate-180" />
            </button>
          </Tooltip>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 w-80">
      {/* Header - REMOVED back button with arrow */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <StatusIcon 
              className={`w-4 h-4 ${statusIndicator.color} ${statusIndicator.spinning ? 'animate-spin' : ''}`} 
            />
            <span className="text-xs text-gray-500">{statusIndicator.label}</span>
          </div>
        </div>

        {/* Canvas Stats */}
        {hasNodes && (
          <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
            <span>{nodeCount} elements</span>
            <span>{edgeCount} connections</span>
            <span className="capitalize">{canvasMode}</span>
          </div>
        )}
      </div>

      {/* Accordion Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Elements Section */}
        <AccordionSection id="elements" title="Story Elements" icon={Plus}>
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
        </AccordionSection>

        {/* Templates Section */}
        <AccordionSection id="templates" title="Story Templates" icon={Sparkles}>
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
        </AccordionSection>

        {/* Sample Stories Section */}
        <AccordionSection id="samples" title="Sample Stories" icon={BookOpen}>
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
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm mb-2">Clear canvas to load samples</p>
              <button
                onClick={onClear}
                className="text-xs text-red-600 hover:text-red-700 px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
              >
                Clear Canvas
              </button>
            </div>
          )}
        </AccordionSection>

        {/* AI Tools Section */}
        <AccordionSection id="ai" title="AI Analysis" icon={Brain}>
          <button
            onClick={onAnalyzeAI}
            disabled={isAnalyzing || !hasNodes}
            className="w-full flex items-center justify-center gap-2 p-3 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Brain className={`w-4 h-4 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">
              {isAnalyzing ? 'Analyzing...' : 'Analyze Story'}
            </span>
          </button>
          {!hasNodes && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Add elements to enable analysis
            </p>
          )}
        </AccordionSection>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-2">
          {/* UPDATED: Only show sync button when there are actual changes */}
          {hasChanges ? (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="text-sm">{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2 px-3 bg-green-100 text-green-700 rounded-lg">
              <Cloud className="w-4 h-4" />
              <span className="text-sm">Synced</span>
            </div>
          )}
          
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
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-gray-50 text-gray-600 rounded text-xs hover:bg-gray-100 transition-colors"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
            )}
            <button
              onClick={onClear}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
        )}

        {/* Collapse Button */}
        <button 
          onClick={() => setIsCollapsed(true)}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
        >
          <PanelRightClose className="w-4 h-4" />
          <span className="text-sm font-medium">Collapse</span>
        </button>

        {/* Status Footer */}
        {lastSynced && (
          <div className="text-xs text-gray-400 text-center">
            Last synced: {lastSynced.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};