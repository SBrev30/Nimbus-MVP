import React, { useState, useCallback, Suspense, lazy } from 'react';
import { Sidebar } from './Sidebar';
import { Breadcrumb } from './Breadcrumb';
import { Search } from 'lucide-react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AppDataProvider, useAppData } from '../contexts/AppDataContext';
import { SettingsProvider } from '../contexts/SettingsContext';

// Lightweight immediate components
import { Library } from './Library';

// Heavy lazy-loaded components
const Canvas = lazy(() => import('./Canvas'));
const Files = lazy(() => import('./Files'));

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
type ViewType = 'dashboard' | 'canvas' | 'library' | 'files';

function AppContent() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  const handleViewChange = useCallback((view: ViewType) => {
    setActiveView(view);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <ErrorBoundary>
            <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-[#A5F7AC] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">Welcome to Nimbus Note</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Import your existing writing content, organize it visually, and develop your story with our powerful tools.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveView('library')}
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#A5F7AC] hover:bg-gray-50 transition-colors text-left"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">Library</h3>
                    <p className="text-sm text-gray-600">Import and manage your content</p>
                  </button>
                  <button
                    onClick={() => setActiveView('canvas')}
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#A5F7AC] hover:bg-gray-50 transition-colors text-left"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">Canvas</h3>
                    <p className="text-sm text-gray-600">Visualize your story elements</p>
                  </button>
                </div>
              </div>
            </div>
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
          <Library />
        );

      case 'files':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner message="Loading files..." />}>
              <Files />
            </Suspense>
          </ErrorBoundary>
        );

      default:
        return (
          <ErrorBoundary>
            <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
                <p className="text-gray-600">The requested view was not found.</p>
              </div>
            </div>
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
    <AppContent />
  );
}

export default App;
