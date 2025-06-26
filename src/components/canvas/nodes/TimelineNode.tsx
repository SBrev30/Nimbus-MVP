import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

export interface TimelineNodeData {
  title: string;
  type: 'event' | 'milestone' | 'deadline' | 'turning_point';
  description: string;
  timeframe: string;
  duration?: string;
  order: number;
  significance: 'low' | 'medium' | 'high';
  connectedEvents?: string[];
}

interface TimelineNodeProps {
  data: TimelineNodeData;
  selected: boolean;
  id: string;
  onDataChange?: (newData: Partial<TimelineNodeData>) => void;
}

export const TimelineNode: React.FC<TimelineNodeProps> = ({ data, selected, onDataChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data);

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'event': return '📅';
      case 'milestone': return '🎯';
      case 'deadline': return '⏰';
      case 'turning_point': return '🔄';
      default: return '📅';
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const handleSave = () => {
    onDataChange?.(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(data);
    setIsEditing(false);
  };

  return (
    <div className={`timeline-node ${selected ? 
        'ring-2 ring-blue-400 ring-offset-2' : ''
    } ${getSignificanceColor(data.significance)} 
      px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] max-w-[300px] bg-white`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{getTimelineIcon(data.type)}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-gray-900">{data.title || 'Timeline Event'}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="capitalize">{data.type}</span>
            <span>•</span>
            <span>Order: {data.order}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="w-full px-2 py-1 text-sm font-semibold bg-white border border-gray-300 rounded"
              placeholder="Event title"
            />
            <select
              value={editData.type}
              onChange={(e) => setEditData({ ...editData, type: e.target.value as TimelineNodeData['type'] })}
              className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded"
            >
              <option value="event">Event</option>
              <option value="milestone">Milestone</option>
              <option value="deadline">Deadline</option>
              <option value="turning_point">Turning Point</option>
            </select>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded resize-none"
              rows={3}
              placeholder="Event description, consequences, timing..."
            />
            <input
              type="text"
              value={editData.timeframe}
              onChange={(e) => setEditData({ ...editData, timeframe: e.target.value })}
              className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded"
              placeholder="Timeframe (e.g., 'Day 1', 'Chapter 5')"
            />
            <input
              type="text"
              value={editData.duration || ''}
              onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
              className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded"
              placeholder="Duration (optional)"
            />
            <input
              type="number"
              value={editData.order}
              onChange={(e) => setEditData({ ...editData, order: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded"
              placeholder="Order in timeline"
            />
            <select
              value={editData.significance}
              onChange={(e) => setEditData({ ...editData, significance: e.target.value as TimelineNodeData['significance'] })}
              className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded"
            >
              <option value="low">Low Significance</option>
              <option value="medium">Medium Significance</option>
              <option value="high">High Significance</option>
            </select>
            
            <div className="flex gap-1">
              <button
                onClick={handleSave}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div onClick={() => setIsEditing(true)} className="cursor-pointer space-y-2">
            <div>
              <span className="text-xs font-medium text-gray-700">Timeframe: </span>
              <span className="text-xs text-gray-600">{data.timeframe}</span>
            </div>

            {data.duration && (
              <div>
                <span className="text-xs font-medium text-gray-700">Duration: </span>
                <span className="text-xs text-gray-600">{data.duration}</span>
              </div>
            )}

            {data.description && (
              <p className="text-xs leading-relaxed text-gray-700">
                {data.description}
              </p>
            )}

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 capitalize">Significance: {data.significance}</span>
              {data.connectedEvents && data.connectedEvents.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {data.connectedEvents.length} connected
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};