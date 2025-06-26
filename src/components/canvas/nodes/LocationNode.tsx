import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { MapPin, Eye, EyeOff, Edit2, Save, X } from 'lucide-react';
import { LocationNodeData } from '../types';

interface LocationNodeProps {
  data: LocationNodeData;
  selected: boolean;
  id: string;
  onDataChange?: (id: string, newData: Partial<LocationNodeData>) => void;
}

export const LocationNode: React.FC<LocationNodeProps> = ({ 
  data, 
  selected, 
  id,
  onDataChange 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editData, setEditData] = useState(data);

  const handleSave = useCallback(() => {
    onDataChange?.(id, editData);
    setIsEditing(false);
  }, [id, editData, onDataChange]);

  const handleCancel = useCallback(() => {
    setEditData(data);
    setIsEditing(false);
  }, [data]);

  const updateField = useCallback(<K extends keyof LocationNodeData>(field: K, value: LocationNodeData[K]) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  }, []);

  type NestedFields = Extract<keyof LocationNodeData, 'geography' | 'culture'>;
  const updateNestedField = useCallback((parent: NestedFields, field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  }, []);

  const getLocationColor = (type: string) => {
    switch (type) {
      case 'city': return 'bg-blue-100 border-blue-400 text-blue-900';
      case 'building': return 'bg-gray-100 border-gray-400 text-gray-900';
      case 'natural': return 'bg-green-100 border-green-400 text-green-900';
      case 'mystical': return 'bg-purple-100 border-purple-400 text-purple-900';
      case 'country': return 'bg-indigo-100 border-indigo-400 text-indigo-900';
      case 'region': return 'bg-teal-100 border-teal-400 text-teal-900';
      default: return 'bg-gray-100 border-gray-400 text-gray-900';
    }
  };

  const getImportanceIndicator = (importance: string) => {
    switch (importance) {
      case 'critical': return '🔴';
      case 'high': return '🟡';
      case 'moderate': return '🟢';
      case 'low': return '⚪';
      default: return '⚪';
    }
  };

  return (
    <div className={`location-node min-w-[220px] max-w-[350px] p-4 border-2 rounded-lg transition-all shadow-md ${
      selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''
    } ${getLocationColor(data.type)} bg-white bg-opacity-90`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="text-lg"> {getImportanceIndicator(data.importance)} <span className="sr-only">{data.importance} importance</span> </span>
          {isEditing ? (
            <input
              type="text"
              value={editData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="font-semibold text-sm bg-white border border-gray-300 rounded px-2 py-1 flex-1"
              placeholder="Location name"
            />
          ) : (
            <h3 className="font-semibold text-sm flex-1">{data.name || 'New Location'}</h3>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          {isEditing ? (
            <div className="flex gap-1">
              <button
                onClick={handleSave}
                className="p-1 hover:bg-green-200 rounded transition-colors"
                title="Save"
              >
                <Save size={14} />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-red-200 rounded transition-colors"
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
              title="Edit"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Type and Importance */}
      <div className="flex items-center gap-2 mb-2">
        {isEditing ? (
          <select
            value={editData.type}
            onChange={(e) => updateField('type', e.target.value)}
            className="text-xs bg-white border border-gray-300 rounded px-2 py-1 capitalize"
          >
            <option value="city">City</option>
            <option value="building">Building</option>
            <option value="natural">Natural</option>
            <option value="mystical">Mystical</option>
            <option value="country">Country</option>
            <option value="region">Region</option>
          </select>
        ) : (
          <span className="text-xs font-medium capitalize opacity-75">{data.type}</span>
        )}
        <span className="text-xs opacity-50">•</span>
        {isEditing ? (
          <select
            value={editData.importance}
            onChange={(e) => updateField('importance', e.target.value)}
            className="text-xs bg-white border border-gray-300 rounded px-2 py-1 capitalize"
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
        ) : (
          <span className="text-xs font-medium capitalize opacity-75">{data.importance} importance</span>
        )}
      </div>

      {/* Description */}
      <div className="mb-3">
        {isEditing ? (
          <textarea
            value={editData.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="w-full text-xs bg-white border border-gray-300 rounded px-2 py-1 resize-none"
            rows={3}
            placeholder="Location description, atmosphere, significance..."
          />
        ) : (
          <p className="text-xs leading-relaxed opacity-90">
            {data.description || 'No description provided...'}
          </p>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-3 pt-3 border-t border-current border-opacity-20">
          {/* Geography */}
          <div>
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
              🌍 Geography
            </h4>
            {isEditing ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={editData.geography?.climate || ''}
                  onChange={(e) => updateNestedField('geography', 'climate', e.target.value)}
                  className="w-full text-xs bg-white border border-gray-300 rounded px-2 py-1"
                  placeholder="Climate"
                />
                <input
                  type="text"
                  value={editData.geography?.terrain || ''}
                  onChange={(e) => updateNestedField('geography', 'terrain', e.target.value)}
                  className="w-full text-xs bg-white border border-gray-300 rounded px-2 py-1"
                  placeholder="Terrain"
                />
                <input
                  type="text"
                  value={editData.geography?.size || ''}
                  onChange={(e) => updateNestedField('geography', 'size', e.target.value)}
                  className="w-full text-xs bg-white border border-gray-300 rounded px-2 py-1"
                  placeholder="Size"
                />
              </div>
            ) : (
              data.geography && (
                <div className="text-xs space-y-1 opacity-80">
                  {data.geography.climate && <p>Climate: {data.geography.climate}</p>}
                  {data.geography.terrain && <p>Terrain: {data.geography.terrain}</p>}
                  {data.geography.size && <p>Size: {data.geography.size}</p>}
                </div>
              )
            )}
          </div>

          {/* Culture */}
          <div>
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
              🏛️ Culture
            </h4>
            {isEditing ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={editData.culture?.politics || ''}
                  onChange={(e) => updateNestedField('culture', 'politics', e.target.value)}
                  className="w-full text-xs bg-white border border-gray-300 rounded px-2 py-1"
                  placeholder="Politics"
                />
                <input
                  type="text"
                  value={editData.culture?.religion || ''}
                  onChange={(e) => updateNestedField('culture', 'religion', e.target.value)}
                  className="w-full text-xs bg-white border border-gray-300 rounded px-2 py-1"
                  placeholder="Religion"
                />
                <input
                  type="text"
                  value={editData.culture?.customs || ''}
                  onChange={(e) => updateNestedField('culture', 'customs', e.target.value)}
                  className="w-full text-xs bg-white border border-gray-300 rounded px-2 py-1"
                  placeholder="Customs"
                />
              </div>
            ) : (
              data.culture && (
                <div className="text-xs space-y-1 opacity-80">
                  {data.culture.politics && <p>Politics: {data.culture.politics}</p>}
                  {data.culture.religion && <p>Religion: {data.culture.religion}</p>}
                  {data.culture.customs && <p>Customs: {data.culture.customs}</p>}
                </div>
              )
            )}
          </div>

          {/* Connected Characters */}
          {data.connectedCharacters && data.connectedCharacters.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
                👥 Connected Characters
              </h4>
              <div className="flex flex-wrap gap-1">
                {data.connectedCharacters.map((char, idx) => (
                  <span 
                    key={idx} 
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};
