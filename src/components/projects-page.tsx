// src/components/projects-page.tsx - Enhanced with simplified search and filter

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronDown, 
  FileText, 
  Clock, 
  TrendingUp, 
  Users,
  Layers,
  Check,
  ArrowLeft
} from 'lucide-react';
import { projectService, Project } from '../services/projectService';
import { chapterService, Chapter } from '../services/chapterService';
import { ChaptersPage } from './chapters-page';
import { SimpleSearchFilter, useSimpleFilter } from './shared/simple-search-filter';
import { useAuth } from '../contexts/AuthContext';

interface ProjectsPageProps {
  onBack?: () => void;
  onNavigateToWrite?: (projectId: string) => void;
}

interface ProjectWithChapters extends Project {
  chapterCount: number;
  completionPercentage: number;
}

export function ProjectsPage({ onBack, onNavigateToWrite }: ProjectsPageProps) {
  const { signOut } = useAuth();
  const [projects, setProjects] = useState<ProjectWithChapters[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('lastModified');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [currentView, setCurrentView] = useState<'overview' | 'chapters'>('overview');
  const [selectedProject, setSelectedProject] = useState<ProjectWithChapters | null>(null);

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    genre: 'Fantasy',
    wordCountTarget: 50000,
    status: 'planning' as const
  });

  // Define filter options
  const statusFilterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'planning', label: 'Planning' },
    { value: 'writing', label: 'Writing' },
    { value: 'editing', label: 'Editing' },
    { value: 'complete', label: 'Complete' }
  ];

  const genreFilterOptions = [
    { value: 'all', label: 'All Genres' },
    ...Array.from(new Set(projects.map(p => p.genre))).map(genre => ({
      value: genre,
      label: genre
    }))
  ];

  // Use simplified filter hook for status
  const {
    searchTerm,
    setSearchTerm,
    filterValue: filterStatus,
    setFilterValue: setFilterStatus,
    filteredItems: statusFilteredProjects,
    clearFilters: clearStatusFilters,
    hasActiveFilters: hasStatusFilters
  } = useSimpleFilter(
    projects,
    (project, search) => 
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase()),
    (project, filter) => filter === 'all' || project.status === filter
  );

  // Additional genre filter
  const [genreFilter, setGenreFilter] = useState('all');

  // Apply genre filter and sorting
  const filteredAndSortedProjects = statusFilteredProjects
    .filter(project => genreFilter === 'all' || project.genre === genreFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'lastModified':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'progress':
          return b.completionPercentage - a.completionPercentage;
        case 'wordCount':
          return b.wordCountCurrent - a.wordCountCurrent;
        default:
          return 0;
      }
    });

  const clearAllFilters = () => {
    clearStatusFilters();
    setGenreFilter('all');
  };

  const hasActiveFilters = hasStatusFilters || genreFilter !== 'all';

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const projectsData = await projectService.getUserProjects();
        
        // Add additional computed properties
        const transformedProjects = await Promise.all(
          projectsData.map(async (project) => {
            const chapters = await chapterService.getProjectChapters(project.id);
            return {
              ...project,
              chapterCount: chapters.length,
              completionPercentage: project.wordCountTarget > 0 
                ? Math.round((project.wordCountCurrent / project.wordCountTarget) * 100) 
                : 0
            };
          })
        );
        
        setProjects(transformedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectSelect = (project: ProjectWithChapters) => {
    setSelectedProject(project);
    setCurrentView('chapters');
  };

  const handleBackToProjects = () => {
    setCurrentView('overview');
    setSelectedProject(null);
  };

  const handleStartWriting = (project: ProjectWithChapters) => {
    // First check if project has chapters
    if (project.chapterCount > 0) {
      // Navigate to the project's writing area
      setSelectedProject(project);
      setCurrentView('chapters');
    } else {
      // Create a new chapter and then navigate
      handleCreateFirstChapter(project.id);
    }
  };

  const handleCreateFirstChapter = async (projectId: string) => {
    try {
      const newChapter = await chapterService.createChapter({
        projectId,
        title: 'Chapter 1',
        content: '',
        summary: '',
        wordCount: 0,
        orderIndex: 1,
        status: 'draft'
      });
      
      if (newChapter && onNavigateToWrite) {
        // Update project with new chapter
        setProjects(prev => 
          prev.map(p => 
            p.id === projectId 
              ? { ...p, chapterCount: p.chapterCount + 1 }
              : p
          )
        );
        
        // Navigate to write page with this project
        onNavigateToWrite(projectId);
      }
    } catch (error) {
      console.error('Error creating first chapter:', error);
    }
  };

  const handleCreateProject = async () => {
    try {
      const createdProject = await projectService.createProject({
        title: newProject.title,
        description: newProject.description,
        genre: newProject.genre,
        status: newProject.status,
        wordCountTarget: newProject.wordCountTarget,
        wordCountCurrent: 0,
        settings: {}
      });
      
      if (createdProject) {
        // Add the new project to the list with additional properties
        setProjects(prev => [
          {
            ...createdProject,
            chapterCount: 0,
            completionPercentage: 0
          },
          ...prev
        ]);
        
        setShowNewProjectModal(false);
        setNewProject({
          title: '',
          description: '',
          genre: 'Fantasy',
          wordCountTarget: 50000,
          status: 'planning' as const
        });

        // If status is 'writing', automatically start writing
        if (newProject.status === 'writing') {
          handleStartWriting({
            ...createdProject,
            chapterCount: 0,
            completionPercentage: 0
          });
        }
      }
    } catch (error) {
      console.error('Error creating project:', error);
      
      // Check if the error is due to authentication
      if (error instanceof Error && error.message.includes('Not authenticated')) {
        alert('Your session has expired. Please log in again to continue.');
        signOut();
        return;
      }
      
      // Handle other errors
      alert('Failed to create project. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'writing':
        return 'bg-blue-100 text-blue-800';
      case 'editing':
        return 'bg-orange-100 text-orange-800';
      case 'complete':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return <Layers className="w-4 h-4" />;
      case 'writing':
        return <FileText className="w-4 h-4" />;
      case 'editing':
        return <TrendingUp className="w-4 h-4" />;
      case 'complete':
        return <Users className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Fixed formatDate function with proper error handling
  const formatDate = (dateInput: string | Date | null | undefined) => {
    if (!dateInput) {
      return 'No date';
    }
    
    try {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatWordCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (currentView === 'chapters' && selectedProject) {
    return (
      <ChaptersPage
        projectId={selectedProject.id}
        projectTitle={selectedProject.title}
        onBack={handleBackToProjects}
      />
    );
  }

  return (
    <div className="h-screen bg-[#F9FAFB] flex flex-col font-inter">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#ff4e00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#889096]">Loading your projects...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-white border-b border-[#f2eee2] p-6">
            <div className="max-w-7xl mx-auto">
              {/* Back button and title */}
              <div className="flex items-center gap-4 mb-6">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-[#889096]" />
                  </button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Your Writing Projects</h1>
                  <p className="text-[#889096] mt-1">Manage and organize your creative work</p>
                </div>
              </div>

              {/* Simplified Search and Filters */}
              <div className="flex items-center gap-4 mb-4">
                <SimpleSearchFilter
                  searchValue={searchTerm}
                  onSearchChange={setSearchTerm}
                  searchPlaceholder="Search projects..."
                  filterValue={filterStatus}
                  onFilterChange={setFilterStatus}
                  filterOptions={statusFilterOptions}
                  onClear={clearAllFilters}
                  showClearAll={true}
                  className="flex-1"
                />

                {/* Genre Filter */}
                <select
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                >
                  {genreFilterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                >
                  <option value="lastModified">Last Modified</option>
                  <option value="title">Title</option>
                  <option value="progress">Progress</option>
                  <option value="wordCount">Word Count</option>
                </select>

                {/* New Project Button */}
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-gray-900 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-6">
              {filteredAndSortedProjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {hasActiveFilters ? 'No projects match your filters' : 'No projects found'}
                  </h3>
                  <p className="text-[#889096] mb-6">
                    {hasActiveFilters 
                      ? "Try adjusting your search or filters"
                      : "Start your writing journey by creating your first project"
                    }
                  </p>
                  {hasActiveFilters ? (
                    <button
                      onClick={clearAllFilters}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mr-3"
                    >
                      Clear Filters
                    </button>
                  ) : null}
                  <button
                    onClick={() => setShowNewProjectModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-gray-900 rounded-lg font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {hasActiveFilters ? 'Create New Project' : 'Create Your First Project'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group"
                    >
                      {/* Project Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(project.status)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </span>
                            <span className="text-xs text-[#889096]">{project.genre}</span>
                          </div>
                        </div>
                      </div>

                      {/* Project Description */}
                      <p className="text-sm text-[#889096] mb-4 line-clamp-2">
                        {project.description || 'No description available'}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-[#889096]">Progress</span>
                          <span className="text-xs font-medium text-gray-900">{project.completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#ff4e00] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(project.completionPercentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Project Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatWordCount(project.wordCountCurrent)}
                          </div>
                          <div className="text-xs text-[#889096]">Words</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-lg font-semibold text-gray-900">
                            {project.chapterCount}
                          </div>
                          <div className="text-xs text-[#889096]">Chapters</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleProjectSelect(project)}
                          className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleStartWriting(project)}
                          className="flex-1 px-3 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-gray-900 rounded-lg transition-colors text-sm font-medium"
                        >
                          {project.chapterCount > 0 ? 'Continue Writing' : 'Start Writing'}
                        </button>
                      </div>

                      {/* Last Modified */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-[#889096]">
                          <span>Last modified</span>
                          <span>{formatDate(project.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
              <p className="text-sm text-[#889096] mt-1">Start your next creative journey</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  placeholder="Enter your project title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Describe your project"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genre
                  </label>
                  <select
                    value={newProject.genre}
                    onChange={(e) => setNewProject({...newProject, genre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                  >
                    <option value="Fantasy">Fantasy</option>
                    <option value="Science Fiction">Science Fiction</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Romance">Romance</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Literary Fiction">Literary Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Word Count Target
                  </label>
                  <input
                    type="number"
                    value={newProject.wordCountTarget}
                    onChange={(e) => setNewProject({...newProject, wordCountTarget: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Status
                </label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({...newProject, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                >
                  <option value="planning">Planning</option>
                  <option value="writing">Writing</option>
                  <option value="editing">Editing</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProject.title}
                className="px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-gray-900 rounded-lg transition-colors disabled:opacity-50"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
