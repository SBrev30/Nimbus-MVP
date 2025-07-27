// src/components/canvas/connection-controls.tsx
import React from 'react';

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
  return (
    <div className="connection-controls absolute top-4 right-4 z-20 bg-white rounded-lg shadow-lg border p-3 max-w-xs">
      <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
        Show Connections
      </div>
      
      <div className="space-y-2">
        <label className="flex items-center justify-between gap-3 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.relationships}
              onChange={() => onToggle('relationships')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">Character Relationships</span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {connectionCounts.relationships}
          </span>
        </label>
        
        <label className="flex items-center justify-between gap-3 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.locations}
              onChange={() => onToggle('locations')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">Location Associations</span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {connectionCounts.locations}
          </span>
        </label>
        
        <label className="flex items-center justify-between gap-3 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded opacity-50">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.plots}
              onChange={() => onToggle('plots')}
              disabled
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">Plot Participation</span>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            Soon
          </span>
        </label>
      </div>
      
      {(connectionCounts.relationships + connectionCounts.locations) === 0 && (
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
          💡 Add characters with relationships to your planning pages to see connections here.
        </div>
      )}
    </div>
  );
};
