// src/components/canvas/nodes/ThemeNode.tsx
import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Lightbulb, Star, Circle, Users, BookOpen, MapPin } from 'lucide-react';
import { useCanvasPlanningData } from '../../../hooks/useCanvasPlanningData';
import type { CanvasThemeData } from '../../../services/canvas-integration-service';

interface ThemeNodeData {
  id: string;
  name: string;
  description: string;
  fromPlanning?: boolean;
  planningId?: string;
  themeType?: 'major' | 'minor' | 'motif';
  completenessScore?: number;
  connectionCount?: number;
  characterConnections?: number;
  plotConnections?: number;
}

interface ThemeNodeProps {
  id: string;
  data: ThemeNodeData;
  selected?: boolean;
  onDataChange?: (newData: Partial<ThemeNodeData>) => void;
  onConnect?: (nodeId: string) => void;
  projectId?: string;
}

const ThemeNode: React.FC<ThemeNodeProps> = ({
  id,
  data,
  selected,
  onDataChange,
  onConnect,
  projectId
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { planningThemes, loading } = useCanvasPlanningData(projectId);

  // Handle theme selection from planning data
  const handleThemeSelect = useCallback((theme: CanvasThemeData) => {
    if (onDataChange) {
      onDataChange({
        ...data,
        name: theme.name,
        description: theme.description,
        fromPlanning: true,
        planningId: theme.id,
        themeType: theme.themeType,
        completenessScore: theme.completenessScore,
        connectionCount: theme.connectionCount,
        characterConnections: theme.characterConnections,
        plotConnections: theme.plotConnections
      });
    }
    setShowDropdown(false);
  }, [data, onDataChange]);

  const handleAtomClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setShowDropdown(!showDropdown);
  }, [showDropdown]);

  const handleConnectClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    if (onConnect) {
      setIsConnecting(true);
      onConnect(id);
    }
  }, [onConnect, id]);

  // Get theme type icon
  const getThemeIcon = () => {
    switch (data.themeType) {
      case 'major':
        return <Star className="w-4 h-4" />;
      case 'minor':
        return <Circle className="w-4 h-4" />;
      case 'motif':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  // Get theme type color
  const getThemeColor = () => {
    switch (data.themeType) {
      case 'major':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'minor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'motif':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get completeness color
  const getCompletenessColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className={`
      bg-white rounded-lg shadow-md border-2 transition-all duration-200 min-w-[200px] max-w-[300px]
      ${selected ? 'border-indigo-400 shadow-lg' : 'border-indigo-200'}
      ${data.fromPlanning ? 'ring-2 ring-green-200' : ''}
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-indigo-400 border-2 border-white"
      />
      
      {/* Header */}
      <div className="px-3 py-2 bg-indigo-50 rounded-t-lg border-b border-indigo-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getThemeIcon()}
            <span className="text-xs font-medium text-indigo-700">Theme</span>
            {data.fromPlanning && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">Linked</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-1">
            {/* Atom button for planning integration */}
            <button
              onClick={handleAtomClick}
              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 p-1 rounded transition-colors relative"
              title="Link to Planning Themes"
            >
              <span className="text-sm font-bold">⚛</span>
            </button>
            
            {/* Connect button */}
            <button
              onClick={handleConnectClick}
              className={`text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 p-1 rounded transition-colors ${
                isConnecting ? 'bg-indigo-200' : ''
              }`}
              title="Connect to other nodes"
            >
              🔗
            </button>
          </div>
        </div>
      </div>

      {/* Planning Dropdown */}
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-600">Story Themes</div>
            </div>
            
            {loading ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                Loading themes...
              </div>
            ) : planningThemes.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                No themes found
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {planningThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-sm text-gray-900">{theme.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {theme.themeType} • {theme.completenessScore}% complete
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {theme.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Content */}
      <div className="px-3 py-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2">
          {data.name}
        </h3>
        
        <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-3">
          {data.description}
        </p>

        {/* Theme Details */}
        <div className="space-y-2">
          {data.themeType && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Type:</span>
              <span className={`text-xs px-2 py-1 rounded-full border capitalize ${getThemeColor()}`}>
                {data.themeType}
              </span>
            </div>
          )}
          
          {data.completenessScore !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Development:</span>
              <span className={`text-xs font-medium ${getCompletenessColor(data.completenessScore)}`}>
                {data.completenessScore}%
              </span>
            </div>
          )}
          
          {data.connectionCount !== undefined && data.connectionCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Total Connections:</span>
              <span className="text-xs text-gray-700">
                {data.connectionCount}
              </span>
            </div>
          )}
        </div>

        {/* Connection Breakdown */}
        {(data.characterConnections || data.plotConnections) && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-2">Theme Connections</div>
            <div className="space-y-1">
              {data.characterConnections !== undefined && data.characterConnections > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Characters</span>
                  </div>
                  <span className="text-xs text-gray-700">{data.characterConnections}</span>
                </div>
              )}
              
              {data.plotConnections !== undefined && data.plotConnections > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Plots</span>
                  </div>
                  <span className="text-xs text-gray-700">{data.plotConnections}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completeness Progress Bar */}
        {data.completenessScore !== undefined && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Theme Development</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  data.completenessScore >= 80 ? 'bg-green-500' :
                  data.completenessScore >= 60 ? 'bg-yellow-500' :
                  data.completenessScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${data.completenessScore}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-indigo-400 border-2 border-white"
      />
    </div>
  );
};

// Export both named and default exports to fix import issues
export { ThemeNode };
export default ThemeNode;
