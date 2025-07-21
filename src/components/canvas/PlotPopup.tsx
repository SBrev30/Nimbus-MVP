import React, { useEffect, useRef } from 'react';
import { ExternalLink, X, TrendingUp, Hash } from 'lucide-react';

interface PlotPopupProps {
  plot: {
    id: string;
    title: string;
    type: string;
    description: string;
    completion?: number;
    eventCount?: number;
    color?: string;
  };
  position: { x: number; y: number };
  onClose: () => void;
  onExpand: () => void;
}

export const PlotPopup: React.FC<PlotPopupProps> = ({
  plot,
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
      case 'main': return 'bg-blue-100 text-blue-800';
      case 'subplot': return 'bg-green-100 text-green-800';
      case 'side_story': return 'bg-purple-100 text-purple-800';
      case 'character_arc': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'main': return '🌍';
      case 'subplot': return '📖';
      case 'side_story': return '🔀';
      case 'character_arc': return '👤';
      default: return '📄';
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
          minWidth: '280px',
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
            {getTypeIcon(plot.type)}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 leading-tight">
              {plot.title}
            </h3>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTypeColor(plot.type)}`}>
              {plot.type.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Description */}
        {plot.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {plot.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mb-3 text-sm">
          {plot.completion !== undefined && (
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${plot.completion}%`,
                    backgroundColor: plot.color || '#3B82F6'
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">{plot.completion}%</span>
            </div>
          )}
          
          {plot.eventCount !== undefined && (
            <div className="flex items-center gap-1 text-gray-500">
              <Hash className="w-3 h-3" />
              <span className="text-xs">{plot.eventCount} events</span>
            </div>
          )}
        </div>

        {/* Tension Indicator */}
        {plot.color && (
          <div className="mb-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Thread Color</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: plot.color }}
              />
              <span className="text-xs text-gray-600">{plot.color}</span>
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