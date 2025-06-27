import React, { useState, useCallback, Suspense, lazy } from 'react';
import { Sidebar } from './Sidebar';  // Fixed: removed ./components/
import { Breadcrumb } from './Breadcrumb';  // Fixed: removed ./components/
import { Editor } from './Editor';  // Fixed: removed ./components/
import { NotesPanel } from './NotesPanel';  // Fixed: removed ./components/
import { KanbanApp } from './KanbanApp';  // Fixed: removed ./components/
import { StatusDashboard } from './StatusDashboard';  // Fixed: removed ./components/
import { Files } from './Files';  // Fixed: removed ./components/
import { ProjectsPage } from './projects-page';  // Fixed: removed ./components/
import { Search } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';  // Fixed: added ../
import { useAutoSave } from '../hooks/useAutoSave';  // Fixed: added ../
import { ThemeProvider } from '../contexts/ThemeContext';  // Fixed: added ../

// Define types directly in this file to avoid import issues
interface EditorContent {
  title: string;
  content: string;
  wordCount: number;
  lastSaved: Date;
}

interface Note {
  id: string;
  title: string;
  content: string;
  category: 'Person' | 'Place' | 'Plot' | 'Misc';
  createdAt: Date;
  updatedAt: Date;
}

// Import planning components
import { OutlinePage } from './planning/OutlinePage';  // Fixed: removed ./components/
import { PlotPage } from './planning/PlotPage';  // Fixed: removed ./components/
import { CharactersPage } from './planning/CharactersPage';  // Fixed: removed ./components/
import { WorldBuildingPage } from './planning/WorldBuildingPage';  // Fixed: removed ./components/

// Import help components
import { HelpTopicsPage } from './help/HelpTopicsPage';  // Fixed: removed ./components/
import { GetStartedPage } from './help/GetStartedPage';  // Fixed: removed ./components/
import { AskQuestionPage } from './help/AskQuestionPage';  // Fixed: removed ./components/
import { GetFeedbackPage } from './help/GetFeedbackPage';  // Fixed: removed ./components/

// Lazy load heavy components
const Canvas = lazy(() => import('./Canvas').then(module => ({ default: module.default || module })));  // Fixed: removed ./components/
const Integration = lazy(() => import('./Integration').then(module => ({ default: module.default || module })));  // Fixed: removed ./components/
const History = lazy(() => import('./History').then(module => ({ default: module.default || module })));  // Fixed: removed ./components/

// Loading component
const LoadingSpinner = () => (
  <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-[#A5F7AC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[#889096]">Loading...</p>
    </div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">An unexpected error occurred</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Dashboard Page Component
const DashboardPage = ({ onViewChange }: { onViewChange?: (view: string) => void }) => (
  <div className="h-full w-full">
    {/* Dashboard Header */}
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Dashboard</h1>
          <p className="text-gray-600">Manage your writing projects and track progress</p>
        </div>
        <button
          onClick={() => onViewChange?.('projects')}
          className="px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-medium"
        >
          View All Projects
        </button>
      </div>
    </div>

    {/* Dashboard Content */}
    <div className="flex-1 p-6">
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <KanbanApp />
        </Suspense>
      </ErrorBoundary>
    </div>
  </div>
);

// Planning Page Component
const PlanningPage = ({ onViewChange }: { onViewChange: (view: string) => void }) => (
  <div className="h-full w-full bg-white">
    {/* Planning Header */}
    <div className="border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Story Planning</h1>
          <p className="text-gray-600">Organize your story structure, characters, and world</p>
        </div>
      </div>
    </div>

    {/* Planning Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {/* Outline Card */}
      <div
        onClick={() => onViewChange('outline')}
        className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 cursor-pointer hover:shadow-lg transition-all duration-200 group"
      >
        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Story Outline</h3>
        <p className="text-gray-600 text-sm">Structure your story with acts, chapters, and scenes</p>
      </div>

      {/* Plot Card */}
      <div
        onClick={() => onViewChange('plot')}
        className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 cursor-pointer hover:shadow-lg transition-all duration-200 group"
      >
        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Plot Development</h3>
        <p className="text-gray-600 text-sm">Develop plot points, conflicts, and story arcs</p>
      </div>

      {/* Characters Card */}
      <div
        onClick={() => onViewChange('characters')}
        className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 cursor-pointer hover:shadow-lg transition-all duration-200 group"
      >
        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Characters</h3>
        <p className="text-gray-600 text-sm">Create and develop your story characters</p>
      </div>

      {/* World Building Card */}
      <div
        onClick={() => onViewChange('world-building')}
        className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 cursor-pointer hover:shadow-lg transition-all duration-200 group"
      >
        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">World Building</h3>
        <p className="text-gray-600 text-sm">Design settings, cultures, and story world</p>
      </div>
    </div>
  </div>
);

// Settings Page Component
const SettingsPage = ({ onViewChange }: { onViewChange: (view: string) => void }) => (
  <div className="h-full w-full bg-white">
    {/* Settings Header */}
    <div className="border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your preferences and manage your account</p>
        </div>
      </div>
    </div>

    {/* Settings Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* History Card */}
      <div
        onClick={() => onViewChange('history')}
        className="bg-white p-6 rounded-xl border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 group"
      >
        <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Version History</h3>
        <p className="text-gray-600 text-sm">View and restore previous versions of your work</p>
      </div>

      {/* Integrations Card */}
      <div
        onClick={() => onViewChange('integrations')}
        className="bg-white p-6 rounded-xl border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 group"
      >
        <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Integrations</h3>
        <p className="text-gray-600 text-sm">Connect with external tools and services</p>
      </div>
    </div>
  </div>
);

// Help Page Component
const HelpPage = ({ onViewChange }: { onViewChange: (view: string) => void }) => (
  <div className="h-full w-full bg-white">
    {/* Help Header */}
    <div className="border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-600">Get help and learn how to use WritersBlock effectively</p>
        </div>
      </div>
    </div>

    {/* Help Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {/* Help Topics Card */}
      <div
        onClick={() => onViewChange('help-topics')}
        className="bg-white p-6 rounded-xl border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 group"
      >
        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Help Topics</h3>
        <p className="text-gray-600 text-sm">Browse common questions and tutorials</p>
      </div>

      {/* Get Started Card */}
      <div
        onClick={() => onViewChange('get-started')}
        className="bg-white p-6 rounded-xl border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 group"
      >
        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Started</h3>
        <p className="text-gray-600 text-sm">Learn the basics and set up your first project</p>
      </div>

      {/* Ask Question Card */}
      <div
        onClick={() => onViewChange('ask-question')}
        className="bg-white p-6 rounded-xl border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 group"
      >
        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ask a Question</h3>
        <p className="text-gray-600 text-sm">Get personalized help from our support team</p>
      </div>

      {/* Get Feedback Card */}
      <div
        onClick={() => onViewChange('get-feedback')}
        className="bg-white p-6 rounded-xl border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 group"
      >
        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Feedback</h3>
        <p className="text-gray-600 text-sm">Share your ideas and help us improve</p>
      </div>
    </div>
  </div>
);

// Main App Component
function App() {
  // State management
  const [activeView, setActiveView] = useState('write');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notesPanelCollapsed, setNotesPanelCollapsed] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<{ id: string; title: string } | null>(null);

  // Use hooks for data management
  const [editorContent, setEditorContent] = useLocalStorage<EditorContent>('editorContent', {
    title: 'Chapter 1',
    content: '',
    wordCount: 0,
    lastSaved: new Date(),
  });

  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);

  // Auto-save setup
  useAutoSave(editorContent, 'editorContent', 2000);

  // Event handlers
  const handleEditorChange = useCallback((content: any) => {
    setEditorContent(content);
  }, [setEditorContent]);

  const handleAddNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [newNote, ...prev]);
  }, [setNotes]);

  const handleEditNote = useCallback((id: string, updatedNote: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updatedNote, updatedAt: new Date() } : note
    ));
  }, [setNotes]);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, [setNotes]);

  const handleBackToWrite = useCallback(() => {
    setActiveView('write');
  }, []);

  const handleBackToPlanning = useCallback(() => {
    setActiveView('planning');
  }, []);

  const handleBackToSettings = useCallback(() => {
    setActiveView('settings');
  }, []);

  const handleBackToHelp = useCallback(() => {
    setActiveView('help');
  }, []);

  // Render main content based on active view
  const renderMainContent = () => {
    switch (activeView) {
      case 'write':
        return (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col">
              <Editor
                content={editorContent}
                onChange={handleEditorChange}
              />
            </div>
            <NotesPanel
              notes={notes}
              onAddNote={handleAddNote}
              onEditNote={handleEditNote}
              onDeleteNote={handleDeleteNote}
              isCollapsed={notesPanelCollapsed}
              onToggleCollapse={() => setNotesPanelCollapsed(!notesPanelCollapsed)}
            />
          </div>
        );

      case 'editor':
        return (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col">
              <Editor
                content={editorContent}
                onChange={handleEditorChange}
              />
            </div>
            <NotesPanel
              notes={notes}
              onAddNote={handleAddNote}
              onEditNote={handleEditNote}
              onDeleteNote={handleDeleteNote}
              isCollapsed={notesPanelCollapsed}
              onToggleCollapse={() => setNotesPanelCollapsed(!notesPanelCollapsed)}
            />
          </div>
        );

      case 'projects':
        return (
          <ErrorBoundary>
            <ProjectsPage onBack={handleBackToWrite} />
          </ErrorBoundary>
        );
      
      case 'dashboard':
        return (
          <ErrorBoundary>
            <DashboardPage onViewChange={setActiveView} />
          </ErrorBoundary>
        );
      
      case 'canvas':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Canvas />
            </Suspense>
          </ErrorBoundary>
        );

      case 'files':
        return (
          <ErrorBoundary>
            <Files onBack={handleBackToWrite} />
          </ErrorBoundary>
        );

      case 'planning':
        return (
          <ErrorBoundary>
            <PlanningPage onViewChange={setActiveView} />
          </ErrorBoundary>
        );

      case 'outline':
        return (
          <ErrorBoundary>
            <OutlinePage onBack={handleBackToPlanning} />
          </ErrorBoundary>
        );

      case 'plot':
        return (
          <ErrorBoundary>
            <PlotPage onBack={handleBackToPlanning} />
          </ErrorBoundary>
        );

      case 'characters':
        return (
          <ErrorBoundary>
            <CharactersPage onBack={handleBackToPlanning} />
          </ErrorBoundary>
        );

      case 'world-building':
        return (
          <ErrorBoundary>
            <WorldBuildingPage onBack={handleBackToPlanning} />
          </ErrorBoundary>
        );

      case 'settings':
        return (
          <ErrorBoundary>
            <SettingsPage onViewChange={setActiveView} />
          </ErrorBoundary>
        );
      
      case 'integrations':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Integration onBack={handleBackToSettings} />
            </Suspense>
          </ErrorBoundary>
        );

      case 'history':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <History onBack={handleBackToSettings} />
            </Suspense>
          </ErrorBoundary>
        );

      case 'help':
        return (
          <ErrorBoundary>
            <HelpPage onViewChange={setActiveView} />
          </ErrorBoundary>
        );

      case 'help-topics':
        return (
          <ErrorBoundary>
            <HelpTopicsPage onBack={handleBackToHelp} />
          </ErrorBoundary>
        );

      case 'get-started':
        return (
          <ErrorBoundary>
            <GetStartedPage onBack={handleBackToHelp} />
          </ErrorBoundary>
        );

      case 'ask-question':
        return (
          <ErrorBoundary>
            <AskQuestionPage onBack={handleBackToHelp} />
          </ErrorBoundary>
        );

      case 'get-feedback':
        return (
          <ErrorBoundary>
            <GetFeedbackPage onBack={handleBackToHelp} />
          </ErrorBoundary>
        );

      default:
        return (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col">
              <Editor
                content={editorContent}
                onChange={handleEditorChange}
              />
            </div>
            <NotesPanel
              notes={notes}
              onAddNote={handleAddNote}
              onEditNote={handleEditNote}
              onDeleteNote={handleDeleteNote}
              isCollapsed={notesPanelCollapsed}
              onToggleCollapse={() => setNotesPanelCollapsed(!notesPanelCollapsed)}
            />
          </div>
        );
    }
  };

  return (
    <ThemeProvider>
      <div className="h-screen bg-[#FAF9F9] flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb */}
          <Breadcrumb activeView={activeView} onViewChange={setActiveView} />
          
          {/* Main Content */}
          {renderMainContent()}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
