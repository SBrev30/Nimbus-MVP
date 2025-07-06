// src/components/Breadcrumb.tsx - Updated breadcrumb logic

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  activeView: string;
  currentChapter?: { id: string; title: string } | null;
  projectTitle?: string;
  onNavigate?: (view: string) => void;
}

export function Breadcrumb({ activeView, currentChapter, projectTitle, onNavigate }: BreadcrumbProps) {
  const getBreadcrumbPath = () => {
    const basePath = [
      { label: 'WorkSpace', view: 'dashboard', href: '#' }
    ];

    switch (activeView) {
      case 'write':
        return [
          ...basePath,
          { label: 'Projects', view: 'projects', href: '#' },
          { label: 'Write', view: 'write', href: '#', active: true }
        ];
      
      case 'projects':
        return [
          ...basePath,
          { label: 'Projects', view: 'projects', href: '#', active: true }
        ];
      
      case 'editor':
        return [
          ...basePath,
          { label: 'Projects', view: 'projects', href: '#' },
          { label: 'Write', view: 'write', href: '#' },
          { label: currentChapter?.title || 'Chapter', view: 'editor', href: '#', active: true }
        ];
      
      case 'canvas':
        return [
          ...basePath,
          { label: 'Canvas', view: 'canvas', href: '#', active: true }
        ];
      
      case 'planning':
        return [
          ...basePath,
          { label: 'Planning', view: 'planning', href: '#', active: true }
        ];
      
      case 'outline':
        return [
          ...basePath,
          { label: 'Planning', view: 'planning', href: '#' },
          { label: 'Outline', view: 'outline', href: '#', active: true }
        ];
      
      case 'plot':
        return [
          ...basePath,
          { label: 'Planning', view: 'planning', href: '#' },
          { label: 'Plot', view: 'plot', href: '#', active: true }
        ];
      
      case 'characters':
        return [
          ...basePath,
          { label: 'Planning', view: 'planning', href: '#' },
          { label: 'Characters', view: 'characters', href: '#', active: true }
        ];
      
      case 'world-building':
        return [
          ...basePath,
          { label: 'Planning', view: 'planning', href: '#' },
          { label: 'World Building', view: 'world-building', href: '#', active: true }
        ];
      
      case 'files':
        return [
          ...basePath,
          { label: 'Files', view: 'files', href: '#', active: true }
        ];
      
      case 'settings':
        return [
          ...basePath,
          { label: 'Settings', view: 'settings', href: '#', active: true }
        ];
      
      case 'history':
        return [
          ...basePath,
          { label: 'Settings', view: 'settings', href: '#' },
          { label: 'History', view: 'history', href: '#', active: true }
        ];
      
      case 'integrations':
        return [
          ...basePath,
          { label: 'Settings', view: 'settings', href: '#' },
          { label: 'Integrations', view: 'integrations', href: '#', active: true }
        ];
      
      case 'help':
        return [
          ...basePath,
          { label: 'Help & Support', view: 'help', href: '#', active: true }
        ];

      case 'help-topics':
        return [
          ...basePath,
          { label: 'Help & Support', view: 'help', href: '#' },
          { label: 'Help Topics', view: 'help-topics', href: '#', active: true }
        ];

      case 'get-started':
        return [
          ...basePath,
          { label: 'Help & Support', view: 'help', href: '#' },
          { label: 'Get Started', view: 'get-started', href: '#', active: true }
        ];

      case 'ask-question':
        return [
          ...basePath,
          { label: 'Help & Support', view: 'help', href: '#' },
          { label: 'Ask A Question', view: 'ask-question', href: '#', active: true }
        ];

      case 'get-feedback':
        return [
          ...basePath,
          { label: 'Help & Support', view: 'help', href: '#' },
          { label: 'Get Feedback', view: 'get-feedback', href: '#', active: true }
        ];
      
      default:
        return [
          ...basePath,
          { label: 'Dashboard', view: 'dashboard', href: '#', active: true }
        ];
    }
  };

  const breadcrumbs = getBreadcrumbPath();

  const handleBreadcrumbClick = (item: any) => {
    if (onNavigate && item.view) {
      onNavigate(item.view);
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-[#889096] font-semibold">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-[#889096]" />}
          <button
            onClick={() => handleBreadcrumbClick(item)}
            className={`font-inter transition-colors font-semibold hover:text-gray-700 ${
              item.active
                ? 'text-gray-900'
                : 'text-[#889096]'
            }`}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}
