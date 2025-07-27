// src/components/canvas/connection-controls.tsx
import React, { useState } from 'react';
import { Network, Eye, EyeOff, ChevronDown, Users, MapPin, BookOpen } from 'lucide-react';

interface ConnectionControlsProps {
  settings: {
    relationships: boolean;
    locations: boolean;
    plots: boolean;
  };
  onToggle: (type: 'relationships' | 'locations' | 'plots') => void;
  connectionCounts: {
    relationships: number;
    locations: number;
    plots: number;
  };
}

export const ConnectionControls: React.FC<ConnectionControlsProps> = ({
  settings,
  onToggle,
  connectionCounts
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const totalConnections = connectionCounts.relationships + connectionCounts.locations + connectionCounts.plots;
  const activeTypes = Object.entries(settings).filter(([_, active]) => active).length;

  return (
    <div className="absolute top-4 right-4 z-20">
      {/* Compact Toggle Button */}
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 hover:bg-gray-50 transition-colors"
          title={`${totalConnections} connections • ${activeTypes} types visible`}
        >
          <Network className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {totalConnections}
          </span>
          <div className="flex items-center gap-1">
            {settings.relationships && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
            {settings.locations && <div className="w-2 h-2 bg-green-500 rounded-full" />}
            {settings.plots && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
          </div>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Panel */}
        {isExpanded && (
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg py-2 min-w-[200px]">
            <div className="px-3 pb-2 text-xs font-medium text-gray-500 border-b border-gray-100">
              Connection Visibility
            </div>
            
            <div className="p-1">
              {/* Character Relationships */}
              <button
                onClick={() => onToggle('relationships')}
                className={`w-full flex items-center justify-between px-2 py-2 rounded text-sm transition-colors ${
                  settings.relationships 
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Character Links</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {connectionCounts.relationships}
                  </span>
                  {settings.relationships ? (
                    <Eye className="w-4 h-4 text-blue-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Location Connections */}
              <button
                onClick={() => onToggle('locations')}
                className={`w-full flex items-center justify-between px-2 py-2 rounded text-sm transition-colors ${
                  settings.locations 
                    ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Location Links</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {connectionCounts.locations}
                  </span>
                  {settings.locations ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Plot Connections */}
              <button
                onClick={() => onToggle('plots')}
                disabled
                className="w-full flex items-center justify-between px-2 py-2 rounded text-sm text-gray-400 cursor-not-allowed"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Plot Links</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    Soon
                  </span>
                  <EyeOff className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            </div>

            {/* Help Text */}
            {totalConnections === 0 && (
              <div className="mx-2 mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                💡 Add character relationships in Planning to see connections.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
