import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  activeView: string;
  onNavigate?: (view: string) => void;
}

export function Breadcrumb({ activeView, onNavigate }: BreadcrumbProps) {
  const getBreadcrumbPath = () => {
    const basePath = [
      { label: 'Nimbus Note', view: 'dashboard', href: '#' }
    ];

    switch (activeView) {
      case 'canvas':
        return [
          ...basePath,
          { label: 'Canvas', view: 'canvas', href: '#', active: true }
        ];
      
      case 'library':
        return [
          ...basePath,
          { label: 'Library', view: 'library', href: '#', active: true }
        ];
      
      case 'files':
        return [
          ...basePath,
          { label: 'Files', view: 'files', href: '#', active: true }
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