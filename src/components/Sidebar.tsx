import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp,
  User,
  LogOut,
  Cloud
} from 'lucide-react';

// React Icons imports as specified
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { LuTextCursor } from "react-icons/lu";
import { RiStackLine } from "react-icons/ri";
import { RxMagnifyingGlass } from "react-icons/rx";
import { IoFolderOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { GoSidebarCollapse } from "react-icons/go";

// Nimbus Note Logo Component
const NimbusLogo = ({ isCollapsed }: { isCollapsed: boolean }) => {
  if (isCollapsed) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <Cloud className="w-5 h-5 text-white" />
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <Cloud className="w-5 h-5 text-white" />
      </div>
      <span className="font-bold text-gray-900">Nimbus Note</span>
    </div>
  );
};

// User Avatar Component
const UserAvatar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const initials = "SB"; // SBrev30 initials
  
  return (
    <div className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} bg-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300`}>
      <span className="text-gray-700 font-semibold text-sm">{initials}</span>
    </div>
  );
};

// Tooltip Component for collapsed state
const Tooltip = ({ content, children }: { content: string; children: React.ReactNode }) => (
  <div className="relative group">
    {children}
    <div className="absolute left-16 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[60] whitespace-nowrap">
      {content}
    </div>
  </div>
);

// Dropdown Menu for collapsed state
const CollapsedDropdownMenu = ({ 
  item, 
  onItemClick, 
  activeView 
}: { 
  item: any; 
  onItemClick: (view: string) => void;
  activeView: string;
}) => (
  <div className="absolute left-16 top-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-[60] w-48">
    <div className="px-3 py-2 text-sm font-semibold text-gray-900 border-b border-gray-100">
      {item.label}
    </div>
    {item.hasDropdown && item.subItems ? (
      <div className="py-1">
        {item.subItems.map((subItem: any) => {
          const isSubActive = activeView === subItem.id;
          return (
            <button
              key={subItem.id}
              onClick={() => onItemClick(subItem.id)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${
                isSubActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {subItem.label}
            </button>
          );
        })}
      </div>
    ) : (
      <div className="py-1">
        <button
          onClick={() => onItemClick(item.id)}
          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
        >
          Go to {item.label}
        </button>
      </div>
    )}
  </div>
);

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasDropdown?: boolean;
  subItems?: { id: string; label: string }[];
  isNew?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: RiDashboardHorizontalLine,
  },
  {
    id: 'write',
    label: 'Write',
    icon: LuTextCursor,
    hasDropdown: true,
    subItems: [
      { id: 'projects', label: 'Projects' }
    ]
  },
  {
    id: 'canvas',
    label: 'Canvas',
    icon: RiStackLine,
    isNew: true
  },
  {
    id: 'planning',
    label: 'Planning',
    icon: RxMagnifyingGlass,
    hasDropdown: true,
    subItems: [
      { id: 'outline', label: 'Outline' },
      { id: 'plot', label: 'Plot' },
      { id: 'characters', label: 'Characters' },
      { id: 'world-building', label: 'World Building' }
    ]
  },
  {
    id: 'files',
    label: 'Files',
    icon: IoFolderOutline,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: IoSettingsOutline,
    hasDropdown: true,
    subItems: [
      { id: 'history', label: 'History' },
      { id: 'integrations', label: 'Integrations' }
    ]
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: IoIosHelpCircleOutline,
    hasDropdown: true,
    subItems: [
      { id: 'help-topics', label: 'Help Topics' },
      { id: 'get-started', label: 'Get Started' },
      { id: 'ask-question', label: 'Ask A Question' },
      { id: 'give-feedback', label: 'Give Feedback' }
    ]
  }
];

interface SidebarProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export default function EnhancedNimbusSidebar({ activeView = 'dashboard', onViewChange }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['planning', 'settings']);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isExpanded = (itemId: string) => expandedItems.includes(itemId);

  const handleItemClick = (view: string) => {
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const isItemActive = (itemId: string, subItems?: { id: string; label: string }[]) => {
    return activeView === itemId || (subItems?.some(sub => activeView === sub.id));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } flex flex-col`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <NimbusLogo isCollapsed={isCollapsed} />
            {!isCollapsed && (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
          {!isCollapsed && (
            <div className="mt-2 text-sm text-gray-500">Visual Story Canvas</div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.id, item.subItems);

              if (isCollapsed) {
                return (
                  <li key={item.id} className="relative group">
                    <Tooltip content={item.label}>
                      <button
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full flex items-center justify-center px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                          isActive 
                            ? 'bg-gray-100 text-gray-900' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {item.isNew && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                        )}
                      </button>
                    </Tooltip>
                    
                    {/* Collapsed Dropdown Menu */}
                    {item.hasDropdown && (
                      <CollapsedDropdownMenu 
                        item={item}
                        onItemClick={handleItemClick}
                        activeView={activeView}
                      />
                    )}
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  <div>
                    <button
                      onClick={() => {
                        if (item.hasDropdown) {
                          toggleExpanded(item.id);
                        } else {
                          handleItemClick(item.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-colors duration-150 ${
                        isActive 
                          ? 'bg-gray-100 text-gray-900' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.isNew && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                            New
                          </span>
                        )}
                        {item.hasDropdown && (
                          <div className="flex-shrink-0">
                            {isExpanded(item.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Dropdown items */}
                  {item.hasDropdown && isExpanded(item.id) && (
                    <ul className="mt-1 ml-8 space-y-1">
                      {item.subItems?.map((subItem) => {
                        const isSubActive = activeView === subItem.id;
                        return (
                          <li key={subItem.id}>
                            <button 
                              onClick={() => handleItemClick(subItem.id)}
                              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                                isSubActive
                                  ? 'bg-gray-100 text-gray-900 font-medium'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              }`}
                            >
                              {subItem.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-gray-200">
          {/* User profile */}
          <div className="p-3">
            <div className={`flex items-center space-x-3 p-3 rounded-lg bg-gray-50 ${
              isCollapsed ? 'justify-center' : ''
            }`}>
              <UserAvatar isCollapsed={isCollapsed} />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">SBrev30</div>
                  <div className="text-sm text-gray-500">Admin</div>
                </div>
              )}
              {!isCollapsed && (
                <div className="flex space-x-1">
                  <Tooltip content="Profile">
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors duration-150">
                      <User className="w-4 h-4 text-gray-400" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Sign Out">
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors duration-150">
                      <LogOut className="w-4 h-4 text-gray-400" />
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>

          {/* Collapse button */}
          <div className="p-3">
            {isCollapsed ? (
              <Tooltip content="Expand Sidebar">
                <button 
                  onClick={() => setIsCollapsed(false)}
                  className="w-full flex justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150 border border-gray-200 hover:shadow-sm"
                >
                  <GoSidebarCollapse className="w-4 h-4 rotate-180" />
                </button>
              </Tooltip>
            ) : (
              <button 
                onClick={() => setIsCollapsed(true)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150 border border-gray-200 hover:shadow-sm"
              >
                <GoSidebarCollapse className="w-4 h-4" />
                <span className="font-medium">Collapse</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 capitalize">
            {activeView.replace('-', ' ')}
          </h1>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 mb-4">
              Currently viewing: <strong className="capitalize">{activeView.replace('-', ' ')}</strong>
            </p>
            <p className="text-gray-600">
              This enhanced Nimbus Note sidebar includes all CodeRabbit functionality:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>✅ Collapsible design with smooth animations</li>
              <li>✅ Dropdown menus (Planning, Settings, Help, Write)</li>
              <li>✅ Hover states and active states</li>
              <li>✅ Tooltips when collapsed</li>
              <li>✅ Mini dropdown menus for collapsed state</li>
              <li>✅ User profile section with non-gradient avatar</li>
              <li>✅ Responsive icons with React Icons</li>
              <li>✅ New badge for Canvas</li>
              <li>✅ Collapse button with border and hover shadow</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
