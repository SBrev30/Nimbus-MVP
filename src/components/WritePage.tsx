import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Clock, TrendingUp } from 'lucide-react';
import { projectService, Project } from '../services/projectService';
import { chapterService, Chapter } from '../services/chapterService';

interface WritePageProps {
  onSelectChapter: (chapterId: string, chapterTitle: string) => void;
}

interface ProjectWithChapters extends Project {
  chapters: Chapter[];
}

export function WritePage({ onSelectChapter }: WritePageProps) {
  const [projects, setProjects] = useState<ProjectWithChapters[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleCreateChapter = useCallback(async (projectId: string) => {
    try {
      const newChapter = await chapterService.createChapter({
        projectId,
        title: 'New Chapter',
        content: '',
        summary: '',
        wordCount: 0,
        orderIndex: 1,
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
        
        // Navigate to the new chapter
        onSelectChapter(newChapter.id, newChapter.title);
      }
    } catch (error) {
      console.error('Error creating chapter:', error);
    }
  }, [onSelectChapter]);

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

  return (
    <div className="h-screen bg-[#F9FAFB] flex flex-col font-inter overflow-hidden">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#A5F7AC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#889096]">Loading your projects...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-white border-b border-[#C6C5C5] p-6">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Your Writing Projects</h1>
              <p className="text-[#889096]">Continue working on your stories and manage your chapters</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto space-y-8">
              {projects.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
                    <p className="text-[#889096] mb-4">Create your first writing project to get started</p>
                    <button 
                      onClick={() => window.location.hash = '#projects'}
                      className="px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-medium"
                    >
                      Go to Projects
                    </button>
                  </div>
                </div>
              ) : (
                projects.map(project => (
                  <div key={project.id} className="bg-white rounded-lg border border-[#C6C5C5] overflow-hidden">
                    {/* Project Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-semibold text-gray-900">{project.title}</h2>
                            {project.genre && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                {project.genre}
                              </span>
                            )}
                          </div>
                          <p className="text-[#889096] mb-4">{project.description}</p>
                          
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="text-gray-600">
                                {project.wordCountCurrent.toLocaleString()} / {project.wordCountTarget.toLocaleString()} words
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-[#A5F7AC] h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${project.wordCountTarget > 0 
                                    ? Math.round((project.wordCountCurrent / project.wordCountTarget) * 100) 
                                    : 0}%` 
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-[#889096]">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>
                                {project.wordCountTarget > 0 
                                  ? Math.round((project.wordCountCurrent / project.wordCountTarget) * 100) 
                                  : 0}% complete
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Last modified {formatDate(new Date(project.updatedAt))}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chapters */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Chapters</h3>
                      <div className="grid gap-4">
                        {project.chapters.length > 0 ? (
                          project.chapters.map(chapter => (
                            <div
                              key={chapter.id}
                              onClick={() => onSelectChapter(chapter.id, chapter.title)}
                              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    <h4 className="font-semibold text-gray-900">{chapter.title}</h4>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(chapter.status)}`}>
                                      {chapter.status?.charAt(0).toUpperCase() + chapter.status?.slice(1)}
                                    </span>
                                  </div>
                                  <p className="text-[#889096] text-sm mb-2">{chapter.summary}</p>
                                  <div className="flex items-center gap-4 text-sm text-[#889096]">
                                    <span>{chapter.wordCount.toLocaleString()} words</span>
                                    <span>Modified {formatDate(chapter.updatedAt)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-[#889096] mb-4">No chapters yet. Create your first chapter to start writing.</p>
                          </div>
                        )}
                        
                        {/* Add New Chapter Button */}
    <button
      type="button"
      className="p-4 w-full border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
      onClick={() => handleCreateChapter(project.id)}
    >
      <div className="flex items-center justify-center gap-2 text-blue-600">
        <FileText className="w-5 h-5" />
        <span className="font-medium">Add New Chapter</span>
      </div>
    </button>
  </div>  {/* ← ADD THIS MISSING CLOSING DIV TAG */}
</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
