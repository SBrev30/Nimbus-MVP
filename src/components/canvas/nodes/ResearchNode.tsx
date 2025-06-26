import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

export interface ResearchNodeData {
  title: string;
  content: string;
  source?: string;
  tags: string[];
  category: 'worldbuilding' | 'character' | 'plot' | 'historical' | 'technical' | 'other';
  credibility: 'low' | 'medium' | 'high';
  dateAdded: string;
}

interface ResearchNodeProps {
  data: ResearchNodeData;
  selected: boolean;
  id: string;
  onDataChange?: (newData: Partial<ResearchNodeData>) => void;
}

export const ResearchNode: React.FC<ResearchNodeProps> = ({ data, selected, onDataChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'worldbuilding': return 'bg-green-100 border-green-300 text-green-800';
      case 'character': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'plot': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'historical': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'technical': return 'bg-gray-100 border-gray-300 text-gray-800';
      default: return 'bg-indigo-100 border-indigo-300 text-indigo-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'worldbuilding': return '🌍';
      case 'character': return '👤';
      case 'plot': return '📖';
      case 'historical': return '📜';
      case 'technical': return '⚙️';
      default: return '🔍';
    }
  };

  const getCredibilityColor = (credibility: string) => {
    switch (credibility) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const handleTagAdd = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !editData.tags.includes(trimmedTag)) {
      setEditData({
        ...editData,
        tags: [...editData.tags, trimmedTag]
      });
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setEditData({
      ...editData,
      tags: editData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className={`research-node ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''} ${getCategoryColor(data.category)} 
      px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] max-w-[300px] bg-white`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{getCategoryIcon(data.category)}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-gray-900">{data.title || 'Research Note'}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="capitalize">{data.category}</span>
            <span>•</span>
            <span className={`px-2 py-1 rounded-full ${getCredibilityColor(data.credibility)}`}>
              {data.credibility} credibility
            </span>
          </div>
        </div>
      </div>
        
      <div className="research-info">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="w-full px-2 py-1 text-sm font-semibold bg-white border border-gray-300 rounded"
              placeholder="Research title"
            />
            <select
              value={editData.category}
              onChange={(e) => setEditData({ ...editData, category: e.target.value as ResearchNodeData['category'] })}
              className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded"
            >
              <option value="worldbuilding">Worldbuilding</option>
              <option value="character">Character</option>
              <option value="plot">Plot</option>
              <option value="historical">Historical</option>
              <option value="technical">Technical</option>
              <option value="other">Other</option>
            </select>
            <textarea
              value={editData.content}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
              className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded resize-none"
              rows={4}
              placeholder="Research content and notes"
            />
            <input
              type="text"
              value={editData.source || ''}
              onChange={(e) => setEditData({ ...editData, source: e.target.value })}
              className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded"
              placeholder="Source (optional)"
            />
            <select
              value={editData.credibility}
              onChange={(e) => setEditData({ ...editData, credibility: e.target.value as ResearchNodeData['credibility'] })}
              className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded"
            >
              <option value="high">High Credibility</option>
              <option value="medium">Medium Credibility</option>
              <option value="low">Low Credibility</option>
            </select>
            
            {/* Tags management */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Tags:</label>
              <div className="flex flex-wrap gap-1">
                {editData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => handleTagRemove(tag)}
                      className="hover:text-indigo-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add tag (press Enter)"
                className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleTagAdd(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
            
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
            {data.content && (
              <p className="text-xs leading-relaxed text-gray-700 line-clamp-4">
                {data.content}
              </p>
            )}
            
            {data.source && (
              <p className="text-xs text-gray-600 italic">
                📖 Source: {data.source}
              </p>
            )}
            
            {data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {data.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {data.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{data.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};