import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Link, 
  TrendingUp, 
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { useCanvasPlanningData } from '../../hooks/useCanvasPlanningData';

export interface PlotNodeData {
  // Existing fields from your current PlotNode
  title: string;
  type: 'event' | 'twist' | 'climax' | 'resolution' | 'rising_action' | 'falling_action';
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
  order?: number;
  chapter?: string;
  connectedCharacters?: string[];
  consequences?: string;
  foreshadowing?: string;
  
  // New Canvas Planning Integration fields
  fromPlanning?: boolean;
  planningId?: string;
  completion?: number;
  eventCount?: number;
  color?: string;
  tensionCurve?: number[];
  tags?: string[];
  connectedThreads?: string[];
  plotType?: 'main' | 'subplot' | 'side_story' | 'character_arc';
}

interface PlotNodeProps extends NodeProps {
  data: PlotNodeData;
  onDataChange?: (newData: Partial<PlotNodeData>) => void;
  selected?: boolean;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'event': return '📚';
    case 'twist': return '🌀';
    case 'climax': return '⚡';
    case 'resolution': return '✅';
    case 'rising_action': return '📈';
    case 'falling_action': return '📉';
    default: return '📖';
  }
};

const getSignificanceColor = (significance: string) => {
  switch (significance) {
    case 'critical': return 'border-red-400 bg-red-50';
    case 'high': return 'border-orange-400 bg-orange-50';
    case 'medium': return 'border-yellow-400 bg-yellow-50';
    case 'low': return 'border-green-400 bg-green-50';
    default: return 'border-gray-300 bg-white';
  }
};

const getPlotTypeIcon = (type: string) => {
  switch (type) {
    case 'main': return '🌍';
    case 'subplot': return '📖';
    case 'side_story': return '🔀';
    case 'character_arc': return '👤';
    default: return '📄';
  }
};

export const PlotNode: React.FC<PlotNodeProps> = ({ 
  data, 
  onDataChange, 
  selected = false 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { plotThreads, loading } = useCanvasPlanningData();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateNodeData = (field: keyof PlotNodeData, value: any) => {
    if (onDataChange) {
      onDataChange({ [field]: value });
    }
  };

  const filteredPlotThreads = plotThreads.filter(thread =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (thread.tags && thread.tags.some(tag => 
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  const handlePlotSelect = (plotThread: any) => {
    onDataChange?.({
      title: plotThread.title,
      description: plotThread.description,
      plotType: plotThread.type,
      fromPlanning: true,
      planningId: plotThread.id,
      completion: plotThread.completion_percentage,
      eventCount: plotThread.events?.length || 0,
      color: plotThread.color,
      tensionCurve: plotThread.tension_curve,
      tags: plotThread.tags,
      connectedCharacters: plotThread.connected_character_ids,
      connectedThreads: plotThread.connected_thread_ids
    });
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleViewProfile = () => {
    if (data.planningId) {
      // Navigate to plot planning page - implement based on your routing
      console.log('Navigate to plot planning:', data.planningId);
    }
  };

  const renderTensionCurveMini = (tensionCurve?: number[]) => {
    if (!tensionCurve || tensionCurve.length === 0) return null;

    const maxTension = Math.max(...tensionCurve);
    const points = tensionCurve.map((tension, index) => {
      const x = (index / (tensionCurve.length - 1)) * 100;
      const y = 100 - (tension / maxTension) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-6" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={data.color || '#3B82F6'}
          strokeWidth="3"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className={`
      plot-node min-w-72 max-w-80 p-4 bg-white border-2 rounded-lg shadow-md relative
      ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''} 
      ${getSignificanceColor(data.significance)}
    `}>
      {/* Canvas Planning Integration Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {data.plotType ? getPlotTypeIcon(data.plotType) : getTypeIcon(data.type)}
          </span>
          <div className="flex-1">
            <input
              value={data.title}
              onChange={(e) => updateNodeData('title', e.target.value)}
              placeholder="Plot point title..."
              className="w-full text-sm font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Canvas Planning Integration Controls */}
        <div className="flex items-center gap-1">
          {data.fromPlanning && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Linked
            </div>
          )}
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Link to Plot Thread"
            >
              <span className="text-sm">⚛</span>
            </button>
            
            {showDropdown && (
              <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
                <div className="p-3 border-b border-gray-100">
                  <input
                    type="text"
                    placeholder="Search plot threads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span className="text-sm text-gray-500">Loading plot threads...</span>
                    </div>
                  ) : filteredPlotThreads.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      {searchQuery ? 'No plot threads found' : 'No plot threads available'}
                    </div>
                  ) : (
                    filteredPlotThreads.map((thread) => (
                      <button
                        key={thread.id}
                        onClick={() => handlePlotSelect(thread)}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-base mt-0.5">{getPlotTypeIcon(thread.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 text-sm truncate">
                                {thread.title}
                              </h4>
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {thread.type.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {thread.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{thread.completion_percentage}% complete</span>
                              <span>{thread.events?.length || 0} events</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Type and Order Row */}
      <div className="flex items-center gap-2 mb-3">
        <select
          value={data.type}
          onChange={(e) => updateNodeData('type', e.target.value)}
          className="text-xs bg-transparent border-none outline-none capitalize"
        >
          <option value="event">Event</option>
          <option value="twist">Twist</option>
          <option value="climax">Climax</option>
          <option value="resolution">Resolution</option>
          <option value="rising_action">Rising Action</option>
          <option value="falling_action">Falling Action</option>
        </select>
        {data.order && (
          <span className="text-xs text-gray-500">#{data.order}</span>
        )}
        
        {/* Plot Type Badge (from Canvas Planning Integration) */}
        {data.plotType && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            {data.plotType.replace('_', ' ').charAt(0).toUpperCase() + data.plotType.replace('_', ' ').slice(1)}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <textarea
          value={data.description}
          onChange={(e) => updateNodeData('description', e.target.value)}
          placeholder="Describe what happens in this plot point..."
          rows={3}
          className="w-full text-xs bg-transparent border-none outline-none resize-none placeholder-gray-400"
        />

        {data.chapter && (
          <div className="text-xs text-gray-600">
            <span className="font-medium">Chapter:</span> {data.chapter}
          </div>
        )}

        {/* Canvas Planning Integration: Progress Bar */}
        {data.completion !== undefined && (
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{data.completion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${data.completion}%`,
                  backgroundColor: data.color || '#3B82F6'
                }}
              />
            </div>
          </div>
        )}

        {/* Canvas Planning Integration: Tension Curve Mini */}
        {data.tensionCurve && data.tensionCurve.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Tension</span>
            </div>
            {renderTensionCurveMini(data.tensionCurve)}
          </div>
        )}

        {data.consequences && (
          <div className="text-xs">
            <span className="font-medium text-gray-700">Consequences:</span>
            <div className="text-gray-600 mt-1">{data.consequences}</div>
          </div>
        )}

        {data.foreshadowing && (
          <div className="text-xs">
            <span className="font-medium text-gray-700">Foreshadowing:</span>
            <div className="text-gray-600 mt-1">{data.foreshadowing}</div>
          </div>
        )}

        {/* Canvas Planning Integration: Tags */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {data.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{data.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Bottom Row with Significance and Stats */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <select
            value={data.significance}
            onChange={(e) => updateNodeData('significance', e.target.value)}
            className="text-xs bg-transparent border-none outline-none capitalize"
          >
            <option value="low">Low Impact</option>
            <option value="medium">Medium Impact</option>
            <option value="high">High Impact</option>
            <option value="critical">Critical</option>
          </select>
          
          <div className="flex items-center gap-2">
            {/* Event Count from Canvas Planning Integration */}
            {data.eventCount !== undefined && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                {data.eventCount} events
              </span>
            )}
            
            {/* Connected Characters */}
            {data.connectedCharacters && data.connectedCharacters.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {data.connectedCharacters.length} characters
              </span>
            )}

            {/* Canvas Planning Integration: View Profile Button */}
            {data.fromPlanning && data.planningId && (
              <button
                onClick={handleViewProfile}
                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};
