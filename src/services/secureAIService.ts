import { createClient } from '@supabase/supabase-js';
import type { 
  AITaggingResult, 
  StoryCoherenceResult, 
  RelationshipSuggestion, 
  CharacterArc 
} from './aiService';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface AIAnalysisResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class SecureAIService {
  private async makeAIRequest(body: any): Promise<any> {
    try {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Supabase not configured');
      }

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      // For demo purposes, we'll use anonymous authentication
      // In production, you'd want proper user authentication
      let authToken = session?.access_token;
      
      if (!authToken) {
        // Sign in anonymously for demo purposes
        const { data: { session: anonSession }, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.warn('Anonymous auth failed, edge functions may not work:', error);
          throw error;
        }
        authToken = anonSession?.access_token;
      }

      // FIXED: Use correct edge function name 'analyze-content' instead of 'ai-analysis'
      const { data, error } = await supabase.functions.invoke('analyze-content', {
        body,
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'AI analysis failed');
      }

      return data.data;
    } catch (error: any) {
      console.error('Secure AI request failed:', error);
      throw new Error(error.message || 'AI service unavailable');
    }
  }

  async analyzeCharacterContent(content: string): Promise<AITaggingResult> {
    try {
      const result = await this.makeAIRequest({
        content,
        analysisType: 'character'
      });

      return {
        characterName: result.characterName || null,
        role: result.role || null,
        fantasyClass: result.fantasyClass || null,
        relationships: result.relationships || [],
        confidence: result.confidence || 0
      };
    } catch (error) {
      console.error('Character analysis failed:', error);
      return { 
        confidence: 0,
        characterName: undefined,
        role: undefined,
        fantasyClass: undefined,
        relationships: []
      };
    }
  }

  async analyzeStoryCoherence(nodes: any[], edges: any[]): Promise<StoryCoherenceResult> {
    try {
      const result = await this.makeAIRequest({
        content: '',
        analysisType: 'story-coherence',
        nodes,
        edges
      });

      return result || {
        overallScore: 50,
        issues: [],
        suggestions: ['Unable to analyze story coherence at this time'],
        plotHoles: []
      };
    } catch (error) {
      console.error('Story coherence analysis failed:', error);
      return {
        overallScore: 50,
        issues: [],
        suggestions: ['Analysis temporarily unavailable'],
        plotHoles: []
      };
    }
  }

  async generateRelationshipSuggestions(nodes: any[], edges: any[]): Promise<RelationshipSuggestion[]> {
    try {
      const result = await this.makeAIRequest({
        content: '',
        analysisType: 'relationships',
        nodes,
        edges
      });

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Relationship suggestions failed:', error);
      return [];
    }
  }

  async analyzeCharacterArcs(nodes: any[], edges: any[]): Promise<CharacterArc[]> {
    try {
      const result = await this.makeAIRequest({
        content: '',
        analysisType: 'character-arcs',
        nodes,
        edges
      });

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Character arc analysis failed:', error);
      return [];
    }
  }

  async generateCharacterSuggestions(existingCharacters: any[]): Promise<string[]> {
    try {
      const result = await this.makeAIRequest({
        content: JSON.stringify(existingCharacters.map(c => ({ name: c.name, role: c.role }))),
        analysisType: 'character-suggestions'
      });

      return Array.isArray(result) ? result : [
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
      const result = await this.makeAIRequest({
        content: JSON.stringify(plotNodes.map(p => ({ title: p.title, type: p.type }))),
        analysisType: 'story-structure'
      });

      return Array.isArray(result) ? result : [
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

  async generateStoryTemplate(genre: string, complexity: 'simple' | 'complex' | 'epic'): Promise<any> {
    try {
      const result = await this.makeAIRequest({
        content: `Generate a ${complexity} ${genre} story template`,
        analysisType: 'story-template',
        genre,
        complexity
      });

      return result || null;
    } catch (error) {
      console.error('Template generation failed:', error);
      return null;
    }
  }
}

export const secureAIService = new SecureAIService();