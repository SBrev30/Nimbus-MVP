import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Zap, 
  Users, 
  BookOpen, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  Eye,
  MoreHorizontal,
  Sparkles,
  Target,
  Link
} from 'lucide-react';
import type { AnalysisType } from '../../types/ai-analysis';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  nodeId: string | null;
  nodeType: string | null;
  nodeData: any;
  onClose: () => void;
  onAnalyze: (nodeId: string, analysisType: AnalysisType) => void;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onViewDetails: (nodeId: string) => void;
  onConnectNodes?: (nodeId: string) => void;
}

interface MenuOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
  submenu?: MenuOption[];
}

export function ContextMenu({
  isOpen,
  position,
  nodeId,
  nodeType,
  nodeData,
  onClose,
  onAnalyze,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onConnectNodes
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Calculate menu position to keep it on screen
  const getMenuStyle = () => {
    if (!isOpen) return { display: 'none' };

    const menuWidth = 240;
    const menuHeight = 300;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = position.x;
    let top = position.y;

    // Adjust if menu would go off screen
    if (left + menuWidth > windowWidth) {
      left = position.x - menuWidth;
    }
    if (top + menuHeight > windowHeight) {
      top = position.y - menuHeight;
    }

    // Ensure minimum distance from edges
    left = Math.max(10, Math.min(left, windowWidth - menuWidth - 10));
    top = Math.max(10, Math.min(top, windowHeight - menuHeight - 10));

    return {
      position: 'fixed' as const,
      left: `${left}px`,
      top: `${top}px`,
      zIndex: 9999
    };
  };

  const getAnalysisOptions = (): MenuOption[] => {
    const baseAnalysisTypes: { type: AnalysisType; label: string; icon: React.ReactNode }[] = [
      { type: 'general', label: 'General Analysis', icon: <Brain size={16} /> },
      { type: 'character', label: 'Character Analysis', icon: <Users size={16} /> },
      { type: 'plot', label: 'Plot Analysis', icon: <BookOpen size={16} /> },
      { type: 'research', label: 'Research Analysis', icon: <Search size={16} /> }
    ];

    // Filter analysis types based on node type
    let availableTypes = baseAnalysisTypes;
    
    if (nodeType === 'character' || nodeData?.type === 'Character') {
      availableTypes = baseAnalysisTypes.filter(t => 
        ['character', 'general'].includes(t.type)
      );
    } else if (nodeType === 'plot' || nodeData?.type === 'Plot') {
      availableTypes = baseAnalysisTypes.filter(t => 
        ['plot', 'general'].includes(t.type)
      );
    } else if (nodeType === 'research' || nodeData?.type === 'Research') {
      availableTypes = baseAnalysisTypes.filter(t => 
        ['research', 'general'].includes(t.type)
      );
    }

    return availableTypes.map(({ type, label, icon }) => ({
      id: `analyze-${type}`,
      label,
      icon,
      action: () => {
        if (nodeId) {
          onAnalyze(nodeId, type);
          onClose();
        }
      }
    }));
  };

  const menuOptions: MenuOption[] = [
    // AI Analysis submenu
    {
      id: 'ai-analysis',
      label: 'AI Analysis',
      icon: <Sparkles size={16} />,
      action: () => setSubmenuOpen(submenuOpen === 'ai-analysis' ? null : 'ai-analysis'),
      submenu: getAnalysisOptions()
    },
    
    // Quick AI Actions
    {
      id: 'quick-analyze',
      label: 'Quick Analyze',
      icon: <Zap size={16} />,
      action: () => {
        if (nodeId) {
          // Use the most appropriate analysis type for this node
          const analysisType = getDefaultAnalysisType(nodeType, nodeData);
          onAnalyze(nodeId, analysisType);
          onClose();
        }
      }
    },

    { id: 'separator-1', label: '', icon: null, action: () => {}, separator: true },

    // Standard node actions
    {
      id: 'view-details',
      label: 'View Details',
      icon: <Eye size={16} />,
      action: () => {
        if (nodeId) {
          onViewDetails(nodeId);
          onClose();
        }
      }
    },

    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit size={16} />,
      action: () => {
        if (nodeId) {
          onEdit(nodeId);
          onClose();
        }
      }
    },

    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <Copy size={16} />,
      action: () => {
        if (nodeId) {
          onDuplicate(nodeId);
          onClose();
        }
      }
    },

    // Connect nodes option (if available)
    ...(onConnectNodes ? [{
      id: 'connect',
      label: 'Connect to Node',
      icon: <Link size={16} />,
      action: () => {
        if (nodeId) {
          onConnectNodes(nodeId);
          onClose();
        }
      }
    }] : []),

    { id: 'separator-2', label: '', icon: null, action: () => {}, separator: true },

    // Destructive action
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={16} />,
      action: () => {
        if (nodeId) {
          onDelete(nodeId);
          onClose();
        }
      }
    }
  ];

  if (!isOpen || !nodeId) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      style={getMenuStyle()}
      className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[240px] max-w-[280px]"
    >
      {/* Node Info Header */}
      <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-sm font-medium text-gray-700 truncate">
            {nodeData?.title || nodeData?.name || `${nodeType} Node`}
          </span>
        </div>
        {nodeData?.contentType && (
          <div className="text-xs text-gray-500 mt-1">
            Type: {nodeData.contentType}
          </div>
        )}
      </div>

      {/* Menu Options */}
      <div className="py-1">
        {menuOptions.map((option) => {
          if (option.separator) {
            return (
              <div key={option.id} className="border-t border-gray-100 my-1" />
            );
          }

          const hasSubmenu = option.submenu && option.submenu.length > 0;
          const isSubmenuOpen = submenuOpen === option.id;

          return (
            <div key={option.id} className="relative">
              <button
                onClick={option.action}
                disabled={option.disabled}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-sm text-left
                  transition-colors relative
                  ${option.disabled 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : option.id === 'delete'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                  ${isSubmenuOpen ? 'bg-gray-100' : ''}
                `}
              >
                <span className="flex-shrink-0">{option.icon}</span>
                <span className="flex-1">{option.label}</span>
                {hasSubmenu && (
                  <MoreHorizontal size={14} className="text-gray-400" />
                )}
              </button>

              {/* Submenu */}
              {hasSubmenu && isSubmenuOpen && option.submenu && (
                <div className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] z-10">
                  {option.submenu.map((subOption) => (
                    <button
                      key={subOption.id}
                      onClick={subOption.action}
                      disabled={subOption.disabled}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 text-sm text-left
                        transition-colors
                        ${subOption.disabled 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <span className="flex-shrink-0">{subOption.icon}</span>
                      <span className="flex-1">{subOption.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer with keyboard shortcut hint */}
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
        <div className="text-xs text-gray-500">
          Press <kbd className="bg-gray-200 px-1 rounded">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}

// Helper function to determine default analysis type
function getDefaultAnalysisType(nodeType: string | null, nodeData: any): AnalysisType {
  if (nodeType === 'character' || nodeData?.type === 'Character') {
    return 'character';
  }
  if (nodeType === 'plot' || nodeData?.type === 'Plot') {
    return 'plot';
  }
  if (nodeType === 'research' || nodeData?.type === 'Research') {
    return 'research';
  }
  if (nodeData?.contentType) {
    switch (nodeData.contentType.toLowerCase()) {
      case 'character': return 'character';
      case 'plot': return 'plot';
      case 'research': return 'research';
      case 'chapter': return 'chapter';
      default: return 'general';
    }
  }
  
  return 'general';
}
