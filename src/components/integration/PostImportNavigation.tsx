// src/components/integration/PostImportNavigation.tsx - UPDATED

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
  Zap,
  Library,
  FolderOpen
} from 'lucide-react';
import { ImportResult } from '../../services/enhanced-supabase-import-service';

interface PostImportNavigationProps {
  importResult: ImportResult;
  onNavigateToPlanning: (page: 'characters' | 'plot' | 'world-building' | 'outline') => void;
  onNavigateToCanvas: () => void;
  onNavigateToLibrary?: () => void; // NEW: Library navigation
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
    ).page
