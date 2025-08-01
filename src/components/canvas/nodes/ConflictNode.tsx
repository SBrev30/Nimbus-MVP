// src/components/canvas/nodes/ConflictNode.tsx
import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Zap, Shield, Users, Building, AlertTriangle } from 'lucide-react';
import { useCanvasPlanningData } from '../../../hooks/useCanvasPlanningData';
import type { CanvasConflictData } from '../../../services/canvas-integration-service';

interface ConflictNodeData {
  id: string;
  name: string;
  description: string;
  fromPlanning?: boolean;
  planningId?: string;
  conflictType?: 'internal' | 'external' | 'interpersonal' | 'societal';
  tensionLevel?: number;
  charactersInvolved?: string[];
  plotThreads?: string[];
}

interface ConflictNodeProps {
  id: string;
  data: ConflictNodeData;
  selected?: boolean;
  onDataChange?: (newData: Partial<ConflictNodeData>) => void;
  onConnect?: (nodeId: string) => void;
  projectId?: string;
}

const ConflictNode: React.FC<ConflictNodeProps> = ({
  id,
  data,
  selected,
  onDataChange,
  onConnect,
  projectId
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { planningConflicts, loading } = useCanvasPlanningData(projectId);

  // Handle conflict selection from planning data
  const handleConflictSelect = useCallback((conflict: CanvasConflictData) => {
    if (onDataChange) {
      onDataChange({
        ...data,
        name: conflict.name,
        description: conflict.description,
        fromPlanning: true,
        planningId: conflict.id,
        conflictType: conflict.conflictType,
        tensionLevel: conflict.tensionLevel,
        charactersInvolved: conflict.charactersInvolved,
        plotThreads: conflict.plotThreads
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

  // Get conflict type icon
  const getConflictIcon = () => {
    switch (data.conflictType) {
      case 'internal':
        return <Shield className="w-4 h-4" />;
      case 'external':
        return <Zap className="w-4 h-4" />;
      case 'interpersonal':
        return <Users className="w-4 h-4" />;
      case 'societal':
        return <Building className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Get conflict type color
  const getConflictColor = () => {
    switch (data.conflictType) {
      case 'internal':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'external':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'interpersonal':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'societal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get tension level color and indicator
  const getTensionIndicator = () => {
    const level = data.tensionLevel || 0;
    if (level >= 8) return { color: 'bg-red-500', text: 'Critical' };
    if (level >= 6) return { color: 'bg-orange-500', text: 'High' };
    if (level >= 4) return { color: 'bg-yellow-500', text: 'Medium' };
    return { color: 'bg-green-500', text: 'Low' };
  };

  const tensionIndicator = getTensionIndicator();

  return (
    <div className={`
      bg-white rounded-lg shadow-md border-2 transition-all duration-200 min-w-[200px] max-w-[300px]
      ${selected ? 'border-red-400 shadow-lg' : 'border-red-200'}
      ${data.fromPlanning ? 'ring-2 ring-green-200' : ''}
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-red-400 border-2 border-white"
      />
      
      {/* Header */}
      <div className="px-3 py-2 bg-red-50 rounded-t-lg border-b border-red-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getConflictIcon()}
            <span className="text-xs font-medium text-red-700">Conflict</span>
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
              className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded transition-colors relative"
              title="Link to Planning Conflicts"
            >
              <span className="text-sm font-bold">⚛</span>
            </button>
            
            {/* Connect button */}
            <button
              onClick={handleConnectClick}
              className={`text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded transition-colors ${
                isConnecting ? 'bg-red-200' : ''
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
              <div className="text-xs font-medium text-gray-600">Story Conflicts</div>
            </div>
            
            {loading ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                Loading conflicts...
              </div>
            ) : planningConflicts.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                No conflicts detected
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {planningConflicts.map((conflict) => (
                  <button
                    key={conflict.id}
                    onClick={() => handleConflictSelect(conflict)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-sm text-gray-900">{conflict.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {conflict.conflictType} • Tension: {conflict.tensionLevel}/10
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {conflict.description}
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

        {/* Conflict Details */}
        <div className="space-y-2">
          {data.conflictType && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Type:</span>
              <span className={`text-xs px-2 py-1 rounded-full border capitalize ${getConflictColor()}`}>
                {data.conflictType}
              </span>
            </div>
          )}
          
          {data.tensionLevel !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Tension:</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${tensionIndicator.color}`}></div>
                <span className="text-xs text-gray-700">
                  {data.tensionLevel}/10 ({tensionIndicator.text})
                </span>
              </div>
            </div>
          )}
          
          {data.charactersInvolved && data.charactersInvolved.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Characters:</span>
              <span className="text-xs text-gray-700">
                {data.charactersInvolved.length}
              </span>
            </div>
          )}
          
          {data.plotThreads && data.plotThreads.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Plot Threads:</span>
              <span className="text-xs text-gray-700">
                {data.plotThreads.length}
              </span>
            </div>
          )}
        </div>

        {/* Tension Level Visual Indicator */}
        {data.tensionLevel !== undefined && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Tension Level</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  data.tensionLevel >= 8 ? 'bg-red-500' :
                  data.tensionLevel >= 6 ? 'bg-orange-500' :
                  data.tensionLevel >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${(data.tensionLevel / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-red-400 border-2 border-white"
      />
    </div>
  );
};

export default ConflictNode;
