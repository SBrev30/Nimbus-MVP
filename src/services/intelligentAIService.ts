import { aiService } from './aiService';

// Enhanced AI service that automatically selects the best approach
export interface AIAnalysisResult {
  type: 'character' | 'story-coherence' | 'relationships' | 'character-arcs';
  success: boolean;
  data: any;
  confidence: number;
  processingTime: number;
  recommendations?: string[];
}

export interface StoryCoherenceResult {
  overallScore: number;
  issues: Array<{
    type: 'character_inconsistency' | 'plot_contradiction' | 'timeline_error' | 'motivation_gap';
    severity: 'critical' | 'moderate' | 'minor';
    description: string;
    affectedNodes: string[];
    suggestedFix: string;
  }>;
  suggestions: string[];
  plotHoles: Array<{
    id: string;
    description: string;
    location: string;
    severity: 'critical' | 'moderate' | 'minor';
    suggestedResolution: string;
    affectedCharacters: string[];
  }>;
}

export interface RelationshipSuggestion {
  fromNodeId: string;
  toNodeId: string;
  relationshipType: 'friend' | 'enemy' | 'family' | 'mentor' | 'love' | 'affects' | 'causes' | 'prevents';
  strength: number;
  reasoning: string;
  confidence: number;
}

export interface CharacterArcAnalysis {
  characterId: string;
  stages: Array<{
    plotPointId: string;
    stage: 'introduction' | 'development' | 'crisis' | 'resolution';
    characterState: string;
    growth: number;
  }>;
  development: Array<{
    aspect: 'personality' | 'relationships' | 'skills' | 'worldview';
    change: number;
    evidence: string[];
  }>;
  conflicts: string[];
  growth: number;
}

class IntelligentAIService {
  private usage: Map<string, number> = new Map();
  private lastUsed: Map<string, number> = new Map();

  // Intelligent analysis dispatcher
  async analyzeStoryElements(nodes: any[], edges: any[], analysisType?: string): Promise<AIAnalysisResult[]> {
    const startTime = Date.now();
    const results: AIAnalysisResult[] = [];

    try {
      // If no specific type requested, analyze everything intelligently
      if (!analysisType) {
        const characterNodes = nodes.filter(n => n.type === 'character');
        const plotNodes = nodes.filter(n => n.type === 'plot');
        
        if (characterNodes.length > 0) {
          const characterAnalysis = await this.analyzeCharacters(characterNodes);
          results.push(...characterAnalysis);
        }

        if (nodes.length > 3 && edges.length > 1) {
          const coherenceAnalysis = await this.analyzeStoryCoherence(nodes, edges);
          results.push(coherenceAnalysis);
        }

        if (characterNodes.length > 1) {
          const relationshipAnalysis = await this.suggestRelationships(nodes, edges);
          results.push(relationshipAnalysis);
        }

        if (plotNodes.length > 2 && characterNodes.length > 0) {
          const arcAnalysis = await this.analyzeCharacterArcs(nodes, edges);
          results.push(arcAnalysis);
        }
      } else {
        // Specific analysis requested
        switch (analysisType) {
          case 'character':
            const characterAnalysis = await this.analyzeCharacters(nodes.filter(n => n.type === 'character'));
            results.push(...characterAnalysis);
            break;
          case 'story-coherence':
            const coherenceAnalysis = await this.analyzeStoryCoherence(nodes, edges);
            results.push(coherenceAnalysis);
            break;
          case 'relationships':
            const relationshipAnalysis = await this.suggestRelationships(nodes, edges);
            results.push(relationshipAnalysis);
            break;
          case 'character-arcs':
            const arcAnalysis = await this.analyzeCharacterArcs(nodes, edges);
            results.push(arcAnalysis);
            break;
        }
      }

      const processingTime = Date.now() - startTime;
      results.forEach(result => result.processingTime = processingTime);

      return results;
    } catch (error) {
      console.error('Intelligent AI analysis failed:', error);
      return [{
        type: 'character',
        success: false,
        data: null,
        confidence: 0,
        processingTime: Date.now() - startTime,
        recommendations: ['AI analysis temporarily unavailable. Please try again later.']
      }];
    }
  }

  private async analyzeCharacters(characterNodes: any[]): Promise<AIAnalysisResult[]> {
    const results: AIAnalysisResult[] = [];

    for (const node of characterNodes) {
      try {
        const content = `${node.data.name || 'Unnamed Character'} - ${node.data.description || 'No description'}`;
        const analysis = await aiService.analyzeCharacterContent(content);
        
        results.push({
          type: 'character',
          success: true,
          data: {
            nodeId: node.id,
            ...analysis,
            suggestions: this.generateCharacterSuggestions(analysis, node.data)
          },
          confidence: analysis.confidence || 0,
          processingTime: 0,
          recommendations: this.generateCharacterRecommendations(analysis, node.data)
        });
      } catch (error) {
        results.push({
          type: 'character',
          success: false,
          data: { nodeId: node.id },
          confidence: 0,
          processingTime: 0,
          recommendations: [`Unable to analyze character: ${node.data.name || 'Unnamed'}`]
        });
      }
    }

    return results;
  }

  private async analyzeStoryCoherence(nodes: any[], edges: any[]): Promise<AIAnalysisResult> {
    try {
      // Mock implementation for story coherence analysis
      const characters = nodes.filter(n => n.type === 'character');
      const plotPoints = nodes.filter(n => n.type === 'plot');
      
      const issues = this.detectStoryIssues(nodes, edges);
      const suggestions = this.generateStoryImprovements(characters, plotPoints, edges);
      const plotHoles = this.identifyPlotHoles(plotPoints, edges);

      const result: StoryCoherenceResult = {
        overallScore: Math.max(30, 100 - (issues.length * 15) - (plotHoles.length * 10)),
        issues,
        suggestions,
        plotHoles
      };

      return {
        type: 'story-coherence',
        success: true,
        data: result,
        confidence: 0.8,
        processingTime: 0,
        recommendations: suggestions.slice(0, 3)
      };
    } catch (error) {
      return {
        type: 'story-coherence',
        success: false,
        data: {
          overallScore: 50,
          issues: [],
          suggestions: ['Unable to analyze story coherence at this time'],
          plotHoles: []
        },
        confidence: 0,
        processingTime: 0
      };
    }
  }

  private async suggestRelationships(nodes: any[], edges: any[]): Promise<AIAnalysisResult> {
    try {
      const characters = nodes.filter(n => n.type === 'character');
      const plotPoints = nodes.filter(n => n.type === 'plot');
      const existingConnections = edges.map(e => `${e.source}-${e.target}`);

      const suggestions: RelationshipSuggestion[] = [];

      // Generate intelligent relationship suggestions
      for (let i = 0; i < characters.length; i++) {
        for (let j = i + 1; j < characters.length; j++) {
          const char1 = characters[i];
          const char2 = characters[j];
          const connectionKey = `${char1.id}-${char2.id}`;
          const reverseKey = `${char2.id}-${char1.id}`;

          if (!existingConnections.includes(connectionKey) && !existingConnections.includes(reverseKey)) {
            const suggestion = this.generateRelationshipSuggestion(char1, char2, plotPoints);
            if (suggestion.confidence > 0.6) {
              suggestions.push(suggestion);
            }
          }
        }
      }

      return {
        type: 'relationships',
        success: true,
        data: suggestions.slice(0, 5), // Top 5 suggestions
        confidence: 0.75,
        processingTime: 0,
        recommendations: suggestions.map(s => `${s.relationshipType} relationship between connected characters: ${s.reasoning}`)
      };
    } catch (error) {
      return {
        type: 'relationships',
        success: false,
        data: [],
        confidence: 0,
        processingTime: 0
      };
    }
  }

  private async analyzeCharacterArcs(nodes: any[], edges: any[]): Promise<AIAnalysisResult> {
    try {
      const characters = nodes.filter(n => n.type === 'character');
      const plotPoints = nodes.filter(n => n.type === 'plot').sort((a, b) => 
        (a.position?.x || 0) - (b.position?.x || 0) // Sort by x position as a simple ordering
      );

      const analyses: CharacterArcAnalysis[] = characters.map(char => {
        return {
          characterId: char.id,
          stages: this.mapCharacterToPlotStages(char, plotPoints, edges),
          development: this.analyzeDevelopmentAspects(char, plotPoints),
          conflicts: this.identifyCharacterConflicts(char, characters, plotPoints),
          growth: this.calculateGrowthScore(char, plotPoints, edges)
        };
      });

      return {
        type: 'character-arcs',
        success: true,
        data: analyses,
        confidence: 0.7,
        processingTime: 0,
        recommendations: this.generateArcRecommendations(analyses)
      };
    } catch (error) {
      return {
        type: 'character-arcs',
        success: false,
        data: [],
        confidence: 0,
        processingTime: 0
      };
    }
  }

  // Helper methods for analysis
  private generateCharacterSuggestions(analysis: any, characterData: any): string[] {
    const suggestions = [];
    
    if (!characterData.description || characterData.description.length < 50) {
      suggestions.push("Consider expanding the character description with more personality details");
    }
    
    if (analysis.fantasyClass && !characterData.fantasyClass) {
      suggestions.push(`AI suggests this character might be a ${analysis.fantasyClass}`);
    }
    
    if (!characterData.relationships || characterData.relationships.length === 0) {
      suggestions.push("Add relationships with other characters to increase story complexity");
    }

    return suggestions;
  }

  private generateCharacterRecommendations(analysis: any, characterData: any): string[] {
    const recommendations = [];
    
    if (analysis.confidence > 0.8) {
      recommendations.push("Character analysis shows strong coherence");
    } else if (analysis.confidence > 0.5) {
      recommendations.push("Character could benefit from more detailed description");
    } else {
      recommendations.push("Consider developing this character further");
    }

    return recommendations;
  }

  private detectStoryIssues(nodes: any[], edges: any[]): any[] {
    const issues = [];
    const characters = nodes.filter(n => n.type === 'character');
    const plotPoints = nodes.filter(n => n.type === 'plot');

    // Check for unconnected important characters
    const protagonists = characters.filter(c => c.data.role === 'protagonist');
    const antagonists = characters.filter(c => c.data.role === 'antagonist');

    if (protagonists.length > 0 && antagonists.length > 0) {
      const hasProtagonistAntagonistConnection = edges.some(e => 
        (protagonists.some(p => p.id === e.source) && antagonists.some(a => a.id === e.target)) ||
        (antagonists.some(a => a.id === e.source) && protagonists.some(p => p.id === e.target))
      );

      if (!hasProtagonistAntagonistConnection) {
        issues.push({
          type: 'character_inconsistency',
          severity: 'moderate',
          description: 'Protagonist and antagonist are not connected in the story structure',
          affectedNodes: [...protagonists.map(p => p.id), ...antagonists.map(a => a.id)],
          suggestedFix: 'Create a connection showing their conflict or relationship'
        });
      }
    }

    return issues;
  }

  private generateStoryImprovements(characters: any[], plotPoints: any[], edges: any[]): string[] {
    const suggestions = [];

    if (characters.length < 3) {
      suggestions.push("Consider adding more supporting characters to enrich your story");
    }

    if (plotPoints.length < 5) {
      suggestions.push("Your story might benefit from additional plot points to create a fuller narrative arc");
    }

    if (edges.length < characters.length) {
      suggestions.push("Connect more characters to show their relationships and interactions");
    }

    const conflicts = plotPoints.filter(p => p.data.type === 'conflict');
    if (conflicts.length < 2) {
      suggestions.push("Add more conflict points to create tension and drive your story forward");
    }

    return suggestions;
  }

  private identifyPlotHoles(plotPoints: any[], edges: any[]): any[] {
    const plotHoles = [];

    // Check for missing resolutions
    const conflicts = plotPoints.filter(p => p.data.type === 'conflict');
    const resolutions = plotPoints.filter(p => p.data.type === 'resolution');

    if (conflicts.length > resolutions.length) {
      plotHoles.push({
        id: 'missing-resolutions',
        description: 'Some conflicts may not have corresponding resolutions',
        location: 'Plot structure',
        severity: 'moderate',
        suggestedResolution: 'Add resolution plot points for major conflicts',
        affectedCharacters: []
      });
    }

    return plotHoles;
  }

  private generateRelationshipSuggestion(char1: any, char2: any, plotPoints: any[]): RelationshipSuggestion {
    // Simple relationship suggestion based on character roles
    let relationshipType: RelationshipSuggestion['relationshipType'] = 'friend';
    let reasoning = '';
    let confidence = 0.5;

    if (char1.data.role === 'protagonist' && char2.data.role === 'antagonist') {
      relationshipType = 'enemy';
      reasoning = 'Natural conflict between protagonist and antagonist';
      confidence = 0.9;
    } else if (char1.data.role === 'protagonist' && char2.data.role === 'supporting') {
      relationshipType = 'friend';
      reasoning = 'Supporting character often allies with protagonist';
      confidence = 0.8;
    } else if (char1.data.role === 'supporting' && char2.data.role === 'supporting') {
      relationshipType = 'friend';
      reasoning = 'Supporting characters often know each other';
      confidence = 0.6;
    }

    return {
      fromNodeId: char1.id,
      toNodeId: char2.id,
      relationshipType,
      strength: Math.floor(Math.random() * 5) + 5, // 5-10
      reasoning,
      confidence
    };
  }

  private mapCharacterToPlotStages(character: any, plotPoints: any[], edges: any[]): any[] {
    // Simple mapping of character to plot stages
    return plotPoints.map((plot, index) => ({
      plotPointId: plot.id,
      stage: this.determineStage(index, plotPoints.length),
      characterState: `Character state at ${plot.data.title}`,
      growth: Math.min(10, index + 1)
    }));
  }

  private determineStage(index: number, total: number): 'introduction' | 'development' | 'crisis' | 'resolution' {
    const position = index / total;
    if (position < 0.25) return 'introduction';
    if (position < 0.75) return 'development';
    if (position < 0.9) return 'crisis';
    return 'resolution';
  }

  private analyzeDevelopmentAspects(character: any, plotPoints: any[]): any[] {
    return [
      {
        aspect: 'personality',
        change: Math.floor(Math.random() * 11) - 5, // -5 to +5
        evidence: ['Character development through story events']
      },
      {
        aspect: 'relationships',
        change: Math.floor(Math.random() * 8) + 1, // 1 to 8
        evidence: ['Interactions with other characters']
      }
    ];
  }

  private identifyCharacterConflicts(character: any, allCharacters: any[], plotPoints: any[]): string[] {
    const conflicts = [];
    
    if (character.data.role === 'protagonist') {
      conflicts.push('Internal struggle with personal growth');
      conflicts.push('External conflict with antagonistic forces');
    }
    
    return conflicts;
  }

  private calculateGrowthScore(character: any, plotPoints: any[], edges: any[]): number {
    // Simple growth calculation based on connections and plot involvement
    const connectionCount = edges.filter(e => e.source === character.id || e.target === character.id).length;
    return Math.min(10, connectionCount * 2 + 3);
  }

  private generateArcRecommendations(analyses: CharacterArcAnalysis[]): string[] {
    const recommendations = [];
    
    const lowGrowthChars = analyses.filter(a => a.growth < 5);
    if (lowGrowthChars.length > 0) {
      recommendations.push(`Consider developing character arcs further for: ${lowGrowthChars.map(c => c.characterId).join(', ')}`);
    }
    
    if (analyses.some(a => a.conflicts.length === 0)) {
      recommendations.push('Add internal or external conflicts to drive character development');
    }
    
    return recommendations;
  }

  // Usage tracking
  private trackUsage(analysisType: string) {
    const current = this.usage.get(analysisType) || 0;
    this.usage.set(analysisType, current + 1);
    this.lastUsed.set(analysisType, Date.now());
  }

  getUsageStats() {
    return {
      totalAnalyses: Array.from(this.usage.values()).reduce((a, b) => a + b, 0),
      byType: Object.fromEntries(this.usage),
      lastUsed: Object.fromEntries(this.lastUsed)
    };
  }
}

export const intelligentAIService = new IntelligentAIService();
