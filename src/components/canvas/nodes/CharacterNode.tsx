import React, { useState, useCallback } from 'react';
import { BaseCanvasNode, withCanvasComponent, BaseCanvasComponentProps } from '../core/BaseCanvasComponent';
import { User, Edit3, Heart, Brain } from 'lucide-react';

export interface CharacterNodeData {
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'other';
  description: string;
  age?: number;
  occupation?: string;
  motivation?: string;
  backstory?: string;
  appearance?: string;
  personality?: string;
  image?: string;
  completenessScore?: number;
  relationships?: Array<{
    characterId: string;
    type: 'family' | 'friend' | 'enemy' | 'romantic' | 'other';
    description: string;
  }>;
}

interface CharacterNodeProps extends BaseCanvasComponentProps {
  data: CharacterNodeData;
  isEditing?: boolean;
  onDataChange?: (field: string, value: any) => void;
  onAnalyzeAI?: (characterId: string) => void;
}

const CharacterNodeComponent: React.FC<CharacterNodeProps> = ({
  id,
  data,
  selected,
  isEditing,
  onDataChange,
  onAnalyzeAI
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'relationships'>('basic');

  const handleFieldChange = useCallback((field: string, value: any) => {
    if (onDataChange) {
      onDataChange(field, value);
    }
  }, [onDataChange]);

  const calculateCompleteness = useCallback(() => {
    const requiredFields = ['name', 'role', 'description'];
    const optionalFields = ['age', 'occupation', 'motivation', 'backstory', 'appearance', 'personality'];
    
    const requiredComplete = requiredFields.every(field => data[field as keyof CharacterNodeData]);
    const optionalComplete = optionalFields.filter(field => data[field as keyof CharacterNodeData]).length;
    
    return requiredComplete ? (50 + (optionalComplete / optionalFields.length) * 50) : 0;
  }, [data]);

  const completeness = calculateCompleteness();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'protagonist': return 'bg-green-100 border-green-300';
      case 'antagonist': return 'bg-red-100 border-red-300';
      case 'supporting': return 'bg-blue-100 border-blue-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'protagonist': return '🦸';
      case 'antagonist': return '🦹';
      case 'supporting': return '👥';
      default: return '👤';
    }
  };

  return (
    <BaseCanvasNode selected={selected} className={`character-node ${getRoleColor(data.role)}`}>
      {/* Character Header */}
      <div className="character-header">
        <div className="character-avatar">
          {data.image ? (
            <img src={data.image} alt={data.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
              {getRoleIcon(data.role)}
            </div>
          )}
        </div>
        <div className="character-info ml-3 flex-1">
          {isEditing ? (
            <input
              value={data.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="text-lg font-bold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
              placeholder="Character name..."
            />
          ) : (
            <h3 className="text-lg font-bold text-gray-800">{data.name || 'Unnamed Character'}</h3>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-600 capitalize">{data.role}</span>
            <div className="completeness-indicator">
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 ml-1">{Math.round(completeness)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Character Content Tabs */}
      <div className="character-content mt-3">
        <div className="tabs flex border-b border-gray-200 mb-3">
          <button
            className={`tab px-3 py-1 text-sm font-medium ${activeTab === 'basic' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic
          </button>
          <button
            className={`tab px-3 py-1 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`tab px-3 py-1 text-sm font-medium ${activeTab === 'relationships' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('relationships')}
          >
            Relations
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'basic' && (
            <div className="basic-info space-y-2">
              {isEditing ? (
                <>
                  <select
                    value={data.role}
                    onChange={(e) => handleFieldChange('role', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="protagonist">Protagonist</option>
                    <option value="antagonist">Antagonist</option>
                    <option value="supporting">Supporting</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea
                    value={data.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Character description..."
                    className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                    rows={3}
                  />
                </>
              ) : (
                <p className="text-sm text-gray-700 line-clamp-3">{data.description || 'No description yet...'}</p>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="details-info space-y-2">
              {isEditing ? (
                <>
                  <input
                    type="number"
                    value={data.age || ''}
                    onChange={(e) => handleFieldChange('age', parseInt(e.target.value) || undefined)}
                    placeholder="Age"
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    value={data.occupation || ''}
                    onChange={(e) => handleFieldChange('occupation', e.target.value)}
                    placeholder="Occupation"
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                  <textarea
                    value={data.motivation || ''}
                    onChange={(e) => handleFieldChange('motivation', e.target.value)}
                    placeholder="Motivation & goals..."
                    className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                    rows={2}
                  />
                </>
              ) : (
                <div className="text-sm text-gray-700 space-y-1">
                  {data.age && <div><strong>Age:</strong> {data.age}</div>}
                  {data.occupation && <div><strong>Occupation:</strong> {data.occupation}</div>}
                  {data.motivation && <div><strong>Motivation:</strong> {data.motivation}</div>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'relationships' && (
            <div className="relationships-info">
              <div className="text-sm text-gray-600">
                {data.relationships?.length || 0} relationships
              </div>
              {/* TODO: Implement relationship management UI */}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="character-actions mt-3 flex gap-2">
        {onAnalyzeAI && (
          <button
            onClick={() => onAnalyzeAI(id)}
            className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
          >
            <Brain size={12} />
            AI Analyze
          </button>
        )}
        <button className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors">
          <Heart size={12} />
          Connect
        </button>
      </div>
    </BaseCanvasNode>
  );
};

// Export the component wrapped with canvas functionality
export const CharacterNode = withCanvasComponent(CharacterNodeComponent);

// Default data for new character nodes
export const defaultCharacterData: CharacterNodeData = {
  name: '',
  role: 'other',
  description: '',
  relationships: []
};
