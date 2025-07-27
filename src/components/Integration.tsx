// src/components/Integration.tsx - UPDATED

import React, { useState, useCallback } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  BookOpen, 
  Loader2,
  ExternalLink,
  Shield,
  Database,
  Users,
  FileText,
  Globe
} from 'lucide-react';
import { NotionImportService, ImportedDatabase } from '../services/notion-import-service';
import { EnhancedSupabaseImportService, ImportResult } from '../services/enhanced-supabase-import-service';
import { PostImportNavigation } from './integration/PostImportNavigation';
import { useAuth } from '../contexts/AuthContext';

interface IntegrationProps {
  onBack: () => void;
  // ADD: Navigation callbacks to parent component
  onNavigateToPlanning?: (page: 'characters' | 'plot' | 'world-building' | 'outline', projectId: string) => void;
  onNavigateToCanvas?: (projectId: string) => void;
  onNavigateToLibrary?: (projectId: string) => void;
  onNavigateToProjects?: () => void;
}

type Step = 'connect' | 'preview' | 'importing' | 'success' | 'error';

interface IntegrationState {
  step: Step;
  token: string;
  databaseUrls: string;
  databases: ImportedDatabase[];
  importResult: ImportResult | null;
  isLoading: boolean;
  error: string | null;
}

export default function Integration({ 
  onBack, 
  onNavigateToPlanning,
  onNavigateToCanvas,
  onNavigateToLibrary,
  onNavigateToProjects
}: IntegrationProps) {
  const { user } = useAuth();
  
  const [state, setState] = useState<IntegrationState>({
    step: 'connect',
    token: '',
    databaseUrls: '',
    databases: [],
    importResult: null,
    isLoading: false,
    error: null
  });

  const handleError = useCallback((error: Error | string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    setState(prev => ({ ...prev, error: errorMessage, step: 'error', isLoading: false }));
  }, []);

  const validateInputs = (): boolean => {
    if (!state.token.trim()) {
      handleError('Notion integration token is required');
      return false;
    }
    if (!state.databaseUrls.trim()) {
      handleError('At least one database URL is required');
      return false;
    }
    if (!user?.id) {
      handleError('User authentication is required');
      return false;
    }
    return true;
  };

  const handleConnect = async () => {
    if (!validateInputs()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const notionService = new NotionImportService(state.token.trim());
      
      // Validate token
      const isValidToken = await notionService.validateToken();
      if (!isValidToken) {
        throw new Error('Invalid Notion integration token');
      }

      // Parse database URLs
      const urls = state.databaseUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      if (urls.length === 0) {
        throw new Error('No valid database URLs provided');
      }

      // Import from databases
      const databases = await notionService.importFromMultipleDatabases(urls);
      
      if (databases.length === 0) {
        throw new Error('No databases could be imported. Please check your URLs and permissions.');
      }

      setState(prev => ({ ...prev, databases, step: 'preview', isLoading: false }));

    } catch (error) {
      handleError(error as Error);
    }
  };

  const handleImport = async () => {
    if (!user?.id) {
      handleError('User authentication required');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, step: 'importing' }));

    try {
      const importService = new EnhancedSupabaseImportService();
      
      // Check user permissions
      const canImport = await importService.canUserImport(user.id);
      if (!canImport) {
        throw new Error('Import not allowed. Please check your subscription status.');
      }

      // Generate project name
      const projectName = `Notion Import - ${new Date().toLocaleDateString()}`;

      // Import to Supabase
      const result = await importService.importFromNotion(
        state.databases,
        projectName,
        user.id
      );

      if (!result.success) {
        throw new Error(result.errors.join(', ') || 'Import failed');
      }

      setState(prev => ({ ...prev, importResult: result, step: 'success', isLoading: false }));

    } catch (error) {
      handleError(error as Error);
    }
  };

  const handleRetry = () => {
    setState(prev => ({
      ...prev,
      step: 'connect',
      error: null,
      databases: [],
      importResult: null
    }));
  };

  // UPDATED: Real navigation functions
  const handleNavigateToPlanning = (page: 'characters' | 'plot' | 'world-building' | 'outline') => {
    const projectId = state.importResult?.projectId;
    if (projectId && onNavigateToPlanning) {
      onNavigateToPlanning(page, projectId);
    } else if (projectId) {
      // Fallback: navigate to planning page with project in URL
      window.location.href = `/planning/${page}?project=${projectId}`;
    }
    onBack(); // Close integration
  };

  const handleNavigateToCanvas = () => {
    const projectId = state.importResult?.projectId;
    if (projectId && onNavigateToCanvas) {
      onNavigateToCanvas(projectId);
    } else if (projectId) {
      // Fallback: navigate to canvas with project in URL
      window.location.href = `/canvas?project=${projectId}`;
    }
    onBack(); // Close integration
  };

  const handleNavigateToLibrary = () => {
    const projectId = state.importResult?.projectId;
    if (projectId && onNavigateToLibrary) {
      onNavigateToLibrary(projectId);
    } else if (onNavigateToProjects) {
      onNavigateToProjects();
    } else {
      // Fallback: navigate to projects
      window.location.href = '/projects';
    }
    onBack(); // Close integration
  };

  // ... rest of the component remains the same until renderStepContent

  const renderStepContent = () => {
    switch (state.step) {
      case 'connect':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Notion Workspace</h2>
              <p className="text-gray-600">Import your novel tracker data from Notion into WritersBlock</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notion Integration Token *
                </label>
                <input
                  type="password"
                  value={state.token}
                  onChange={(e) => setState(prev => ({ ...prev, token: e.target.value }))}
                  placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Create an integration at notion.so/my-integrations and copy the token here
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Database URLs *
                </label>
                <textarea
                  value={state.databaseUrls}
                  onChange={(e) => setState(prev => ({ ...prev, databaseUrls: e.target.value }))}
                  placeholder={`https://notion.so/your-database-url-1\nhttps://notion.so/your-database-url-2`}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter one database URL per line. Share your databases with your integration.
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Setup Instructions</h4>
                  <ol className="text-sm text-blue-700 mt-1 list-decimal list-inside space-y-1">
                    <li>Create a Notion integration at <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">notion.so/my-integrations <ExternalLink className="w-3 h-3" /></a></li>
                    <li>Copy the "Internal Integration Token"</li>
                    <li>Share your Writing Novel Tracker databases with the integration</li>
                    <li>Copy the database URLs from your browser address bar</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Security Notice</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Your credentials are used only to connect to Notion. Data is imported directly to your account.
                  </p>
                </div>
              </div>
            </div>

            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-800 font-medium">Connection Error</h4>
                    <p className="text-red-700 text-sm mt-1">{state.error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview Your Content</h2>
              <p className="text-gray-600">Review what will be imported into WritersBlock</p>
            </div>

            <div className="space-y-4">
              {state.databases.map((db) => (
                <div key={db.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(db.type)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{db.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {db.type} • {db.records.length} items
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{db.records.length}</div>
                      <div className="text-xs text-gray-500">records</div>
                    </div>
                  </div>
                  
                  {db.records.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <strong>Sample:</strong> {db.records.slice(0, 3).map(r => r.name).join(', ')}
                      {db.records.length > 3 && `, +${db.records.length - 3} more`}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-800 font-medium">Ready to Import</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    Content will be distributed across Characters, Plot, World Building, and Outline pages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'importing':
        return (
          <div className="space-y-6 text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Importing Your Content</h2>
              <p className="text-gray-600">Processing and organizing your Notion data...</p>
            </div>
          </div>
        );

      case 'success':
        if (state.importResult) {
          return (
            <PostImportNavigation
              importResult={state.importResult}
              onNavigateToPlanning={handleNavigateToPlanning}
              onNavigateToCanvas={handleNavigateToCanvas}
              onNavigateToLibrary={handleNavigateToLibrary}
              onClose={onBack}
            />
          );
        }
        return null;

      case 'error':
        return (
          <div className="space-y-6 text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Failed</h2>
              <p className="text-gray-600 mb-4">There was an issue importing your content.</p>
              {state.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-left max-w-md mx-auto">
                  <p className="text-red-700 text-sm">{state.error}</p>
                </div>
              )}
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Go Back
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'character': return <Users className="w-5 h-5 text-blue-600" />;
      case 'plot': return <BookOpen className="w-5 h-5 text-purple-600" />;
      case 'chapter': return <FileText className="w-5 h-5 text-orange-600" />;
      case 'location': return <Globe className="w-5 h-5 text-green-600" />;
      default: return <Database className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionButtons = () => {
    switch (state.step) {
      case 'connect':
        return (
          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleConnect}
              disabled={state.isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {state.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {state.isLoading ? 'Connecting...' : 'Load Preview'}
            </button>
          </div>
        );
      
      case 'preview':
        return (
          <div className="flex justify-between">
            <button
              onClick={() => setState(prev => ({ ...prev, step: 'connect' }))}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleImport}
              disabled={state.isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {state.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {state.isLoading ? 'Importing...' : 'Start Import'}
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { key: 'connect', label: 'Connect' },
              { key: 'preview', label: 'Preview' },
              { key: 'importing', label: 'Import' },
              { key: 'success', label: 'Complete' }
            ].map((step, index, array) => (
              <React.Fragment key={step.key}>
                <div className="flex items-center">
                  {getStepIcon(step.key as Step, state.step)}
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {step.label}
                  </span>
                </div>
                {index < array.length - 1 && (
                  <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {renderStepContent()}
          
          {/* Action Buttons */}
          <div className="mt-8">
            {getActionButtons()}
          </div>
        </div>
      </div>
    </div>
  );

  function getStepIcon(stepName: Step, currentStep: Step) {
    const steps = ['connect', 'preview', 'importing', 'success'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(stepName);
    
    if (stepIndex < currentIndex) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (stepIndex === currentIndex) {
      return <div className="w-5 h-5 rounded-full bg-blue-600"></div>;
    } else {
      return <div className="w-5 h-5 rounded-full bg-gray-300"></div>;
    }
  }
}
