import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export interface ConflictNodeData {
  title: string;
  type: 'interpersonal' | 'internal' | 'societal' | 'supernatural' | 'environmental' | 'ideological';
  description: string;
  parties: string[];
  currentStatus: 'emerging' | 'escalating' | 'peak' | 'resolving' | 'resolved';
  escalation: number; // 1-10 scale
  impact: 'low' | 'medium' | 'high' | 'critical';
  stakes?: string;
  resolution?: string;
  connectedPlots?: string[];
}

interface ConflictNodeProps extends NodeProps {
  data: ConflictNodeData;
  onDataChange?: (newData: Partial<ConflictNodeData>) => void;
  selected?: boolean;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'interpersonal': return '👥';
    case 'internal': return '🧠';
    case 'societal': return '🏛️';
    case 'supernatural': return '🔮';
    case 'environmental': return '🌪️';
    case 'ideological': return '💭';
    default: return '⚔️';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'emerging': return 'border-blue-400 bg-blue-50';
    case 'escalating': return 'border-yellow-400 bg-yellow-50';
    case 'peak': return 'border-red-400 bg-red-50';
    case 'resolving': return 'border-green-400 bg-green-50';
    case 'resolved': return 'border-gray-400 bg-gray-50';
    default: return 'border-gray-300 bg-white';
  }
};

const getEscalationColor = (escalation: number) => {
  if (escalation <= 3) return 'bg-green-500';
  if (escalation <= 6) return 'bg-yellow-500';
  if (escalation <= 8) return 'bg-orange-500';
  return 'bg-red-500';
};

export const ConflictNode: React.FC<ConflictNodeProps> = ({ 
  data, 
  onDataChange, 
  selected = false 
}) => {
  const updateNodeData = (field: keyof ConflictNodeData, value: any) => {
    if (onDataChange) {
      onDataChange({ [field]: value });
    }
  };

  const addParty = () => {
    const newParty = prompt('Add a party to this conflict:');
    if (newParty && newParty.trim()) {
      updateNodeData('parties', [...(data.parties || []), newParty.trim()]);
    }
  };

  const removeParty = (index: number) => {
    const newParties = data.parties.filter((_, i) => i !== index);
    updateNodeData('parties', newParties);
  };

  return (
    <div className={`
      conflict-node min-w-72 max-w-80 p-4 bg-white border-2 rounded-lg shadow-md
      ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''} 
      ${getStatusColor(data.currentStatus)}
    `}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{getTypeIcon(data.type)}</span>
        <div className="flex-1">
          <input
            value={data.title}
            onChange={(e) => updateNodeData('title', e.target.value)}
            placeholder="Conflict title..."
            className="w-full text-sm font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:border-red-500"
          />
          <div className="flex items-center gap-2 mt-1">
            <select
              value={data.type}
              onChange={(e) => updateNodeData('type', e.target.value)}
              className="text-xs bg-transparent border-none outline-none capitalize"
            >
              <option value="interpersonal">Interpersonal</option>
              <option value="internal">Internal</option>
              <option value="societal">Societal</option>
              <option value="supernatural">Supernatural</option>
              <option value="environmental">Environmental</option>
              <option value="ideological">Ideological</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <textarea
          value={data.description}
          onChange={(e) => updateNodeData('description', e.target.value)}
          placeholder="Describe the nature of this conflict..."
          rows={3}
          className="w-full text-xs bg-transparent border-none outline-none resize-none placeholder-gray-400"
        />

        {/* Conflict Parties */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Parties Involved:</span>
            <button
              onClick={addParty}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              + Add
            </button>
          </div>
          {data.parties && data.parties.length > 0 ? (
            <div className="space-y-1">
              {data.parties.map((party, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 px-2 py-1 rounded text-xs">
                  <span>{party}</span>
                  <button
                    onClick={() => removeParty(index)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic">No parties specified</div>
          )}
        </div>

        {/* Stakes */}
        {data.stakes && (
          <div className="text-xs">
            <span className="font-medium text-gray-700">Stakes:</span>
            <div className="text-gray-600 mt-1">{data.stakes}</div>
          </div>
        )}

        {/* Escalation Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Escalation Level:</span>
            <span className="text-xs font-bold">{data.escalation}/10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getEscalationColor(data.escalation)}`}
              style={{ width: `${data.escalation * 10}%` }}
            ></div>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={data.escalation}
            onChange={(e) => updateNodeData('escalation', parseInt(e.target.value))}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Status and Impact */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <select
            value={data.currentStatus}
            onChange={(e) => updateNodeData('currentStatus', e.target.value)}
            className="text-xs bg-transparent border-none outline-none capitalize"
          >
            <option value="emerging">Emerging</option>
            <option value="escalating">Escalating</option>
            <option value="peak">At Peak</option>
            <option value="resolving">Resolving</option>
            <option value="resolved">Resolved</option>
          </select>
          
          <select
            value={data.impact}
            onChange={(e) => updateNodeData('impact', e.target.value)}
            className="text-xs bg-transparent border-none outline-none capitalize"
          >
            <option value="low">Low Impact</option>
            <option value="medium">Medium Impact</option>
            <option value="high">High Impact</option>
            <option value="critical">Critical Impact</option>
          </select>
        </div>

        {/* Resolution */}
        {data.resolution && (
          <div className="text-xs">
            <span className="font-medium text-gray-700">Resolution:</span>
            <div className="text-gray-600 mt-1">{data.resolution}</div>
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};
