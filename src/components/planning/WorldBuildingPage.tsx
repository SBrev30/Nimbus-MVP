import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus, Globe, Users, Zap, DollarSign, Crown, MapPin, Edit3, Trash2, Eye } from 'lucide-react';
import { SimpleSearchFilter, useSimpleFilter } from '../shared/simple-search-filter';
import { WorldElementCreationModal } from './world-element-creation-modal';
import { WorldElementDetailModal } from './world-element-detail-modal';
import { 
  WorldElement, 
  CreateWorldElementData, 
  worldBuildingService 
} from '../../services/world-building-service';

interface WorldBuildingPageProps {
  onBack: () => void;
  projectId?: string;
}

export function WorldBuildingPage({ onBack, projectId }: WorldBuildingPageProps) {
  const [worldElements, setWorldElements] = useState<WorldElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<WorldElement | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Elements', icon: Globe },
    { id: 'location', label: 'Locations', icon: MapPin },
    { id: 'culture', label: 'Cultures', icon: Users },
    { id: 'technology', label: 'Technology', icon: Zap },
    { id: 'economy', label: 'Economy', icon: DollarSign },
    { id: 'hierarchy', label: 'Hierarchy', icon: Crown }
  ];

  // Use simplified filter hook for search only (category is handled separately via tabs)
  const {
    searchTerm,
    setSearchTerm,
    filteredItems: searchFilteredElements,
    clearFilters,
    hasActiveFilters
  } = useSimpleFilter(
    worldElements,
    (element, search) => 
      element.title.toLowerCase().includes(search.toLowerCase()) ||
      element.description.toLowerCase().includes(search.toLowerCase()) ||
      (element.details && element.details.toLowerCase().includes(search.toLowerCase())),
    () => true // No additional filtering needed for search-only
  );

  // Apply category filter after search filter
  const filteredElements = searchFilteredElements.filter(element => 
    activeCategory === 'all' || element.category === activeCategory
  );

  // Load world elements on component mount
  useEffect(() => {
    loadWorldElements();
  }, [projectId]);

  const loadWorldElements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await worldBuildingService.getWorldElements(projectId);
      setWorldElements(data);
    } catch (error) {
      console.error('Error loading world elements:', error);
      setError('Failed to load world elements. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateElement = useCallback(async (elementData: CreateWorldElementData) => {
    try {
      const newElement = await worldBuildingService.createWorldElement(elementData);
      setWorldElements(prev => [newElement, ...prev]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating world element:', error);
      throw error; // Re-throw so modal can handle it
    }
  }, []);

  const handleDeleteElement = useCallback(async (elementId: string) => {
    try {
      await worldBuildingService.deleteWorldElement(elementId);
      setWorldElements(prev => prev.filter(element => element.id !== elementId));
    } catch (error) {
      console.error('Error deleting world element:', error);
      setError('Failed to delete world element. Please try again.');
    }
  }, []);

  const handleElementClick = useCallback((element: WorldElement) => {
    setSelectedElement(element);
    setIsDetailModalOpen(true);
  }, []);

  const handleEditElement = useCallback((element: WorldElement) => {
    // TODO: Implement edit functionality - for now just close detail modal
    setIsDetailModalOpen(false);
    setSelectedElement(null);
  }, []);

  // Helper functions
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'location': return '🗺️';
      case 'culture': return '🏛️';
      case 'technology': return '⚡';
      case 'economy': return '💰';
      case 'hierarchy': return '👑';
      default: return '🌍';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'location':
        return 'bg-green-100 text-green-800';
      case 'culture':
        return 'bg-blue-100 text-blue-800';
      case 'technology':
        return 'bg-purple-100 text-purple-800';
      case 'economy':
        return 'bg-yellow-100 text-yellow-800';
      case 'hierarchy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const clearAllFilters = () => {
    clearFilters();
    setActiveCategory('all');
  };

  const hasAnyActiveFilters = hasActiveFilters || activeCategory !== 'all';

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
            <h1 className="text-2xl font-semibold text-gray-900">World Building</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading World Elements</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadWorldElements}
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
            <h1 className="text-2xl font-semibold text-gray-900">World Building</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#e8ddc1] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Globe className="w-8 h-8 text-gray-700" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading World Elements...</h2>
            <p className="text-gray-600">Please wait while we fetch your world elements</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state when no world elements exist
  if (worldElements.length === 0) {
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
                <h1 className="text-2xl font-semibold text-gray-900">World Building</h1>
                <p className="text-[#889096] mt-1">
                  Design the foundation of your story universe
                </p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-[#e8ddc1] rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-gray-700" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Craft Your World</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Design locations, cultures, systems, and the rules that govern your story world. Create a rich, immersive setting for your narrative.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff4e00] hover:bg-[#ff4e00]/80 rounded-lg transition-colors font-semibold text-white"
              >
                <Plus className="w-5 h-5" />
                Create First Element
              </button>
              
              {/* Tips */}
              <div className="bg-[#e8ddc1] rounded-lg p-4 text-left mt-8">
                <h3 className="font-semibold text-gray-900 mb-3 text-center">World Building Elements</h3>
                <ul className="space-y-2 text-sm text-gray-800">
                  <li className="flex items-start gap-2">
                    <MapPin className="w-3 h-3 mt-1 flex-shrink-0" />
                    <strong>Locations:</strong> Cities, landscapes, and memorable places
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="w-3 h-3 mt-1 flex-shrink-0" />
                    <strong>Cultures:</strong> Societies, traditions, and belief systems
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-3 h-3 mt-1 flex-shrink-0" />
                    <strong>Technology:</strong> Magic systems, tools, and innovations
                  </li>
                  <li className="flex items-start gap-2">
                    <Crown className="w-3 h-3 mt-1 flex-shrink-0" />
                    <strong>Hierarchy:</strong> Power structures and social systems
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* World Element Creation Modal */}
        <WorldElementCreationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateElement}
          projectId={projectId}
        />
      </>
    );
  }

  // Show content when world elements exist
  return (
    <>
      <div className="h-screen bg-[#F9FAFB] flex flex-col font-inter">
        {/* Header */}
        <div className="bg-white border-b border-[#C6C5C5] p-6">
          <div className="flex items-center gap-4 mb-4">
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
                <span className="text-gray-900">World Building</span>
              </nav>
              
              <h1 className="text-2xl font-semibold text-gray-900">World Building</h1>
              <p className="text-[#889096] mt-1">
                Comprehensive world development with {filteredElements.length} element{filteredElements.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-semibold"
            >
              <Plus className="w-4 h-4" />
              New Element
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-4">
            {categories.map(category => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Simplified Search */}
          <SimpleSearchFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search world elements..."
            showFilter={false}
            onClear={clearAllFilters}
            showClearAll={hasAnyActiveFilters}
            className="max-w-md"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="p-6">
            {filteredElements.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {hasAnyActiveFilters ? 'No elements match your filters' : 'No world elements found'}
                  </h3>
                  <p className="text-[#889096] mb-4">
                    {hasAnyActiveFilters 
                      ? 'Try adjusting your search or changing categories' 
                      : 'Create your first world element to start building your universe'
                    }
                  </p>
                  {hasAnyActiveFilters ? (
                    <button
                      onClick={clearAllFilters}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mr-3"
                    >
                      Clear Filters
                    </button>
                  ) : null}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    {hasAnyActiveFilters ? 'Create New Element' : 'Create First Element'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredElements.map(element => (
                  <div
                    key={element.id}
                    onClick={() => handleElementClick(element)}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(element.category)}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(element.category)}`}>
                          {element.category.charAt(0).toUpperCase() + element.category.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleElementClick(element);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="View element"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditElement(element);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Edit element"
                        >
                          <Edit3 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this world element? This action cannot be undone.')) {
                              handleDeleteElement(element.id);
                            }
                          }}
                          className="p-1.5 hover:bg-red-100 rounded transition-colors"
                          title="Delete element"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2">{element.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{element.description}</p>

                    {/* Image preview */}
                    {element.image_urls && element.image_urls.length > 0 && (
                      <div className="mb-3">
                        <img
                          src={element.image_urls[0]}
                          alt={element.title}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        {element.image_urls.length > 1 && (
                          <p className="text-xs text-gray-500 mt-1">
                            +{element.image_urls.length - 1} more image{element.image_urls.length > 2 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {element.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {element.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{element.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-400">
                      {new Date(element.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <WorldElementCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateElement}
        projectId={projectId}
      />

      <WorldElementDetailModal
        element={selectedElement}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedElement(null);
        }}
        onEdit={handleEditElement}
        onDelete={handleDeleteElement}
      />
    </>
  );
}
