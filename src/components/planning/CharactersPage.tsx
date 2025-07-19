import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus, Users, Edit3, Trash2, Eye } from 'lucide-react';
import { SimpleSearchFilter, useSimpleFilter } from '../shared/simple-search-filter';
import { CharacterCreationModal } from './character-creation-modal';
import { characterService, Character, CreateCharacterData } from '../../services/character-service';

interface CharactersPageProps {
  onBack: () => void;
  projectId?: string;
}

export function CharactersPage({ onBack, projectId }: CharactersPageProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Define filter options for roles
  const roleFilterOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'protagonist', label: 'Protagonists' },
    { value: 'antagonist', label: 'Antagonists' },
    { value: 'supporting', label: 'Supporting' },
    { value: 'minor', label: 'Minor' }
  ];

  // Use simplified filter hook
  const {
    searchTerm,
    setSearchTerm,
    filterValue: filterRole,
    setFilterValue: setFilterRole,
    filteredItems: filteredCharacters,
    clearFilters,
    hasActiveFilters
  } = useSimpleFilter(
    characters,
    (character, search) => 
      character.name.toLowerCase().includes(search.toLowerCase()) ||
      character.description.toLowerCase().includes(search.toLowerCase()) ||
      (character.background && character.background.toLowerCase().includes(search.toLowerCase())),
    (character, filter) => filter === 'all' || character.role === filter
  );

  // Load characters on component mount
  useEffect(() => {
    loadCharacters();
  }, [projectId]);

  const loadCharacters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await characterService.getCharacters(projectId);
      setCharacters(data);
    } catch (error) {
      console.error('Error loading characters:', error);
      setError('Failed to load characters. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCharacter = useCallback(async (characterData: CreateCharacterData) => {
    try {
      const newCharacter = await characterService.createCharacter(characterData);
      setCharacters(prev => [newCharacter, ...prev]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating character:', error);
      throw error; // Re-throw so modal can handle it
    }
  }, []);

  const handleDeleteCharacter = useCallback(async (characterId: string) => {
    if (!confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
      return;
    }

    try {
      await characterService.deleteCharacter(characterId);
      setCharacters(prev => prev.filter(char => char.id !== characterId));
    } catch (error) {
      console.error('Error deleting character:', error);
      setError('Failed to delete character. Please try again.');
    }
  }, []);

  const handleCharacterClick = useCallback((character: Character) => {
    setSelectedCharacter(character);
    // TODO: Open character detail modal or navigate to character detail page
  }, []);

  // Helper function for role colors
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'protagonist':
        return 'bg-blue-100 text-blue-800';
      case 'antagonist':
        return 'bg-red-100 text-red-800';
      case 'supporting':
        return 'bg-green-100 text-green-800';
      case 'minor':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <h1 className="text-2xl font-semibold text-gray-900">Character Development</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Characters</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadCharacters}
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
            <h1 className="text-2xl font-semibold text-gray-900">Character Development</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#e8ddc1] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Users className="w-8 h-8 text-gray-700" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Characters...</h2>
            <p className="text-gray-600">Please wait while we fetch your characters</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state when no characters exist
  if (characters.length === 0) {
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
                <h1 className="text-2xl font-semibold text-gray-900">Character Development</h1>
                <p className="text-[#889096] mt-1">
                  Create and manage your story's cast
                </p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-[#e8ddc1] rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-gray-700" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Build Your Cast</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Create detailed character profiles with relationships, development arcs, and rich backstories that bring your story to life.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff4e00] hover:bg-[#ff4e00]/80 rounded-lg transition-colors font-semibold text-white"
              >
                <Plus className="w-5 h-5" />
                Create First Character
              </button>
              
              {/* Tips */}
              <div className="bg-[#e8ddc1] rounded-lg p-4 text-left mt-8">
                <h3 className="font-semibold text-gray-900 mb-3 text-center">Character Development Tips</h3>
                <ul className="space-y-2 text-sm text-gray-800">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Start with your protagonist and main antagonist
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Define clear motivations and goals for each character
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Map relationships and conflicts between characters
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Track character growth throughout your story
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Character Creation Modal */}
        <CharacterCreationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateCharacter}
          projectId={projectId}
        />
      </>
    );
  }

  // Show content when characters exist
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
                  <span className="text-gray-900">Characters</span>
                </nav>
                
                <h1 className="text-2xl font-semibold text-gray-900">Character Development</h1>
                <p className="text-[#889096] mt-1">
                  Managing {filteredCharacters.length} character{filteredCharacters.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-semibold"
            >
              <Plus className="w-4 h-4" />
              New Character
            </button>
          </div>

          {/* Simplified Search and Filter */}
          <SimpleSearchFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search characters..."
            filterValue={filterRole}
            onFilterChange={setFilterRole}
            filterOptions={roleFilterOptions}
            onClear={clearFilters}
            showClearAll={hasActiveFilters}
            className="max-w-2xl"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="p-6">
            {filteredCharacters.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {hasActiveFilters ? 'No characters match your filters' : 'No characters found'}
                  </h3>
                  <p className="text-[#889096] mb-4">
                    {hasActiveFilters ? 'Try adjusting your search or filters' : 'Create your first character to start building your cast'}
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
                      Create First Character
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCharacters.map(character => (
                  <div
                    key={character.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">{character.name}</h3>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCharacterClick(character);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="View character"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement edit functionality
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Edit character"
                        >
                          <Edit3 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCharacter(character.id);
                          }}
                          className="p-1.5 hover:bg-red-100 rounded transition-colors"
                          title="Delete character"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(character.role)}`}>
                        {character.role}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <div className="w-8 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-green-400 h-1.5 rounded-full" 
                            style={{ width: `${character.completeness_score}%` }}
                          ></div>
                        </div>
                        <span>{character.completeness_score}%</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{character.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {character.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {character.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{character.tags.length - 2}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(character.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Character Creation Modal */}
      <CharacterCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateCharacter}
        projectId={projectId}
      />
    </>
  );
}