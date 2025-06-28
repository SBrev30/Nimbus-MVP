import React, { useState, useCallback } from 'react';
import { ArrowLeft, Plus, Filter, Zap, TrendingUp, Users, BookOpen, Target, MoreHorizontal } from 'lucide-react';

interface PlotEvent {
  id: string;
  title: string;
  description: string;
  chapterReference?: string;
  tensionLevel: number; // 1-10
  eventType: 'setup' | 'conflict' | 'climax' | 'resolution';
  orderIndex: number;
}

interface PlotThread {
  id: string;
  projectId: string;
  title: string;
  type: 'main' | 'subplot' | 'side_story' | 'character_arc';
  description: string;
  tensionCurve: number[];
  connectedCharacterIds: string[];
  connectedThreadIds: string[];
  completionPercentage: number;
  tags: string[];
  events: PlotEvent[];
  color: string;
}

interface PlotPageProps {
  onBack: () => void;
}

const samplePlotThreads: PlotThread[] = [
  {
    id: 'main-plot',
    projectId: 'mana-chronicles',
    title: 'Dimensional War & Human-Dark Elf Alliance',
    type: 'main',
    description: 'Primary story arc driving the narrative through demon invasion and alliance formation',
    tensionCurve: [2, 4, 6, 8, 5, 7, 9, 10, 6, 3],
    connectedCharacterIds: ['protagonist', 'sylandria', 'vazriel'],
    connectedThreadIds: ['mana-awakening', 'political-intrigue'],
    completionPercentage: 45,
    tags: ['war', 'alliance', 'demons', 'magic'],
    color: '#3B82F6',
    events: [
      {
        id: 'demon-discovery',
        title: 'Demon Invasion Discovery',
        description: 'First signs of dimensional breach and demon activity',
        chapterReference: 'Chapter 1',
        tensionLevel: 6,
        eventType: 'setup',
        orderIndex: 1
      },
      {
        id: 'alliance-negotiation',
        title: 'Alliance Negotiation',
        description: 'Humans and Dark Elves discuss unprecedented cooperation',
        chapterReference: 'Chapter 3',
        tensionLevel: 7,
        eventType: 'conflict',
        orderIndex: 2
      },
      {
        id: 'blood-pact-revelation',
        title: 'Blood Pact Revelation',
        description: 'Discovery of ancient alliance rituals and their costs',
        chapterReference: 'Chapter 4',
        tensionLevel: 8,
        eventType: 'climax',
        orderIndex: 3
      }
    ]
  },
  {
    id: 'mana-awakening',
    projectId: 'mana-chronicles',
    title: "Protagonist's Mana Awakening",
    type: 'character_arc',
    description: 'Individual character development journey from ordinary person to mana master',
    tensionCurve: [1, 3, 5, 4, 6, 8, 7, 9, 8, 7],
    connectedCharacterIds: ['protagonist', 'sylandria'],
    connectedThreadIds: ['main-plot'],
    completionPercentage: 65,
    tags: ['character-growth', 'magic', 'training'],
    color: '#10B981',
    events: [
      {
        id: 'first-manifestation',
        title: 'First Mana Manifestation',
        description: 'Protagonist discovers their mana abilities under stress',
        chapterReference: 'Chapter 1',
        tensionLevel: 5,
        eventType: 'setup',
        orderIndex: 1
      },
      {
        id: 'training-struggles',
        title: 'Training Struggles',
        description: 'Difficulty learning Dark Elf mana control techniques',
        chapterReference: 'Chapter 2',
        tensionLevel: 6,
        eventType: 'conflict',
        orderIndex: 2
      },
      {
        id: 'mastery-moment',
        title: 'Mastery Breakthrough',
        description: 'Achieving harmony between human and Dark Elf techniques',
        tensionLevel: 9,
        eventType: 'climax',
        orderIndex: 3
      }
    ]
  },
  {
    id: 'political-intrigue',
    projectId: 'mana-chronicles',
    title: "Sylandria's Political Intrigue",
    type: 'subplot',
    description: 'Dark Elf noble house politics affecting alliance negotiations',
    tensionCurve: [3, 4, 5, 7, 8, 6, 9, 8, 5, 4],
    connectedCharacterIds: ['sylandria'],
    connectedThreadIds: ['main-plot'],
    completionPercentage: 30,
    tags: ['politics', 'nobility', 'betrayal'],
    color: '#8B5CF6',
    events: [
      {
        id: 'house-conflicts',
        title: 'Noble House Conflicts',
        description: 'Internal Dark Elf politics threaten alliance',
        tensionLevel: 7,
        eventType: 'conflict',
        orderIndex: 1
      },
      {
        id: 'betrayal-attempt',
        title: 'Betrayal Attempt',
        description: 'Rival house attempts to sabotage human alliance',
        tensionLevel: 9,
        eventType: 'climax',
        orderIndex: 2
      }
    ]
  },
  {
    id: 'wellspring-discovery',
    projectId: 'mana-chronicles',
    title: 'The Wellspring Discovery',
    type: 'side_story',
    description: 'Understanding why demons call the human world "The Wellspring"',
    tensionCurve: [2, 3, 4, 6, 7, 5, 6, 4, 3, 2],
    connectedCharacterIds: ['protagonist'],
    connectedThreadIds: ['main-plot'],
    completionPercentage: 80,
    tags: ['world-building', 'demons', 'lore'],
    color: '#F59E0B',
    events: [
      {
        id: 'wellspring-explanation',
        title: 'Wellspring Nature Revealed',
        description: 'Learning why human world is valuable to demons',
        chapterReference: 'Chapter 1',
        tensionLevel: 6,
        eventType: 'resolution',
        orderIndex: 1
      }
    ]
  }
];

export function PlotPage({ onBack }: PlotPageProps) {
  const [plotThreads, setPlotThreads] = useState<PlotThread[]>(samplePlotThreads);
  const [selectedThread, setSelectedThread] = useState<PlotThread | null>(plotThreads[0]);
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'threads' | 'timeline' | 'tension'>('threads');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'main':
        return 'bg-blue-100 text-blue-800';
      case 'subplot':
        return 'bg-purple-100 text-purple-800';
      case 'side_story':
        return 'bg-yellow-100 text-yellow-800';
      case 'character_arc':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'main':
        return '🎯';
      case 'subplot':
        return '🔗';
      case 'side_story':
        return '📖';
      case 'character_arc':
        return '👤';
      default:
        return '📝';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'setup':
        return '🎬';
      case 'conflict':
        return '⚔️';
      case 'climax':
        return '🌟';
      case 'resolution':
        return '✅';
      default:
        return '📝';
    }
  };

  const filteredThreads = plotThreads.filter(thread => 
    filterType === 'all' || thread.type === filterType
  );

  const renderTensionCurve = (tensionCurve: number[], color: string) => {
    const maxTension = Math.max(...tensionCurve);
    const points = tensionCurve.map((tension, index) => {
      const x = (index / (tensionCurve.length - 1)) * 100;
      const y = 100 - (tension / maxTension) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-16" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <polygon
          fill={`url(#gradient-${color})`}
          points={`0,100 ${points} 100,100`}
        />
      </svg>
    );
  };

  return (
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
            <h1 className="text-2xl font-semibold text-gray-900">Plot Development</h1>
            <p className="text-[#889096] mt-1">
              Multi-threaded story management with {filteredThreads.length} active plot threads
            </p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-semibold">
            <Plus className="w-4 h-4" />
            New Plot Thread
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#889096]" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="main">Main Plot</option>
              <option value="subplot">Subplots</option>
              <option value="side_story">Side Stories</option>
              <option value="character_arc">Character Arcs</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('threads')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'threads'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Threads
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('tension')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'tension'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tension
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Plot Threads */}
        <div className="w-1/3 border-r border-[#C6C5C5] overflow-y-auto p-6">
          <div className="space-y-4">
            {filteredThreads.map(thread => (
              <div
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedThread?.id === thread.id
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(thread.type)}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(thread.type)}`}>
                      {thread.type.replace('_', ' ').charAt(0).toUpperCase() + thread.type.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{thread.completionPercentage}%</div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{thread.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{thread.description}</p>

                {/* Tension Curve Preview */}
                <div className="mb-3">
                  {renderTensionCurve(thread.tensionCurve, thread.color)}
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${thread.completionPercentage}%`,
                        backgroundColor: thread.color
                      }}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {thread.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                  {thread.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{thread.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Thread Details */}
        <div className="w-2/3 overflow-y-auto p-6">
          {selectedThread ? (
            <div className="space-y-6">
              {/* Thread Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(selectedThread.type)}</span>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedThread.title}</h2>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(selectedThread.type)}`}>
                      {selectedThread.type.replace('_', ' ').charAt(0).toUpperCase() + selectedThread.type.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                  <p className="text-[#889096]">{selectedThread.description}</p>
                </div>
                
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Completion</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{selectedThread.completionPercentage}%</div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">Events</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{selectedThread.events.length}</div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">Characters</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{selectedThread.connectedCharacterIds.length}</div>
                </div>
              </div>

              {/* Tension Curve */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tension Curve</h3>
                <div className="h-32">
                  {renderTensionCurve(selectedThread.tensionCurve, selectedThread.color)}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Beginning</span>
                  <span>Middle</span>
                  <span>End</span>
                </div>
              </div>

              {/* Plot Events */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Plot Events</h3>
                  <button className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm">
                    <Plus className="w-4 h-4" />
                    Add Event
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedThread.events.map((event, index) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg">{getEventTypeIcon(event.eventType)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          {event.chapterReference && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {event.chapterReference}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Tension: {event.tensionLevel}/10</span>
                          <span>Type: {event.eventType}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Elements */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Connected Characters</h3>
                  <div className="space-y-2">
                    {selectedThread.connectedCharacterIds.map(characterId => (
                      <div key={characterId} className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="capitalize">{characterId.replace('-', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Connected Threads</h3>
                  <div className="space-y-2">
                    {selectedThread.connectedThreadIds.map(threadId => {
                      const connectedThread = plotThreads.find(t => t.id === threadId);
                      return (
                        <div key={threadId} className="flex items-center gap-2 text-sm text-gray-600">
                          <BookOpen className="w-4 h-4" />
                          <span>{connectedThread?.title || threadId}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedThread.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                  <button className="px-3 py-1 border border-dashed border-gray-300 text-gray-500 text-sm rounded-full hover:border-gray-400 transition-colors">
                    + Add Tag
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Plot Thread</h3>
                <p className="text-[#889096]">Choose a plot thread to view events and connections</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
