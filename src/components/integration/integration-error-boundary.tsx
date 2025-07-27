'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class IntegrationErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Integration Error Boundary Caught:', error);
    console.error('🔍 Error Info:', errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Integration Error</h3>
              <p className="text-gray-600 mb-6">
                There was an issue processing your Notion import. This could be due to:
              </p>
              
              <ul className="text-sm text-gray-500 mb-6 space-y-1 text-left">
                <li>• Notion API connection issues</li>
                <li>• Database permission problems</li>
                <li>• Content processing errors</li>
                <li>• Network connectivity issues</li>
                <li>• Missing required database tables</li>
              </ul>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                    window.location.reload();
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Try Again
                </button>
                
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
                >
                  Reset Component
                </button>
                
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  Return to Dashboard
                </button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 font-medium">
                    🔍 Error Details (Development)
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-1">Error Message:</h4>
                      <pre className="text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto border">
                        {this.state.error.message}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-1">Stack Trace:</h4>
                      <pre className="text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto border max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    
                    {this.state.errorInfo && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 mb-1">Component Stack:</h4>
                        <pre className="text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto border max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
