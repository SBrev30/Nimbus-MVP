import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus, Lightbulb, Edit3, Trash2, Eye, Circle } from 'lucide-react';
import { SimpleSearchFilter, useSimpleFilter } from '../shared/simple-search-filter';
import { themeService } from '../../services/theme-service';
import { CreateThemeModal } from './create-theme-modal';
import { ThemeDetailModal } from './theme-detail-modal';
import type { Theme, CreateThemeData } from '../../services/theme-service';

interface ThemePageProps {
  onBack: () => void;
  projectId: string;
}

export const ThemesPage: React.FC<ThemePageProps> = ({ onBack, projectId }) => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [themeToEdit, setThemeToEdit] = useState<Theme | null>(null);

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [themeToView, setThemeToView] = useState<Theme | null>(null);

  // Define filter options for theme types
  const typeFilterOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'major', label: 'Major Theme' },
    { value: 'minor', label: 'Minor Theme' },
    { value: 'motif', label: 'Motif' }
  ];

  // Use simplified filter hook
  const {
    searchTerm,
    setSearchTerm,
    filterValue: filterType,
    setFilterValue: setFilterType,
    filteredItems: filteredThemes,
    clearFilters,
    hasActiveFilters
  } = useSimpleFilter(
    themes,
    (theme, search) => 
      theme.title?.toLowerCase().includes(search.toLowerCase()) ||
      theme.description?.toLowerCase().includes(search.toLowerCase()),
    (theme, filter) => filter === 'all' || theme.theme_type === filter
  );

  // Load themes on component mount
  useEffect(() => {
    loadThemes();
  }, [projectId]);

  const loadThemes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await themeService.getThemes(projectId);
      setThemes(data);
    } catch (error) {
      console.error('Error loading themes:', error);
      setError('Failed to load themes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTheme = useCallback(async (themeData: CreateThemeData): Promise<Theme | null> => {
    try {
      setIsCreating(true);
      const newTheme = await themeService.createTheme({
        ...themeData,
        project_id: projectId
      });
      if (newTheme) {
        setThemes(prev => [newTheme, ...prev]);
        setIsModalOpen(false);
        return newTheme;
      }
      return null;
    } catch (error) {
      console.error('Error creating theme:', error);
      throw error; // Re-throw so modal can handle it
    } finally {
      setIsCreating(false);
    }
  }, [projectId]);

  const handleEditTheme = useCallback(async (themeData: CreateThemeData): Promise<Theme | null> => {
    if (!themeToEdit) return null;
    
    try {
      setIsCreating(true);
      const updatedTheme = await themeService.updateTheme(themeToEdit.id, {
        title: themeData.title,
        theme_type: themeData.theme_type,
        description: themeData.description,
        development_notes: themeData.development_notes
      });
      
      if (updatedTheme) {
        setThemes(prev => prev.map(theme => 
          theme.id === themeToEdit.id ? updatedTheme : theme
        ));
        setEditModalOpen(false);
        setThemeToEdit(null);
        return updatedTheme;
      }
      return null;
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [themeToEdit]);

  const handleDeleteTheme = useCallback(async (themeId: string) => {
    if (!confirm('Are you sure you want to delete this theme? This action cannot be undone.')) {
      return;
    }

    try {
      await themeService.deleteTheme(themeId);
      setThemes(prev => prev.filter(theme => theme.id !== themeId));
    } catch (error) {
      console.error('Error deleting theme:', error);
      setError('Failed to delete theme. Please try again.');
    }
  }, []);

  const handleThemeClick = useCallback((theme: Theme) => {
    setThemeToView(theme);
    setDetailModalOpen(true);
  }, []);

  const handleViewTheme = useCallback((e: React.MouseEvent, theme: Theme) => {
    e.stopPropagation();
    setThemeToView(theme);
    setDetailModalOpen(true);
  }, []);

  const handleEditClick = useCallback((e: React.MouseEvent, theme: Theme) => {
    e.stopPropagation();
    setThemeToEdit(theme);
    setEditModalOpen(true);
  }, []);

  // Helper function for theme type colors
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'bg-purple-100 text-purple-800';
      case 'minor':
        return 'bg-blue-100 text-blue-800';
      case 'motif':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function for theme type display
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

  // Show error state
  if (error) {
    return (
      <div className="h-screen bg-[#f2eee2] flex flex-col font-inter">
        <div className="bg-white border-b border-[#C6C5C5] p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#889096]" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Theme Development</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Themes</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadThemes}
              className="px-4 py-2 bg-[#ff4e00] text-white rounded-lg hover:bg-[#ff4e00]/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen bg-[#f2eee2] flex flex-col font-inter">
        <div className="bg-white border-b border-[#C6C5C5] p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#889096]" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Theme Development</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#e8ddc1] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Lightbulb className="w-8 h-8 text-gray-700" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Themes...</h2>
            <p className="text-gray-600">Please wait while we fetch your themes</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state when no themes exist
  if (themes.length === 0) {
    return (
      <>
        <div className="h-screen bg-[#f2eee2] flex flex-col font-inter">
          {/* Header */}
          <div className="bg-white border-b border-[#C6C5C5] p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#889096]" />
              </button>
              
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">Theme Development</h1>
                <p className="text-[#889096] mt-1">
                  Create and explore the central themes in your story
                </p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-[#e8ddc1] rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-8 h-8 text-gray-700" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Develop Your Themes</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Identify and develop the central themes that give your story deeper meaning. Connect themes to characters, plots, and locations.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff4e00] hover:bg-[#ff4e00]/80 rounded-lg transition-colors font-semibold text-white"
              >
                <Plus className="w-5 h-5" />
                Create First Theme
              </button>
              
              {/* Tips */}
              <div className="bg-[#e8ddc1] rounded-lg p-4 text-left mt-8">
                <h3 className="font-semibold text-gray-900 mb-3 text-center">Theme Development Tips</h3>
                <ul className="space-y-2 text-sm text-gray-800">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Start with your story's major themes
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Connect themes to character motivations
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Use recurring motifs and symbols
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Show themes through plot events
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Create Theme Modal */}
        {isModalOpen && (
          <CreateThemeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateTheme}
            projectId={projectId}
            isLoading={isCreating}
          />
        )}
      </>
    );
  }

  // Show content when themes exist
  return (
    <>
      <div className="h-screen bg-[#f2eee2] flex flex-col font-inter">
        {/* Header */}
        <div className="bg-white border-b border-[#C6C5C5] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#889096]" />
              </button>
              
              <div className="flex-1">
                <nav className="flex items-center space-x-2 text-sm text-[#889096] font-semibold mb-2">
                  <button onClick={onBack} className="hover:text-gray-700 transition-colors">
                    Planning
                  </button>
                  <span className="text-[#889096]">›</span>
                  <span className="text-gray-900">Themes</span>
                </nav>
                
                <h1 className="text-2xl font-semibold text-gray-900">Theme Development</h1>
                <p className="text-[#889096] mt-1">
                  Managing {filteredThemes.length} theme{filteredThemes.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-semibold"
            >
              <Plus className="w-4 h-4" />
              New Theme
            </button>
          </div>

          {/* Simplified Search and Filter */}
          <SimpleSearchFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search themes..."
            filterValue={filterType}
            onFilterChange={setFilterType}
            filterOptions={typeFilterOptions}
            onClear={clearFilters}
            showClearAll={hasActiveFilters}
            className="max-w-2xl"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="p-6">
            {filteredThemes.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {hasActiveFilters ? 'No themes match your filters' : 'No themes found'}
                  </h3>
                  <p className="text-[#889096] mb-4">
                    {hasActiveFilters ? 'Try adjusting your search or filters' : 'Create your first theme to start developing your story\'s deeper meaning'}
                  </p>
                  {hasActiveFilters ? (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Create First Theme
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredThemes.map(theme => {
                  return (
                    <div
                      key={theme.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => handleThemeClick(theme)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Lightbulb className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <h3 className="font-semibold text-gray-900 truncate">{theme.title}</h3>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleViewTheme(e, theme)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="View theme"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => handleEditClick(e, theme)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Edit theme"
                          >
                            <Edit3 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTheme(theme.id);
                            }}
                            className="p-1.5 hover:bg-red-100 rounded transition-colors"
                            title="Delete theme"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(theme.theme_type)}`}>
                          {getTypeDisplay(theme.theme_type)}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <div className="w-8 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-purple-400 h-1.5 rounded-full" 
                              style={{ width: `${theme.completeness_score}%` }}
                            ></div>
                          </div>
                          <span>{theme.completeness_score}%</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{theme.description || 'No description'}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{theme.character_connections?.length || 0} characters</span>
                          <span>• {theme.plot_connections?.length || 0} plots</span>
                          <span>• {theme.location_connections?.length || 0} locations</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(theme.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Theme Modal */}
      {isModalOpen && (
        <CreateThemeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateTheme}
          projectId={projectId}
          isLoading={isCreating}
        />
      )}

      {/* Edit Theme Modal */}
      {editModalOpen && themeToEdit && (
        <CreateThemeModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setThemeToEdit(null);
          }}
          onSubmit={handleEditTheme}
          projectId={projectId}
          isLoading={isCreating}
          initialData={{
            title: themeToEdit.title,
            theme_type: themeToEdit.theme_type,
            description: themeToEdit.description,
            development_notes: themeToEdit.development_notes || ''
          }}
          isEditing={true}
        />
      )}

      {/* Theme Detail Modal */}
      {detailModalOpen && (
        <ThemeDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setThemeToView(null);
          }}
          theme={themeToView}
        />
      )}
    </>
  );
};
