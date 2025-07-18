import React from 'react';
import { Breadcrumb } from '../Breadcrumb';

interface HelpLayoutProps {
  activeView: string;
  onNavigate?: (view: string) => void;
  children: React.ReactNode;
  title: string;
  description?: string;
  showBackButton?: boolean;
  showBreadcrumb?: boolean;
}

export function HelpLayout({ 
  activeView, 
  onNavigate, 
  children, 
  title, 
  description,
  showBackButton = false,
  showBreadcrumb = false
}: HelpLayoutProps) {
  return (
    <div className="flex-1 bg-white rounded-t-[17px] overflow-hidden flex flex-col min-h-0">
      {/* Fixed Header Content */}
      <div className="flex-shrink-0 p-8 pb-0">
        {/* Conditionally render Breadcrumb Navigation */}
        {showBreadcrumb && (
          <div className="mb-6">
            <Breadcrumb 
              activeView={activeView}
              onNavigate={onNavigate}
            />
          </div>
        )}
        
        {/* Back Button (if needed) */}
        {showBackButton && (
          <button
            onClick={() => onNavigate?.('help')}
            className="flex items-center gap-2 text-[#889096] hover:text-gray-700 transition-colors mb-6 font-inter text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Help & Support
          </button>
        )}
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3 font-inter">{title}</h1>
          {description && (
            <p className="text-lg text-[#889096] font-inter">{description}</p>
          )}
        </div>
      </div>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 min-h-0">
        <div className="max-w-4xl space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
