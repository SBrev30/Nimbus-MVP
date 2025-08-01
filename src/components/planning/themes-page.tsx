import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Book, Target, Lightbulb, Heart, Brain, Users, Globe, Clock, Star, Trash2, Edit3, Eye, MoreHorizontal } from 'lucide-react';

// Types
interface Theme {
  id: string;
  title: string;
  description: string;
  type: 'central' | 'secondary' | 'motif' | 'symbolic';
  significance: 'critical' | 'high' | 'medium' | 'low';
  literary_devices: string[];
  examples: string[];
  character_connections: string[];
  plot_connections: string[];
  development_notes: string;
  status: 'identified' | 'developing' | 'woven' | 'complete';
  color: string;
  created_at: string;
  updated_at: string;
  project_id: string;
}

interface CreateThemeData {
  title: string;
  description: string;
  type: 'central' | 'secondary' | 'motif' | 'symbolic';
  significance: 'critical' | 'high' | 'medium' | 'low';
  literary_devices: string[];
  examples: string[];
  character_connections: string[];
  plot_connections: string[];
  development_notes: string;
  status: 'identified' | 'developing' | 'woven' | 'complete';
  color: string;
}

// Mock service (replace with actual service)
const themeService = {
  async getThemes(projectId?: string): Promise<Theme[]> {
    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        title: 'Good vs Evil',
        description: 'The eternal struggle between light and darkness, morality and corruption',
        type: 'central',
        significance: 'critical',
        literary_devices: ['Symbolism', 'Metaphor', 'Allegory'],
        examples: ['Hero\'s moral choices', 'Antagonist\'s corruption', 'Light/dark imagery'],
        character_connections: ['Aaron Walker', 'Dark Lord'],
        plot_connections: ['Main Quest Arc', 'Character Development Arc'],
        development_notes: 'Woven throughout the narrative via character decisions and symbolic imagery',
        status: 'woven',
        color: '#8B5CF6',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z',
        project_id: '1'
      },
      {
        id: '2',
        title: 'Coming of Age',
        description: 'The journey from childhood innocence to adult responsibility and wisdom',
        type: 'central',
        significance: 'critical',
        literary_devices: ['Character Arc', 'Bildungsroman', 'Symbolism'],
        examples: ['Aaron\'s growth', 'First real loss', 'Taking responsibility'],
        character_connections: ['Aaron Walker', 'Ethan Walker'],
        plot_connections: ['Character Development Arc'],
        development_notes: 'Aaron\'s transformation from impulsive child to responsible leader',
        status: 'developing',
        color: '#10B981',
        created_at: '2024-01-16T11:00:00Z',
        updated_at: '2024-01-21T09:15:00Z',
        project_id: '1'
      },
      {
        id: '3',
        title: 'Family Bonds',
        description: 'The strength and complexity of family relationships and loyalty',
        type: 'secondary',
        significance: 'high',
        literary_devices: ['Emotional Core', 'Dialogue', 'Internal Conflict'],
        examples: ['Brother relationship', 'Protective instincts', 'Shared sacrifice'],
        character_connections: ['Aaron Walker', 'Ethan Walker'],
        plot_connections: ['Family Subplot'],
        development_notes: 'Explored through brother dynamic and protective relationships',
        status: 'woven',
        color: '#F59E0B',
        created_at: '2024-01-17T14:00:00Z',
        updated_at: '2024-01-22T12:45:00Z',
        project_id: '1'
      }
    ];
  },

  async createTheme(data: CreateThemeData): Promise<Theme> {
    // Mock implementation - replace with actual API call
    return {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project_id: '1'
    };
  },

  async updateTheme(id: string, updates: Partial<CreateThemeData>): Promise<Theme> {
    // Mock implementation - replace with actual API call
    const themes = await this.getThemes();
    const theme = themes.find(t => t.id === id);
    if (!theme) throw new Error('Theme not found');
    
    return {
      ...theme,
      ...updates,
      updated_at: new Date().toISOString()
    };
  },

  async deleteTheme(id: string): Promise<void> {
    // Mock implementation - replace with actual API call
    console.log(`Deleting theme ${id}`);
  }
};

const ThemesPage: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSignificance, setSelectedSignificance] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load themes
  useEffect(() => {
    const loadThemes = async () => {
      try {
        setLoading(true);
        const themesData = await themeService.getThemes();
        setThemes(themesData);
      } catch (error) {
        console.error('Error loading themes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadThemes();
  }, []);

  // Filter themes
  const filteredThemes = useMemo(() => {
    return themes.filter(theme => {
      const matchesSearch = theme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          theme.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || theme.type === selectedType;
      const matchesSignificance = selectedSignificance === 'all' || theme.significance === selectedSignificance;
      const matchesStatus = selectedStatus === 'all' || theme.status === selectedStatus;
      
      return matchesSearch && matchesType && matchesSignificance && matchesStatus;
    });
  }, [themes, searchTerm, selectedType, selectedSignificance, selectedStatus]);

  // Get theme type icon
  const getThemeTypeIcon = (type: string) => {
    switch (type) {
      case 'central': return Brain;
      case 'secondary': return Heart;
      case 'motif': return Target;
      case 'symbolic': return Lightbulb;
      default: return Book;
    }
  };

  // Get significance color
  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'identified': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'developing': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'woven': return 'text-green-600 bg-green-50 border-green-200';
      case 'complete': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Theme statistics
  const themeStats = useMemo(() => {
    const total = themes.length;
    const byType = themes.reduce((acc, theme) => {
      acc[theme.type] = (acc[theme.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byStatus = themes.reduce((acc, theme) => {
      acc[theme.status] = (acc[theme.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byType, byStatus };
  }, [themes]);

  const handleCreateTheme = async (data: CreateThemeData) => {
    try {
      const newTheme = await themeService.createTheme(data);
      setThemes(prev => [...prev, newTheme]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating theme:', error);
    }
  };

  const handleUpdateTheme = async (id: string, updates: Partial<CreateThemeData>) => {
    try {
      const updatedTheme = await themeService.updateTheme(id, updates);
      setThemes(prev => prev.map(theme => theme.id === id ? updatedTheme : theme));
      setEditingTheme(null);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const handleDeleteTheme = async (id: string) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    
    try {
      await themeService.deleteTheme(id);
      setThemes(prev => prev.filter(theme => theme.id !== id));
    } catch (error) {
      console.error('Error deleting theme:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-purple-600" />
            Themes
          </h1>
          <p className="text-gray-600">
            Manage and develop the central themes and motifs in your story
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Theme
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Themes</p>
              <p className="text-2xl font-bold text-gray-900">{themeStats.total}</p>
            </div>
            <Book className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Central Themes</p>
              <p className="text-2xl font-bold text-gray-900">{themeStats.byType.central || 0}</p>
            </div>
            <Brain className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Woven</p>
              <p className="text-2xl font-bold text-gray-900">{themeStats.byStatus.woven || 0}</p>
            </div>
            <Star className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Developing</p>
              <p className="text-2xl font-bold text-gray-900">{themeStats.byStatus.developing || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search themes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="central">Central</option>
                  <option value="secondary">Secondary</option>
                  <option value="motif">Motif</option>
                  <option value="symbolic">Symbolic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Significance</label>
                <select
                  value={selectedSignificance}
                  onChange={(e) => setSelectedSignificance(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Significance</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="identified">Identified</option>
                  <option value="developing">Developing</option>
                  <option value="woven">Woven</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredThemes.map((theme) => {
          const TypeIcon = getThemeTypeIcon(theme.type);
          
          return (
            <div
              key={theme.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Theme Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: theme.color + '20', color: theme.color }}
                    >
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{theme.title}</h3>
                      <p className="text-sm text-gray-600 capitalize">{theme.type} Theme</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => setEditingTheme(theme)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTheme(theme.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Theme Content */}
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-700 line-clamp-2">{theme.description}</p>

                {/* Status and Significance */}
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(theme.status)}`}>
                    {theme.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSignificanceColor(theme.significance)}`}>
                    {theme.significance}
                  </span>
                </div>

                {/* Literary Devices */}
                {theme.literary_devices.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Literary Devices</p>
                    <div className="flex flex-wrap gap-1">
                      {theme.literary_devices.slice(0, 3).map((device, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {device}
                        </span>
                      ))}
                      {theme.literary_devices.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                          +{theme.literary_devices.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Connections */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {theme.character_connections.length} Characters
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {theme.plot_connections.length} Plots
                      </span>
                    </div>
                    <span className="text-gray-400">
                      Updated {new Date(theme.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredThemes.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No themes found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms or filters.' : 'Get started by creating your first theme.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Theme
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Modal would go here */}
      {/* Implementation left for brevity - would follow same pattern as plot page */}
    </div>
  );
};

export default ThemesPage;
