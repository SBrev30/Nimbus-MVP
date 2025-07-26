import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Eye, User, Users, Crown, Shield } from 'lucide-react';
import { characterService, type Character, type CreateCharacterData, type UpdateCharacterData } from '../../services/character-service';
import { useAppData } from '../../contexts/AppDataContext';

interface CharactersPageProps {
  projectId?: string;
}

export const CharactersPage: React.FC<CharactersPageProps> = ({ projectId }) => {
  const { currentProject } = useAppData();
  const effectiveProjectId = projectId || currentProject?.id;

  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'protagonist' | 'antagonist' | 'supporting' | 'minor'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateCharacterData>({
    name: '',
    role: 'minor',
    description: '',
    background: '',
    traits: [],
    physical_description: '',
    age: undefined,
    occupation: '',
    tags: [],
    project_id: effectiveProjectId || ''
  });

  // Load characters
  const loadCharacters = useCallback(async () => {
    if (!effectiveProjectId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await characterService.getCharacters(effectiveProjectId);
      setCharacters(data);
    } catch (err) {
      console.error('Error loading characters:', err);
      setError('Failed to load characters');
    } finally {
      setLoading(false);
    }
  }, [effectiveProjectId]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  // Search and filter
  const filteredCharacters = characters.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         character.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         character.background?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || character.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveProjectId) return;

    try {
      setError(null);
      
      if (editingCharacter) {
        // Update existing character
        const updateData: UpdateCharacterData = {
          name: formData.name,
          role: formData.role,
          description: formData.description,
          background: formData.background,
          traits: formData.traits,
          physical_description: formData.physical_description,
          age: formData.age,
          occupation: formData.occupation,
          tags: formData.tags
        };
        
        await characterService.updateCharacter(editingCharacter.id, updateData);
        setEditingCharacter(null);
      } else {
        // Create new character
        await characterService.createCharacter({
          ...formData,
          project_id: effectiveProjectId
        });
        setIsCreating(false);
      }

      // Reset form
      setFormData({
        name: '',
        role: 'minor',
        description: '',
        background: '',
        traits: [],
        physical_description: '',
        age: undefined,
        occupation: '',
        tags: [],
        project_id: effectiveProjectId
      });

      // Reload characters
      await loadCharacters();
    } catch (err) {
      console.error('Error saving character:', err);
      setError('Failed to save character');
    }
  };

  // Handle delete
  const handleDelete = async (characterId: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return;

    try {
      setError(null);
      await characterService.deleteCharacter(characterId);
      await loadCharacters();
    } catch (err) {
      console.error('Error deleting character:', err);
      setError('Failed to delete character');
    }
  };

  // Handle edit
  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name,
      role: character.role,
      description: character.description || '',
      background: character.background || '',
      traits: character.traits || [],
      physical_description: character.physical_description || '',
      age: character.age,
      occupation: character.occupation || '',
      tags: character.tags || [],
      project_id: character.project_id || effectiveProjectId || ''
    });
    setIsCreating(true);
  };

  // Handle view details
  const handleView = (character: Character) => {
    setSelectedCharacter(character);
  };

  // Cancel edit/create
  const handleCancel = () => {
    setIsCreating(false);
    setEditingCharacter(null);
    setFormData({
      name: '',
      role: 'minor',
      description: '',
      background: '',
      traits: [],
      physical_description: '',
      age: undefined,
      occupation: '',
      tags: [],
      project_id: effectiveProjectId || ''
    });
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'protagonist': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'antagonist': return <Shield className="w-4 h-4 text-red-500" />;
      case 'supporting': return <Users className="w-4 h-4 text-blue-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'protagonist': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'antagonist': return 'bg-red-100 text-red-800 border-red-200';
      case 'supporting': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!effectiveProjectId) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Please select a project to manage characters.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Characters</h1>
        <p className="text-gray-600">Manage your story's characters and their details.</p>
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
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Roles</option>
              <option value="protagonist">Protagonist</option>
              <option value="antagonist">Antagonist</option>
              <option value="supporting">Supporting</option>
              <option value="minor">Minor</option>
            </select>
          </div>
        </div>

        {/* Add Character Button */}
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Character
        </button>
      </div>

      {/* Character List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading characters...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCharacters.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No characters found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || filterRole !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first character.'
                }
              </p>
              {!searchQuery && filterRole === 'all' && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Character
                </button>
              )}
            </div>
          ) : (
            filteredCharacters.map((character) => (
              <div
                key={character.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getRoleIcon(character.role)}
                      <h3 className="text-lg font-semibold text-gray-900">{character.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(character.role)}`}>
                        {character.role}
                      </span>
                    </div>
                    
                    {character.description && (
                      <p className="text-gray-600 mb-2 line-clamp-2">{character.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                      {character.occupation && (
                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
                          {character.occupation}
                        </span>
                      )}
                      {character.age && (
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                          Age: {character.age}
                        </span>
                      )}
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {character.completeness_score}% Complete
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleView(character)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(character)}
                      className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Edit Character"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(character.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Character"
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingCharacter ? 'Edit Character' : 'Create New Character'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Character name"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="protagonist">Protagonist</option>
                    <option value="antagonist">Antagonist</option>
                    <option value="supporting">Supporting</option>
                    <option value="minor">Minor</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief character description"
                  />
                </div>

                {/* Background */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background
                  </label>
                  <textarea
                    value={formData.background || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Character's background and history"
                  />
                </div>

                {/* Physical Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Physical Description
                  </label>
                  <textarea
                    value={formData.physical_description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, physical_description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Physical appearance"
                  />
                </div>

                {/* Age and Occupation */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={formData.occupation || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Job or role"
                    />
                  </div>
                </div>

                {/* Traits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Traits (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.traits?.join(', ') || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      traits: e.target.value.split(',').map(trait => trait.trim()).filter(trait => trait.length > 0)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="brave, intelligent, stubborn"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags?.join(', ') || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="hero, warrior, noble"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {editingCharacter ? 'Update Character' : 'Create Character'}
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

      {/* Character Details Modal */}
      {selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getRoleIcon(selectedCharacter.role)}
                  <h2 className="text-xl font-semibold">{selectedCharacter.name}</h2>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(selectedCharacter.role)}`}>
                    {selectedCharacter.role}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCharacter(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {selectedCharacter.description && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Description</h3>
                    <p className="text-gray-600">{selectedCharacter.description}</p>
                  </div>
                )}

                {selectedCharacter.background && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Background</h3>
                    <p className="text-gray-600">{selectedCharacter.background}</p>
                  </div>
                )}

                {selectedCharacter.physical_description && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Physical Description</h3>
                    <p className="text-gray-600">{selectedCharacter.physical_description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedCharacter.age && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Age</h3>
                      <p className="text-gray-600">{selectedCharacter.age}</p>
                    </div>
                  )}

                  {selectedCharacter.occupation && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Occupation</h3>
                      <p className="text-gray-600">{selectedCharacter.occupation}</p>
                    </div>
                  )}
                </div>

                {selectedCharacter.traits && selectedCharacter.traits.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Traits</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCharacter.traits.map((trait, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCharacter.tags && selectedCharacter.tags.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCharacter.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-50 text-gray-700 px-2 py-1 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Completeness</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${selectedCharacter.completeness_score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{selectedCharacter.completeness_score}%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => {
                    setSelectedCharacter(null);
                    handleEdit(selectedCharacter);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Edit Character
                </button>
                <button
                  onClick={() => setSelectedCharacter(null)}
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
