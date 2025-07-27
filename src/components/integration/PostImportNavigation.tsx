// src/components/integration/PostImportNavigation.tsx - OPTIMIZED

import React from 'react';
import { 
  Users, BookOpen, Globe, FileText, ArrowRight, CheckCircle,
  Target, Zap, Library, FolderOpen
} from 'lucide-react';
import { ImportResult } from '../../services/enhanced-supabase-import-service';

interface PostImportNavigationProps {
  importResult: ImportResult;
  onNavigateToPlanning: (page: 'characters' | 'plot' | 'world-building' | 'outline') => void;
  onNavigateToCanvas: () => void;
  onNavigateToLibrary?: () => void;
  onClose: () => void;
}

export const PostImportNavigation: React.FC<PostImportNavigationProps> = ({
  importResult,
  onNavigateToPlanning,
  onNavigateToCanvas,
  onNavigateToLibrary,
  onClose
}) => {
  const { imported, planningPageDistribution } = importResult;
  const totalImported = Object.values(imported).reduce((sum, count) => sum + count, 0);

  // Planning page configuration
  const planningPages = [
    {
      id: 'characters' as const,
      title: 'Characters',
      icon: Users,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      iconColor: 'text-blue-600',
      count: imported.characters,
      distribution: planningPageDistribution.charactersPage
    },
    {
      id: 'plot' as const,
      title: 'Plot Development',
      icon: BookOpen,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      iconColor: 'text-purple-600',
      count: imported.plotThreads,
      distribution: planningPageDistribution.plotPage
    },
    {
      id: 'world-building' as const,
      title: 'World Building',
      icon: Globe,
      color: 'bg-green-50 border-green-200 text-green-700',
      iconColor: 'text-green-600',
      count: imported.worldElements + imported.locations,
      distribution: planningPageDistribution.worldBuildingPage
    },
    {
      id: 'outline' as const,
      title: 'Story Outline',
      icon: FileText,
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      iconColor: 'text-orange-600',
      count: imported.outlineNodes + imported.chapters,
      distribution: planningPageDistribution.outlinePage
    }
  ].filter(page => page.count > 0);

  const recommendedPage = planningPages.reduce((max, current) => 
    current.count > max.count ? current : max
  );

  // Summary stats for display
  const summaryStats = [
    { label: 'Characters', count: imported.characters, color: 'text-blue-600' },
    { label: 'Plot Threads', count: imported.plotThreads, color: 'text-purple-600' },
    { label: 'World Elements', count: imported.worldElements + imported.locations, color: 'text-green-600' },
    { label: 'Outline Items', count: imported.outlineNodes + imported.chapters, color: 'text-orange-600' }
  ].filter(stat => stat.count > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Successful!</h2>
            <p className="text-gray-600">
              Successfully imported <strong>{totalImported} items</strong> from your Notion workspace
            </p>
            <div className="mt-3 text-sm text-gray-500">
              Project ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{importResult.projectId}</span>
            </div>
          </div>

          {/* Import Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Import Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {summaryStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigateToPlanning(recommendedPage.id)}
                className="flex items-center gap-2 px-4 py-2 bg-[#ff4e00] text-white rounded-lg hover:bg-[#ff4e00]/80 transition-colors"
              >
                <Target className="w-4 h-4" />
                Start with {recommendedPage.title}
                <span className="text-xs bg-white/20 px-2 py-1 rounded">Recommended</span>
              </button>
              
              <button
                onClick={onNavigateToCanvas}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Visualize on Canvas
              </button>

              {onNavigateToLibrary && imported.chapters > 0 && (
                <button
                  onClick={onNavigateToLibrary}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Library className="w-4 h-4" />
                  View in Library
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">{imported.chapters} chapters</span>
                </button>
              )}

              {onNavigateToLibrary && (
                <button
                  onClick={onNavigateToLibrary}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                  View Project
                </button>
              )}
            </div>
          </div>

          {/* Content Distribution Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900">Content Successfully Distributed</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Your Notion content has been intelligently organized across planning pages:
                </p>
                <ul className="text-blue-700 text-sm mt-2 space-y-1">
                  {imported.characters > 0 && <li>• {imported.characters} characters → Characters planning page</li>}
                  {imported.plotThreads > 0 && <li>• {imported.plotThreads} plot threads → Plot planning page</li>}
                  {imported.chapters > 0 && <li>• {imported.chapters} chapters → Outline planning page & Library</li>}
                  {(imported.locations + imported.worldElements) > 0 && (
                    <li>• {imported.locations + imported.worldElements} locations/world elements → World Building page</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Planning Pages Overview */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900">Your Content Distribution</h3>
            
            {planningPages.map((page) => (
              <div key={page.id} className={`border rounded-lg p-4 ${page.color}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      <page.icon className={`w-5 h-5 ${page.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{page.title}</h4>
                      <p className="text-sm opacity-80">{page.count} items imported</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateToPlanning(page.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-white text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                  >
                    View
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Distribution Info */}
                {page.distribution.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-1">What was imported:</div>
                    <ul className="text-xs space-y-1 opacity-90">
                      {page.distribution.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Your imported project: <strong>{importResult.projectId}</strong>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => onNavigateToPlanning(recommendedPage.id)}
                className="px-4 py-2 bg-[#ff4e00] text-white rounded-lg hover:bg-[#ff4e00]/80 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
