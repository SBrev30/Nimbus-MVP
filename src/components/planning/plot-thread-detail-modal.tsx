import React from 'react';
import { X, Circle, Calendar, Users, Hash, TrendingUp } from 'lucide-react';
import type { PlotThread } from '../../types/plot';

interface PlotThreadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: PlotThread | null;
  onEdit?: (thread: PlotThread) => void;
}

export function PlotThreadDetailModal({ 
  isOpen, 
  onClose, 
  thread,
  onEdit 
}: PlotThreadDetailModalProps) {
  if (!isOpen || !thread) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'main':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'subplot':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'side_story':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'character_arc':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateCompleteness = () => {
    let score = 0;
    
    // Basic info (40%)
    if (thread.title && thread.title.trim().length > 0) score += 15;
    if (thread.description && thread.description.trim().length > 20) score += 15;
    if (thread.type) score += 10;

    // Events (30%)
    const eventCount = thread.events?.length || 0;
    if (eventCount > 0) score += 10;
    if (eventCount >= 3) score += 10;
    if (eventCount >= 5) score += 10;

    // Connections (20%)
    if (thread.connected_character_ids && thread.connected_character_ids.length > 0) score += 10;
    if (thread.connected_thread_ids && thread.connected_thread_ids.length > 0) score += 10;

    // Tension curve (10%)
    if (thread.start_tension !== undefined && thread.peak_tension !== undefined && thread.end_tension !== undefined) score += 10;

    return Math.min(score, 100);
  };

  const completeness = thread.completion_percentage || calculateCompleteness();

  const renderTensionCurve = () => {
    if (!thread.start_tension && !thread.peak_tension && !thread.end_tension) {
      return null;
    }

    const tensions = [
      thread.start_tension || 1,
      thread.peak_tension || 7,
      thread.end_tension || 2
    ];

    const maxTension = Math.max(...tensions);
    const points = tensions.map((tension, index) => {
      const x = (index / (tensions.length - 1)) * 100;
      const y = 100 - (tension / maxTension) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="mt-2">
        <svg className="w-full h-16" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={thread.color || '#3B82F6'}
            strokeWidth="3"
            points={points}
          />
          <circle cx="0" cy={100 - ((thread.start_tension || 1) / maxTension) * 100} r="2" fill={thread.color || '#3B82F6'} />
          <circle cx="50" cy={100 - ((thread.peak_tension || 7) / maxTension) * 100} r="2" fill={thread.color || '#3B82F6'} />
          <circle cx="100" cy={100 - ((thread.end_tension || 2) / maxTension) * 100} r="2" fill={thread.color || '#3B82F6'} />
        </svg>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Start: {thread.start_tension || 1}</span>
          <span>Peak: {thread.peak_tension || 7}</span>
          <span>End: {thread.end_tension || 2}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {thread.color && (
              <Circle 
                className="w-4 h-4 flex-shrink-0" 
                style={{ color: thread.color, fill: thread.color }}
              />
            )}
            <h2 className="text-xl font-semibold text-gray-900">{thread.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Thread Type and Status */}
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getTypeColor(thread.type)}`}>
              {thread.type.replace('_', ' ')}
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${completeness}%` }}
                ></div>
              </div>
              <span>{completeness}% complete</span>
            </div>
            {thread.status && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full capitalize">
                {thread.status}
              </span>
            )}
          </div>

          {/* Description */}
          {thread.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{thread.description}</p>
            </div>
          )}

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Events</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{thread.event_count || thread.events?.length || 0}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Characters</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {thread.connected_character_ids?.length || 0}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Peak Tension</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {thread.peak_tension || 'N/A'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Circle className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Threads</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {thread.connected_thread_ids?.length || 0}
              </p>
            </div>
          </div>

          {/* Tension Curve */}
          {(thread.start_tension || thread.peak_tension || thread.end_tension) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Tension Curve</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {renderTensionCurve()}
              </div>
            </div>
          )}

          {/* Tags */}
          {thread.tags && thread.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {thread.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Connected Characters */}
          {thread.connected_character_ids && thread.connected_character_ids.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Connected Characters</h3>
              <div className="flex flex-wrap gap-2">
                {thread.connected_character_ids.map((charId) => (
                  <span
                    key={charId}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    Character {charId.slice(-8)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Events List */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Plot Events</h3>
            {thread.events && thread.events.length > 0 ? (
              <div className="space-y-3">
                {thread.events.slice(0, 10).map((event, index) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 truncate">{event.name || `Event ${index + 1}`}</p>
                        {event.tension_level && (
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                            Tension: {event.tension_level}/10
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                      )}
                      {event.event_type && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                          {event.event_type.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {thread.events.length > 10 && (
                  <div className="text-center py-2">
                    <span className="text-sm text-gray-500">
                      ... and {thread.events.length - 10} more events
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Hash className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No events added yet</p>
                <p className="text-gray-400 text-xs mt-1">Add events to build your plot thread</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Created</h4>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {new Date(thread.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Last Updated</h4>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {new Date(thread.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={() => {
                onEdit(thread);
                onClose();
              }}
              className="px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-white rounded-lg transition-colors"
            >
              Edit Thread
            </button>
          )}
        </div>
      </div>
    </div>
  );
}