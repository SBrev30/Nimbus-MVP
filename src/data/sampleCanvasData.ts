import { Node, Edge } from 'reactflow';

// Sample nodes for Enhanced Canvas demonstration
export const sampleNodes: Node[] = [
  // Character Nodes
  {
    id: 'char-1',
    type: 'character',
    position: { x: 100, y: 100 },
    data: {
      name: 'Sylandria Moonwhisper',
      role: 'protagonist',
      description: 'A dark elf princess with powerful mana control abilities. Born into the noble house of Moonwhisper in the underground city of Nyth\'Anduil.',
      image: '',
      fantasyClass: 'Mage/Noble',
      relationships: ['Theron Brightblade'],
      traits: ['Curious', 'Powerful', 'Rebellious'],
      backstory: 'Exiled for studying forbidden magic, possesses exceptional talent in elemental magic, particularly shadow and lunar magic.',
    }
  },
  {
    id: 'char-2',
    type: 'character',
    position: { x: 400, y: 150 },
    data: {
      name: 'Theron Brightblade',
      role: 'supporting',
      description: 'A seasoned human knight and former royal guard of the Kingdom of Astoria. Lost his family to a dark magic attack during the War of Shadows.',
      image: '',
      fantasyClass: 'Knight/Guardian',
      relationships: ['Sylandria Moonwhisper'],
      traits: ['Protective', 'Experienced', 'Haunted'],
      backstory: 'Dedicated his life to protecting others after losing family to dark magic. Wields ancient blessed weapons.',
    }
  },
  
  // Plot Nodes
  {
    id: 'plot-1',
    type: 'plot',
    position: { x: 250, y: 350 },
    data: {
      title: 'Awakening Power',
      type: 'event',
      description: 'Sylandria touches the forbidden tome and awakens her true magical potential',
      chapter: 'Chapter 1',
      order: 1,
      significance: 'major',
      consequences: ['Power manifestation', 'Unable to hide abilities', 'Changes her destiny']
    }
  },
  {
    id: 'plot-2',
    type: 'plot',
    position: { x: 550, y: 400 },
    data: {
      title: 'The Mentor Arrives',
      type: 'event',
      description: 'Theron arrives claiming to be a messenger, but Sylandria senses he knows about her power',
      chapter: 'Chapter 2',
      order: 2,
      significance: 'major',
      consequences: ['New alliance formed', 'Guidance in power control', 'Journey begins']
    }
  },
  {
    id: 'plot-3',
    type: 'plot',
    position: { x: 150, y: 550 },
    data: {
      title: 'The War of Shadows',
      type: 'conflict',
      description: 'Background conflict that shaped the current world and Theron\'s motivations',
      chapter: 'Background',
      order: 0,
      significance: 'major',
      consequences: ['World separation', 'Family losses', 'Magic knowledge scattered']
    }
  },

  // Location Nodes
  {
    id: 'loc-1',
    type: 'location',
    position: { x: 50, y: 300 },
    data: {
      name: 'Nyth\'Anduil',
      type: 'city',
      description: 'Underground dark elf city with crystal formations and ethereal moonlight',
      importance: 'major',
      geography: {
        climate: 'Cool and mystical',
        terrain: 'Underground caverns with crystal formations',
        size: 'Major city'
      },
      culture: {
        politics: 'Noble houses rule',
        religion: 'Lunar worship',
        customs: 'Traditional elven customs, forbidden magic taboos'
      },
      connectedCharacters: ['Sylandria Moonwhisper'],
      atmosphere: 'Mystical, secretive, ancient'
    }
  },
  {
    id: 'loc-2',
    type: 'location',
    position: { x: 650, y: 100 },
    data: {
      name: 'Kingdom of Astoria',
      type: 'kingdom',
      description: 'Surface kingdom where Theron served as royal guard',
      importance: 'major',
      geography: {
        climate: 'Temperate',
        terrain: 'Plains and forests',
        size: 'Large kingdom'
      },
      culture: {
        politics: 'Monarchy with royal guard',
        religion: 'Light worship',
        customs: 'Honor-based society, protective of citizens'
      },
      connectedCharacters: ['Theron Brightblade'],
      atmosphere: 'Noble, protective, war-scarred'
    }
  },

  // Research/Lore Nodes
  {
    id: 'research-1',
    type: 'research',
    position: { x: 400, y: 550 },
    data: {
      title: 'Magic System',
      content: 'Magic operates on three principles: Source (Celestial Nexus), Flow (ley lines), Focus (emotional resonance)',
      source: 'World Building Notes',
      tags: ['magic', 'worldbuilding', 'system'],
      category: 'worldbuilding',
      importance: 'critical'
    }
  },

  // Theme Nodes
  {
    id: 'theme-1',
    type: 'theme',
    position: { x: 300, y: 50 },
    data: {
      title: 'Power and Responsibility',
      type: 'central',
      description: 'The burden and consequences of wielding great magical power',
      development: 'Introduced through Sylandria\'s awakening, developed through her relationship with Theron',
      examples: ['Sylandria\'s forbidden magic studies', 'Theron\'s protective dedication'],
      symbolism: ['The forbidden tome', 'Blessed weapons'],
      significance: 'major'
    }
  },
  {
    id: 'theme-2',
    type: 'theme',
    position: { x: 500, y: 50 },
    data: {
      title: 'Bridging Worlds',
      type: 'supporting',
      description: 'Connecting separated peoples and overcoming historical divisions',
      development: 'Surface and underground worlds, different races working together',
      examples: ['Elf-human alliance', 'Sharing magical knowledge'],
      symbolism: ['Ley lines connecting realms', 'Crystal formations'],
      significance: 'moderate'
    }
  },

  // Timeline/Conflict Nodes
  {
    id: 'conflict-1',
    type: 'conflict',
    position: { x: 700, y: 300 },
    data: {
      title: 'Internal: Power Control',
      type: 'internal',
      description: 'Sylandria struggles to control her awakened magical abilities',
      participants: ['Sylandria'],
      stakes: 'Personal safety and others\' well-being',
      resolution: 'Learning control through Theron\'s guidance',
      relatedPlots: ['Awakening Power', 'The Mentor Arrives'],
      intensity: 'high'
    }
  },
  {
    id: 'timeline-1',
    type: 'timeline',
    position: { x: 800, y: 500 },
    data: {
      title: 'Pre-Story: The War',
      type: 'backstory',
      description: 'The War of Shadows devastates both surface and underground realms',
      timeframe: '20 years ago',
      duration: '3 years',
      order: -1,
      significance: 'major',
      connectedEvents: ['Theron loses family', 'Realm separation', 'Magic scatter']
    }
  }
];

// Sample edges showing relationships between nodes
export const sampleEdges: Edge[] = [
  // Character relationships
  {
    id: 'e1',
    source: 'char-1',
    target: 'char-2',
    type: 'smoothstep',
    label: 'Mentor-Student',
    labelStyle: { fontSize: '12px', fontWeight: 600 },
    style: { stroke: '#10B981', strokeWidth: 2 }
  },

  // Character-Location relationships
  {
    id: 'e2',
    source: 'char-1',
    target: 'loc-1',
    type: 'smoothstep',
    label: 'Home',
    labelStyle: { fontSize: '11px' },
    style: { stroke: '#8B5CF6', strokeWidth: 1.5 }
  },
  {
    id: 'e3',
    source: 'char-2',
    target: 'loc-2',
    type: 'smoothstep',
    label: 'Origin',
    labelStyle: { fontSize: '11px' },
    style: { stroke: '#8B5CF6', strokeWidth: 1.5 }
  },

  // Plot flow connections
  {
    id: 'e4',
    source: 'plot-1',
    target: 'plot-2',
    type: 'smoothstep',
    label: 'Leads to',
    labelStyle: { fontSize: '11px' },
    style: { stroke: '#F59E0B', strokeWidth: 2 }
  },
  {
    id: 'e5',
    source: 'plot-3',
    target: 'plot-1',
    type: 'smoothstep',
    label: 'Influences',
    labelStyle: { fontSize: '11px' },
    style: { stroke: '#EF4444', strokeWidth: 1.5 }
  },

  // Character-Plot involvement
  {
    id: 'e6',
    source: 'char-1',
    target: 'plot-1',
    type: 'smoothstep',
    label: 'Protagonist',
    labelStyle: { fontSize: '10px' },
    style: { stroke: '#06B6D4', strokeWidth: 1.5, strokeDasharray: '5,5' }
  },
  {
    id: 'e7',
    source: 'char-2',
    target: 'plot-2',
    type: 'smoothstep',
    label: 'Initiates',
    labelStyle: { fontSize: '10px' },
    style: { stroke: '#06B6D4', strokeWidth: 1.5, strokeDasharray: '5,5' }
  },

  // Research connections
  {
    id: 'e8',
    source: 'research-1',
    target: 'plot-1',
    type: 'smoothstep',
    label: 'Explains',
    labelStyle: { fontSize: '10px' },
    style: { stroke: '#84CC16', strokeWidth: 1 }
  },

  // Theme connections
  {
    id: 'e9',
    source: 'theme-1',
    target: 'char-1',
    type: 'smoothstep',
    label: 'Embodies',
    labelStyle: { fontSize: '10px' },
    style: { stroke: '#EC4899', strokeWidth: 1, strokeDasharray: '3,3' }
  },
  {
    id: 'e10',
    source: 'theme-2',
    target: 'char-2',
    type: 'smoothstep',
    label: 'Represents',
    labelStyle: { fontSize: '10px' },
    style: { stroke: '#EC4899', strokeWidth: 1, strokeDasharray: '3,3' }
  },

  // Conflict connections
  {
    id: 'e11',
    source: 'conflict-1',
    target: 'char-1',
    type: 'smoothstep',
    label: 'Faces',
    labelStyle: { fontSize: '10px' },
    style: { stroke: '#F97316', strokeWidth: 1.5 }
  },

  // Timeline connections
  {
    id: 'e12',
    source: 'timeline-1',
    target: 'plot-3',
    type: 'smoothstep',
    label: 'Creates',
    labelStyle: { fontSize: '10px' },
    style: { stroke: '#6366F1', strokeWidth: 1 }
  }
];

// Helper function to load sample data
export const loadSampleData = () => {
  return {
    nodes: sampleNodes,
    edges: sampleEdges
  };
};

// Empty state message with instructions
export const getEmptyStateContent = () => ({
  title: "Enhanced Canvas Ready",
  subtitle: "Create your story's visual blueprint",
  instructions: [
    "Add characters, plot points, and locations using the toolbar",
    "Connect elements by dragging from one node to another",
    "Use AI assistance to analyze story structure and suggest improvements",
    "Switch between exploratory and master canvas modes"
  ],
  quickActions: [
    { label: "Load Sample Story", action: "load-sample" },
    { label: "Start with Character", action: "create-character" },
    { label: "Begin with Plot", action: "create-plot" },
    { label: "Import from Library", action: "import-library" }
  ]
});
