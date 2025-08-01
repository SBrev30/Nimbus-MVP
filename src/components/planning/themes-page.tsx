// src/components/planning/themes-page.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Eye, Lightbulb, Star, Circle, Users, BookOpen, MapPin } from 'lucide-react';
import { themeService, type Theme, type CreateThemeData, type UpdateThemeData } from '../../services/theme-service';
import { characterService } from '../../services/character-service';
import { plotService } from '../../services/plot-service';
import { worldBuildingService } from '../../services/world-building-service';
import { useAppData } from '../../contexts/AppDataContext';

interface ThemesPageProps {
  projectId?: string;
}

export const ThemesPage: React.FC<ThemesPageProps> = ({ projectId }) => {
  const { currentProject } = useAppData();
  const effectiveProjectId = projectId || currentProject?.id;

  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'major' | 'minor' | 'motif'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  // Available content for connections
  const [availableCharacters, setAvailableCharacters] = useState<any[]>([]);
  const [availablePlots, setAvailablePlots] = useState<any[]>([]);
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState<CreateThemeData>({
    title: '',
    description: '',
    theme_type: 'major',
    character_connections: [],
    plot_connections: [],
    location_connections: [],
    development_notes: '',
    project_id: effectiveProjectId || ''
  });

  // Load themes
  const loadThemes = useCallback(async () => {
    if (!effectiveProjectId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await themeService.getThemes(effectiveProjectId);
      setThemes(data);
    } catch (err) {
      console.error('Error loading themes:', err);
      setError('Failed to load themes');
    } finally {
      setLoading(false);
    }
  }, [effectiveProjectId]);

  // Load available content for connections
  const loadAvailableContent = useCallback(async () => {
    if (!effectiveProjectId) return;

    try {
      const [characters, plots, locations] = await Promise.all([
        characterService.getCharacters(effectiveProjectId),
        plotService.getPlotThreads(effectiveProjectId),
        worldBuildingService.getWorldElementsByCategory('location', effectiveProjectId)
      ]);
      
      setAvailableCharacters(characters);
      setAvailablePlots(plots);
      setAvailableLocations(locations);
    } catch (err) {
      console.error('Error loading available content:', err);
    }
  }, [effectiveProjectId]);

  useEffect(() => {
    loadThemes();
    loadAvailableContent();
  }, [loadThemes, loadAvailableContent]);

  // Search and filter
  const filteredThemes = themes.filter(theme => {
    const matchesSearch = theme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         theme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         theme.development_notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || theme.theme_type === selectedType;
    return matchesSearch && matchesType;
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveProjectId) return;

    try {
      setError(null);
      
      if (editingTheme) {
        // Update existing theme
        const updateData: UpdateThemeData = {
          title: formData.title,
          description: formData.description,
          theme_type: formData.theme_type,
          character_connections: formData.character_connections,
          plot_connections: formData.plot_connections,
          location_connections: formData.location_connections,
          development_notes: formData.development_notes
        };
        
        await themeService.updateTheme(editingTheme.id, updateData);
        setEditingTheme(null);
      } else {
        // Create new theme
        await themeService.createTheme({
          ...formData,
          project_id: effectiveProjectId
        });
        setIsCreating(false);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        theme_type: 'major',
        character_connections: [],
        plot_connections: [],
        location_connections: [],
        development_notes: '',
        project_id: effectiveProjectId
      });

      // Reload themes
      await loadThemes();
    } catch (err) {
      console.error('Error saving theme:', err);
      setError('Failed to save theme');
    }
  };

  // Handle delete
  const handleDelete = async (themeId: string) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;

    try {
      setError(null);
      await themeService.deleteTheme(themeId);
      await loadThemes();
    } catch (err) {
      console.error('Error deleting theme:', err);
      setError('Failed to delete theme');
    }
  };

  // Handle edit
  const handleEdit = (theme: Theme) => {
    setEditingTheme(theme);
    setFormData({
      title: theme.title,
      description: theme.description,
      theme_type: theme.theme_type,
      character_connections: theme.character_connections || [],
      plot_connections: theme.plot_connections || [],
      location_connections: theme.location_connections || [],
      development_notes: theme.development_notes || '',
      project_id: theme.project_id || effectiveProjectId || ''
    });
    setIsCreating(true);
  };

  // Handle view details
  const handleView = (theme: Theme) => {
    setSelectedTheme(theme);
  };

  // Cancel edit/create
  const handleCancel = () => {
    setIsCreating(false);
    setEditingTheme(null);
    setFormData({
      title: '',
      description: '',
      theme_type: 'major',
      character_connections: [],
      plot_connections: [],
      location_connections: [],
      development_notes: '',
      project_id: effectiveProjectId || ''
    });
  };

  // Get theme type icon
  const getThemeIcon = (type: Theme['theme_type']) => {
    switch (type) {
      case 'major': return <Star className="w-4 h-4 text-amber-500" />;
      case 'minor': return <Circle className="w-4 h-4 text-blue-500" />;
      case 'motif': return <Lightbulb className="w-4 h-4 text-green-500" />;
      default: return <Lightbulb className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get theme type color
  const getThemeColor = (type: Theme['theme_type']) => {
    switch (type) {
      case 'major': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'motif': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!effectiveProjectId) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Please select a project to manage themes.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Themes</h1>
        <p className="text-gray-600">Manage your story's themes, motifs, and their connections to characters and plot.</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="major">Major Theme</option>
              <option value="minor">Minor Theme</option>
              <option value="motif">Motif</option>
            </select>
          </div>
        </div>

        {/* Add Theme Button */}
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Theme
        </button>
      </div>

      {/* Theme List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading themes...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredThemes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Lightbulb className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No themes found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || selectedType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first theme.'
                }
              </p>
              {!searchQuery && selectedType === 'all' && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Theme
                </button>
              )}
            </div>
          ) : (
            filteredThemes.map((theme) => (
              <div
                key={theme.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getThemeIcon(theme.theme_type)}
                      <h3 className="text-lg font-semibold text-gray-900">{theme.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getThemeColor(theme.theme_type)}`}>
                        {theme.theme_type}
                      </span>
                    </div>
                    
                    {theme.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">{theme.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 text-sm">
                      {theme.character_connections?.length > 0 && (
                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {theme.character_connections.length} Character{theme.character_connections.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {theme.plot_connections?.length > 0 && (
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {theme.plot_connections.length} Plot{theme.plot_connections.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {theme.location_connections?.length > 0 && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {theme.location_connections.length} Location{theme.location_connections.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      <span className="bg-gray-50 text-gray-700 px-2 py-1 rounded">
                        {theme.completeness_score}% Complete
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleView(theme)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(theme)}
                      className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Edit Theme"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(theme.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Theme"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingTheme ? 'Edit Theme' : 'Create New Theme'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Theme title"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Theme Type *
                    </label>
                    <select
                      required
                      value={formData.theme_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, theme_type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="major">Major Theme</option>
                      <option value="minor">Minor Theme</option>
                      <option value="motif">Motif</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the theme and what it represents in your story"
                  />
                </div>

                {/* Development Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Development Notes
                  </label>
                  <textarea
                    value={formData.development_notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, development_notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Notes on how to develop this theme throughout your story"
                  />
                </div>

                {/* Connections section can be added here in the future */}
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <strong>Note:</strong> Character, plot, and location connections will be available in a future update. 
                  Focus on defining your theme clearly for now.
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {editingTheme ? 'Update Theme' : 'Create Theme'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Theme Details Modal */}
      {selectedTheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getThemeIcon(selectedTheme.theme_type)}
                  <h2 className="text-xl font-semibold">{selectedTheme.title}</h2>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getThemeColor(selectedTheme.theme_type)}`}>
                    {selectedTheme.theme_type}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTheme(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Description</h3>
                  <p className="text-gray-600">{selectedTheme.description}</p>
                </div>

                {selectedTheme.development_notes && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Development Notes</h3>
                    <p className="text-gray-600">{selectedTheme.development_notes}</p>
                  </div>
                )}

                {/* Connections sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Character Connections ({selectedTheme.character_connections?.length || 0})
                    </h3>
                    {selectedTheme.character_connections?.length > 0 ? (
                      <div className="space-y-1">
                        {selectedTheme.character_connections.map((conn, index) => (
                          <div key={index} className="text-sm bg-purple-50 p-2 rounded">
                            <div className="font-medium">Character ID: {conn.characterId}</div>
                            <div className="text-purple-700">{conn.howThemeManifests}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No character connections yet</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Plot Connections ({selectedTheme.plot_connections?.length || 0})
                    </h3>
                    {selectedTheme.plot_connections?.length > 0 ? (
                      <div className="space-y-1">
                        {selectedTheme.plot_connections.map((conn, index) => (
                          <div key={index} className="text-sm bg-green-50 p-2 rounded">
                            <div className="font-medium">Plot ID: {conn.plotThreadId}</div>
                            <div className="text-green-700">{conn.howPlotExpressesTheme}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No plot connections yet</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location Connections ({selectedTheme.location_connections?.length || 0})
                    </h3>
                    {selectedTheme.location_connections?.length > 0 ? (
                      <div className="space-y-1">
                        {selectedTheme.location_connections.map((conn, index) => (
                          <div key={index} className="text-sm bg-blue-50 p-2 rounded">
                            <div className="font-medium">Location ID: {conn.locationId}</div>
                            <div className="text-blue-700">{conn.symbolicMeaning}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No location connections yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Completeness</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${selectedTheme.completeness_score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{selectedTheme.completeness_score}%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => {
                    setSelectedTheme(null);
                    handleEdit(selectedTheme);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Edit Theme
                </button>
                <button
                  onClick={() => setSelectedTheme(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemesPage;
