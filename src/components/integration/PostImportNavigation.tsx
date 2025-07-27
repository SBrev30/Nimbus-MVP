// src/components/integration/PostImportNavigation.tsx

import React from 'react';
import { 
  Users, 
  BookOpen, 
  Globe, 
  FileText, 
  ArrowRight, 
  CheckCircle,
  ExternalLink,
  Target,
  Zap
} from 'lucide-react';
import { ImportResult } from '../../services/enhanced-supabase-import-service';

interface PostImportNavigationProps {
  importResult: ImportResult;
  onNavigateToPlanning: (page: 'characters' | 'plot' | 'world-building' | 'outline') => void;
  onNavigateToCanvas: () => void;
  onClose: () => void;
}

export const PostImportNavigation: React.FC<PostImportNavigationProps> = ({
  importResult,
  onNavigateToPlanning,
  onNavigateToCanvas,
  onClose
}) => {
  const { imported, planningPageDistribution } = importResult;
  const totalImported = imported.characters + imported.plotThreads + imported.chapters + 
                       imported.locations + imported.worldElements + imported.outlineNodes;

  const planningPages = [
    {
      id: 'characters' as const,
      title: 'Characters Page',
      description: 'Manage your imported characters with detailed profiles',
      icon: Users,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      iconColor: 'text-blue-600',
      count: imported.characters,
      features: [
        'Role-based organization with visual indicators',
        'Completeness scoring for character development',
        'Canvas integration via atom button dropdown',
        'Search and filter by role, name, or traits'
      ],
      distribution: planningPageDistribution.charactersPage,
      nextSteps: [
        'Review character roles and adjust if needed',
        'Complete missing character details (motivation, personality)',
        'Add character relationships and connections',
        'Link characters to plot threads and locations'
      ]
    },
    {
      id: 'plot' as const,
      title: 'Plot Development',
      description: 'Track your story\'s plot threads and narrative structure',
      icon: BookOpen,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      iconColor: 'text-purple-600',
      count: imported.plotThreads,
      features: [
        'Plot thread management with tension curves',
        'Progress tracking with completion percentages',
        'Type-based filtering (main, subplot, character arc)',
        'Connected character relationship mapping'
      ],
      distribution: planningPageDistribution.plotPage,
      nextSteps: [
        'Review plot thread types and adjust categories',
        'Set up tension curves for dramatic pacing',
        'Connect plot threads to relevant characters',
        'Add detailed plot events and milestones'
      ]
    },
    {
      id: 'world-building' as const,
      title: 'World Building',
      description: 'Explore your story\'s locations and world elements',
      icon: Globe,
      color: 'bg-green-50 border-green-200 text-green-700',
      iconColor: 'text-green-600',
      count: imported.worldElements + imported.locations,
      features: [
        'Category-based organization (location, culture, technology)',
        'Rich detail views with geography and cultural data',
        'Image support for visual world building',
        'Connection mapping between world elements'
      ],
      distribution: planningPageDistribution.worldBuildingPage,
      nextSteps: [
        'Review world element categories and reorganize',
        'Add images and visual references',
        'Expand cultural and geographic details',
        'Map connections between locations and characters'
      ]
    },
    {
      id: 'outline' as const,
      title: 'Story Outline',
      description: 'Navigate your hierarchical story structure',
      icon: FileText,
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      iconColor: 'text-orange-600',
      count: imported.outlineNodes + imported.chapters,
      features: [
        'Hierarchical act/chapter/scene structure',
        'Word count tracking with targets',
        'Status progression from planned to published',
        'Character appearance tracking per chapter'
      ],
      distribution: planningPageDistribution.outlinePage,
      nextSteps: [
        'Review chapter organization and structure',
        'Set word count targets for each chapter',
        'Add scene breakdowns within chapters',
        'Track character appearances and arcs'
      ]
    }
  ];

  const getRecommendedStartingPage = () => {
    const counts = [
      { page: 'characters', count: imported.characters },
      { page: 'plot', count: imported.plotThreads },
      { page: 'world-building', count: imported.worldElements + imported.locations },
      { page: 'outline', count: imported.outlineNodes + imported.chapters }
    ];
    
    return counts.reduce((max, current) => 
      current.count > max.count ? current : max
    ).page;
  };

  const recommendedPage = getRecommendedStartingPage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
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
          </div>

          {/* Import Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Import Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imported.characters > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{imported.characters}</div>
                  <div className="text-sm text-gray-600">Characters</div>
                </div>
              )}
              {imported.plotThreads > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{imported.plotThreads}</div>
                  <div className="text-sm text-gray-600">Plot Threads</div>
                </div>
              )}
              {(imported.worldElements + imported.locations) > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {imported.worldElements + imported.locations}
                  </div>
                  <div className="text-sm text-gray-600">World Elements</div>
                </div>
              )}
              {(imported.outlineNodes + imported.chapters) > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {imported.outlineNodes + imported.chapters}
                  </div>
                  <div className="text-sm text-gray-600">Outline Items</div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigateToPlanning(recommendedPage as any)}
                className="flex items-center gap-2 px-4 py-2 bg-[#ff4e00] text-white rounded-lg hover:bg-[#ff4e00]/80 transition-colors"
              >
                <Target className="w-4 h-4" />
                Start with {planningPages.find(p => p.id === recommendedPage)?.title}
                <span className="text-xs bg-white/20 px-2 py-1 rounded">Recommended</span>
              </button>
              
              <button
                onClick={onNavigateToCanvas}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Visualize on Canvas
              </button>
            </div>
          </div>

          {/* Planning Pages Overview */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Your Content Distribution</h3>
            
            {planningPages.filter(page => page.count > 0).map((page) => (
              <div key={page.id} className={`border rounded-lg p-4 ${page.color}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      <page.icon className={`w-5 h-5 ${page.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{page.title}</h4>
                      <p className="text-sm opacity-80">{page.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold">{page.count}</div>
                      <div className="text-xs opacity-70">items</div>
                    </div>
                    <button
                      onClick={() => onNavigateToPlanning(page.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-white text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                    >
                      View
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Distribution Info */}
                {page.distribution.length > 0 && (
                  <div className="mb-3">
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

                {/* Features */}
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">Available features:</div>
                  <div className="flex flex-wrap gap-1">
                    {page.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="text-xs bg-white/50 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                    {page.features.length > 3 && (
                      <span className="text-xs bg-white/30 px-2 py-1 rounded">
                        +{page.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Next Steps */}
                <details className="group">
                  <summary className="text-sm font-medium cursor-pointer hover:opacity-80 flex items-center gap-2">
                    Recommended next steps
                    <ArrowRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                  </summary>
                  <ul className="mt-2 text-xs space-y-1 opacity-90 pl-4">
                    {page.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
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
                onClick={() => onNavigateToPlanning(recommendedPage as any)}
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
