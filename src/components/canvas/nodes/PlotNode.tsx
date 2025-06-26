import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export interface PlotNodeData {
  title: string;
  type: 'event' | 'twist' | 'climax' | 'resolution' | 'rising_action' | 'falling_action';
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
  order?: number;
  chapter?: string;
  connectedCharacters?: string[];
  consequences?: string;
  foreshadowing?: string;
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

export const PlotNode: React.FC<PlotNodeProps> = ({ 
  data, 
  onDataChange, 
  selected = false 
}) => {
  const updateNodeData = (field: keyof PlotNodeData, value: any) => {
    if (onDataChange) {
      onDataChange({ [field]: value });
    }
  };

  return (
    <div className={`
      plot-node min-w-72 max-w-80 p-4 bg-white border-2 rounded-lg shadow-md
      ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''} 
      ${getSignificanceColor(data.significance)}
    `}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{getTypeIcon(data.type)}</span>
        <div className="flex-1">
          <input
            value={data.title}
            onChange={(e) => updateNodeData('title', e.target.value)}
            placeholder="Plot point title..."
            className="w-full text-sm font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
          />
          <div className="flex items-center gap-2 mt-1">
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
          </div>
        </div>
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
          
          {data.connectedCharacters && data.connectedCharacters.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {data.connectedCharacters.length} characters
            </span>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};
