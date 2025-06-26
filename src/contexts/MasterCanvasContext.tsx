import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  ProjectCanvasData, 
  AnalysisResults, 
  CanvasMode, 
  CanvasLayoutOptions,
  MasterCanvasContextData,
  ConflictData
} from '../types/masterCanvas';
import { projectDataTransformer } from '../services/projectDataTransformer';
import { plotAnalysisService } from '../services/plotAnalysisService';

const MasterCanvasContext = createContext<MasterCanvasContextData | null>(null);

interface MasterCanvasProviderProps {
  children: ReactNode;
}

export const MasterCanvasProvider: React.FC<MasterCanvasProviderProps> = ({ children }) => {
  const [projectData, setProjectData] = useState<ProjectCanvasData | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('exploratory');

  const generateCanvas = useCallback(async (
    projectId: string, 
    options?: CanvasLayoutOptions
  ) => {
    setIsLoading(true);
    
    try {
      // Fetch project data (this would be replaced with actual API call)
      const data = await fetchProjectData(projectId);
      setProjectData(data);
      setCurrentProject(projectId);
      
      // Run AI analysis
      const analysis = await plotAnalysisService.analyzeProject(data);
      setAnalysisResults(analysis);
      
      // Switch to master mode
      setCanvasMode('master');
      
    } catch (error) {
      console.error('Failed to generate canvas:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchMode = useCallback((mode: CanvasMode) => {
    setCanvasMode(mode);
  }, []);

  const dismissConflict = useCallback(async (conflictId: string, feedback?: string) => {
    if (!analysisResults) return;
    
    try {
      // Update conflict as dismissed (would call API)
      await dismissConflictAPI(conflictId, feedback);
      
      // Update local state
      const updatedConflicts = analysisResults.conflicts.map(conflict =>
        conflict.id === conflictId 
          ? { ...conflict, userDismissed: true, userFeedback: feedback }
          : conflict
      );
      
      setAnalysisResults({
        ...analysisResults,
        conflicts: updatedConflicts
      });
      
    } catch (error) {
      console.error('Failed to dismiss conflict:', error);
    }
  }, [analysisResults]);

  const refreshAnalysis = useCallback(async () => {
    if (!projectData) return;
    
    setIsLoading(true);
    try {
      const analysis = await plotAnalysisService.analyzeProject(projectData);
      setAnalysisResults(analysis);
    } catch (error) {
      console.error('Failed to refresh analysis:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectData]);

  const contextValue: MasterCanvasContextData = {
    projectData,
    analysisResults,
    isLoading,
    currentProject,
    canvasMode,
    generateCanvas,
    switchMode,
    dismissConflict,
    refreshAnalysis
  };

  return (
    <MasterCanvasContext.Provider value={contextValue}>
      {children}
    </MasterCanvasContext.Provider>
  );
};

export const useMasterCanvas = (): MasterCanvasContextData => {
  const context = useContext(MasterCanvasContext);
  if (!context) {
    throw new Error('useMasterCanvas must be used within a MasterCanvasProvider');
  }
  return context;
};

// Mock functions - replace with actual API calls
async function fetchProjectData(projectId: string): Promise<ProjectCanvasData> {
  // This would be replaced with actual Supabase queries
  // For now, return mock data structure
  return {
    projectId,
    chapters: [
      {
        id: '1',
        number: 1,
        title: 'The Beginning',
        content: 'Chapter content...',
        wordCount: 2500,
        summary: 'Our hero starts their journey in a small village.',
        characters: ['Hero', 'Mentor'],
        scenes: [
          {
            id: 'scene1',
            title: 'Opening Scene',
            summary: 'Hero wakes up',
            characters: ['Hero'],
            order: 1
          }
        ],
        plotEvents: [
          {
            id: 'event1',
            description: 'Hero receives call to adventure',
            type: 'inciting_incident',
            order: 1
          }
        ],
        status: 'draft'
      },
      {
        id: '2', 
        number: 2,
        title: 'The Call',
        content: 'More content...',
        wordCount: 3200,
        summary: 'The mentor reveals the truth about the hero\'s destiny.',
        characters: ['Hero', 'Mentor', 'Villain'],
        scenes: [],
        plotEvents: [
          {
            id: 'event2',
            description: 'Mentor explains the prophecy',
            type: 'rising_action',
            order: 2
          }
        ],
        status: 'draft'
      }
    ],
    characters: [
      {
        id: 'char1',
        name: 'Hero',
        role: 'protagonist',
        description: 'Young adventurer destined for greatness',
        relationships: [
          {
            characterId: 'char2',
            type: 'mentor',
            strength: 8,
            description: 'Student-teacher relationship'
          }
        ],
        appearances: ['1', '2']
      },
      {
        id: 'char2',
        name: 'Mentor',
        role: 'supporting',
        description: 'Wise old sage who guides the hero',
        relationships: [
          {
            characterId: 'char1',
            type: 'mentor',
            strength: 8,
            description: 'Teacher-student relationship'
          }
        ],
        appearances: ['1', '2']
      },
      {
        id: 'char3',
        name: 'Villain',
        role: 'antagonist',
        description: 'Dark lord seeking to destroy the world',
        relationships: [
          {
            characterId: 'char1',
            type: 'enemy',
            strength: 9,
            description: 'Mortal enemies'
          }
        ],
        appearances: ['2']
      }
    ],
    lastModified: new Date()
  };
}

async function dismissConflictAPI(conflictId: string, feedback?: string): Promise<void> {
  // Would make API call to update conflict status
  console.log('Dismissing conflict:', conflictId, feedback);
  return Promise.resolve();
}

export default MasterCanvasProvider;
