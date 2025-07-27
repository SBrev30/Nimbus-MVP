import React, { useEffect, useRef } from 'react';
import { ExternalLink, X, MapPin, Globe } from 'lucide-react';

interface LocationPopupProps {
  location: {
    id: string;
    name: string;
    type: string;
    description: string;
    importance: string;
    geography?: {
      climate?: string;
      terrain?: string;
      size?: string;
    };
    culture?: {
      politics?: string;
      religion?: string;
      customs?: string;
    };
    connectedCharacters?: string[];
  };
  position: { x: number; y: number };
  onClose: () => void;
  onExpand: () => void;
}

export const LocationPopup: React.FC<LocationPopupProps> = ({
  location,
  position,
  onClose,
  onExpand
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'city': return 'bg-blue-100 text-blue-800';
      case 'building': return 'bg-gray-100 text-gray-800';
      case 'natural': return 'bg-green-100 text-green-800';
      case 'mystical': return 'bg-purple-100 text-purple-800';
      case 'country': return 'bg-indigo-100 text-indigo-800';
      case 'region': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'city': return '🏙️';
      case 'building': return '🏢';
      case 'natural': return '🌲';
      case 'mystical': return '✨';
      case 'country': return '🗺️';
      case 'region': return '🌍';
      default: return '📍';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'critical': return '🔴';
      case 'high': return '🟡';
      case 'moderate': return '🟢';
      case 'low': return '⚪';
      default: return '⚪';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      style={{
        left: 0,
        top: 0,
      }}
    >
      <div
        ref={popupRef}
        className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-xs pointer-events-auto transform -translate-x-1/2 -translate-y-full"
        style={{
          left: position.x,
          top: position.y - 10,
          minWidth: '320px',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-3 pr-6">
          <span className="text-xl flex-shrink-0">
            {getTypeIcon(location.type)}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 leading-tight">
              {location.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTypeColor(location.type)}`}>
                {location.type}
              </span>
              <span className="text-sm">{getImportanceIcon(location.importance)}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {location.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {location.description}
          </p>
        )}

        {/* Geography Info */}
        {location.geography && Object.keys(location.geography).length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Globe className="w-3 h-3" />
              <span>Geography</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              {location.geography.climate && (
                <div>Climate: {location.geography.climate}</div>
              )}
              {location.geography.terrain && (
                <div>Terrain: {location.geography.terrain}</div>
              )}
              {location.geography.size && (
                <div>Size: {location.geography.size}</div>
              )}
            </div>
          </div>
        )}

        {/* Culture Info */}
        {location.culture && Object.keys(location.culture).length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <span>🏛️</span>
              <span>Culture</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              {location.culture.politics && (
                <div>Politics: {location.culture.politics}</div>
              )}
              {location.culture.religion && (
                <div>Religion: {location.culture.religion}</div>
              )}
              {location.culture.customs && (
                <div>Customs: {location.culture.customs}</div>
              )}
            </div>
          </div>
        )}

        {/* Connected Characters */}
        {location.connectedCharacters && location.connectedCharacters.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <span>👥</span>
              <span>Connected Characters</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {location.connectedCharacters.slice(0, 3).map((char, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {char}
                </span>
              ))}
              {location.connectedCharacters.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{location.connectedCharacters.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onExpand}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Details
          </button>
        </div>

        {/* Arrow pointing to node */}
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
        />
      </div>
    </div>
  );
};