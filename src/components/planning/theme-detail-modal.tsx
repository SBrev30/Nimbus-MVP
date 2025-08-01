import React from 'react';
import { X, Lightbulb, Users, BookOpen, MapPin, FileText } from 'lucide-react';
import type { Theme } from '../../services/theme-service';

interface ThemeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme | null;
}

export function ThemeDetailModal({ isOpen, onClose, theme }: ThemeDetailModalProps) {
  if (!isOpen || !theme) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'minor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'motif':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'major':
        return 'Major Theme';
      case 'minor':
        return 'Minor Theme';
      case 'motif':
        return 'Motif';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{theme.title}</h2>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium border ${getTypeColor(theme.theme_type)}`}>
                {getTypeDisplay(theme.theme_type)}
              </span>
            </div>
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
          {/* Description */}
          {theme.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{theme.description}</p>
            </div>
          )}

          {/* Completeness Score */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Development Progress</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${theme.completeness_score}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">{theme.completeness_score}%</span>
            </div>
          </div>

          {/* Connections Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Character Connections</h4>
              </div>
              <p className="text-2xl font-bold text-blue-900">{theme.character_connections?.length || 0}</p>
              <p className="text-sm text-blue-700">Characters linked to this theme</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Plot Connections</h4>
              </div>
              <p className="text-2xl font-bold text-green-900">{theme.plot_connections?.length || 0}</p>
              <p className="text-sm text-green-700">Plot threads expressing this theme</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-orange-900">Location Connections</h4>
              </div>
              <p className="text-2xl font-bold text-orange-900">{theme.location_connections?.length || 0}</p>
              <p className="text-sm text-orange-700">Locations symbolizing this theme</p>
            </div>
          </div>

          {/* Character Connections Details */}
          {theme.character_connections && theme.character_connections.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Character Connections
              </h3>
              <div className="space-y-3">
                {theme.character_connections.map((connection, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Character: {connection.characterId}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">How theme manifests:</span>
                        <p className="text-blue-700">{connection.howThemeManifests}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Motivation alignment:</span>
                        <p className="text-blue-700">{connection.motivationAlignment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plot Connections Details */}
          {theme.plot_connections && theme.plot_connections.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                Plot Connections
              </h3>
              <div className="space-y-3">
                {theme.plot_connections.map((connection, index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Plot Thread: {connection.plotThreadId}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-green-800">Relevance:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          connection.themeRelevance === 'high' ? 'bg-red-100 text-red-800' :
                          connection.themeRelevance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {connection.themeRelevance}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-green-800">How plot expresses theme:</span>
                        <p className="text-green-700">{connection.howPlotExpressesTheme}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location Connections Details */}
          {theme.location_connections && theme.location_connections.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                Location Connections
              </h3>
              <div className="space-y-3">
                {theme.location_connections.map((connection, index) => (
                  <div key={index} className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-2">Location: {connection.locationId}</h4>
                    <div className="text-sm">
                      <span className="font-medium text-orange-800">Symbolic meaning:</span>
                      <p className="text-orange-700">{connection.symbolicMeaning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Development Notes */}
          {theme.development_notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Development Notes
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{theme.development_notes}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Created:</span> {new Date(theme.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {new Date(theme.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
