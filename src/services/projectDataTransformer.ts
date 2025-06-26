import { Node, Edge, Position } from 'reactflow';
import { 
  ProjectCanvasData, 
  ChapterNodeData, 
  NodePosition, 
  CanvasLayoutOptions,
  CanvasGenerationResult,
  CharacterData,
  ChapterData
} from '../types/masterCanvas';

export interface CanvasData {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Service for transforming project data into visual canvas representations
 */
export class ProjectDataTransformer {
  
  /**
   * Transform a project into canvas data
   */
  async transformProjectToCanvas(
    projectData: ProjectCanvasData, 
    options: CanvasLayoutOptions = {
      algorithm: 'hierarchical',
      spacing: 300,
      direction: 'horizontal',
      grouping: 'by_chapter'
    }
  ): Promise<CanvasData> {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    try {
      // Create chapter nodes
      const chapterNodes = this.createChapterNodes(projectData.chapters, options);
      nodes.push(...chapterNodes);
      
      // Create character nodes
      const characterNodes = this.createCharacterNodes(projectData.characters, options);
      nodes.push(...characterNodes);
      
      // Create edges between chapters (story flow)
      const chapterEdges = this.generateChapterFlowEdges(projectData.chapters);
      edges.push(...chapterEdges);
      
      // Create edges between characters and chapters (appearances)
      const characterChapterEdges = this.generateCharacterChapterEdges(
        projectData.characters, 
        projectData.chapters
      );
      edges.push(...characterChapterEdges);
      
      // Create character relationship edges
      const relationshipEdges = this.generateCharacterRelationshipEdges(projectData.characters);
      edges.push(...relationshipEdges);
      
      return { nodes, edges };
      
    } catch (error) {
      console.error('Error transforming project to canvas:', error);
      throw new Error(`Canvas generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Create chapter nodes with enhanced data for Master Canvas
   */
  private createChapterNodes(chapters: ChapterData[], options: CanvasLayoutOptions): Node[] {
    return chapters.map((chapter, index) => {
      const position = this.calculateChapterPosition(index, chapters.length, options);
      
      const nodeData: ChapterNodeData = {
        chapterNumber: chapter.number,
        title: chapter.title,
        summary: chapter.summary || '',
        wordCount: chapter.wordCount,
        mainCharacters: this.extractMainCharacters(chapter),
        plotEvents: chapter.plotEvents || [],
        conflicts: [], // Will be populated by analysis service
        significance: this.calculateChapterSignificance(chapter),
        status: chapter.status
      };
      
      return {
        id: `chapter-${chapter.id}`,
        type: 'chapter',
        position,
        data: nodeData,
        draggable: false, // Master canvas nodes are not manually draggable
      };
    });
  }
  
  /**
   * Create character nodes positioned around chapters
   */
  private createCharacterNodes(characters: CharacterData[], options: CanvasLayoutOptions): Node[] {
    return characters.map((character, index) => {
      const position = this.calculateCharacterPosition(character, index, characters.length, options);
      
      return {
        id: `character-${character.id}`,
        type: 'character',
        position,
        data: {
          name: character.name,
          role: character.role,
          description: character.description,
          relationships: character.relationships,
          appearances: character.appearances,
        },
        draggable: false,
      };
    });
  }
  
  /**
   * Calculate optimal position for chapter nodes based on layout algorithm
   */
  private calculateChapterPosition(
    index: number, 
    total: number, 
    options: CanvasLayoutOptions
  ): NodePosition {
    const { algorithm, spacing, direction } = options;
    
    switch (algorithm) {
      case 'hierarchical':
        return this.hierarchicalLayout(index, total, spacing, direction);
      case 'timeline':
        return this.timelineLayout(index, total, spacing);
      case 'circular':
        return this.circularLayout(index, total, spacing);
      case 'force_directed':
      default:
        return this.defaultLayout(index, spacing);
    }
  }
  
  /**
   * Hierarchical layout - chapters in a flowing timeline
   */
  private hierarchicalLayout(
    index: number, 
    total: number, 
    spacing: number, 
    direction: 'horizontal' | 'vertical'
  ): NodePosition {
    const baseY = 100;
    const curve = Math.sin((index / total) * Math.PI) * 100;
    
    if (direction === 'horizontal') {
      return {
        x: index * spacing,
        y: baseY + curve
      };
    } else {
      return {
        x: baseY + curve,
        y: index * spacing
      };
    }
  }
  
  /**
   * Timeline layout - linear progression
   */
  private timelineLayout(index: number, total: number, spacing: number): NodePosition {
    return {
      x: index * spacing,
      y: 200
    };
  }
  
  /**
   * Circular layout - chapters arranged in a circle
   */
  private circularLayout(index: number, total: number, spacing: number): NodePosition {
    const centerX = 400;
    const centerY = 400;
    const radius = Math.max(200, total * 50);
    const angle = (index / total) * 2 * Math.PI;
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  }
  
  /**
   * Default layout fallback
   */
  private defaultLayout(index: number, spacing: number): NodePosition {
    return {
      x: (index % 4) * spacing,
      y: Math.floor(index / 4) * spacing
    };
  }
  
  /**
   * Calculate character positions relative to their story importance
   */
  private calculateCharacterPosition(
    character: CharacterData, 
    index: number, 
    total: number, 
    options: CanvasLayoutOptions
  ): NodePosition {
    const importanceMultiplier = this.getCharacterImportance(character);
    const baseRadius = 150;
    const radius = baseRadius * importanceMultiplier;
    
    // Position characters in concentric circles around chapters
    const angle = (index / total) * 2 * Math.PI;
    const centerX = 400;
    const centerY = 400;
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  }
  
  /**
   * Extract main characters from chapter content
   */
  private extractMainCharacters(chapter: ChapterData): string[] {
    // For now, return characters from chapter data
    // In full implementation, would analyze content for character mentions
    return chapter.characters || [];
  }
  
  /**
   * Calculate chapter significance based on content and plot events
   */
  private calculateChapterSignificance(chapter: ChapterData): 'high' | 'medium' | 'low' {
    const plotEventCount = chapter.plotEvents?.length || 0;
    const wordCount = chapter.wordCount || 0;
    const characterCount = chapter.characters?.length || 0;
    
    // Simple heuristic - can be enhanced with AI analysis
    const score = plotEventCount * 3 + (wordCount / 1000) + characterCount;
    
    if (score > 10) return 'high';
    if (score > 5) return 'medium';
    return 'low';
  }
  
  /**
   * Get character importance multiplier for positioning
   */
  private getCharacterImportance(character: CharacterData): number {
    switch (character.role) {
      case 'protagonist': return 1.0;
      case 'antagonist': return 0.9;
      case 'supporting': return 0.7;
      case 'minor': return 0.5;
      default: return 0.5;
    }
  }
  
  /**
   * Generate edges representing story flow between chapters
   */
  private generateChapterFlowEdges(chapters: ChapterData[]): Edge[] {
    const edges: Edge[] = [];
    
    for (let i = 0; i < chapters.length - 1; i++) {
      const current = chapters[i];
      const next = chapters[i + 1];
      
      edges.push({
        id: `flow-${current.id}-${next.id}`,
        source: `chapter-${current.id}`,
        target: `chapter-${next.id}`,
        type: 'smoothstep',
        label: 'Next',
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#94a3b8' }
      });
    }
    
    return edges;
  }
  
  /**
   * Generate edges connecting characters to chapters where they appear
   */
  private generateCharacterChapterEdges(
    characters: CharacterData[], 
    chapters: ChapterData[]
  ): Edge[] {
    const edges: Edge[] = [];
    
    characters.forEach(character => {
      character.appearances?.forEach(chapterId => {
        const chapter = chapters.find(c => c.id === chapterId);
        if (chapter) {
          edges.push({
            id: `appearance-${character.id}-${chapterId}`,
            source: `character-${character.id}`,
            target: `chapter-${chapter.id}`,
            type: 'straight',
            style: { 
              stroke: this.getCharacterColor(character.role), 
              strokeWidth: 1,
              strokeDasharray: '5,5'
            },
            label: 'Appears in'
          });
        }
      });
    });
    
    return edges;
  }
  
  /**
   * Generate edges representing character relationships
   */
  private generateCharacterRelationshipEdges(characters: CharacterData[]): Edge[] {
    const edges: Edge[] = [];
    
    characters.forEach(character => {
      character.relationships?.forEach(relationship => {
        const targetCharacter = characters.find(c => c.id === relationship.characterId);
        if (targetCharacter) {
          edges.push({
            id: `relationship-${character.id}-${relationship.characterId}`,
            source: `character-${character.id}`,
            target: `character-${relationship.characterId}`,
            type: 'smoothstep',
            label: relationship.type,
            style: { 
              stroke: this.getRelationshipColor(relationship.type),
              strokeWidth: Math.max(1, relationship.strength / 3)
            }
          });
        }
      });
    });
    
    return edges;
  }
  
  /**
   * Get color for character role
   */
  private getCharacterColor(role: string): string {
    switch (role) {
      case 'protagonist': return '#10b981';
      case 'antagonist': return '#ef4444';
      case 'supporting': return '#3b82f6';
      case 'minor': return '#6b7280';
      default: return '#6b7280';
    }
  }
  
  /**
   * Get color for relationship type
   */
  private getRelationshipColor(type: string): string {
    switch (type) {
      case 'friend': return '#10b981';
      case 'enemy': return '#ef4444';
      case 'family': return '#f59e0b';
      case 'romantic': return '#ec4899';
      case 'mentor': return '#8b5cf6';
      case 'rival': return '#f97316';
      default: return '#6b7280';
    }
  }
  
  /**
   * Find chapters where a story element appears
   */
  findElementAppearances(elementName: string, chapters: ChapterData[]): string[] {
    return chapters
      .filter(chapter => 
        chapter.content?.toLowerCase().includes(elementName.toLowerCase()) ||
        chapter.summary?.toLowerCase().includes(elementName.toLowerCase())
      )
      .map(chapter => chapter.id);
  }
  
  /**
   * Generate outline from canvas data (reverse transformation)
   */
  generateOutlineFromCanvas(nodes: Node[], edges: Edge[]): any {
    const characters = nodes.filter(n => n.type === 'character');
    const chapters = nodes.filter(n => n.type === 'chapter');
    
    return {
      title: 'Story Outline Generated from Master Canvas',
      generatedAt: new Date().toISOString(),
      structure: {
        characters: {
          main: characters.filter(c => c.data.role === 'protagonist'),
          supporting: characters.filter(c => c.data.role === 'supporting'),
          antagonists: characters.filter(c => c.data.role === 'antagonist')
        },
        chapters: chapters.map(chapter => ({
          number: chapter.data.chapterNumber,
          title: chapter.data.title,
          summary: chapter.data.summary,
          wordCount: chapter.data.wordCount,
          significance: chapter.data.significance,
          conflicts: chapter.data.conflicts?.length || 0
        })),
        relationships: edges
          .filter(edge => edge.type === 'smoothstep' && edge.label !== 'Next')
          .map(edge => ({
            from: nodes.find(n => n.id === edge.source)?.data.name || edge.source,
            to: nodes.find(n => n.id === edge.target)?.data.name || edge.target,
            type: edge.label || 'connected'
          }))
      }
    };
  }
}

// Export singleton instance
export const projectDataTransformer = new ProjectDataTransformer();
