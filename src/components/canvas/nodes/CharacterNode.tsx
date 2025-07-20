import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseCanvasNode, withCanvasComponent, BaseCanvasComponentProps } from '../core/BaseCanvasComponent';
import { useCanvasPlanningData } from '../../../hooks/useCanvasPlanningData';
import { CharacterPopup } from '../CharacterPopup';
import { User, Heart, Brain, Atom, ChevronDown, X, Search, Link, Edit } from 'lucide-react';

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
  onConnect?: (nodeId: string) => void;
  onEdit?: (nodeId: string) => void;
}

const CharacterNodeComponent: React.FC<CharacterNodeProps> = ({
  id,
  data,
  selected,
  isEditing,
  onDataChange,
  onAnalyzeAI,
  onConnect,
  onEdit
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { planningCharacters, loading, refreshCharacters } = useCanvasPlanningData();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSearchQuery('');
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  // Refresh characters when component mounts
  useEffect(() => {
    refreshCharacters();
  }, [refreshCharacters]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    if (onDataChange) {
      onDataChange({ [field]: value });
    }
  }, [onDataChange]);

  const handleCharacterSelect = useCallback((character: any) => {
    console.log('Selecting character:', character);
    
    if (onDataChange) {
      // Map all character data from planning
      onDataChange({
        name: character.name || '',
        role: character.role || 'supporting',
        description: character.description || '',
        age: character.age,
        occupation: character.occupation || '',
        motivation: character.motivation || '',
        backstory: character.backstory || '',
        appearance: character.appearance || '',
        personality: character.personality || '',
        fantasyClass: character.fantasyClass || '',
        traits: character.traits || [],
        fromPlanning: true,
        planningId: character.id,
        completeness_score: character.completeness_score || 0,
        relationships: character.relationships || []
      });
    }
    
    setShowDropdown(false);
    setSearchQuery('');
  }, [onDataChange]);

  const handleDropdownToggle = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setShowDropdown(!showDropdown);
    setSearchQuery('');
  }, [showDropdown]);

  const handleNodeClick = (event: React.MouseEvent) => {
    if (isConnecting) {
      // Cancel connection mode
      setIsConnecting(false);
      return;
    }

    if (data.fromPlanning && !isEditing) {
      const rect = event.currentTarget.getBoundingClientRect();
      setPopupPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
      setShowPopup(true);
    }
  };

  const handleUnlinkCharacter = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    if (onDataChange) {
      onDataChange({
        fromPlanning: false,
        planningId: undefined,
        // Keep current data but remove planning link
      });
    }
  }, [onDataChange]);

  const handleConnectClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    if (onConnect) {
      setIsConnecting(true);
      onConnect(id);
    }
  }, [onConnect, id]);

  const handleEditClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    if (onEdit) {
      onEdit(id);
    }
  }, [onEdit, id]);

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
      case 'protagonist': return '⭐';
      case 'antagonist': return '⚡';
      case 'supporting': return '👥';
      default: return '👤';
    }
  };

  // Filter characters based on search
  const filteredCharacters = planningCharacters.filter(char =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div 
        className={`rounded-lg p-3 min-w-[200px] max-w-[280px] shadow-sm relative transition-all hover:shadow-md ${
          isConnecting ? 'ring-2 ring-blue-400 bg-blue-50' : ''
        } ${selected ? 'ring-2 ring-purple-400 ring-offset-2' : ''} ${getRoleColor(data.role)}`}
        onClick={handleNodeClick}
        style={{ cursor: isConnecting ? 'crosshair' : 'pointer' }}
      >
        <Handle type="target" position={Position.Top} className="w-2 h-2" />
        
        {/* Character Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-sm flex items-center gap-2 flex-1 min-w-0">
            <span className="flex-shrink-0">{data.name || 'Character'}</span>
            {data.fromPlanning && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-green-600">Linked</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {data.fromPlanning ? (
              <button
                onClick={handleUnlinkCharacter}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded p-1 transition-colors"
                title="Unlink from Planning Character"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleDropdownToggle}
                  className="text-xs bg-green-200 hover:bg-green-300 rounded p-1 transition-colors flex items-center gap-1"
                  title="Link to Planning Character"
                >
                  <Atom className="w-3 h-3" />
                  <ChevronDown className="w-2 h-2" />
                </button>
                
                {/* Planning Dropdown */}
                {showDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[200px] max-w-[280px]">
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search characters..."
                          className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto">
                      {loading ? (
                        <div className="p-3 text-xs text-gray-500 text-center">Loading characters...</div>
                      ) : filteredCharacters.length === 0 ? (
                        searchQuery ? (
                          <div className="p-3 text-xs text-gray-500 text-center">No characters match "{searchQuery}"</div>
                        ) : (
                          <div className="p-3 text-xs text-gray-500 text-center">No characters found in planning</div>
                        )
                      ) : (
                        filteredCharacters.map((char) => (
                          <button
                            key={char.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleCharacterSelect(char);
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 flex flex-col border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">{char.name}</span>
                              <span className="text-xs text-gray-500 capitalize">{char.role}</span>
                            </div>
                            
                            {char.description && (
                              <span className="text-gray-600 line-clamp-1 mb-1">{char.description}</span>
                            )}
                            
                            {char.completeness_score !== undefined && (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-1">
                                  <div 
                                    className={`h-1 rounded-full ${getCompletionColor(char.completeness_score)}`}
                                    style={{ width: `${char.completeness_score}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400">{Math.round(char.completeness_score)}%</span>
                              </div>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="character-avatar-info flex items-center mb-2">
          <div className="character-avatar mr-2">
            {data.image ? (
              <img src={data.image} alt={data.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                {getRoleIcon(data.role)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-green-600 mb-1 capitalize">{data.role || 'Role'}</div>
            
            {/* Completeness Score */}
            {(data.fromPlanning || completeness > 0) && (
              <div className="mb-1">
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
              onClick={(e) => e.stopPropagation()}
            />
            <select
              value={data.role}
              onChange={(e) => handleFieldChange('role', e.target.value)}
              className="w-full p-1 border border-gray-300 rounded text-xs"
              onClick={(e) => e.stopPropagation()}
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
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <>
            {data.description && (
              <div className="text-xs text-green-700 line-clamp-2 mb-2">
                {data.description}
              </div>
            )}
            
            {/* Fantasy Class */}
            {data.fantasyClass && (
              <div className="text-xs text-purple-600 mb-2 flex items-center gap-1">
                <span className="text-purple-500">⚔️</span>
                {data.fantasyClass}
              </div>
            )}

            {/* Additional character details */}
            {data.age && (
              <div className="text-xs text-gray-600 mb-1">
                Age: {data.age}
              </div>
            )}
            
            {data.occupation && (
              <div className="text-xs text-gray-600 mb-1">
                Occupation: {data.occupation}
              </div>
            )}
          </>
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
              title="AI Analyze Character"
            >
              <Brain size={10} />
              AI
            </button>
          )}
          
          <button 
            onClick={handleConnectClick}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              isConnecting 
                ? 'bg-blue-200 text-blue-800' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            title={isConnecting ? 'Click another node to connect' : 'Create connection'}
          >
            <Link size={10} />
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>

          {data.fromPlanning && (
            <button 
              onClick={handleEditClick}
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
              title="Edit in Planning"
            >
              <Edit size={10} />
              Edit
            </button>
          )}
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
            relationships: data.relationships?.map(r => r.characterId) || []
          }}
          position={popupPosition}
          onClose={() => setShowPopup(false)}
          onExpand={() => {
            console.log('Expand character:', data.planningId);
            // Navigate to character planning page
            if (onEdit) {
              onEdit(data.planningId || id);
            }
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
