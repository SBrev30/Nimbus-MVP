import React from 'react';
import { 
  Grid3X3, 
  Clock, 
  GitBranch, 
  TrendingUp,
  Eye 
} from 'lucide-react';

interface VisualizationSelectorProps {
  currentMode: string;
  onModeChange: (mode: string) => void;
}

export const VisualizationSelector: React.FC<VisualizationSelectorProps> = ({
  currentMode,
  onModeChange
}) => {
  const modes = [
    {
      id: 'canvas',
      name: 'Canvas',
      icon: Grid3X3,
      description: 'Visual node editing'
    },
    {
      id: 'timeline',
      name: 'Timeline',
      icon: Clock,
      description: 'Chronological view'
    },
    {
      id: 'relationships',
      name: 'Relationships',
      icon: GitBranch,
      description: 'Connection analysis'
    },
    {
      id: 'influence',
      name: 'Influence',
      icon: TrendingUp,
      description: 'Character influence map'
    }
  ];

  return (
    <div className="flex items-center gap-1">
      <Eye className="w-4 h-4 text-gray-500 mr-2" />
      <span className="text-sm font-medium text-gray-700 mr-3">View:</span>
      
      {modes.map((mode) => {
        const IconComponent = mode.icon;
        const isActive = currentMode === mode.id;
        
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${isActive 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
            title={mode.description}
          >
            <IconComponent className="w-4 h-4" />
            <span className="hidden sm:inline">{mode.name}</span>
          </button>
        );
      })}
    </div>
  );
};
