import React, { useState, useCallback, Suspense, lazy } from 'react';
import { Sidebar } from './Sidebar';
import { Breadcrumb } from './Breadcrumb';
import { Editor } from './Editor';
import { NotesPanel } from './NotesPanel';
import { Search } from 'lucide-react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AppDataProvider, useAppData } from '../contexts/AppDataContext';
import { SettingsProvider } from '../contexts/SettingsContext';

// Lightweight immediate components
import { OutlinePage } from './planning/OutlinePage';
import { PlotPage } from './planning/PlotPage';
import { CharactersPage } from './planning/CharactersPage';
import { WorldBuildingPage } from './planning/WorldBuildingPage';
import { HelpTopicsPage } from './help/HelpTopicsPage';
import { GetStartedPage } from './help/GetStartedPage';
import { AskQuestionPage } from './help/AskQuestionPage';
import { GetFeedbackPage } from './help/GetFeedbackPage';

// Heavy lazy-loaded components
const Canvas = lazy(() => import('./Canvas'));
const KanbanApp = lazy(() => import('./KanbanApp'));
const Files = lazy(() => import('./Files'));
const ProjectsPage = lazy(() => import('./projects-page'));

// FIXED: Settings components with proper import handling
const History = lazy(() => import('./History'));
const Integration = lazy(() => import('./Integration'));

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
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">We encountered an error loading this component.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 text-white rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Define view types
type ViewType = 'dashboard' | 'projects' | 'canvas' | 'library' | 'planning' | 'outline' | 'plot' | 
               'characters' | 'world-building' | 'files' | 'settings' | 'history' | 'integrations' | 
               'help' | 'help-topics' | 'get-started' | 'ask-question' | 'get-feedback';

function AppContent() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedChapter, setSelectedChapter] = useState<any>(null);

  const handleViewChange = useCallback((view: ViewType) => {
    setActiveView(view);
  }, []);

  const handleSelectChapter = useCallback((chapter: any) => {
    setSelectedChapter(chapter);
    setActiveView('dashboard');
  }, []);

  const handleBackToSettings = useCallback(() => {
    setActiveView('settings');
  }, []);

  const WritePage = () => {
    return (
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <Editor 
            selectedChapter={selectedChapter}
            onSelectChapter={handleSelectChapter}
          />
        </div>
        <NotesPanel />
      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <ErrorBoundary>
            <WritePage />
          </ErrorBoundary>
        );

      case 'projects':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner message="Loading projects..." />}>
              <ProjectsPage />
            </Suspense>
          </ErrorBoundary>
        );

      case 'canvas':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner message="Loading canvas..." />}>
              <Canvas />
            </Suspense>
          </ErrorBoundary>
        );

      case 'library':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner message="Loading library..." />}>
              <KanbanApp />
            </Suspense>
          </ErrorBoundary>
        );

      case 'files':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner message="Loading files..." />}>
              <Files />
            </Suspense>
          </ErrorBoundary>
        );

      case 'settings':
        return (
          <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#A5F7AC] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24">
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Settings</h2>
              <p className="text-gray-600 mb-6">Choose a setting category</p>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveView('history')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-medium"
                >
                  View History
                </button>
                <button
                  onClick={() => setActiveView('integrations')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  Manage Integrations
                </button>
              </div>
            </div>
          </div>
        );

      // FIXED: Integration component with proper error handling
      case 'integrations':
        return (
          <ErrorBoundary>
            <SettingsProvider>
              <Suspense fallback={<LoadingSpinner message="Loading integrations..." />}>
                <Integration onBack={handleBackToSettings} />
              </Suspense>
            </SettingsProvider>
          </ErrorBoundary>
        );
      
      // FIXED: History component with proper error handling
      case 'history':
        return (
          <ErrorBoundary>
            <SettingsProvider>
              <Suspense fallback={<LoadingSpinner message="Loading history..." />}>
                <History onBack={handleBackToSettings} />
              </Suspense>
            </SettingsProvider>
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
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  Plot Development
                </button>
                <button
                  onClick={() => setActiveView('characters')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  Characters
                </button>
                <button
                  onClick={() => setActiveView('world-building')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  World Building
                </button>
              </div>
            </div>
          </div>
        );

      case 'outline':
        return (
          <ErrorBoundary>
            <OutlinePage activeView={activeView} onNavigate={handleViewChange} />
          </ErrorBoundary>
        );

      case 'plot':
        return (
          <ErrorBoundary>
            <PlotPage activeView={activeView} onNavigate={handleViewChange} />
          </ErrorBoundary>
        );

      case 'characters':
        return (
          <ErrorBoundary>
            <CharactersPage activeView={activeView} onNavigate={handleViewChange} />
          </ErrorBoundary>
        );

      case 'world-building':
        return (
          <ErrorBoundary>
            <WorldBuildingPage activeView={activeView} onNavigate={handleViewChange} />
          </ErrorBoundary>
        );

      case 'help':
        return (
          <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#A5F7AC] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24">
                  <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Help & Support</h2>
              <p className="text-gray-600 mb-6">Choose how we can help you</p>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveView('help-topics')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-medium"
                >
                  Browse Help Topics
                </button>
                <button
                  onClick={() => setActiveView('get-started')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  Get Started Guide
                </button>
                <button
                  onClick={() => setActiveView('ask-question')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  Ask a Question
                </button>
                <button
                  onClick={() => setActiveView('get-feedback')}
                  className="block w-full max-w-xs mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  Send Feedback
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <ErrorBoundary>
            <WritePage />
          </ErrorBoundary>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F7] flex">
      <Sidebar 
        activeView={activeView} 
        onViewChange={handleViewChange}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="h-[80px] bg-white border-b border-[#C6C5C5] flex items-center justify-between px-6">
          <Breadcrumb activeView={activeView} />
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#889096] w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-[#C6C5C5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent w-64"
              />
            </div>
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
      <AppDataProvider>
        <AppContent />
      </AppDataProvider>
    </ThemeProvider>
  );
}

export default App;
