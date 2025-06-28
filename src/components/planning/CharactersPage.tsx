import React, { useState, useCallback } from 'react';
import { ArrowLeft, Plus, Users, Search, Filter } from 'lucide-react';

interface CharactersPageProps {
  onBack: () => void;
}

interface Character {
  id: string;
  projectId: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description: string;
  completenessScore: number;
  tags: string[];
}

export function CharactersPage({ onBack }: CharactersPageProps) {
  // Start with empty data - no sample content
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const handleAddCharacter = useCallback(() => {
    // Handle adding a new character
    console.log('Add new character');
    // You would implement the actual creation logic here
  }, []);

  const filteredCharacters = characters.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         character.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || character.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Show empty state when no characters exist
  if (characters.length === 0) {
    return (
      <div className="h-screen bg-[#F9FAFB] flex flex-col font-inter">
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
            <div className="w-16 h-16 bg-[#A5F7AC] rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-gray-700" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Build Your Cast</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Create detailed character profiles with relationships, development arcs, and rich backstories that bring your story to life.
            </p>
            <button
              onClick={handleAddCharacter}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-semibold text-gray-800"
            >
              <Plus className="w-5 h-5" />
              Create First Character
            </button>
            
            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-4 text-left mt-8">
              <h3 className="font-semibold text-blue-900 mb-3 text-center">💡 Character Development Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  Start with your protagonist and main antagonist
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  Define clear motivations and goals for each character
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  Map relationships and conflicts between characters
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  Track character growth throughout your story
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show content when characters exist
  return (
    <div className="h-screen bg-[#F9FAFB] flex flex-col font-inter">
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
                Managing {filteredCharacters.length} characters
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleAddCharacter}
            className="flex items-center gap-2 px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-semibold"
          >
            <Plus className="w-4 h-4" />
            New Character
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#889096]" />
            <input
              type="text"
              placeholder="Search characters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#889096]" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="protagonist">Protagonists</option>
              <option value="antagonist">Antagonists</option>
              <option value="supporting">Supporting</option>
              <option value="minor">Minor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCharacters.map(character => (
              <div
                key={character.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{character.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(character.role)}`}>
                    {character.role}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{character.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {character.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full" 
                        style={{ width: `${character.completenessScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{character.completenessScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
