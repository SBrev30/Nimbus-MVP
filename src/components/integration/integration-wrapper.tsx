'use client';

import React, { Suspense } from 'react';
import { IntegrationErrorBoundary } from './integration-error-boundary';
import Integration from '../Integration';

// Loading component for the integration page
function IntegrationLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Integration</h3>
        <p className="text-gray-600">Setting up your Notion import...</p>
      </div>
    </div>
  );
}

// Main wrapper component that handles all error cases
export default function IntegrationPageWrapper() {
  return (
    <IntegrationErrorBoundary>
      <Suspense fallback={<IntegrationLoading />}>
        <Integration />
      </Suspense>
    </IntegrationErrorBoundary>
  );
}

// Export individual components for flexibility
export { IntegrationErrorBoundary, IntegrationLoading };
