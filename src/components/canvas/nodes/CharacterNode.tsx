import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseCanvasNode, withCanvasComponent, BaseCanvasComponentProps } from '../core/BaseCanvasComponent';
import { useCanvasPlanningData } from '../../../hooks/useCanvasPlanningData';
import { CharacterPopup } from '../CharacterPopup';
import { User, Edit3, Heart, Brain, Atom } from 'lucide-react';

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
  completeness_score?: number;
  // Planning integration fields
  fromPlanning?: boolean;
  planningId?: string;
  traits?: string[];
  fantasyClass?: string;
  relationships?: Array<{
    characterId: string;
    type: 'family' | 'friend' | 'enemy' | 'romantic' | 'other';
    description: string;
  }>;
}

interface CharacterNodeProps extends BaseCanvasComponentProps {
  data: CharacterNodeData;
  isEditing?: boolean;
  onDataChange?: (newData: Partial<CharacterNodeData>) => void;
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  
  const { planningCharacters, loading } = useCanvasPlanningData();

  const handleFieldChange = useCallback((field: string, value: any) => {
    if (onDataChange) {
      onDataChange({ [field]: value });
    }
  }, [onDataChange]);

  const handleCharacterSelect = (character: any) => {
    if (onDataChange) {
      onDataChange({
        name: character.name,
        role: character.role,
        description: character.description,
        fromPlanning: true,
        planningId: character.id,
        traits: character.traits || [],
        age: character.age,
        occupation: character.occupation,
        completeness_score: character.completeness_score
      });
    }
    setShowDropdown(false);
  };

  const handleNodeClick = (event: React.MouseEvent) => {
    if (data.fromPlanning) {
      const rect = event.currentTarget.getBoundingClientRect();
      setPopupPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
      setShowPopup(true);
    }
  };

  const calculateCompleteness = useCallback(() => {
    const requiredFields = ['name', 'role', 'description'];
    const optionalFields = ['age', 'occupation', 'motivation', 'backstory', 'appearance', 'personality'];
    
    const requiredComplete = requiredFields.every(field => data[field as keyof CharacterNodeData]);
    const optionalComplete = optionalFields.filter(field => data[field as keyof CharacterNodeData]).length;
    
    return requiredComplete ? (50 + (optionalComplete / optionalFields.length) * 50) : 0;
  }, [data]);

  const getCompletionColor = (score: number = 0) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const completeness = data.fromPlanning ? (data.completeness_score || 0) : calculateCompleteness();

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
    <>
      <div 
        className={`bg-green-100 border-2 border-green-300 rounded-lg p-3 min-w-[180px] shadow-sm relative cursor-pointer transition-all hover:shadow-md ${getRoleColor(data.role)}`}
        onClick={handleNodeClick}
      >
        <Handle type="target" position={Position.Top} className="w-2 h-2" />
        
        {/* Character Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-green-800 text-sm flex items-center gap-2">
            {data.name || 'Character'}
            {data.fromPlanning && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-green-600">Linked</span>
              </div>
            )}
          </div>
          
          {!data.fromPlanning && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="text-xs bg-green-200 hover:bg-green-300 rounded p-1 transition-colors"
              title="Link to Planning Character"
            >
              <Atom className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="character-avatar-info flex items-center mb-2">
          <div className="character-avatar mr-2">
            {data.image ? (
              <img src={data.image} alt={data.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                {getRoleIcon(data.role)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-xs text-green-600 mb-1 capitalize">{data.role || 'Role'}</div>
            
            {/* Completeness Score */}
            {(data.fromPlanning || completeness > 0) && (
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-green-700">Completeness</span>
                  <span className="text-green-600">{Math.round(completeness)}%</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${getCompletionColor(completeness)}`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Character Description */}
        {isEditing ? (
          <div className="space-y-2">
            <input
              value={data.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full text-sm font-medium bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
              placeholder="Character name..."
            />
            <select
              value={data.role}
              onChange={(e) => handleFieldChange('role', e.target.value)}
              className="w-full p-1 border border-gray-300 rounded text-xs"
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
              className="w-full p-2 border border-gray-300 rounded text-xs resize-none"
              rows={3}
            />
          </div>
        ) : (
          <>
            {data.description && (
              <div className="text-xs text-green-700 line-clamp-2 mb-2">
                {data.description}
              </div>
            )}
          </>
        )}

        {/* Planning Dropdown */}
        {showDropdown && (
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[160px] max-h-48 overflow-y-auto">
            <div className="p-2 text-xs font-medium text-gray-700 border-b">
              {loading ? 'Loading...' : 'From Planning:'}
            </div>
            {!loading && planningCharacters.length === 0 && (
              <div className="p-2 text-xs text-gray-500">No characters found</div>
            )}
            {planningCharacters.map((char) => (
              <button
                key={char.id}
                onClick={() => handleCharacterSelect(char)}
                className="w-full text-left px-2 py-2 text-xs hover:bg-gray-100 flex flex-col border-b border-gray-100 last:border-b-0"
              >
                <span className="font-medium">{char.name}</span>
                <span className="text-gray-500 capitalize">{char.role}</span>
                {char.completeness_score !== undefined && (
                  <div className="mt-1 flex items-center gap-1">
                    <div className="w-8 bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${getCompletionColor(char.completeness_score)}`}
                        style={{ width: `${char.completeness_score}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{Math.round(char.completeness_score)}%</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="character-actions mt-3 flex gap-2">
          {onAnalyzeAI && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAnalyzeAI(id);
              }}
              className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
            >
              <Brain size={12} />
              AI Analyze
            </button>
          )}
          <button 
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
          >
            <Heart size={12} />
            Connect
          </button>
        </div>

        <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
      </div>

      {/* Character Popup */}
      {showPopup && data.fromPlanning && (
        <CharacterPopup
          character={{
            id: data.planningId || data.id || id,
            name: data.name || '',
            role: data.role || '',
            description: data.description || '',
            fantasyClass: data.fantasyClass,
            relationships: data.relationships || []
          }}
          position={popupPosition}
          onClose={() => setShowPopup(false)}
          onExpand={() => {
            console.log('Expand character:', data.planningId);
            setShowPopup(false);
          }}
        />
      )}
    </>
  );
};

// Export the component wrapped with canvas functionality
export const CharacterNode = withCanvasComponent(CharacterNodeComponent);

// Default data for new character nodes
export const defaultCharacterData: CharacterNodeData = {
  name: '',
  role: 'other',
  description: '',
  relationships: [],
  fromPlanning: false
};
