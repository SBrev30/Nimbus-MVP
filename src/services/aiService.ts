import Anthropic from '@anthropic-ai/sdk';

// Keep existing interfaces
interface AITaggingResult {
  characterName?: string;
  role?: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  fantasyClass?: string;
  relationships?: string[];
  confidence: number;
}

// Add new interfaces for enhanced AI features
export interface StoryCoherenceResult {
  overallScore: number;
  issues: CoherenceIssue[];
  suggestions: string[];
  plotHoles: PlotHole[];
}

export interface CoherenceIssue {
  type: 'character_inconsistency' | 'plot_contradiction' | 'timeline_error' | 'motivation_gap';
  severity: 'critical' | 'moderate' | 'minor';
  description: string;
  affectedNodes: string[];
  suggestedFix: string;
}

export interface PlotHole {
  id: string;
  description: string;
  location: string;
  severity: 'critical' | 'moderate' | 'minor';
  suggestedResolution: string;
  affectedCharacters: string[];
}

export interface RelationshipSuggestion {
  fromNodeId: string;
  toNodeId: string;
  relationshipType: string;
  strength: number;
  reasoning: string;
  confidence: number;
}

export interface CharacterArc {
  characterId: string;
  stages: ArcStage[];
  development: DevelopmentMetric[];
  conflicts: string[];
  growth: number;
}

export interface ArcStage {
  plotPointId: string;
  stage: 'introduction' | 'development' | 'crisis' | 'resolution';
  characterState: string;
  growth: number;
}

export interface DevelopmentMetric {
  aspect: 'personality' | 'relationships' | 'skills' | 'worldview';
  change: number;
  evidence: string[];
}

class AIService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  // Keep existing methods
  async analyzeCharacterContent(content: string): Promise<AITaggingResult> {
    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 200,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: `You are an expert at analyzing character descriptions for fantasy/RPG stories. 
            Extract character information and classify roles and fantasy classes.
            
            Fantasy Classes: Battle Mage, Demon, Assassin, Monster, Mage, Archer, Martial Artist, Swordsman, Tracker, Demi God
            
            Respond with JSON only: {
              "characterName": "string or null",
              "role": "protagonist|antagonist|supporting|minor or null", 
              "fantasyClass": "string or null",
              "relationships": ["array of relationship types"],
              "confidence": 0-1
            }
            
            CONTENT: ${content}`
          }
        ]
      });

      const result = JSON.parse(response.content[0].text || '{}');
      return result;
    } catch (error) {
      console.error('AI analysis failed:', error);
      return { confidence: 0 };
    }
  }

  async generateCharacterSuggestions(existingCharacters: any[]): Promise<string[]> {
    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: `Based on these existing characters: ${JSON.stringify(existingCharacters.map(c => ({ name: c.name, role: c.role })))}, 
            suggest 3 character types that would enhance the story. Return as a JSON array of strings.`
          }
        ]
      });

      const suggestions = JSON.parse(response.content[0].text || '[]');
      return Array.isArray(suggestions) ? suggestions : [
        "Consider adding a mentor figure to guide the protagonist",
        "A rival character could create interesting tension",
        "Think about the protagonist's family relationships"
      ];
    } catch (error) {
      console.error('Character suggestions failed:', error);
      return [
        "Consider adding a mentor figure to guide the protagonist",
        "A rival character could create interesting tension",
        "Think about the protagonist's family relationships"
      ];
    }
  }

  async analyzeStoryStructure(plotNodes: any[]): Promise<string[]> {
    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 400,
        temperature: 0.5,
        messages: [
          {
            role: "user",
            content: `Analyze this story structure: ${JSON.stringify(plotNodes.map(p => ({ title: p.title, type: p.type })))}.
            Provide 3 suggestions for improving the plot structure. Return as JSON array of strings.`
          }
        ]
      });

      const suggestions = JSON.parse(response.content[0].text || '[]');
      return Array.isArray(suggestions) ? suggestions : [
        "Consider adding more conflict in the middle section",
        "The resolution could benefit from additional setup",
        "Add a subplot to enrich the main narrative"
      ];
    } catch (error) {
      console.error('Story structure analysis failed:', error);
      return [
        "Consider adding more conflict in the middle section",
        "The resolution could benefit from additional setup",
        "Add a subplot to enrich the main narrative"
      ];
    }
  }

  // NEW ENHANCED METHODS
  async analyzeStoryCoherence(nodes: any[], edges: any[]): Promise<StoryCoherenceResult> {
    try {
      const storyContext = this.buildStoryContext(nodes, edges);
      
      const response = await this.anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: `You are an expert story analyst. Analyze this story structure for coherence, plot holes, and character consistency.

STORY STRUCTURE:
${storyContext}

Provide analysis in this JSON format:
{
  "overallScore": 0-100,
  "issues": [
    {
      "type": "character_inconsistency|plot_contradiction|timeline_error|motivation_gap",
      "severity": "critical|moderate|minor",
      "description": "detailed description",
      "affectedNodes": ["node1", "node2"],
      "suggestedFix": "specific fix suggestion"
    }
  ],
  "suggestions": ["improvement suggestions"],
  "plotHoles": [
    {
      "id": "unique_id",
      "description": "plot hole description",
      "location": "where it occurs",
      "severity": "critical|moderate|minor",
      "suggestedResolution": "how to fix",
      "affectedCharacters": ["character names"]
    }
  ]
}`
          }
        ]
      });

      return JSON.parse(response.content[0].text || '{}');
    } catch (error) {
      console.error('Story coherence analysis failed:', error);
      return {
        overallScore: 50,
        issues: [],
        suggestions: ['Unable to analyze story coherence at this time'],
        plotHoles: []
      };
    }
  }

  async generateRelationshipSuggestions(nodes: any[], edges: any[]): Promise<RelationshipSuggestion[]> {
    try {
      const characters = nodes.filter(n => n.type === 'character');
      const plotPoints = nodes.filter(n => n.type === 'plot');
      const existingRelationships = edges.map(e => `${e.source}-${e.target}`);

      const response = await this.anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1500,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: `Analyze these story elements and suggest meaningful relationships:

CHARACTERS: ${JSON.stringify(characters.map(c => ({ id: c.id, name: c.data.name, role: c.data.role, description: c.data.description })))}

PLOT POINTS: ${JSON.stringify(plotPoints.map(p => ({ id: p.id, title: p.data.title, type: p.data.type, description: p.data.description })))}

EXISTING RELATIONSHIPS: ${existingRelationships.join(', ')}

Suggest 3-5 new meaningful relationships. Return as JSON:
[
  {
    "fromNodeId": "node_id",
    "toNodeId": "node_id", 
    "relationshipType": "friend|enemy|family|mentor|love|affects|causes|prevents",
    "strength": 1-10,
    "reasoning": "why this relationship makes sense",
    "confidence": 0.0-1.0
  }
]`
          }
        ]
      });

      return JSON.parse(response.content[0].text || '[]');
    } catch (error) {
      console.error('Relationship suggestion failed:', error);
      return [];
    }
  }

  async analyzeCharacterArcs(nodes: any[], edges: any[]): Promise<CharacterArc[]> {
    try {
      const characters = nodes.filter(n => n.type === 'character');
      const plotPoints = nodes.filter(n => n.type === 'plot').sort((a, b) => 
        (a.data.order || 0) - (b.data.order || 0)
      );

      const arcs: CharacterArc[] = [];

      for (const character of characters) {
        const connectedPlots = this.findConnectedPlotPoints(character.id, edges, plotPoints);
        
        const response = await this.anthropic.messages.create({
          model: "claude-3-sonnet-20240229",
          max_tokens: 800,
          temperature: 0.4,
          messages: [
            {
              role: "user",
              content: `Analyze the character arc for this character:

CHARACTER: ${JSON.stringify({ 
  name: character.data.name, 
  role: character.data.role, 
  description: character.data.description 
})}

CONNECTED PLOT POINTS: ${JSON.stringify(connectedPlots)}

Create a character arc analysis. Return as JSON:
{
  "characterId": "${character.id}",
  "stages": [
    {
      "plotPointId": "plot_id",
      "stage": "introduction|development|crisis|resolution",
      "characterState": "description of character at this point",
      "growth": 0-10
    }
  ],
  "development": [
    {
      "aspect": "personality|relationships|skills|worldview",
      "change": -10 to +10,
      "evidence": ["specific examples"]
    }
  ],
  "conflicts": ["internal/external conflicts"],
  "growth": 0-10
}`
            }
          ]
        });

        const arc = JSON.parse(response.content[0].text || '{}');
        if (arc.characterId) {
          arcs.push(arc);
        }
      }

      return arcs;
    } catch (error) {
      console.error('Character arc analysis failed:', error);
      return [];
    }
  }

  async generateStoryTemplate(genre: string, complexity: 'simple' | 'complex' | 'epic'): Promise<any> {
    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 2000,
        temperature: 0.6,
        messages: [
          {
            role: "user",
            content: `Create a story structure template for a ${complexity} ${genre} story.

Generate nodes and connections suitable for a visual canvas. Include:
- Main characters with roles and brief descriptions
- Key plot points in logical sequence
- Important locations/settings
- Major themes
- Conflict nodes

Return as JSON:
{
  "name": "Template Name",
  "description": "Template description",
  "nodes": [
    {
      "id": "unique_id",
      "type": "character|plot|location|theme|conflict",
      "position": {"x": number, "y": number},
      "data": {
        "name/title": "string",
        "role/type": "string", 
        "description": "string",
        "additional_fields": "as needed"
      }
    }
  ],
  "edges": [
    {
      "id": "edge_id",
      "source": "node_id",
      "target": "node_id",
      "label": "relationship type",
      "type": "smoothstep"
    }
  ]
}`
          }
        ]
      });

      return JSON.parse(response.content[0].text || '{}');
    } catch (error) {
      console.error('Template generation failed:', error);
      return null;
    }
  }

  // HELPER METHODS
  private buildStoryContext(nodes: any[], edges: any[]): string {
    const characters = nodes.filter(n => n.type === 'character');
    const plotPoints = nodes.filter(n => n.type === 'plot');
    const relationships = edges.map(e => `${e.source} -> ${e.target} (${e.label || 'connected'})`);

    return `
CHARACTERS:
${characters.map(c => `- ${c.data.name} (${c.data.role}): ${c.data.description}`).join('\n')}

PLOT POINTS:
${plotPoints.map(p => `- ${p.data.title} (${p.data.type}): ${p.data.description}`).join('\n')}

RELATIONSHIPS:
${relationships.join('\n')}
    `.trim();
  }

  private findConnectedPlotPoints(characterId: string, edges: any[], plotPoints: any[]): any[] {
    const connectedIds = edges
      .filter(e => e.source === characterId || e.target === characterId)
      .map(e => e.source === characterId ? e.target : e.source);
    
    return plotPoints.filter(p => connectedIds.includes(p.id));
  }
}

export const aiService = new AIService();