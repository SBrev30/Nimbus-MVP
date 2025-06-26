import React, { useState, useCallback, Suspense, lazy } from 'react';
import { Sidebar } from './components/Sidebar';
import { Breadcrumb } from './components/Breadcrumb';
import { Editor } from './components/Editor';
import { NotesPanel } from './components/NotesPanel';
import { Search } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppDataProvider, useAppData } from './contexts/AppDataContext';
import { SettingsProvider } from './contexts/SettingsContext';

// Lightweight immediate components
import { OutlinePage } from './components/planning/OutlinePage';
import { PlotPage } from './components/planning/PlotPage';
import { CharactersPage } from './components/planning/CharactersPage';
import { WorldBuildingPage } from './components/planning/WorldBuildingPage';
import { HelpTopicsPage } from './components/help/HelpTopicsPage';
import { GetStartedPage } from './components/help/GetStartedPage';
import { AskQuestionPage } from './components/help/AskQuestionPage';
import { GetFeedbackPage } from './components/help/GetFeedbackPage';

// Heavy lazy-loaded components
const Canvas = lazy(() => import('./components/Canvas'));
const KanbanApp = lazy(() => import('./components/KanbanApp'));
const Files = lazy(() => import('./components/Files'));
const ProjectsPage = lazy(() => import('./components/projects-page'));

// Settings components wrapped in SettingsProvider
const HistoryPageWithProvider = lazy(() => 
  import('./components/History').then(module => ({
    default: ({ onBack }: { onBack: () => void }) => (
      <SettingsProvider>
        <module.default onBack={onBack} />
      </SettingsProvider>
    )
  }))
);

const IntegrationPageWithProvider = lazy(() =>
  import('./components/Integration').then(module => ({
    default: ({ onBack }: { onBack: () => void }) => (
      <SettingsProvider>
        <module.default onBack={onBack} />
      </SettingsProvider>
    )
  }))
);

// Enhanced loading components with specific messages
const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-[#A5F7AC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[#889096] font-medium">{message}</p>
      <p className="text-sm text-gray-400 mt-2">This may take a moment...</p>
    </div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
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
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
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

// Main App Content component that uses the contexts
function AppContent() {
  // UI state (kept local since it's lightweight)
  const [activeView, setActiveView] = useState('write');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notesPanelCollapsed, setNotesPanelCollapsed] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<{ id: string; title: string } | null>(null);

  // Use AppDataContext for heavy state
  const {
    editorContent,
    setEditorContent,
    notes,
    addNote,
    editNote,
    deleteNote,
    saveChapterContent,
    getChapterContent
  } = useAppData();

  // Optimized event handlers using context functions
  const handleEditorChange = useCallback((content: any) => {
    setEditorContent(content);
    
    // Auto-save to chapter if we're editing a specific chapter
    if (currentChapter) {
      saveChapterContent(currentChapter.id, content);
    }
  }, [setEditorContent, currentChapter, saveChapterContent]);

  const handleViewChange = useCallback((view: string) => {
    setActiveView(view);
    
    // Clear current chapter when navigating away from editor
    if (view !== 'write' && view !== 'editor') {
      setCurrentChapter(null);
    }
  }, []);

  const handleSelectChapter = useCallback((chapterId: string, chapterTitle: string) => {
    // Save current content before switching
    if (currentChapter) {
      saveChapterContent(currentChapter.id, editorContent);
    }

    // Set new chapter
    setCurrentChapter({ id: chapterId, title: chapterTitle });
    setActiveView('editor');
    
    // Load existing content or create new
    const existingContent = getChapterContent(chapterId);
    const chapterContent = existingContent || {
      title: chapterTitle,
      content: '<p>Start writing your chapter here...</p>',
      wordCount: 0,
      lastSaved: new Date(),
    };
    
    setEditorContent(chapterContent);
  }, [currentChapter, editorContent, saveChapterContent, getChapterContent, setEditorContent]);

  // Navigation handlers
  const handleBackToSettings = useCallback(() => setActiveView('settings'), []);
  const handleBackToPlanning = useCallback(() => setActiveView('planning'), []);
  const handleBackToWrite = useCallback(() => setActiveView('write'), []);
  const handleBackToProjects = useCallback(() => {
    // Save current content before leaving
    if (currentChapter) {
      saveChapterContent(currentChapter.id, editorContent);
    }
    setCurrentChapter(null);
    setActiveView('projects');
  }, [currentChapter, editorContent, saveChapterContent]);

  // Memoized render content function
  const renderContent = useCallback(() => {
    switch (activeView) {
      case 'write':
      case 'editor':
        return (
          <ErrorBoundary>
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col">
                <Editor
                  content={editorContent}
                  onChange={handleEditorChange}
                />
              </div>
              <NotesPanel
                notes={notes}
                onAddNote={addNote}
                onEditNote={editNote}
                onDeleteNote={deleteNote}
                isCollapsed={notesPanelCollapsed}
                onToggleCollapse={() => setNotesPanelCollapsed(!notesPanelCollapsed)}
              />
            </div>
          </ErrorBoundary>
        );

      case 'projects':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner message="Loading Projects..." />}>
              <ProjectsPage onBack={handleBackToWrite} />
            </Suspense>
          </ErrorBoundary>
        );
      
      case 'dashboard':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner message="Loading Project Dashboard..." />}>
              <KanbanApp />
            </Suspense>
          </ErrorBoundary>
        );
      
      case 'canvas':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner message="Loading Visual Canvas..." />}>
              <Canvas />
            </Suspense>
          </ErrorBoundary>
        );

      case 'files':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner message="Loading Files..." />}>
              <Files onBack={handleBackToWrite} />
            </Suspense>
          </ErrorBoundary>
        );

      // Planning pages (immediate loading - lightweight)
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
      
      // Settings pages (lazy with providers)
      case 'integrations':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner message="Loading Integration Settings..." />}>
              <IntegrationPageWithProvider onBack={handleBackToSettings} />
            </Suspense>
          </ErrorBoundary>
        );
      
      case 'history':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner message="Loading Change History..." />}>
              <HistoryPageWithProvider onBack={handleBackToSettings} />
            </Suspense>
          </ErrorBoundary>
        );

      // Help pages (immediate loading - lightweight)
      case 'help-topics':
        return (
          <ErrorBoundary>
            <HelpTopicsPage activeView={activeView} onNavigate={handleViewChange} />
          </ErrorBoundary>
        );

      case 'get-started':
        return (
          <ErrorBoundary>
            <GetStartedPage activeView={activeView} onNavigate={handleViewChange} />
          </ErrorBoundary>
        );

      case 'ask-question':
        return (
          <ErrorBoundary>
            <AskQuestionPage activeView={activeView} onNavigate={handleViewChange} />
          </ErrorBoundary>
        );

      case 'get-feedback':
        return (
          <ErrorBoundary>
            <GetFeedbackPage activeView={activeView} onNavigate={handleViewChange} />
          </ErrorBoundary>
        );

      // Static pages (immediate)
      case 'planning':
        return (
          <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#A5F7AC] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Planning</h2>
              <p className="text-gray-600 mb-6">Choose a planning tool to get started</p>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveView('outline')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-medium"
                >
                  Story Outline
                </button>
                <button
                  onClick={() => setActiveView('plot')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Plot Development
                </button>
                <button
                  onClick={() => setActiveView('characters')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Characters
                </button>
                <button
                  onClick={() => setActiveView('world-building')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  World Building
                </button>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#A5F7AC] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Settings</h2>
              <p className="text-gray-600 mb-6">Configure your WritersBlock experience</p>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveView('history')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-medium"
                >
                  View History
                </button>
                <button
                  onClick={() => setActiveView('integrations')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Manage Integrations
                </button>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#A5F7AC] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 17h.01" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Help & Support</h2>
              <p className="text-gray-600 mb-6">Get help with WritersBlock features</p>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveView('help-topics')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-medium"
                >
                  Help Topics
                </button>
                <button
                  onClick={() => setActiveView('get-started')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Get Started
                </button>
                <button
                  onClick={() => setActiveView('ask-question')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Ask A Question
                </button>
                <button
                  onClick={() => setActiveView('get-feedback')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Get Feedback
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to WritersBlock</h2>
              <p className="text-gray-600">Select an option from the sidebar to get started</p>
            </div>
          </div>
        );
    }
  }, [
    activeView,
    editorContent,
    handleEditorChange,
    notes,
    addNote,
    editNote,
    deleteNote,
    notesPanelCollapsed,
    handleBackToSettings,
    handleBackToPlanning,
    handleBackToWrite,
    handleBackToProjects,
    handleViewChange
  ]);

  return (
    <div className="h-screen bg-[#F9FAFB] flex font-inter overflow-hidden">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeView={activeView}
        onViewChange={handleViewChange}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-[72px] flex items-end justify-between px-6 pb-3">
          <Breadcrumb activeView={activeView} onNavigate={handleViewChange} />
          
          <div className="bg-[#FAF9F9] rounded-[20px] h-[29px] w-[171px] flex items-center px-3 gap-2">
            <Search className="w-[17px] h-[17px] text-[#889096]" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent text-sm text-gray-600 outline-none flex-1 font-inter"
            />
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}

// Root App with all providers in correct order
function App() {
  return (
    <ThemeProvider>
      <AppDataProvider>
        <AppContent />
      </AppDataProvider>
    </ThemeProvider>
  );
}

export default App;
