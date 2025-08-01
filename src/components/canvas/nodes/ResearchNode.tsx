// src/components/canvas/nodes/ResearchNode.tsx
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseCanvasNode, withCanvasComponent, BaseCanvasComponentProps } from '../core/BaseCanvasComponent';
import { useCanvasPlanningData } from '../../../hooks/useCanvasPlanningData';
import { BookOpen, Search, Database, Link, Users, ChevronDown, X, Atom, Edit, Eye } from 'lucide-react';

export interface ResearchNodeData {
  name: string;
  description: string;
  researchCategory?: 'culture' | 'technology' | 'economy' | 'hierarchy';
  elementCount?: number;
  connectedContent?: string[];
  // Planning integration fields
  fromPlanning?: boolean;
  planningId?: string;
  completenessScore?: number;
}

interface ResearchNodeProps extends BaseCanvasComponentProps {
  data: ResearchNodeData;
  isEditing?: boolean;
  hasChanges?: boolean;
  onDataChange?: (field: string, value: any) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  projectId?: string;
}

const ResearchNodeComponent: React.FC<ResearchNodeProps> = ({
  id,
  data,
  selected,
  isEditing,
  hasChanges,
  onDataChange,
  onEdit,
  onDelete,
  projectId
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
    
  const dropdownRef = useRef<HTMLDivElement>(null);
  const atomButtonRef = useRef<HTMLButtonElement>(null);
  
  const { planningResearch, loading, refreshResearch, error: planningError } = useCanvasPlanningData(projectId);

  // Debug planning data
  useEffect(() => {
    console.log('🐛 ResearchNode Debug Info:', {
      projectId,
      planningResearchCount: planningResearch.length,
      loading,
      planningError,
      showDropdown,
      nodeData: data,
      onDataChangeAvailable: !!onDataChange
    });
  }, [projectId, planningResearch, loading, planningError, showDropdown, data, onDataChange]);

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
    console.log('📝 Field change:', field, value);
    if (onDataChange) {
      onDataChange(field, value);
    }
  }, [onDataChange]);

  // Handle research selection from planning
  const handleResearchSelect = useCallback((research: any) => {
    console.log('🎯 Selecting research from planning:', research.name);
    console.log('📊 Full research data:', research);
    
    if (!onDataChange) {
      console.warn('⚠️ onDataChange not available');
      return;
    }
    
    try {
      // Update multiple fields through the HOC's onDataChange
      const updates = {
        name: research.name || '',
        description: research.description || '',
        researchCategory: research.researchCategory || 'culture',
        elementCount: research.elementCount || 0,
        connectedContent: research.connectedContent || [],
        fromPlanning: true,
        planningId: research.id,
        completenessScore: research.elementCount || 0
      };
      
      // Apply all updates field by field for HOC compatibility
      Object.entries(updates).forEach(([field, value]) => {
        onDataChange(field, value);
      });
      
      console.log('📝 Applied research updates via HOC');
      
      // Force close the dropdown
      setTimeout(() => {
        setShowDropdown(false);
        setSearchQuery('');
        console.log('✅ Research linked successfully:', research.name);
      }, 100);
      
    } catch (error) {
      console.error('❌ Error selecting research:', error);
    }
  }, [onDataChange]);

  const handleDropdownToggle = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    console.log('🔽 Dropdown toggle clicked, current state:', showDropdown);
    console.log('🔽 Using projectId:', projectId);
    setShowDropdown(!showDropdown);
    setSearchQuery('');
    
    // If opening dropdown, refresh research
    if (!showDropdown) {
      console.log('🔄 Refreshing research on dropdown open with projectId:', projectId);
      refreshResearch();
    }
  }, [showDropdown, refreshResearch, projectId]);

  const handleNodeClick = (event: React.MouseEvent) => {
    // Don't handle node clicks if dropdown is open
    if (showDropdown) {
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
  };

  const handleUnlinkResearch = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    if (onDataChange) {
      onDataChange('fromPlanning', false);
      onDataChange('planningId', undefined);
    }
  }, [onDataChange]);

  // Get research category icon
  const getCategoryIcon = () => {
    switch (data.researchCategory) {
      case 'culture':
        return <Users className="w-4 h-4" />;
      case 'technology':
        return <Database className="w-4 h-4" />;
      case 'economy':
        return <BookOpen className="w-4 h-4" />;
      case 'hierarchy':
        return <Link className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  // Get category color
  const getCategoryColor = () => {
    switch (data.researchCategory) {
      case 'culture':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'technology':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'economy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'hierarchy':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter research based on search
  const filteredResearch = useMemo(() => {
    if (!planningResearch || planningResearch.length === 0) {
      return [];
    }
    
    return planningResearch.filter(research =>
      research.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      research.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (research.researchCategory || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [planningResearch, searchQuery]);

  return (
    <>
      <div 
        className={`rounded-lg p-3 min-w-[200px] max-w-[280px] shadow-sm relative transition-all hover:shadow-md ${
          selected ? 'ring-2 ring-amber-400 ring-offset-2' : ''
        } bg-amber-50 border-2 border-amber-200`}
        onClick={handleNodeClick}
        style={{ cursor: 'pointer' }}
      >
        <Handle type="target" position={Position.Top} className="w-2 h-2" />
        
        {/* Research Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-sm flex items-center gap-2 flex-1 min-w-0">
            {getCategoryIcon()}
            <span className="flex-shrink-0">{data.name || 'Research'}</span>
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
                onClick={handleUnlinkResearch}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded p-1 transition-colors"
                title="Unlink from Planning Research"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <div className="relative">
                <button
                  ref={atomButtonRef}
                  onClick={handleDropdownToggle}
                  className="text-xs bg-green-200 hover:bg-green-300 rounded p-1 transition-colors flex items-center gap-1"
                  title="Link to Planning Research"
                >
                  <Atom className="w-3 h-3" />
                  <ChevronDown className="w-2 h-2" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Research Content */}
        {isEditing ? (
          <div className="space-y-2">
            <input
              value={data.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full text-sm font-medium bg-transparent border-b border-amber-300 focus:outline-none focus:border-amber-500"
              placeholder="Research collection name..."
              onClick={(e) => e.stopPropagation()}
            />
            <select
              value={data.researchCategory || 'culture'}
              onChange={(e) => handleFieldChange('researchCategory', e.target.value)}
              className="w-full p-1 border border-amber-300 rounded text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="culture">Culture</option>
              <option value="technology">Technology</option>
              <option value="economy">Economy</option>
              <option value="hierarchy">Hierarchy</option>
            </select>
            <textarea
              value={data.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Research description..."
              className="w-full p-2 border border-amber-300 rounded text-xs resize-none"
              rows={3}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <>
            {data.description && (
              <div className="text-xs text-amber-700 line-clamp-2 mb-2">
                {data.description}
              </div>
            )}
            
            {/* Research Details */}
            <div className="space-y-1">
              {data.researchCategory && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-600">Category:</span>
                  <span className={`text-xs px-2 py-1 rounded-full border capitalize ${getCategoryColor()}`}>
                    {data.researchCategory}
                  </span>
                </div>
              )}
              
              {data.elementCount !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-600">Elements:</span>
                  <span className="text-xs text-amber-700">
                    {data.elementCount}
                  </span>
                </div>
              )}
              
              {data.connectedContent && data.connectedContent.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-600">Connections:</span>
                  <span className="text-xs text-amber-700">
                    {data.connectedContent.length}
                  </span>
                </div>
              )}
            </div>

            {/* Connected Content Preview */}
            {data.connectedContent && data.connectedContent.length > 0 && (
              <div className="mt-3 pt-2 border-t border-amber-100">
                <div className="text-xs text-amber-500 mb-1">Connected to:</div>
                <div className="flex flex-wrap gap-1">
                  {data.connectedContent.slice(0, 3).map((connection, index) => (
                    <span key={index} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                      {connection.length > 10 ? `${connection.substring(0, 10)}...` : connection}
                    </span>
                  ))}
                  {data.connectedContent.length > 3 && (
                    <span className="text-xs text-amber-600">
                      +{data.connectedContent.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="research-actions mt-3 flex gap-2">
          {data.fromPlanning && onEdit && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs hover:bg-amber-200 transition-colors"
              title="Edit in Planning"
            >
              <Edit size={10} />
              Edit
            </button>
          )}
        </div>

        <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
      </div>

      {/* Planning Dropdown */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg min-w-[200px] max-w-[280px] z-50"
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
                placeholder="Search research..."
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
                console.log('🔄 Manually refreshing research with projectId:', projectId);
                refreshResearch();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full text-xs text-blue-600 hover:text-blue-800 py-1 transition-colors"
            >
              🔄 Refresh Research
            </button>
          </div>
          
          {/* Research List */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-xs text-gray-500 text-center">Loading research...</div>
            ) : planningError ? (
              <div className="p-3 text-xs text-red-500 text-center">
                Error loading research: {planningError}
              </div>
            ) : planningResearch.length === 0 ? (
              <div className="p-3 text-xs text-gray-500 text-center">
                No research collections found in planning.
                <br />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    refreshResearch();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:text-blue-800 underline mt-1"
                >
                  Refresh
                </button>
              </div>
            ) : filteredResearch.length === 0 ? (
              searchQuery ? (
                <div className="p-3 text-xs text-gray-500 text-center">
                  No research matches "{searchQuery}"
                </div>
              ) : (
                <div className="p-3 text-xs text-gray-500 text-center">
                  All research filtered out
                </div>
              )
            ) : (
              filteredResearch.map((research, index) => (
                <div
                  key={`${research.id}-${index}`}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 flex flex-col border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('🎯 Research clicked:', research.name);
                    handleResearchSelect(research);
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{research.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{research.researchCategory}</span>
                  </div>
                  
                  {research.description && (
                    <span className="text-gray-600 text-xs mb-1 line-clamp-2">{research.description}</span>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{research.elementCount} elements</span>
                    {research.connectedContent && research.connectedContent.length > 0 && (
                      <span>{research.connectedContent.length} connections</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Research Details Popup */}
      {showPopup && data.fromPlanning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getCategoryIcon()}
                  <h2 className="text-xl font-semibold">{data.name}</h2>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor()}`}>
                    {data.researchCategory}
                  </span>
                </div>
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Description</h3>
                  <p className="text-gray-600">{data.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Category</h3>
                    <p className="text-gray-600 capitalize">{data.researchCategory}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Elements</h3>
                    <p className="text-gray-600">{data.elementCount || 0}</p>
                  </div>
                </div>

                {data.connectedContent && data.connectedContent.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Connected Content</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.connectedContent.map((connection, index) => (
                        <span key={index} className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-sm">
                          {connection}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-6">
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowPopup(false);
                      onEdit();
                    }}
                    className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  >
                    Edit Research
                  </button>
                )}
                <button
                  onClick={() => setShowPopup(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Export the component wrapped with canvas functionality
export const ResearchNode = withCanvasComponent(ResearchNodeComponent);

// Default data for new research nodes
export const defaultResearchData: ResearchNodeData = {
  name: '',
  description: '',
  researchCategory: 'culture',
  elementCount: 0,
  connectedContent: [],
  fromPlanning: false
};
