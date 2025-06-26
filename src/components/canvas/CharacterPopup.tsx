import React from 'react';
import { X, User, Sword, Heart, Users } from 'lucide-react';

interface CharacterPopupProps {
  character: {
    id: string;
    name: string;
    role: string;
    description: string;
    fantasyClass?: string;
    relationships?: string[];
  };
  position: { x: number; y: number };
  onClose: () => void;
  onExpand: () => void;
}

export const CharacterPopup: React.FC<CharacterPopupProps> = ({
  character,
  position,
  onClose,
  onExpand
}) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'protagonist': return '🦸';
      case 'antagonist': return '👹';
      case 'supporting': return '👥';
      default: return '👤';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'protagonist': return 'text-blue-600';
      case 'antagonist': return 'text-red-600';
      case 'supporting': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-40"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div
        className="character-popup fixed z-50 bg-white rounded-lg shadow-xl border-2 border-gray-200 p-4 max-w-xs animate-in fade-in duration-200"
        style={{
          left: Math.min(position.x, window.innerWidth - 300),
          top: Math.max(position.y - 200, 50),
          transform: 'translate(-50%, 0)'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getRoleIcon(character.role)}</span>
            <h3 className="font-semibold text-gray-900 truncate max-w-[200px]">
              {character.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User size={14} className="text-gray-500 flex-shrink-0" />
            <span className={`text-sm font-medium capitalize ${getRoleColor(character.role)}`}>
              {character.role}
            </span>
          </div>

          {character.fantasyClass && (
            <div className="flex items-center gap-2">
              <Sword size={14} className="text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">{character.fantasyClass}</span>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700 line-clamp-4 leading-relaxed">
              {character.description || 'No description available'}
            </p>
          </div>

          {character.relationships && character.relationships.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-red-400" />
                <span className="text-xs text-gray-500">
                  {character.relationships.length} relationship{character.relationships.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex -space-x-1">
                {character.relationships.slice(0, 3).map((rel, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 bg-blue-100 border-2 border-white rounded-full flex items-center justify-center text-xs"
                    title={rel}
                  >
                    👤
                  </div>
                ))}
                {character.relationships.length > 3 && (
                  <div className="w-6 h-6 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center text-xs text-gray-600">
                    +{character.relationships.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={onExpand}
            className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            View Profile
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};