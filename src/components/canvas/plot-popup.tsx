// src/components/canvas/plot-popup.tsx
import React from 'react';
import { 
  X, 
  ExternalLink, 
  TrendingUp, 
  Target, 
  Zap, 
  Users, 
  BookOpen,
  Edit3,
  MoreHorizontal
} from 'lucide-react';

interface PlotPopupProps {
  plot: {
    id: string;
    title: string;
    description: string;
    type: 'main' | 'subplot' | 'side_story' | 'character_arc';
    completion?: number;
    eventCount?: number;
    color?: string;
    tensionCurve?: number[];
    tags?: string[];
    connectedCharacters?: string[];
    connectedThreads?: string[];
    significance?: 'low' | 'medium' | 'high' | 'critical';
    events?: Array<{
      id: string;
      title: string;
      description: string;
      event_type: string;
      tension_level: number;
      chapter_reference?: string;
    }>;
  };
  position: { x: number; y: number };
  onClose: () => void;
  onExpand: () => void;
  onEdit?: () => void;
}

export const PlotPopup: React.FC<PlotPopupProps> = ({ 
  plot, 
  position, 
  onClose, 
  onExpand,
  onEdit
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'main': return '🌍';
      case 'subplot': return '📖';
      case 'side_story': return '🔀';
      case 'character_arc': return '👤';
      default: return '📄';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'setup': return '🎬';
      case 'conflict': return '⚔️';
      case 'climax': return '✨';
      case 'resolution': return '✅';
      default: return '📜';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'main': return 'bg-blue-100 text-blue-800';
      case 'subplot': return 'bg-purple-100 text-purple-800';
      case 'side_story': return 'bg-yellow-100 text-yellow-800';
      case 'character_arc': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderTensionCurve = (tensionCurve?: number[]) => {
    if (!tensionCurve || tensionCurve.length === 0) {
      return (
        <div className="w-full h-20 flex items-center justify-center text-gray-400 text-sm">
          No tension data
        </div>
      );
    }

    const maxTension = Math.max(...tensionCurve);
    const points = tensionCurve.map((tension, index) => {
      const x = (index / (tensionCurve.length - 1)) * 100;
      const y = 100 - (tension / maxTension) * 100;
      return `${x},${y}`;
    }).join(' ');

    const gradientId = `gradient-${plot.id}`;

    return (
      <svg className="w-full h-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={plot.color || '#3B82F6'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={plot.color || '#3B82F6'} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={plot.color || '#3B82F6'}
          strokeWidth="2"
          points={points}
        />
        <polygon
          fill={`url(#${gradientId})`}
          points={`0,100 ${points} 100,100`}
        />
      </svg>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div
        className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-w-md w-full"
        style={{
          left: Math.min(position.x, window.innerWidth - 400),
          top: Math.min(position.y, window.innerHeight - 600),
          maxHeight: '80vh',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-100">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-2xl mt-1">{getTypeIcon(plot.type)}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">
                {plot.title}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(plot.type)}`}>
                  {plot.type.replace('_', ' ').charAt(0).toUpperCase() + plot.type.replace('_', ' ').slice(1)}
                </span>
                {plot.significance && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSignificanceColor(plot.significance)}`}>
                    {plot.significance}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit Plot"
              >
                <Edit3 className="w-4 h-4 text-gray-500" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
          <div className="p-4 space-y-4">
            {/* Description */}
            <div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {plot.description || 'No description provided'}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              {plot.completion !== undefined && (
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <Target className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-blue-900">{plot.completion}%</div>
                  <div className="text-xs text-blue-700">Complete</div>
                </div>
              )}
              
              {plot.eventCount !== undefined && (
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <Zap className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-orange-900">{plot.eventCount}</div>
                  <div className="text-xs text-orange-700">Events</div>
                </div>
              )}
              
              {plot.connectedCharacters && (
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <Users className="w-4 h-4 text-green-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-green-900">{plot.connectedCharacters.length}</div>
                  <div className="text-xs text-green-700">Characters</div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {plot.completion !== undefined && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{plot.completion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${plot.completion}%`,
                      backgroundColor: plot.color || '#3B82F6'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Tension Curve */}
            {plot.tensionCurve && plot.tensionCurve.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <h4 className="font-medium text-gray-900">Tension Curve</h4>
                </div>
                {renderTensionCurve(plot.tensionCurve)}
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Beginning</span>
                  <span>Middle</span>
                  <span>End</span>
                </div>
              </div>
            )}

            {/* Recent Events */}
            {plot.events && plot.events.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <h4 className="font-medium text-gray-900">Recent Events</h4>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {plot.events.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                      <span className="text-sm">{getEventTypeIcon(event.event_type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-sm text-gray-900 truncate">
                            {event.title}
                          </h5>
                          {event.chapter_reference && (
                            <span className="px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                              {event.chapter_reference}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          Tension: {event.tension_level}/10
                        </div>
                      </div>
                    </div>
                  ))}
                  {plot.events.length > 3 && (
                    <div className="text-center text-xs text-gray-500 py-1">
                      +{plot.events.length - 3} more events
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Connected Characters */}
            {plot.connectedCharacters && plot.connectedCharacters.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <h4 className="font-medium text-gray-900">Connected Characters</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {plot.connectedCharacters.slice(0, 5).map((characterId, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {characterId.replace('-', ' ')}
                    </span>
                  ))}
                  {plot.connectedCharacters.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{plot.connectedCharacters.length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {plot.tags && plot.tags.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {plot.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={onExpand}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              View Full Details
            </button>
            
            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
