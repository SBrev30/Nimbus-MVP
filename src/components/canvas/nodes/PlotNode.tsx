import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Link, 
  TrendingUp, 
  ExternalLink,
  MoreHorizontal,
  ChevronDown,
  X,
  Search,
  Atom,
  Edit
} from 'lucide-react';
import { BaseCanvasComponentProps, withCanvasComponent } from '../core/BaseCanvasComponent';
import { useCanvasPlanningData } from '../../../hooks/useCanvasPlanningData';
import { PlotPopup } from '../PlotPopup'; // You'll need to create this

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
  
  // Canvas Planning Integration fields
  fromPlanning?: boolean;
  planningId?: string;
  completion?: number;
  eventCount?: number;
  color?: string;
  tensionCurve?: number[];
  tags?: string[];
  connectedThreads?: string[];
  plotType?: 'main' | 'subplot' | 'side_story' | 'character_arc';
  completeness_score?: number;
}

interface PlotNodeProps extends BaseCanvasComponentProps {
  data: PlotNodeData;
  isEditing?: boolean;
  hasChanges?: boolean;
  onDataChange?: (field: string, value: any) => void; // HOC provides this format
  onConnect?: (nodeId: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PlotNodeComponent: React.FC<PlotNodeProps> = ({
  id,
  data,
  selected,
  isEditing,
  hasChanges,
  onDataChange,
  onConnect,
  onEdit,
  onDelete
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const atomButtonRef = useRef<HTMLButtonElement>(null);
  const { plotThreads, loading, refreshPlotThreads, error: planningError } = useCanvasPlanningData();

  // Debug planning data
  useEffect(() => {
    console.log('🐛 PlotNode Debug Info:', {
      plotThreadsCount: plotThreads.length,
      loading,
      planningError,
      showDropdown,
      nodeData: data,
      onDataChangeAvailable: !!onDataChange
    });
  }, [plotThreads, loading, planningError, showDropdown, data, onDataChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSearchQuery('');
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  // Handle field changes compatible with HOC
  const handleFieldChange = useCallback((field: string, value: any) => {
    console.log('📝 Plot field change:', field, value);
    if (onDataChange) {
      onDataChange(field, value);
    }
  }, [onDataChange]);

  // Handle plot thread selection from planning
  const handlePlotSelect = useCallback((plotThread: any) => {
    console.log('🎯 Selecting plot thread from planning:', plotThread.title);
    console.log('📊 Full plot thread data:', plotThread);
    
    if (!onDataChange) {
      console.warn('⚠️ onDataChange not available');
      return;
    }
    
    try {
      // Update multiple fields through the HOC's onDataChange
      const updates = {
        title: plotThread.title || '',
        description: plotThread.description || '',
        plotType: plotThread.type || 'main',
        fromPlanning: true,
        planningId: plotThread.id,
        completion: plotThread.completion_percentage || 0,
        eventCount: plotThread.events?.length || 0,
        color: plotThread.color || '#3B82F6',
        tensionCurve: plotThread.tension_curve || [],
        tags: plotThread.tags || [],
        connectedCharacters: plotThread.connected_character_ids || [],
        connectedThreads: plotThread.connected_thread_ids || [],
        completeness_score: plotThread.completion_percentage || 0
      };
      
      // Apply all updates field by field for HOC compatibility
      Object.entries(updates).forEach(([field, value]) => {
        onDataChange(field, value);
      });
      
      console.log('📝 Applied plot thread updates via HOC');
      
      // Force close the dropdown
      setTimeout(() => {
        setShowDropdown(false);
        setSearchQuery('');
        console.log('✅ Plot thread linked successfully:', plotThread.title);
      }, 100);
      
    } catch (error) {
      console.error('❌ Error selecting plot thread:', error);
    }
  }, [onDataChange]);

  const handleDropdownToggle = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    console.log('🔽 Plot dropdown toggle clicked, current state:', showDropdown);
    setShowDropdown(!showDropdown);
    setSearchQuery('');
    
    // If opening dropdown, refresh plot threads
    if (!showDropdown) {
      console.log('🔄 Refreshing plot threads on dropdown open');
      refreshPlotThreads();
    }
  }, [showDropdown, refreshPlotThreads]);

  const handleNodeClick = useCallback((event: React.MouseEvent) => {
    // Don't handle node clicks if dropdown is open
    if (showDropdown) {
      return;
    }
    
    if (isConnecting) {
      // Cancel connection mode
      setIsConnecting(false);
      return;
    }

    if (data.fromPlanning && !isEditing) {
      const rect = event.currentTarget.getBoundingClientRect();
      setPopupPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
      setShowPopup(true);
    }
  }, [showDropdown, isConnecting, data.fromPlanning, isEditing]);

  const handleUnlinkPlotThread = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    if (onDataChange) {
      onDataChange('fromPlanning', false);
      onDataChange('planningId', undefined);
    }
  }, [onDataChange]);

  const handleConnectButtonClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    console.log('🔗 Connect button clicked for plot:', data.title);
    
    if (onConnect) {
      setIsConnecting(true);
      onConnect(id);
    } else {
      console.warn('⚠️ onConnect handler not available');
    }
  }, [onConnect, id, data.title]);

  const calculateCompleteness = useCallback(() => {
    const requiredFields = ['title', 'type', 'description'];
    const optionalFields = ['consequences', 'foreshadowing', 'chapter'];
    
    const requiredComplete = requiredFields.every(field => data[field as keyof PlotNodeData]);
    const optionalComplete = optionalFields.filter(field => data[field as keyof PlotNodeData]).length;
    
    return requiredComplete ? (50 + (optionalComplete / optionalFields.length) * 50) : 0;
  }, [data]);

  const getCompletionColor = (score: number = 0) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const completeness = data.fromPlanning ? (data.completeness_score || 0) : calculateCompleteness();

  // Icon and color functions
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

  const getPlotTypeIcon = (type?: string) => {
    switch (type) {
      case 'main': return '🌍';
      case 'subplot': return '📖';
      case 'side_story': return '🔀';
      case 'character_arc': return '👤';
      default: return '📄';
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

  // Filter plot threads based on search
  const filteredPlotThreads = useMemo(() => {
    if (!plotThreads || plotThreads.length === 0) {
      return [];
    }
    
    return plotThreads.filter(thread =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [plotThreads, searchQuery]);

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
    <>
      <div className={`
        plot-node min-w-72 max-w-80 p-4 bg-white border-2 rounded-lg shadow-md relative
        ${isConnecting ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
        ${selected ? 'ring-2 ring-purple-400 ring-offset-2' : ''} 
        ${getSignificanceColor(data.significance)}
      `}
      onClick={handleNodeClick}
      style={{ cursor: isConnecting ? 'crosshair' : 'pointer' }}
      >
        <Handle type="target" position={Position.Top} className="w-2 h-2" />
        
        {/* Canvas Planning Integration Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg">
              {data.plotType ? getPlotTypeIcon(data.plotType) : getTypeIcon(data.type)}
            </span>
            <span className="font-semibold text-sm flex-1 min-w-0 truncate">{data.title || 'Plot Point'}</span>
            {data.fromPlanning && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-green-600">Linked</span>
              </div>
            )}
            {hasChanges && (
              <div className="text-xs text-orange-500" title="Auto-saving...">💾</div>
            )}
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {data.fromPlanning ? (
              <button
                onClick={handleUnlinkPlotThread}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded p-1 transition-colors"
                title="Unlink from Planning Plot Thread"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <div className="relative">
                <button
                  ref={atomButtonRef}
                  onClick={handleDropdownToggle}
                  className="text-xs bg-green-200 hover:bg-green-300 rounded p-1 transition-colors flex items-center gap-1"
                  title="Link to Planning Plot Thread"
                >
                  <Atom className="w-3 h-3" />
                  <ChevronDown className="w-2 h-2" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Type and Plot Type Row */}
        <div className="flex items-center gap-2 mb-3">
          {isEditing ? (
            <select
              value={data.type}
              onChange={(e) => handleFieldChange('type', e.target.value)}
              className="text-xs bg-transparent border-none outline-none capitalize"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="event">Event</option>
              <option value="twist">Twist</option>
              <option value="climax">Climax</option>
              <option value="resolution">Resolution</option>
              <option value="rising_action">Rising Action</option>
              <option value="falling_action">Falling Action</option>
            </select>
          ) : (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{data.type.replace('_', ' ')}</span>
          )}

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
          {/* Description */}
          {isEditing ? (
            <textarea
              value={data.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Describe what happens in this plot point..."
              rows={3}
              className="w-full p-2 border border-gray-300 rounded text-xs resize-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="text-xs leading-relaxed text-gray-700">
              {data.description || 'No description provided...'}
            </p>
          )}

          {data.chapter && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Chapter:</span> {data.chapter}
            </div>
          )}

          {/* Canvas Planning Integration: Progress Bar */}
          {(data.fromPlanning || completeness > 0) && (
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Completeness</span>
                <span>{Math.round(completeness)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getCompletionColor(completeness)}`}
                  style={{ width: `${completeness}%` }}
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

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <button 
              onClick={handleConnectButtonClick}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                isConnecting 
                  ? 'bg-blue-200 text-blue-800' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
              title={isConnecting ? 'Click another node to connect' : 'Create connection'}
            >
              <Link size={10} />
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>

            {data.fromPlanning && onEdit && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                title="Edit in Planning"
              >
                <Edit size={10} />
                Edit
              </button>
            )}
          </div>

          {/* Bottom Stats Row */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            {isEditing ? (
              <select
                value={data.significance}
                onChange={(e) => handleFieldChange('significance', e.target.value)}
                className="text-xs bg-transparent border-none outline-none capitalize"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="low">Low Impact</option>
                <option value="medium">Medium Impact</option>
                <option value="high">High Impact</option>
                <option value="critical">Critical</option>
              </select>
            ) : (
              <span className="text-xs text-gray-500 capitalize">{data.significance} impact</span>
            )}
            
            <div className="flex items-center gap-2">
              {/* Event Count from Canvas Planning Integration */}
              {data.eventCount !== undefined && data.eventCount > 0 && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  {data.eventCount} events
                </span>
              )}
              
              {/* Connected Characters */}
              {data.connectedCharacters && data.connectedCharacters.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {data.connectedCharacters.length} chars
                </span>
              )}
            </div>
          </div>
        </div>

        <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
      </div>

      {/* Planning Dropdown - Enhanced like CharacterNode */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg min-w-[300px] max-w-[400px] z-50"
          style={{
            top: '100%',
            right: 0,
            marginTop: '4px'
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plot threads..."
                className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          {/* Refresh Button */}
          <div className="px-2 pb-2 border-b border-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Manually refreshing plot threads...');
                refreshPlotThreads();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full text-xs text-blue-600 hover:text-blue-800 py-1 transition-colors"
            >
              🔄 Refresh Plot Threads
            </button>
          </div>
          
          {/* Plot Thread List */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-xs text-gray-500 text-center">Loading plot threads...</div>
            ) : planningError ? (
              <div className="p-3 text-xs text-red-500 text-center">
                Error loading plot threads: {planningError}
              </div>
            ) : plotThreads.length === 0 ? (
              <div className="p-3 text-xs text-gray-500 text-center">
                No plot threads found in planning.
                <br />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    refreshPlotThreads();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:text-blue-800 underline mt-1"
                >
                  Refresh
                </button>
              </div>
            ) : filteredPlotThreads.length === 0 ? (
              searchQuery ? (
                <div className="p-3 text-xs text-gray-500 text-center">
                  No plot threads match "{searchQuery}"
                </div>
              ) : (
                <div className="p-3 text-xs text-gray-500 text-center">
                  All plot threads filtered out
                </div>
              )
            ) : (
              filteredPlotThreads.map((thread, index) => (
                <div
                  key={`${thread.id}-${index}`}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 flex flex-col border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('🎯 Plot thread clicked:', thread.title);
                    handlePlotSelect(thread);
                  }}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-base mt-0.5 flex-shrink-0">{getPlotTypeIcon(thread.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 truncate">{thread.title}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex-shrink-0">
                          {thread.type.replace('_', ' ')}
                        </span>
                      </div>
                      {thread.description && (
                        <p className="text-gray-600 text-xs mb-2 line-clamp-2">{thread.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${getCompletionColor(thread.completion_percentage || 0)}`}
                          style={{ width: `${Math.max(5, thread.completion_percentage || 0)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{Math.round(thread.completion_percentage || 0)}%</span>
                    </div>
                    <span className="text-xs text-gray-500">{thread.events?.length || 0} events</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Plot Popup - Similar to CharacterPopup */}
      {showPopup && data.fromPlanning && (
        <PlotPopup
          plot={{
            id: data.planningId || data.id || id,
            title: data.title || '',
            type: data.plotType || data.type,
            description: data.description || '',
            completion: data.completion,
            eventCount: data.eventCount
          }}
          position={popupPosition}
          onClose={() => setShowPopup(false)}
          onExpand={() => {
            console.log('Expand plot:', data.planningId);
            if (onEdit) {
              onEdit();
            }
            setShowPopup(false);
          }}
        />
      )}
    </>
  );
};

// Export the component wrapped with canvas functionality
export const PlotNode = withCanvasComponent(PlotNodeComponent);

// Default data for new plot nodes
export const defaultPlotData: PlotNodeData = {
  title: '',
  type: 'event',
  description: '',
  significance: 'medium',
  fromPlanning: false
};
