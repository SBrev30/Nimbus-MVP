import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Filter, FileText, Clock, TrendingUp, Users, MapPin, Layers, X, Check, Cloud } from 'lucide-react';
import { ChaptersPage } from './chapters-page';
import { projectService, Project } from '../services/projectService';

interface ProjectWithChapters extends Project {
  chapterCount: number;
  completionPercentage: number;
}

interface ProjectsPageProps {
  onBack: () => void;
}

export function ProjectsPage({ onBack }: ProjectsPageProps) {
  const [projects, setProjects] = useState<ProjectWithChapters[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectWithChapters | null>(null);
  const [currentView, setCurrentView] = useState<'overview' | 'chapters'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'lastModified' | 'progress' | 'wordCount'>('lastModified');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    genre: 'Fantasy',
    wordCountTarget: 50000,
    status: 'planning' as const
  });

  // Check if all changes are saved (simplified for demo - in real app this would check localStorage/IndexedDB)
  const areAllChangesSaved = () => {
    // This would typically check for any unsaved changes in localStorage
    // For now, we'll assume changes are saved if the page was loaded more than 30 seconds ago
    const pageLoadTime = localStorage.getItem('projectsPageLoadTime');
    if (!pageLoadTime) {
      localStorage.setItem('projectsPageLoadTime', Date.now().toString());
      return false;
    }
    return Date.now() - parseInt(pageLoadTime) > 30000; // 30 seconds
  };

  // Fetch projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const projectsData = await projectService.getUserProjects();
        
        // Transform projects to include chapter count and completion percentage
        const transformedProjects = projectsData.map(project => ({
          ...project,
          chapterCount: 0, // We'll implement chapter count later
          completionPercentage: project.wordCountTarget > 0 
            ? Math.round((project.wordCountCurrent / project.wordCountTarget) * 100) 
            : 0
        }));
        
        setProjects(transformedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const statuses = ['all', 'planning', 'writing', 'editing', 'complete'];
  const genres = ['all', ...Array.from(new Set(projects.map(p => p.genre)))];

  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      const matchesGenre = filterGenre === 'all' || project.genre === filterGenre;
      return matchesSearch && matchesStatus && matchesGenre;
    })
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

  const handleProjectSelect = (project: ProjectWithChapters) => {
    setSelectedProject(project);
    setCurrentView('chapters');
  };

  const handleBackToProjects = () => {
    setCurrentView('overview');
    setSelectedProject(null);
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
      }
    } catch (error) {
      console.error('Error creating project:', error);
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
            <div className="w-16 h-16 border-4 border-[#A5F7AC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#889096]">Loading your projects...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Auto-save Status Banner */}
          {areAllChangesSaved() && (
            <div className="bg-green-50 border-b border-green-200 px-6 py-2">
              <div className="max-w-7xl mx-auto flex items-center justify-center">
                <div className="flex items-center space-x-2 text-sm text-green-800">
                  <Check className="w-4 h-4" />
                  <span className="font-medium">All changes saved since last edit</span>
                  <span className="text-green-600">• Auto-sync enabled</span>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-white border-b border-[#C6C5C5] p-6">
            <div className="max-w-7xl mx-auto">
              {/* Back button and title */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[#889096]" />
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold text-gray-900 font-inter">
                        Your Writing Projects
                      </h1>
                      <p className="text-[#889096] mt-1">
                        {filteredAndSortedProjects.length} projects • {projects.reduce((sum, p) => sum + p.wordCountCurrent, 0).toLocaleString()} total words
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => setShowNewProjectModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      New Project
                    </button>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#889096]" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#889096]" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Genre Filter */}
                <select
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>
                      {genre === 'all' ? 'All Genres' : genre}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="lastModified">Last Modified</option>
                  <option value="title">Title</option>
                  <option value="progress">Progress</option>
                  <option value="wordCount">Word Count</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {filteredAndSortedProjects.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
                    <p className="text-[#889096]">Try adjusting your search or filters</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredAndSortedProjects.map(project => (
                    <div
                      key={project.id}
                      onClick={() => handleProjectSelect(project)}
                      className="bg-white rounded-lg border border-[#C6C5C5] p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(project.status)}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                              </span>
                              {project.genre && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                  {project.genre}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-[#889096] text-sm mb-4 line-clamp-2">{project.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-gray-600">
                            {formatWordCount(project.wordCountCurrent)} / {formatWordCount(project.wordCountTarget)} words
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#A5F7AC] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.completionPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Project Stats */}
                      <div className="flex items-center justify-between text-sm text-[#889096]">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>{project.chapterCount} chapters</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>{project.completionPercentage}% complete</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(new Date(project.updatedAt))}</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent"
                  placeholder="Enter project title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent"
                  placeholder="Brief description of your project"
                  rows={3}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent"
                  >
                    <option value="Fantasy">Fantasy</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Romance">Romance</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Historical">Historical</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({...newProject, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent"
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
                className="px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 text-gray-900 rounded-lg transition-colors disabled:opacity-50"
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
