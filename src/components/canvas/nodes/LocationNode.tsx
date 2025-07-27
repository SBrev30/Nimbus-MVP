import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  MapPin, 
  ExternalLink,
  MoreHorizontal,
  ChevronDown,
  X,
  Search,
  Atom,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';
import { BaseCanvasComponentProps, withCanvasComponent } from '../core/BaseCanvasComponent';
import { useCanvasPlanningData } from '../../../hooks/useCanvasPlanningData';
import { LocationPopup } from '../LocationPopup';

export interface LocationNodeData {
  // Existing fields from your current LocationNode
  name: string;
  type: 'city' | 'building' | 'natural' | 'mystical' | 'country' | 'region';
  description: string;
  importance: 'critical' | 'high' | 'moderate' | 'low';
  geography?: {
    climate?: string;
    terrain?: string;
    size?: string;
  };
  culture?: {
    politics?: string;
    religion?: string;
    customs?: string;
  };
  connectedCharacters?: string[];
  
  // Canvas Planning Integration fields
  fromPlanning?: boolean;
  planningId?: string;
  completeness_score?: number;
}

interface LocationNodeProps extends BaseCanvasComponentProps {
  data: LocationNodeData;
  projectId?: string;
  isEditing?: boolean;
  hasChanges?: boolean;
  onDataChange?: (field: string, value: any) => void; // HOC provides this format
  onConnect?: (nodeId: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const LocationNodeComponent: React.FC<LocationNodeProps> = ({
  id,
  data,
  selected,
  projectId,
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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const atomButtonRef = useRef<HTMLButtonElement>(null);
  const { planningLocations, loading, refreshLocations, error: planningError } = useCanvasPlanningData(projectId);

  // Debug planning data
  useEffect(() => {
    console.log('🐛 LocationNode Debug Info:', {
      locationsCount: planningLocations.length,
      loading,
      planningError,
      showDropdown,
      nodeData: data,
      onDataChangeAvailable: !!onDataChange,
      projectId
    });
  }, [planningLocations, loading, planningError, showDropdown, data, onDataChange, projectId]);

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
    console.log('📝 Location field change:', field, value);
    if (onDataChange) {
      onDataChange(field, value);
    }
  }, [onDataChange]);

  // Handle location selection from planning
  const handleLocationSelect = useCallback((location: any) => {
    console.log('🎯 Selecting location from planning:', location.name);
    console.log('📊 Full location data:', location);
    
    if (!onDataChange) {
      console.warn('⚠️ onDataChange not available');
      return;
    }
    
    try {
      // Update multiple fields through the HOC's onDataChange
      const updates = {
        name: location.name || '',
        description: location.description || '',
        type: location.type || 'building',
        importance: location.importance || 'moderate',
        geography: location.geography || {},
        culture: location.culture || {},
        connectedCharacters: location.connectedCharacters || [],
        fromPlanning: true,
        planningId: location.id,
        completeness_score: calculateLocationCompleteness(location)
      };
      
      // Apply all updates field by field for HOC compatibility
      Object.entries(updates).forEach(([field, value]) => {
        onDataChange(field, value);
      });
      
      console.log('📝 Applied location updates via HOC');
      
      // Force close the dropdown
      setTimeout(() => {
        setShowDropdown(false);
        setSearchQuery('');
        console.log('✅ Location linked successfully:', location.name);
      }, 100);
      
    } catch (error) {
      console.error('❌ Error selecting location:', error);
    }
  }, [onDataChange]);

  const handleDropdownToggle = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    console.log('🔽 Location dropdown toggle clicked, current state:', showDropdown);
    setShowDropdown(!showDropdown);
    setSearchQuery('');
    
    // If opening dropdown, refresh locations
    if (!showDropdown) {
      console.log('🔄 Refreshing locations on dropdown open');
      refreshLocations();
    }
  }, [showDropdown, refreshLocations]);

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

  const handleUnlinkLocation = useCallback((event: React.MouseEvent) => {
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
    
    console.log('🔗 Connect button clicked for location:', data.name);
    
    if (onConnect) {
      setIsConnecting(true);
      onConnect(id);
    } else {
      console.warn('⚠️ onConnect handler not available');
    }
  }, [onConnect, id, data.name]);

  const calculateLocationCompleteness = useCallback((location: any) => {
    const requiredFields = ['name', 'type', 'description'];
    const optionalFields = ['geography', 'culture', 'connectedCharacters', 'importance'];
    
    const requiredComplete = requiredFields.every(field => location[field]);
    const optionalComplete = optionalFields.filter(field => {
      const value = location[field];
      if (field === 'geography' || field === 'culture') {
        return value && Object.keys(value).length > 0;
      }
      if (field === 'connectedCharacters') {
        return value && value.length > 0;
      }
      return value;
    }).length;
    
    return requiredComplete ? (50 + (optionalComplete / optionalFields.length) * 50) : 0;
  }, []);

  const getCompletionColor = (score: number = 0) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const completeness = data.fromPlanning ? (data.completeness_score || 0) : calculateLocationCompleteness(data);

  // Icon and color functions
  const getLocationColor = (type: string) => {
    switch (type) {
      case 'city': return 'border-blue-400 bg-blue-50';
      case 'building': return 'border-gray-400 bg-gray-50';
      case 'natural': return 'border-green-400 bg-green-50';
      case 'mystical': return 'border-purple-400 bg-purple-50';
      case 'country': return 'border-indigo-400 bg-indigo-50';
      case 'region': return 'border-teal-400 bg-teal-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'critical': return '🔴';
      case 'high': return '🟡';
      case 'moderate': return '🟢';
      case 'low': return '⚪';
      default: return '⚪';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'city': return '🏙️';
      case 'building': return '🏢';
      case 'natural': return '🌲';
      case 'mystical': return '✨';
      case 'country': return '🗺️';
      case 'region': return '🌍';
      default: return '📍';
    }
  };

  // Filter locations based on search
  const filteredLocations = useMemo(() => {
    if (!planningLocations || planningLocations.length === 0) {
      return [];
    }
    
    return planningLocations.filter(location =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [planningLocations, searchQuery]);

  return (
    <>
      <div className={`
        location-node min-w-72 max-w-80 p-4 bg-white border-2 rounded-lg shadow-md relative
        ${isConnecting ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
        ${selected ? 'ring-2 ring-purple-400 ring-offset-2' : ''} 
        ${getLocationColor(data.type)}
      `}
      onClick={handleNodeClick}
      style={{ cursor: isConnecting ? 'crosshair' : 'pointer' }}
      >
        <Handle type="target" position={Position.Top} className="w-2 h-2" />
        
        {/* Canvas Planning Integration Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg">
              {getTypeIcon(data.type)}
            </span>
            <span className="font-semibold text-sm flex-1 min-w-0 truncate">{data.name || 'New Location'}</span>
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
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs bg-gray-100 hover:bg-gray-200 rounded p-1 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
            {data.fromPlanning ? (
              <button
                onClick={handleUnlinkLocation}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded p-1 transition-colors"
                title="Unlink from Planning Location"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <div className="relative">
                <button
                  ref={atomButtonRef}
                  onClick={handleDropdownToggle}
                  className="text-xs bg-green-200 hover:bg-green-300 rounded p-1 transition-colors flex items-center gap-1"
                  title="Link to Planning Location"
                >
                  <Atom className="w-3 h-3" />
                  <ChevronDown className="w-2 h-2" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Type and Importance Row */}
        <div className="flex items-center gap-2 mb-3">
          {isEditing ? (
            <select
              value={data.type}
              onChange={(e) => handleFieldChange('type', e.target.value)}
              className="text-xs bg-transparent border-none outline-none capitalize"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="city">City</option>
              <option value="building">Building</option>
              <option value="natural">Natural</option>
              <option value="mystical">Mystical</option>
              <option value="country">Country</option>
              <option value="region">Region</option>
            </select>
          ) : (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full capitalize">{data.type}</span>
          )}

          <span className="text-lg">{getImportanceIcon(data.importance)}</span>
          
          <span className="text-xs text-gray-500 capitalize">{data.importance} importance</span>
        </div>

        <div className="space-y-3">
          {/* Description */}
          {isEditing ? (
            <textarea
              value={data.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Describe this location..."
              rows={3}
              className="w-full p-2 border border-gray-300 rounded text-xs resize-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="text-xs leading-relaxed text-gray-700">
              {data.description || 'No description provided...'}
            </p>
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

          {/* Expanded Details */}
          {isExpanded && (
            <div className="space-y-3 pt-3 border-t border-gray-200">
              {/* Geography */}
              {data.geography && (Object.keys(data.geography).length > 0) && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">🌍</span>
                    <span className="text-xs text-gray-500">Geography</span>
                  </div>
                  <div className="text-xs space-y-1 text-gray-600">
                    {data.geography.climate && <p>Climate: {data.geography.climate}</p>}
                    {data.geography.terrain && <p>Terrain: {data.geography.terrain}</p>}
                    {data.geography.size && <p>Size: {data.geography.size}</p>}
                  </div>
                </div>
              )}

              {/* Culture */}
              {data.culture && (Object.keys(data.culture).length > 0) && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">🏛️</span>
                    <span className="text-xs text-gray-500">Culture</span>
                  </div>
                  <div className="text-xs space-y-1 text-gray-600">
                    {data.culture.politics && <p>Politics: {data.culture.politics}</p>}
                    {data.culture.religion && <p>Religion: {data.culture.religion}</p>}
                    {data.culture.customs && <p>Customs: {data.culture.customs}</p>}
                  </div>
                </div>
              )}

              {/* Connected Characters */}
              {data.connectedCharacters && data.connectedCharacters.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">👥</span>
                    <span className="text-xs text-gray-500">Connected Characters</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {data.connectedCharacters.slice(0, 3).map((char, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {char}
                      </span>
                    ))}
                    {data.connectedCharacters.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{data.connectedCharacters.length - 3}
                      </span>
                    )}
                  </div>
                </div>
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
              <MapPin size={10} />
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
                placeholder="Search locations..."
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
                console.log('Manually refreshing locations...');
                refreshLocations();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full text-xs text-blue-600 hover:text-blue-800 py-1 transition-colors"
            >
              🔄 Refresh Locations
            </button>
          </div>
          
          {/* Location List */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-xs text-gray-500 text-center">Loading locations...</div>
            ) : planningError ? (
              <div className="p-3 text-xs text-red-500 text-center">
                Error loading locations: {planningError}
              </div>
            ) : planningLocations.length === 0 ? (
              <div className="p-3 text-xs text-gray-500 text-center">
                No locations found in planning.
                <br />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    refreshLocations();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:text-blue-800 underline mt-1"
                >
                  Refresh
                </button>
              </div>
            ) : filteredLocations.length === 0 ? (
              searchQuery ? (
                <div className="p-3 text-xs text-gray-500 text-center">
                  No locations match "{searchQuery}"
                </div>
              ) : (
                <div className="p-3 text-xs text-gray-500 text-center">
                  All locations filtered out
                </div>
              )
            ) : (
              filteredLocations.map((location, index) => (
                <div
                  key={`${location.id}-${index}`}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 flex flex-col border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('🎯 Location clicked:', location.name);
                    handleLocationSelect(location);
                  }}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-base mt-0.5 flex-shrink-0">{getTypeIcon(location.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 truncate">{location.name}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex-shrink-0 capitalize">
                          {location.type}
                        </span>
                      </div>
                      {location.description && (
                        <p className="text-gray-600 text-xs mb-2 line-clamp-2">{location.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getImportanceIcon(location.importance)}</span>
                      <span className="text-xs text-gray-500 capitalize">{location.importance} importance</span>
                    </div>
                    {location.connectedCharacters && location.connectedCharacters.length > 0 && (
                      <span className="text-xs text-gray-500">{location.connectedCharacters.length} chars</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Location Popup - Similar to CharacterPopup */}
      {showPopup && data.fromPlanning && (
        <LocationPopup
          location={{
            id: data.planningId || data.id || id,
            name: data.name || '',
            type: data.type,
            description: data.description || '',
            importance: data.importance,
            geography: data.geography,
            culture: data.culture,
            connectedCharacters: data.connectedCharacters
          }}
          position={popupPosition}
          onClose={() => setShowPopup(false)}
          onExpand={() => {
            console.log('Expand location:', data.planningId);
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
export const LocationNode = withCanvasComponent(LocationNodeComponent);

// Default data for new location nodes
export const defaultLocationData: LocationNodeData = {
  name: '',
  type: 'building',
  description: '',
  importance: 'moderate',
  fromPlanning: false
};
