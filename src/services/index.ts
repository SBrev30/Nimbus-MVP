import { aiService as originalAIService } from './aiService';
import { secureAIService } from './secureAIService';

// Environment-based service selection
const useSecureAI = import.meta.env.VITE_USE_SECURE_AI === 'true';
const hasSupabaseConfig = !!(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Fallback service that tries secure first, then falls back to original
class FallbackAIService {
  async analyzeCharacterContent(content: string) {
    if (useSecureAI && hasSupabaseConfig) {
      try {
        const result = await secureAIService.analyzeCharacterContent(content);
        // If confidence is 0, it likely failed, so try fallback
        if (result.confidence > 0) {
          return result;
        }
      } catch (error) {
        console.warn('Secure AI failed, falling back to direct API:', error);
      }
    }
    
    // Fallback to original service
    return originalAIService.analyzeCharacterContent(content);
  }

  async analyzeStoryCoherence(nodes: any[], edges: any[]) {
    if (useSecureAI && hasSupabaseConfig) {
      try {
        return await secureAIService.analyzeStoryCoherence(nodes, edges);
      } catch (error) {
        console.warn('Secure AI failed, falling back to direct API:', error);
      }
    }
    
    return originalAIService.analyzeStoryCoherence(nodes, edges);
  }

  async generateRelationshipSuggestions(nodes: any[], edges: any[]) {
    if (useSecureAI && hasSupabaseConfig) {
      try {
        return await secureAIService.generateRelationshipSuggestions(nodes, edges);
      } catch (error) {
        console.warn('Secure AI failed, falling back to direct API:', error);
      }
    }
    
    return originalAIService.generateRelationshipSuggestions(nodes, edges);
  }

  async analyzeCharacterArcs(nodes: any[], edges: any[]) {
    if (useSecureAI && hasSupabaseConfig) {
      try {
        return await secureAIService.analyzeCharacterArcs(nodes, edges);
      } catch (error) {
        console.warn('Secure AI failed, falling back to direct API:', error);
      }
    }
    
    return originalAIService.analyzeCharacterArcs(nodes, edges);
  }

  async generateCharacterSuggestions(existingCharacters: any[]) {
    if (useSecureAI && hasSupabaseConfig) {
      try {
        return await secureAIService.generateCharacterSuggestions(existingCharacters);
      } catch (error) {
        console.warn('Secure AI failed, falling back to direct API:', error);
      }
    }
    
    return originalAIService.generateCharacterSuggestions(existingCharacters);
  }

  async analyzeStoryStructure(plotNodes: any[]) {
    if (useSecureAI && hasSupabaseConfig) {
      try {
        return await secureAIService.analyzeStoryStructure(plotNodes);
      } catch (error) {
        console.warn('Secure AI failed, falling back to direct API:', error);
      }
    }
    
    return originalAIService.analyzeStoryStructure(plotNodes);
  }

  async generateStoryTemplate(genre: string, complexity: 'simple' | 'complex' | 'epic') {
    if (useSecureAI && hasSupabaseConfig) {
      try {
        return await secureAIService.generateStoryTemplate(genre, complexity);
      } catch (error) {
        console.warn('Secure AI failed, falling back to direct API:', error);
      }
    }
    
    return originalAIService.generateStoryTemplate(genre, complexity);
  }
}

// Create the fallback service instance
const fallbackAIService = new FallbackAIService();

// Export the appropriate service based on configuration
export const aiService = (useSecureAI && hasSupabaseConfig) 
  ? fallbackAIService  // Use fallback service for smart switching
  : originalAIService; // Use original service directly

// Also export individual services for manual selection
export { originalAIService, secureAIService };

// Export other services
export { chapterService } from './chapterService';
export { projectService } from './projectService';
export { userService } from './userService';
export { autoSaveService } from './autoSaveService';
export { intelligentAIService } from './intelligentAIService';
export { outlineService } from './outlineService';
export { characterService } from './character-service';
export { worldBuildingService } from './world-building-service';

// Export types
export type { 
  OutlineNode, 
  CreateOutlineNodeData 
} from './outlineService';

export type {
  Character,
  CreateCharacterData
} from './character-service';

export type {
  WorldElement,
  CreateWorldElementData
} from './world-building-service';

// Re-export common types that might be used across services
export type {
  Project,
  Chapter,
  PlotPoint,
  WorldBuildingElement,
  Note,
  EditorContent
} from '../Type';

// Export configuration info for debugging
export const aiServiceConfig = {
  useSecureAI,
  hasSupabaseConfig,
  selectedService: (useSecureAI && hasSupabaseConfig) ? 'fallback' : 'original',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'configured' : 'missing',
  anthropicKey: import.meta.env.VITE_ANTHROPIC_API_KEY ? 'configured' : 'missing'
};
