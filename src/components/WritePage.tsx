import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Search, FileText, Plus, ChevronLeft, ChevronRight, Menu, Clock, TrendingUp } from 'lucide-react';
import { Editor } from './Editor';
import { NotesPanel } from './NotesPanel';
import { SimpleSearchFilter, useSimpleFilter } from './shared/simple-search-filter';
import { projectService, Project } from '../services/projectService';
import { chapterService, Chapter } from '../services/chapterService';

interface Note {
  id: string;
  title: string;
  content: string;
  category: 'Person' | 'Place' | 'Plot' | 'Misc';
  createdAt: Date;
  updatedAt: Date;
}

interface EditorContent {
  title: string;
  content: string;
  wordCount: number;
  lastSaved: Date;
}

interface WritePageProps {
  onSelectChapter: (chapterId: string, chapterTitle: string) => void;
}

interface ProjectWithChapters extends Project {
  chapters: Chapter[];
}

export function WritePage({ onSelectChapter }: WritePageProps) {
  const [projects, setProjects] = useState<ProjectWithChapters[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [editorContent, setEditorContent] = useState<EditorContent>({
    title: 'Untitled',
    content: '<p>Start writing here...</p>',
    wordCount: 0,
    lastSaved: new Date(),
  });
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [notesPanelCollapsed, setNotesPanelCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileNotes, setShowMobileNotes] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentView, setCurrentView] = useState<'projects' | 'editor'>('projects');

  // Filter logic using the pattern from other components
  const { filteredItems: filteredProjects } = useSimpleFilter(
    projects,
    searchTerm,
    (project) => `${project.title} ${project.description}`
  );

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Auto-save simulation
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (currentView === 'editor') {
        setIsAutoSaving(true);
        setTimeout(() => {
          setIsAutoSaving(false);
          setEditorContent(prev => ({
            ...prev,
            lastSaved: new Date(),
          }));
        }, 500);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [currentView]);

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
        setCurrentView('editor');
      }
    } catch (error) {
      console.error('Error creating chapter:', error);
    }
  }, [onSelectChapter]);

  const handleSelectChapter = useCallback((chapterId: string, chapterTitle: string) => {
    // Call the parent component's onSelectChapter function
    if (onSelectChapter) {
      onSelectChapter(chapterId, chapterTitle); 
    }
    setCurrentView('editor');
  }, [onSelectChapter]);

  const handleBackToProjects = useCallback(() => {
    setCurrentView('projects');
  }, []);

  const handleEditorChange = useCallback((content: EditorContent) => {
    setEditorContent(content);
  }, []);

  const handleAddNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [...prev, newNote]);
  }, []);

  const handleEditNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ));
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      case 'revision': return 'bg-yellow-100 text-yellow-800';
      case 'planned': return 'bg-gray-100 text-gray-800';
      case 'outline': return 'bg-yellow-100 text-yellow-800';
      case 'published': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  const formatWordCount = (count: number) => {
    return count.toLocaleString();
  };

  const characterCount = editorContent.content.replace(/<[^>]*>/g, '').length;
  const characterCountWithoutSpaces = editorContent.content.replace(/<[^>]*>/g, '').replace(/\s/g, '').length;
  const estimatedReadTime = Math.ceil(editorContent.wordCount / 200);

  // Render Editor View
  if (currentView === 'editor') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'rgb(246, 246, 241)' }}>
        <div className="flex h-screen overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header with Breadcrumb and Search */}
            <div className="border-b border-[#C6C5C5] px-4 md:px-6 py-4" style={{ backgroundColor: 'rgb(246, 246, 241)' }}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-[#889096] font-semibold">
                    <button 
                      onClick={handleBackToProjects}
                      className="hover:text-gray-700 transition-colors"
                    >
                      Write
                    </button>
                    <span className="text-[#889096]">›</span>
                    <span className="text-gray-900">Editor</span>
                  </div>
                  
                  {/* Mobile Notes Toggle */}
                  <button
                    onClick={() => setShowMobileNotes(true)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Menu className="w-5 h-5 text-[#889096]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Writing Area */}
            <div className="flex-1 flex">
              {/* Editor Container */}
              <div className={`transition-all duration-300 ${
                isMobile || notesPanelCollapsed ? 'flex-1' : 'flex-1 mr-80'
              }`}>
                <div className="h-full bg-white mx-3 md:mx-6 mb-3 md:mb-6 rounded-lg shadow-sm border border-gray-200">
                  <Editor
                    content={editorContent}
                    onChange={handleEditorChange}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="bg-white border-t border-[#C6C5C5] px-4 md:px-6 py-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-[#889096]">
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                  <span>{editorContent.wordCount} words</span>
                  <span className="hidden sm:inline">{characterCount} characters</span>
                  <span className="hidden md:inline">{characterCountWithoutSpaces} without spaces</span>
                  <span>{estimatedReadTime} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  {isAutoSaving ? (
                    <span className="text-blue-600">Auto-saving...</span>
                  ) : (
                    <span className="text-xs">Last saved: {editorContent.lastSaved.toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Toolbar - Responsive Positioning */}
          <div 
            className={`fixed left-1/2 transform -translate-x-1/2 bg-[#F6F6F1] rounded-[5.277px] shadow-lg border border-gray-200 flex items-center px-2 md:px-3 py-1 gap-1 md:gap-2 ${
              isMobile ? 'bottom-20' : 'bottom-[60px]'
            }`}
            style={{ 
              width: isMobile ? '180px' : '200px', 
              height: '30px',
              zIndex: 50 
            }}
          >
            <button className="text-xs px-1 md:px-2 py-1 rounded hover:bg-gray-200 min-w-[24px]">B</button>
            <button className="text-xs px-1 md:px-2 py-1 rounded hover:bg-gray-200 min-w-[24px]">I</button>
            <button className="text-xs px-1 md:px-2 py-1 rounded hover:bg-gray-200 min-w-[24px]">U</button>
            <div className="w-px h-4 bg-gray-300"></div>
            <button className="text-xs px-1 md:px-2 py-1 rounded hover:bg-gray-200 min-w-[24px]">14</button>
            <button className="text-xs px-1 md:px-2 py-1 rounded hover:bg-gray-200 min-w-[24px]">⟷</button>
          </div>

          {/* Desktop Notes Panel - Hidden on Mobile */}
          {!isMobile && (
            <div className={`fixed right-0 top-0 h-full bg-white border-l border-[#C6C5C5] transition-transform duration-300 ease-in-out z-40 ${
              notesPanelCollapsed ? 'translate-x-full' : 'translate-x-0'
            }`} style={{ width: '320px' }}>
              <div className="h-full flex flex-col">
                <NotesPanel
                  notes={notes}
                  onAddNote={handleAddNote}
                  onEditNote={handleEditNote}
                  onDeleteNote={handleDeleteNote}
                />
                
                {/* Collapse Button */}
                <div className="absolute -left-8 bottom-6">
                  <button
                    onClick={() => setNotesPanelCollapsed(!notesPanelCollapsed)}
                    className="w-8 h-8 bg-white border border-[#C6C5C5] rounded-l-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                    title={notesPanelCollapsed ? "Show Notes" : "Hide Notes"}
                  >
                    {notesPanelCollapsed ? (
                      <ChevronLeft className="w-4 h-4 text-[#889096]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#889096]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Notes Modal */}
          {isMobile && showMobileNotes && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
              <div className="bg-white w-full h-3/4 rounded-t-xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Notes</h3>
                  <button
                    onClick={() => setShowMobileNotes(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
                <div className="h-full overflow-hidden">
                  <NotesPanel
                    notes={notes}
                    onAddNote={handleAddNote}
                    onEditNote={handleEditNote}
                    onDeleteNote={handleDeleteNote}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Projects View
  return (
    <div className="min-h-screen font-inter" style={{ backgroundColor: 'rgb(246, 246, 241)' }}>
      <div className="flex h-screen overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#A5F7AC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#889096]">Loading your projects...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header with Search */}
              <div className="border-b border-[#C6C5C5] px-4 md:px-6 py-4" style={{ backgroundColor: 'rgb(246, 246, 241)' }}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-[#889096] font-semibold">
                      <span className="text-gray-900">Write</span>
                    </div>
                  </div>
                  
                  {/* Search Bar - Full width on mobile, centered on desktop */}
                  <div className="w-full md:flex-1 md:flex md:justify-center md:max-w-md md:mx-8">
                    <SimpleSearchFilter
                      value={searchTerm}
                      onChange={setSearchTerm}
                      placeholder="Search projects..."
                      className="w-full md:max-w-md"
                    />
                  </div>
                  
                  <div className="hidden md:block w-24"></div> {/* Spacer for balance on desktop */}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
                <div className="max-w-6xl mx-auto">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Your Writing Projects</h1>
                      <p className="text-[#889096] mt-1 text-sm md:text-base">
                        Continue working on your stories and manage your chapters
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6 md:space-y-8">
                    {filteredProjects.length === 0 ? (
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
                      filteredProjects.map(project => (
                        <div key={project.id} className="bg-white rounded-lg border border-[#C6C5C5] overflow-hidden shadow-sm">
                          {/* Project Header */}
                          <div className="p-4 md:p-6 border-b border-gray-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">{project.title}</h2>
                                  {project.genre && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full w-fit">
                                      {project.genre}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[#889096] mb-4 text-sm md:text-base">{project.description}</p>
                                
                                {/* Progress Bar */}
                                <div className="mb-3">
                                  <div className="flex justify-between text-xs md:text-sm mb-1">
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

                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-[#889096]">
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                                    <span>
                                      {project.wordCountTarget > 0 
                                        ? Math.round((project.wordCountCurrent / project.wordCountTarget) * 100) 
                                        : 0}% complete
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                    <span>Last modified {formatDate(new Date(project.updatedAt))}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Chapters */}
                          <div className="p-4 md:p-6">
                            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Chapters</h3>
                            <div className="space-y-3 md:space-y-4">
                              {project.chapters.length > 0 ? (
                                project.chapters.map(chapter => (
                                  <div
                                    key={chapter.id}
                                    onClick={() => handleSelectChapter(chapter.id, chapter.title)}
                                    className="p-3 md:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 active:bg-blue-50"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                                          <div className="flex items-center gap-3">
                                            <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-500 flex-shrink-0" />
                                            <h4 className="font-semibold text-gray-900 text-sm md:text-base">{chapter.title}</h4>
                                          </div>
                                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(chapter.status)} w-fit`}>
                                            {chapter.status?.charAt(0).toUpperCase() + chapter.status?.slice(1)}
                                          </span>
                                        </div>
                                        <p className="text-[#889096] text-xs md:text-sm mb-2">{chapter.summary}</p>
                                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-[#889096]">
                                          <span>{chapter.wordCount.toLocaleString()} words</span>
                                          <span>Modified {formatDate(chapter.updatedAt)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-6 md:py-8">
                                  <p className="text-[#889096] mb-4 text-sm md:text-base">No chapters yet. Create your first chapter to start writing.</p>
                                </div>
                              )}
                              
                              {/* Add New Chapter Button */}
                              <button
                                type="button"
                                className="p-3 md:p-4 w-full border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors active:bg-blue-50"
                                onClick={() => handleCreateChapter(project.id)}
                              >
                                <div className="flex items-center justify-center gap-2 text-blue-600">
                                  <FileText className="w-4 h-4 md:w-5 md:h-5" />
                                  <span className="font-medium text-sm md:text-base">Add New Chapter</span>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}