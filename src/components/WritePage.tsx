// src/components/WritePage.tsx - Enhanced with better project navigation

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Clock, TrendingUp, ArrowLeft, Plus } from 'lucide-react';
import { projectService, Project } from '../services/projectService';
import { chapterService, Chapter } from '../services/chapterService';

interface WritePageProps {
  onSelectChapter: (chapterId: string, chapterTitle: string) => void;
  selectedProjectId?: string;
  onBack?: () => void;
}

interface ProjectWithChapters extends Project {
  chapters: Chapter[];
}

export function WritePage({ onSelectChapter, selectedProjectId, onBack }: WritePageProps) {
  const [projects, setProjects] = useState<ProjectWithChapters[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectWithChapters | null>(null);

  // Fetch projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // Fetch projects
        const projectsData = await projectService.getUserProjects();
        
        // Fetch chapters for each project
        const projectsWithChapters: ProjectWithChapters[] = [];
        
        for (const project of projectsData) {
          const chapters = await chapterService.getProjectChapters(project.id);
          projectsWithChapters.push({
            ...project,
            chapters
          });
        }
        
        setProjects(projectsWithChapters);

        // If a specific project is selected, set it as active
        if (selectedProjectId) {
          const targetProject = projectsWithChapters.find(p => p.id === selectedProjectId);
          if (targetProject) {
            setSelectedProject(targetProject);
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [selectedProjectId]);

  const handleCreateChapter = useCallback(async (projectId: string) => {
    try {
      const project = projects.find(p => p.id === projectId);
      const chapterNumber = project ? project.chapters.length + 1 : 1;
      
      const newChapter = await chapterService.createChapter({
        projectId,
        title: `Chapter ${chapterNumber}`,
        content: '',
        summary: '',
        wordCount: 0,
        orderIndex: chapterNumber,
        status: 'draft'
      });
      
      if (newChapter) {
        // Update the projects state with the new chapter
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === projectId
              ? { ...project, chapters: [...project.chapters, newChapter] }
              : project
          )
        );

        // Update selected project if it's the same one
        if (selectedProject && selectedProject.id === projectId) {
          setSelectedProject({
            ...selectedProject,
            chapters: [...selectedProject.chapters, newChapter]
          });
        }
        
        // Navigate to the new chapter
        onSelectChapter(newChapter.id, newChapter.title);
      }
    } catch (error) {
      console.error('Error creating chapter:', error);
    }
  }, [projects, selectedProject, onSelectChapter]);

  const handleProjectSelect = (project: ProjectWithChapters) => {
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'outline':
        return 'bg-yellow-100 text-yellow-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#A5F7AC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#889096]">Loading your writing workspace...</p>
        </div>
      </div>
    );
  }

  // If a specific project is selected, show its chapters
  if (selectedProject) {
    return (
      <div className="flex-1 bg-white rounded-t-[17px] p-8">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBackToProjects}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#889096]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h1>
            <p className="text-[#889096]">
              {selectedProject.chapters.length} {selectedProject.chapters.length === 1 ? 'chapter' : 'chapters'}
              {selectedProject.wordCountCurrent > 0 && (
                <span> • {selectedProject.wordCountCurrent.toLocaleString()} words</span>
              )}
            </p>
          </div>
        </div>

        {/* Project description */}
        {selectedProject.description && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-[#889096]">{selectedProject.description}</p>
          </div>
        )}

        {/* Chapters list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Chapters</h2>
            <button
              onClick={() => handleCreateChapter(selectedProject.id)}
              className="flex items-center gap-2 px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 text-gray-900 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Chapter
            </button>
          </div>

          {selectedProject.chapters.length > 0 ? (
            <div className="grid gap-4">
              {selectedProject.chapters
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map(chapter => (
                  <div
                    key={chapter.id}
                    onClick={() => onSelectChapter(chapter.id, chapter.title)}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {chapter.title}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(chapter.status)}`}>
                            {chapter.status?.charAt(0).toUpperCase() + chapter.status?.slice(1)}
                          </span>
                        </div>
                        {chapter.summary && (
                          <p className="text-[#889096] text-sm mb-2">{chapter.summary}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-[#889096]">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {chapter.wordCount.toLocaleString()} words
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Modified {formatDate(chapter.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                          Open →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters yet</h3>
              <p className="text-[#889096] mb-4">Start writing by creating your first chapter</p>
              <button
                onClick={() => handleCreateChapter(selectedProject.id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 text-gray-900 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Chapter
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show projects overview if no specific project is selected
  return (
    <div className="flex-1 bg-white rounded-t-[17px] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Writing Projects</h1>
          <p className="text-[#889096] mt-1">Select a project to continue writing</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-[#889096] hover:text-gray-700 transition-colors"
          >
            View All Projects
          </button>
        )}
      </div>

      {/* Projects list */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-[#889096] mb-6">Create your first writing project to get started</p>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 text-gray-900 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectSelect(project)}
              className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300 group"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-[#889096] text-sm line-clamp-2">
                  {project.description || 'No description available'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {project.chapters.length}
                  </div>
                  <div className="text-xs text-[#889096]">
                    {project.chapters.length === 1 ? 'Chapter' : 'Chapters'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {project.wordCountCurrent.toLocaleString()}
                  </div>
                  <div className="text-xs text-[#889096]">Words</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#889096]">
                  Last modified {formatDate(project.updatedAt)}
                </span>
                <span className="text-blue-600 group-hover:text-blue-700 font-medium">
                  Open →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
