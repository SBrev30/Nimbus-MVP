import React, { useState, useCallback, Suspense, lazy } from 'react';
import { Sidebar } from './components/Sidebar';
import { Breadcrumb } from './components/Breadcrumb';
import { Editor } from './components/Editor';
import { NotesPanel } from './components/NotesPanel';
import { KanbanApp } from './components/KanbanApp';
import { StatusDashboard } from './components/StatusDashboard';
import { Files } from './components/Files';
import { ProjectsPage } from './components/projects-page';
import { Search } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAutoSave } from './hooks/useAutoSave';
import { ThemeProvider } from './contexts/ThemeContext';

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
import { OutlinePage } from './components/planning/OutlinePage';
import { PlotPage } from './components/planning/PlotPage';
import { CharactersPage } from './components/planning/CharactersPage';
import { WorldBuildingPage } from './components/planning/WorldBuildingPage';

// Import help components
import { HelpTopicsPage } from './components/help/HelpTopicsPage';
import { GetStartedPage } from './components/help/GetStartedPage';
import { AskQuestionPage } from './components/help/AskQuestionPage';
import { GetFeedbackPage } from './components/help/GetFeedbackPage';

// Lazy load heavy components
const Canvas = lazy(() => import('./components/Canvas').then(module => ({ default: module.default || module })));
const Integration = lazy(() => import('./components/Integration').then(module => ({ default: module.default || module })));
const History = lazy(() => import('./components/History').then(module => ({ default: module.default || module })));

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
          <div className="text-center">
            <p className="text-red-600 mb-4">Something went wrong.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors"
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

// Main App Component
function AppContent() {
  // State variables
  const [activeView, setActiveView] = useState('write');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notesPanelCollapsed, setNotesPanelCollapsed] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<{ id: string; title: string } | null>(null);

  // Editor state
  const [editorContent, setEditorContent] = useLocalStorage<EditorContent>('editor-content', {
    title: 'Origin',
    content: '<p>I thought learning to channel mana was difficult until I met Sylandria. The Dark Elf princess moved like shadow given form, her mana control making my six months of training look like a child playing with matches beside a master pyromancer.</p><p>"Your kind wastes so much energy," she told me during our first training session, her silver eyes narrowing as she watched me manifest a mana blade. "You leak mana like a sieve."</p><p>She placed her obsidian hand over mine, and I felt a strange pulling sensation as she absorbed the excess mana I could not properly control. The blue markings on my arm dimmed momentarily.</p>',
    wordCount: 87,
    lastSaved: new Date(),
  });

  // Chapter contents state
  const [chapterContents, setChapterContents] = useLocalStorage<Record<string, EditorContent>>('chapter-contents', {});

  // Notes state
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', [
    {
      id: '1',
      title: 'Vazriel Character Notes',
      content: 'Dark Elf general leading invasion. Strategically brilliant, conflicted about the war.',
      category: 'Person' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Ethereal Depths',
      content: "Source of channeler energy for Vazriel's invasion plans.",
      category: 'Place' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      title: 'Blood Pact System',
      content: "Human-Dark Elf alliance mechanism. Enhances both parties' abilities through magical bonding.",
      category: 'Plot' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      title: 'Mana Control Techniques',
      content: 'Differences between human and Dark Elf mana channeling. Humans leak energy, Dark Elves absorb excess.',
      category: 'Misc' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // Auto-save editor content
  useAutoSave(editorContent, setEditorContent, 2000);

  // Event handlers
  const handleEditorChange = useCallback((content: EditorContent) => {
    setEditorContent(content);
    
    if (currentChapter) {
      setChapterContents(prev => ({
        ...prev,
        [currentChapter.id]: content
      }));
    }
  }, [setEditorContent, currentChapter, setChapterContents]);

  const handleAddNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
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

  const handleViewChange = useCallback((view: string) => {
    setActiveView(view);
    if (view !== 'write' && view !== 'editor') {
      setCurrentChapter(null);
    }
  }, []);

  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleBackToWrite = useCallback(() => {
    setActiveView('write');
  }, []);

  const handleBackToPlanning = useCallback(() => {
    setActiveView('planning');
  }, []);

  const handleBackToSettings = useCallback(() => {
    setActiveView('settings');
  }, []);

  const handleSelectChapter = useCallback((chapterId: string, chapterTitle: string) => {
    if (currentChapter) {
      setChapterContents(prev => ({
        ...prev,
        [currentChapter.id]: editorContent
      }));
    }

    setCurrentChapter({ id: chapterId, title: chapterTitle });
    setActiveView('editor');
    
    const existingContent = chapterContents[chapterId];
    const chapterContent = existingContent || {
      title: chapterTitle,
      content: '<p>Start writing your chapter here...</p>',
      wordCount: 0,
      lastSaved: new Date(),
    };
    
    setEditorContent(chapterContent);
  }, [setEditorContent, currentChapter, editorContent, chapterContents, setChapterContents]);

  const handleBackToProjects = useCallback(() => {
    if (currentChapter) {
      setChapterContents(prev => ({
        ...prev,
        [currentChapter.id]: editorContent
      }));
    }
    
    setCurrentChapter(null);
    setActiveView('projects');
  }, [currentChapter, editorContent, setChapterContents]);

  // Render content based on active view
  const renderContent = () => {
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
            <KanbanApp />
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
  };

  return (
    <div className="h-screen bg-[#F9FAFB] flex font-inter overflow-hidden">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={handleSidebarToggle}
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

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
