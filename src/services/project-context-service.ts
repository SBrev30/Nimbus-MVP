// src/services/project-context-service.ts - NEW FILE

import { supabase } from '../lib/supabase';

export interface ProjectContextService {
  setCurrentProject(projectId: string): Promise<void>;
  getCurrentProject(): Promise<string | null>;
  clearCurrentProject(): Promise<void>;
  getUserProjects(userId: string): Promise<Project[]>;
  getProjectWithContent(projectId: string): Promise<ProjectWithContent | null>;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithContent {
  project: Project;
  contentCounts: {
    characters: number;
    plotThreads: number;
    chapters: number;
    locations: number;
    worldElements: number;
    outlineNodes: number;
  };
}

class ProjectContextServiceImpl implements ProjectContextService {
  private currentProjectId: string | null = null;

  async setCurrentProject(projectId: string): Promise<void> {
    try {
      // Validate project exists
      const { data: project, error } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .single();

      if (error || !project) {
        throw new Error(`Project ${projectId} not found`);
      }

      // Store in memory and localStorage for persistence
      this.currentProjectId = projectId;
      localStorage.setItem('currentProjectId', projectId);
      
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('projectChanged', { 
        detail: { projectId } 
      }));

      console.log('✅ Project context set:', projectId);
    } catch (error) {
      console.error('❌ Failed to set project context:', error);
      throw error;
    }
  }

  async getCurrentProject(): Promise<string | null> {
    // Check memory first
    if (this.currentProjectId) {
      return this.currentProjectId;
    }

    // Check localStorage
    const storedProjectId = localStorage.getItem('currentProjectId');
    if (storedProjectId) {
      this.currentProjectId = storedProjectId;
      return storedProjectId;
    }

    return null;
  }

  async clearCurrentProject(): Promise<void> {
    this.currentProjectId = null;
    localStorage.removeItem('currentProjectId');
    
    window.dispatchEvent(new CustomEvent('projectChanged', { 
      detail: { projectId: null } 
    }));
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to load projects: ${error.message}`);
      }

      return projects || [];
    } catch (error) {
      console.error('❌ Failed to load user projects:', error);
      return [];
    }
  }

  async getProjectWithContent(projectId: string): Promise<ProjectWithContent | null> {
    try {
      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        throw new Error(`Project ${projectId} not found`);
      }

      // Get content counts in parallel
      const [
        charactersResult,
        plotThreadsResult,
        chaptersResult,
        locationsResult,
        worldElementsResult,
        outlineNodesResult
      ] = await Promise.all([
        supabase.from('characters').select('id', { count: 'exact' }).eq('project_id', projectId),
        supabase.from('plot_threads').select('id', { count: 'exact' }).eq('project_id', projectId),
        supabase.from('chapters').select('id', { count: 'exact' }).eq('project_id', projectId),
        supabase.from('locations').select('id', { count: 'exact' }).eq('project_id', projectId),
        supabase.from('world_elements').select('id', { count: 'exact' }).eq('project_id', projectId),
        supabase.from('outline_nodes').select('id', { count: 'exact' }).eq('project_id', projectId)
      ]);

      const contentCounts = {
        characters: charactersResult.count || 0,
        plotThreads: plotThreadsResult.count || 0,
        chapters: chaptersResult.count || 0,
        locations: locationsResult.count || 0,
        worldElements: worldElementsResult.count || 0,
        outlineNodes: outlineNodesResult.count || 0,
      };

      return {
        project,
        contentCounts
      };
    } catch (error) {
      console.error('❌ Failed to load project with content:', error);
      return null;
    }
  }

  // Helper method to create project-aware URLs
  createProjectUrl(basePath: string, projectId?: string): string {
    const currentProject = projectId || this.currentProjectId;
    if (currentProject) {
      const separator = basePath.includes('?') ? '&' : '?';
      return `${basePath}${separator}project=${currentProject}`;
    }
    return basePath;
  }

  // Helper method to extract project ID from URL
  getProjectIdFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project');
    
    if (projectId) {
      // Auto-set current project from URL
      this.setCurrentProject(projectId).catch(console.error);
    }
    
    return projectId;
  }
}

// Export singleton instance
export const projectContextService = new ProjectContextServiceImpl();

// React hook for easy project context usage
export function useProjectContext() {
  const [currentProjectId, setCurrentProjectId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Load current project on mount
    const loadCurrentProject = async () => {
      try {
        // Check URL first
        const urlProjectId = projectContextService.getProjectIdFromUrl();
        if (urlProjectId) {
          setCurrentProjectId(urlProjectId);
        } else {
          // Check stored project
          const storedProjectId = await projectContextService.getCurrentProject();
          setCurrentProjectId(storedProjectId);
        }
      } catch (error) {
        console.error('Failed to load current project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentProject();

    // Listen for project changes
    const handleProjectChange = (event: CustomEvent) => {
      setCurrentProjectId(event.detail.projectId);
    };

    window.addEventListener('projectChanged', handleProjectChange as EventListener);
    
    return () => {
      window.removeEventListener('projectChanged', handleProjectChange as EventListener);
    };
  }, []);

  const setProject = React.useCallback(async (projectId: string) => {
    try {
      await projectContextService.setCurrentProject(projectId);
      setCurrentProjectId(projectId);
    } catch (error) {
      console.error('Failed to set project:', error);
      throw error;
    }
  }, []);

  const clearProject = React.useCallback(async () => {
    try {
      await projectContextService.clearCurrentProject();
      setCurrentProjectId(null);
    } catch (error) {
      console.error('Failed to clear project:', error);
    }
  }, []);

  return {
    currentProjectId,
    isLoading,
    setProject,
    clearProject,
    createProjectUrl: projectContextService.createProjectUrl.bind(projectContextService)
  };
}

// Export for importing React from another file
import React from 'react';
