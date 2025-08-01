// src/components/canvas/nodes/ResearchNode.tsx
import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { BookOpen, Search, Database, Link, Users } from 'lucide-react';
import { useCanvasPlanningData } from '../../../hooks/useCanvasPlanningData';
import type { CanvasResearchData } from '../../../services/canvas-integration-service';

interface ResearchNodeData {
  id: string;
  name: string;
  description: string;
  fromPlanning?: boolean;
  planningId?: string;
  researchCategory?: string;
  elementCount?: number;
  connectedContent?: string[];
}

interface ResearchNodeProps {
  id: string;
  data: ResearchNodeData;
  selected?: boolean;
  onDataChange?: (newData: Partial<ResearchNodeData>) => void;
  onConnect?: (nodeId: string) => void;
  projectId?: string;
}

const ResearchNode: React.FC<ResearchNodeProps> = ({
  id,
  data,
  selected,
  onDataChange,
  onConnect,
  projectId
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { planningResearch, loading } = useCanvasPlanningData(projectId);

  // Handle research selection from planning data
  const handleResearchSelect = useCallback((research: CanvasResearchData) => {
    if (onDataChange) {
      onDataChange({
        ...data,
        name: research.name,
        description: research.description,
        fromPlanning: true,
        planningId: research.id,
        researchCategory: research.researchCategory,
        elementCount: research.elementCount,
        connectedContent: research.connectedContent
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

  return (
    <div className={`
      bg-white rounded-lg shadow-md border-2 transition-all duration-200 min-w-[200px] max-w-[300px]
      ${selected ? 'border-amber-400 shadow-lg' : 'border-amber-200'}
      ${data.fromPlanning ? 'ring-2 ring-green-200' : ''}
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-amber-400 border-2 border-white"
      />
      
      {/* Header */}
      <div className="px-3 py-2 bg-amber-50 rounded-t-lg border-b border-amber-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getCategoryIcon()}
            <span className="text-xs font-medium text-amber-700">Research</span>
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
              className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 p-1 rounded transition-colors relative"
              title="Link to Research Data"
            >
              <span className="text-sm font-bold">⚛</span>
            </button>
            
            {/* Connect button */}
            <button
              onClick={handleConnectClick}
              className={`text-amber-600 hover:text-amber-800 hover:bg-amber-100 p-1 rounded transition-colors ${
                isConnecting ? 'bg-amber-200' : ''
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
              <div className="text-xs font-medium text-gray-600">Research Collections</div>
            </div>
            
            {loading ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                Loading research data...
              </div>
            ) : planningResearch.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                No research collections found
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {planningResearch.map((research) => (
                  <button
                    key={research.id}
                    onClick={() => handleResearchSelect(research)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-sm text-gray-900">{research.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {research.researchCategory} • {research.elementCount} elements
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {research.description}
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

        {/* Research Details */}
        <div className="space-y-2">
          {data.researchCategory && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Category:</span>
              <span className={`text-xs px-2 py-1 rounded-full border capitalize ${getCategoryColor()}`}>
                {data.researchCategory}
              </span>
            </div>
          )}
          
          {data.elementCount && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Elements:</span>
              <span className="text-xs text-gray-700">
                {data.elementCount}
              </span>
            </div>
          )}
          
          {data.connectedContent && data.connectedContent.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Connections:</span>
              <span className="text-xs text-gray-700">
                {data.connectedContent.length}
              </span>
            </div>
          )}
        </div>

        {/* Connected Content Preview */}
        {data.connectedContent && data.connectedContent.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Connected to:</div>
