// src/components/canvas/nodes/TimelineNode.tsx
import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Calendar, Clock, TrendingUp, Users, ChevronDown } from 'lucide-react';
import { useCanvasPlanningData } from '../../../hooks/useCanvasPlanningData';
import type { CanvasTimelineData } from '../../../services/canvas-integration-service';

interface TimelineNodeData {
  id: string;
  name: string;
  description: string;
  fromPlanning?: boolean;
  planningId?: string;
  timelineType?: 'story_beats' | 'character_arc' | 'plot_progression';
  chapterCount?: number;
  significanceLevel?: 'low' | 'medium' | 'high' | 'critical';
  characterArcs?: string[];
}

interface TimelineNodeProps {
  id: string;
  data: TimelineNodeData;
  selected?: boolean;
  onDataChange?: (newData: Partial<TimelineNodeData>) => void;
  onConnect?: (nodeId: string) => void;
  projectId?: string;
}

const TimelineNode: React.FC<TimelineNodeProps> = ({
  id,
  data,
  selected,
  onDataChange,
  onConnect,
  projectId
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { planningTimelines, loading } = useCanvasPlanningData(projectId);

  // Handle timeline selection from planning data
  const handleTimelineSelect = useCallback((timeline: CanvasTimelineData) => {
    if (onDataChange) {
      onDataChange({
        ...data,
        name: timeline.name,
        description: timeline.description,
        fromPlanning: true,
        planningId: timeline.id,
        timelineType: timeline.timelineType,
        chapterCount: timeline.chapterCount,
        significanceLevel: timeline.significanceLevel,
        characterArcs: timeline.characterArcs
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

  // Get timeline type icon
  const getTimelineIcon = () => {
    switch (data.timelineType) {
      case 'story_beats':
        return <TrendingUp className="w-4 h-4" />;
      case 'character_arc':
        return <Users className="w-4 h-4" />;
      case 'plot_progression':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Get significance color
  const getSignificanceColor = () => {
    switch (data.significanceLevel) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`
      bg-white rounded-lg shadow-md border-2 transition-all duration-200 min-w-[200px] max-w-[300px]
      ${selected ? 'border-purple-400 shadow-lg' : 'border-purple-200'}
      ${data.fromPlanning ? 'ring-2 ring-green-200' : ''}
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />
      
      {/* Header */}
      <div className="px-3 py-2 bg-purple-50 rounded-t-lg border-b border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getTimelineIcon()}
            <span className="text-xs font-medium text-purple-700">Timeline</span>
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
              className="text-purple-600 hover:text-purple-800 hover:bg-purple-100 p-1 rounded transition-colors relative"
              title="Link to Planning Timeline"
            >
              <span className="text-sm font-bold">⚛</span>
            </button>
            
            {/* Connect button */}
            <button
              onClick={handleConnectClick}
              className={`text-purple-600 hover:text-purple-800 hover:bg-purple-100 p-1 rounded transition-colors ${
                isConnecting ? 'bg-purple-200' : ''
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
              <div className="text-xs font-medium text-gray-600">Timeline Planning Data</div>
            </div>
            
            {loading ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                Loading timelines...
              </div>
            ) : planningTimelines.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                No planning timelines found
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {planningTimelines.map((timeline) => (
                  <button
                    key={timeline.id}
                    onClick={() => handleTimelineSelect(timeline)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-sm text-gray-900">{timeline.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {timeline.timelineType} • {timeline.chapterCount} chapters
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {timeline.description}
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

        {/* Timeline Details */}
        <div className="space-y-2">
          {data.timelineType && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Type:</span>
              <span className="text-xs text-gray-700 capitalize">
                {data.timelineType.replace('_', ' ')}
              </span>
            </div>
          )}
          
          {data.chapterCount && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Chapters:</span>
              <span className="text-xs text-gray-700">
                {data.chapterCount}
              </span>
            </div>
          )}
          
          {data.significanceLevel && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Significance:</span>
              <span className={`text-xs px-2 py-1 rounded-full border ${getSignificanceColor()}`}>
                {data.significanceLevel}
              </span>
            </div>
          )}
          
          {data.characterArcs && data.characterArcs.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Character Arcs:</span>
              <span className="text-xs text-gray-700">
                {data.characterArcs.length}
              </span>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />
    </div>
  );
};

// Export both named and default exports to fix import issues
export { TimelineNode };
export default TimelineNode;
