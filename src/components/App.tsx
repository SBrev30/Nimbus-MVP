import React, { useState, useCallback, Suspense, lazy, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Breadcrumb } from './Breadcrumb';
import { Editor } from './Editor';
import { NotesPanel } from './NotesPanel';
import { KanbanApp } from './KanbanApp';
import { StatusDashboard } from './StatusDashboard';
import { Files } from './Files';
import { ProjectsPage } from './projects-page';
import { AuthPage } from './auth/AuthPage';
import { Search } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAutoSave } from '../hooks/useAutoSave';
import { ThemeProvider } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

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
import { OutlinePage } from './planning/OutlinePage';
import { PlotPage } from './planning/PlotPage';
import { CharactersPage } from './planning/CharactersPage';
import { WorldBuildingPage } from './planning/WorldBuildingPage';

// Import help components
import { HelpTopicsPage } from './help/HelpTopicsPage';
import { GetStartedPage } from './help/GetStartedPage';
import { AskQuestionPage } from './help/AskQuestionPage';
import { GiveFeedbackPage } from './help/GiveFeedbackPage';

// Lazy load heavy components - Fixed Canvas import
const Canvas = lazy(() => import('./Canvas').then(module => ({ default: module.default || module })));
const Integration = lazy(() => import('./Integration').then(module => ({ default: module.default || module })));
const History = lazy(() => import('./History').then(module => ({ default: module.default || module })));

// Loading component with message support
const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-[#A5F7AC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[#889096]">{message}</p>
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

  static getDerivedStateFromError(error: Error): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
            <p className="text-gray-600">Please try refreshing the page</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// App Content Component
function AppContent() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State management
  const [activeView, setActiveView] = useState('write');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notesPanelCollapsed, setNotesPanelCollapsed] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<{ id: string; title: string } | null>(null);
  
  // Editor content state
  const [editorContent, setEditorContent] = useLocalStorage<EditorContent>('editorContent', {
    title: 'Untitled Document',
    content: '<p>Start writing your story here...</p>',
    wordCount: 0,
    lastSaved: new Date(),
  });

  // Chapter contents state
  const [chapterContents, setChapterContents] = useLocalStorage<Record<string, EditorContent>>('chapterContents', {});

  // Notes state
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);

  // Auto-save functionality
  useAutoSave(editorContent, setEditorContent, 5000);

  // Check authentication state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        setActiveView('write');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handler functions
  const handleEditorChange = useCallback((content: EditorContent) => {
    setEditorContent(content);
    
    // Save current chapter if we're editing a specific chapter
    if (currentChapter) {
      setChapterContents(prev => ({
        ...prev,
        [currentChapter.id]: content
      }));
    }
  }, [setEditorContent, currentChapter, setChapterContents]);

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
      setChapterContents(prev => ({
        ...prev,
        [currentChapter.id]: editorContent
      }));
    }

    // Set new chapter
    setCurrentChapter({ id: chapterId, title: chapterTitle });
    setActiveView('editor');
    
    // Load existing content or create new
    const existingContent = chapterContents[chapterId];
    const chapterContent = existingContent || {
      title: chapterTitle,
      content: '<p>Start writing your chapter here...</p>',
      wordCount: 0,
      lastSaved: new Date(),
    };
    
    setEditorContent(chapterContent);
  }, [currentChapter, editorContent, chapterContents, setEditorContent, setChapterContents]);

  // Notes handlers
  const handleAddNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [...prev, newNote]);
  }, [setNotes]);

  const handleEditNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ));
  }, [setNotes]);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, [setNotes]);

  // Sign out handler
  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setActiveView('write');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  // Navigation handlers
  const handleBackToSettings = useCallback(() => setActiveView('settings'), []);
  const handleBackToPlanning = useCallback(() => setActiveView('planning'), []);
  const handleBackToWrite = useCallback(() => setActiveView('write'), []);
  const handleBackToProjects = useCallback(() => {
    // Save current content before leaving
    if (currentChapter) {
      setChapterContents(prev => ({
        ...prev,
        [currentChapter.id]: editorContent
      }));
    }
    setCurrentChapter(null);
    setActiveView('projects');
  }, [currentChapter, editorContent, setChapterContents]);

  // Lazy component wrappers with providers
  const IntegrationPageWithProvider = useCallback(({ onBack }: { onBack: () => void }) => (
    <Integration onBack={onBack} />
  ), []);

  const HistoryPageWithProvider = useCallback(({ onBack }: { onBack: () => void }) => (
    <History onBack={onBack} />
  ), []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F9FAFB]">
        <LoadingSpinner message="Checking authentication..." />
      </div>
    );
  }

  // Show auth page if user is not authenticated
  if (!user) {
    return (
      <ThemeProvider>
        <AuthPage />
      </ThemeProvider>
    );
  }

  // Memoized render content function
  const renderContent = useCallback(() => {
    switch (activeView) {
      case 'write':
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
                onAddNote={handleAddNote}
                onEditNote={handleEditNote}
                onDeleteNote={handleDeleteNote}
                isCollapsed={notesPanelCollapsed}
                onToggleCollapse={() => setNotesPanelCollapsed(!notesPanelCollapsed)}
              />
            </div>
          </ErrorBoundary>
        );

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
                onAddNote={handleAddNote}
                onEditNote={handleEditNote}
                onDeleteNote={handleDeleteNote}
                isCollapsed={notesPanelCollapsed}
                onToggleCollapse={() => setNotesPanelCollapsed(!notesPanelCollapsed)}
              />
            </div>
          </ErrorBoundary>
        );

      // Fixed Canvas case - no back button needed
      case 'canvas':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner message="Loading Visual Canvas..." />}>
              <Canvas />
            </Suspense>
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

      case 'give-feedback':
        return (
          <ErrorBoundary>
            <GiveFeedbackPage activeView={activeView} onNavigate={handleViewChange} />
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
              <p className="text-gray-600 mb-6">Configure your application settings</p>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveView('history')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-medium"
                >
                  Change History
                </button>
                <button
                  onClick={() => setActiveView('integrations')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Integrations
                </button>
                <button
                  onClick={handleSignOut}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-medium"
                >
                  Sign Out
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
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="17" r="1" fill="currentColor"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Help & Support</h2>
              <p className="text-gray-600 mb-6">Get help and support for WritersBlock</p>
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
                  onClick={() => setActiveView('give-feedback')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Give Feedback
                </button>
              </div>
            </div>
          </div>
        );

      default:
        console.warn(`Unknown view: ${activeView}`);
        return (
          <ErrorBoundary>
            <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">View Not Found</h2>
                <p className="text-gray-600 mb-4">The requested view "{activeView}" was not found.</p>
                <button 
                  onClick={() => handleViewChange('write')} 
                  className="px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-medium"
                >
                  Go to Write
                </button>
              </div>
            </div>
          </ErrorBoundary>
        );
    }
  }, [
    activeView,
    editorContent,
    handleEditorChange,
    notes,
    handleAddNote,
    handleEditNote,
    handleDeleteNote,
    notesPanelCollapsed,
    handleBackToSettings,
    handleBackToPlanning,
    handleBackToWrite,
    handleBackToProjects,
    handleViewChange,
    handleSignOut,
    IntegrationPageWithProvider,
    HistoryPageWithProvider
  ]);

  // Determine if we should show header (hide for canvas view)
  const shouldShowHeader = activeView !== 'canvas';

  return (
    <div className="h-screen bg-[#F9FAFB] flex font-inter overflow-hidden">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeView={activeView}
        onViewChange={handleViewChange}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Conditionally render header - hidden for canvas */}
        {shouldShowHeader && (
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
        )}

        {renderContent()}
      </div>
    </div>
  );
}

// Root App with all providers in correct order
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
