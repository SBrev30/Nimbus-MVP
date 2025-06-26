// Enhanced Node Components Export
export { CharacterNode } from './CharacterNode';
export { PlotNode } from './PlotNode';
export { LocationNode } from './LocationNode';
export { ThemeNode } from './ThemeNode';
export { ConflictNode } from './ConflictNode';
export { TimelineNode } from './TimelineNode';
export { ResearchNode } from './ResearchNode';

import { CharacterNode } from './CharacterNode';
import { PlotNode } from './PlotNode';
import { LocationNode } from './LocationNode';
import { ThemeNode } from './ThemeNode';
import { ConflictNode } from './ConflictNode';
import { TimelineNode } from './TimelineNode';
import { ResearchNode } from './ResearchNode';

// Export data interfaces for type checking
export type { CharacterNodeData } from './CharacterNode';
export type { PlotNodeData } from './PlotNode';
export type { LocationNodeData } from './LocationNode';
export type { ThemeNodeData } from './ThemeNode';
export type { ConflictNodeData } from './ConflictNode';
export type { TimelineNodeData } from './TimelineNode';
export type { ResearchNodeData } from './ResearchNode';

// Combined node types for ReactFlow
export const enhancedNodeTypes = {
  character: CharacterNode,
  plot: PlotNode,
  location: LocationNode,
  theme: ThemeNode,
  conflict: ConflictNode,
  timeline: TimelineNode,
  research: ResearchNode,
};

// Node color mapping for MiniMap and visualization
export const nodeColors = {
  character: '#A5F7AC', // Green
  plot: '#FEE2E2',      // Light Red
  location: '#E0E7FF',  // Light Blue
  theme: '#FEF3C7',     // Light Yellow
  conflict: '#FECACA',  // Light Pink
  timeline: '#E0F2FE',  // Light Cyan
  research: '#F3E8FF',  // Light Purple
};

// Node icons for toolbar and UI
export const nodeIcons = {
  character: '👤',
  plot: '📖',
  location: '📍',
  theme: '💡',
  conflict: '⚔️',
  timeline: '⏰',
  research: '🔍',
};

// Node creation functions
export const createNodeData = (type: string, customData?: any) => {
  const baseData = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
  };

  switch (type) {
    case 'character':
      return { ...baseData, ...characterTemplate(), ...customData };
    case 'plot':
      return { ...baseData, ...plotTemplate(), ...customData };
    case 'location':
      return { ...baseData, ...locationTemplate(), ...customData };
    case 'theme':
      return { ...baseData, ...themeTemplate(), ...customData };
    case 'conflict':
      return { ...baseData, ...conflictTemplate(), ...customData };
    case 'timeline':
      return { ...baseData, ...timelineTemplate(), ...customData };
    case 'research':
      return { ...baseData, ...researchTemplate(), ...customData };
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
};

// Template functions for creating new nodes
const characterTemplate = () => ({
  name: 'New Character',
  role: 'protagonist' as const,
  description: '',
  traits: [],
  relationships: [],
  fantasyClass: '',
  aiSuggested: false
});

const plotTemplate = () => ({
  title: 'New Plot Point',
  type: 'event' as const,
  description: '',
  significance: 'moderate' as const,
  order: 0,
  chapter: ''
});

const locationTemplate = () => ({
  name: 'New Location',
  type: 'building' as const,
  description: '',
  importance: 'moderate' as const,
  connectedCharacters: [],
  atmosphere: '',
  details: ''
});

const themeTemplate = () => ({
  title: 'New Theme',
  type: 'supporting' as const,
  description: '',
  significance: 'moderate' as const,
  relatedCharacters: [],
  development: 'emerging'
});

const conflictTemplate = () => ({
  title: 'New Conflict',
  type: 'interpersonal' as const,
  description: '',
  parties: [],
  currentStatus: 'emerging' as const,
  escalation: 5,
  impact: 'moderate' as const
});

const timelineTemplate = () => ({
  title: 'New Timeline Event',
  type: 'event' as const,
  description: '',
  timeframe: 'Present',
  duration: '',
  order: 0,
  significance: 'medium' as const,
  connectedEvents: []
});

const researchTemplate = () => ({
  title: 'New Research',
  content: '',
  source: '',
  tags: [],
  category: 'worldbuilding' as const,
  credibility: 'medium' as const,
  dateAdded: new Date().toISOString()
});

// Utility functions for node management
interface NodeWithTypeAndData {
  type: string;
  data: { name?: string; title?: string };
}

export const getNodeDisplayName = (node: NodeWithTypeAndData): string => {
  switch (node.type) {
    case 'character':
      return node.data.name || 'Unnamed Character';
    case 'plot':
    case 'theme':
    case 'conflict':
    case 'timeline':
    case 'research':
      return node.data.title || `New ${node.type}`;
    case 'location':
      return node.data.name || 'Unnamed Location';
    default:
      return 'Unknown Node';
  }
};

export const getNodeDescription = (node: { data: { description?: string } }): string => {
  return node.data.description || 'No description available';
};

export const getNodeIcon = (type: string): string => {
  return nodeIcons[type as keyof typeof nodeIcons] || '❓';
};

export const getNodeColor = (type: string): string => {
  return nodeColors[type as keyof typeof nodeColors] || '#F3F4F6';
};

// Export validation functions
return typeof data.name === 'string' && 
data.name.trim().length > 0 && 
typeof data.role === 'string' && 
['protagonist', 'antagonist', 'supporting'].includes(data.role);
    case 'plot':
    case 'theme':
    case 'conflict':
    case 'timeline':
    case 'research':
      return typeof data.title === 'string' && 
data.title.trim().length > 0 && 
['event', 'twist', 'climax', 'resolution'].includes(data.type);
    case 'location':
      return typeof data.name === 'string';
    default:
      return false;
  }
};

// Node relationship utilities
export const getValidConnectionTypes = (sourceType: string, targetType: string): string[] => {
  const connections: Record<string, Record<string, string[]>> = {
    character: {
      character: ['friend', 'enemy', 'family', 'romance', 'rival'],
      plot: ['participates', 'causes', 'affected_by'],
      location: ['lives_at', 'visits', 'owns'],
      theme: ['embodies', 'represents'],
      conflict: ['involved_in', 'causes', 'resolves'],
      research: ['researches', 'studies']
    },
    plot: {
      character: ['involves', 'affects'],
      plot: ['leads_to', 'caused_by', 'parallel_to'],
      location: ['occurs_at', 'moves_to'],
      theme: ['explores', 'develops'],
      conflict: ['creates', 'resolves'],
      timeline: ['part_of', 'triggers']
    },
    location: {
      character: ['home_to', 'visited_by'],
      plot: ['setting_for'],
      location: ['connected_to', 'near'],
      theme: ['symbolizes'],
      conflict: ['site_of']
    },
    theme: {
      character: ['embodied_by'],
      plot: ['explored_in'],
      theme: ['related_to', 'contrasts'],
      conflict: ['underlying']
    },
    conflict: {
      character: ['involves'],
      plot: ['drives'],
      location: ['takes_place_at'],
      conflict: ['escalates', 'causes']
    },
    timeline: {
      plot: ['contains', 'sequence'],
      timeline: ['before', 'after', 'during']
    },
    research: {
      character: ['about'],
      plot: ['informs'],
      location: ['describes'],
      theme: ['supports']
    }
  };

  return connections[sourceType]?.[targetType] || ['connected'];
};
