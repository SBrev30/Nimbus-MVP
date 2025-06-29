import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp,
  User,
  LogOut,
  Cloud,
  LayoutDashboard,
  Edit3,
  Layers,
  Search,
  Folder,
  Settings,
  HelpCircle,
  PanelLeftClose
} from 'lucide-react';

// Nimbus Note Logo Component
const NimbusLogo = ({ isCollapsed }: { isCollapsed: boolean }) => {
  if (isCollapsed) {
    return (
      <svg 
        version="1.1" 
        viewBox="0 0 107.5 112.6" 
        className="w-8 h-8 text-gray-800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill="currentColor" d="M61.8,69.1c-4-3.4-9.2-8-14.7-12.9l0,0C33.8,44.4,18.9,31.5,18.6,31c-0.6-0.7-1.6-0.6-1.8-0.6c-0.1,0,0,0,0,0H4.5
        c-1.2,0-2.2,1-2.2,2.2v48c0,1.2,1,2.2,2.2,2.2h9.7c0.1,0,0.3,0,0.3-0.3V45.4l0,0l0,0l0,0l0,0c0-0.6,0.6-1,1.2-1s0.4,0,0.6,0.1l0,0
        l0,0c0,0,0,0,0.1,0l21.8,18.9l0,0l4,3.4l0,0l13.8,12l3.1,2.7l0,0c1.6,1.9,2.5,4.3,2.5,7c0,6.4-5.5,11.6-12.2,11.6
        s-12.2-5.2-12.2-11.6s1.5-6.2,3.9-8.3s0-0.3,0-0.4l-8.3-7.1c0,0-0.3,0-0.4,0c-4.3,4.2-6.8,9.8-6.8,15.9c0,12.6,10.7,22.7,24.1,22.7
        S73.7,101,73.7,88.5s-4.3-13.1-4.6-13.4s0,0,0,0c-0.1-0.1-3-2.7-7.1-6.2L61.8,69.1z"/>
        <path fill="currentColor" d="M45.8,44c4,3.4,9.2,8,14.7,12.9l0,0C73.9,68.6,88.7,81.6,89,82c0.6,0.7,1.8,0.6,1.8,0.6h2.1h1.3h8.9c1.2,0,2.2-1,2.2-2.2
        v-48c0-1.2-1-2.2-2.2-2.2h-10v37.4l0,0l0,0l0,0l0,0c0,0.6-0.6,1-1.2,1s-0.4,0-0.6-0.1l0,0l0,0c0,0,0,0-0.1,0L69.4,49.6l0,0l-4-3.4
        l0,0l-13.8-12l-3.1-2.7c-1.6-1.9-2.5-4.3-2.5-7c0-6.4,5.5-11.6,12.2-11.6c6.7,0,12.2,5.2,12.2,11.6s-1.6,6.5-4,8.6l8.8,7.6
        c4.3-4.2,7-9.8,7-16.2C82,11.9,71.4,1.8,58,1.8S33.9,12.1,33.9,24.5s4.6,13.4,4.6,13.4s2.8,2.5,7.1,6.2L45.8,44z"/>
      </svg>
    );
  }
  
  return (
    <div className="flex items-center space-x-3">
      <svg 
        version="1.1" 
        viewBox="0 0 608.8 118" 
        className="h-8 w-auto text-gray-800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill="currentColor" d="M73.1,74.5c-4-3.4-9.2-8-14.7-12.9l0,0C45,49.9,30.2,36.9,29.9,36.5c-0.6-0.7-1.6-0.6-1.8-0.6c-0.1,0,0,0,0,0H15.8
        c-1.2,0-2.2,1-2.2,2.2v48c0,1.2,1,2.2,2.2,2.2h9.7c0.1,0,0.3,0,0.3-0.3V50.9l0,0l0,0l0,0l0,0c0-0.6,0.6-1,1.2-1c0.6,0,0.4,0,0.6,0.1
        l0,0l0,0c0,0,0,0,0.1,0l21.8,18.9l0,0l4,3.4l0,0l13.8,12l3.1,2.7l0,0c1.6,1.9,2.5,4.3,2.5,7c0,6.4-5.5,11.6-12.2,11.6
        S48.6,100.3,48.6,94s1.5-6.2,3.9-8.3c2.4-2.1,0-0.3,0-0.4l-8.3-7.1c0,0-0.3,0-0.4,0c-4.3,4.2-6.8,9.8-6.8,15.9
        c0,12.6,10.7,22.7,24.1,22.7S85,106.4,85,94s-4.3-13.1-4.6-13.4c-0.3-0.3,0,0,0,0c-0.1-0.1-3-2.7-7.1-6.2L73.1,74.5z"/>
        <path fill="currentColor" d="M57,49.4c4,3.4,9.2,8,14.7,12.9l0,0C85.1,74.1,100,87,100.3,87.4c0.6,0.7,1.8,0.6,1.8,0.6h2.1h1.3h8.9c1.2,0,2.2-1,2.2-2.2
        v-48c0-1.2-1-2.2-2.2-2.2h-10V73l0,0l0,0l0,0l0,0c0,0.6-0.6,1-1.2,1s-0.4,0-0.6-0.1l0,0l0,0c0,0,0,0-0.1,0L80.7,55.1l0,0l-4-3.4l0,0
        l-13.8-12L59.7,37c-1.6-1.9-2.5-4.3-2.5-7c0-6.4,5.5-11.6,12.2-11.6S81.5,23.6,81.5,30s-1.6,6.5-4,8.6l8.8,7.6c4.3-4.2,7-9.8,7-16.2
        c0-12.6-10.7-22.7-24.1-22.7S45.2,17.5,45.2,30s4.6,13.4,4.6,13.4s2.8,2.5,7.1,6.2L57,49.4z"/>
        <g>
          <path fill="currentColor" d="M150.8,35.9h9.1l22.2,34.6l3.4,6.2l-0.2-40.9h8.7v53h-9.1l-22.2-34.5l-3.4-6.5l0.2,41h-8.7V35.9z"/>
          <path fill="currentColor" d="M205.2,32.8h8.3v9.4h-8.3V32.8z M205.2,47.4h8.3v41.6h-8.3V47.4z"/>
          <path fill="currentColor" d="M224,47.4h8.3v5.3c2.7-4.3,6.8-6.4,11.7-6.4c5.5,0,9.7,2.4,11.7,7.2c2.7-4.8,7.3-7.2,12.7-7.2c8.2,0,13.5,5.1,13.5,14.9
          v27.8h-8.3V62.9c0-6-2.3-9.7-7.4-9.7c-5.6,0-9,5.5-9,11.3v24.4h-8.3V62.9c0-6-2.3-9.7-7.4-9.7c-5.6,0-9,5.5-9,11.3v24.4H224V47.4z"/>
          <path fill="currentColor" d="M292.4,88.9V32.8h8.3v19.4c2.7-3.8,6.6-5.9,11.3-5.9c10.9,0,17.6,8.2,17.6,21.8c0,14.1-6.8,21.9-17.6,21.9
          c-4.8,0-8.7-2-11.3-5.7v4.7H292.4z M300.8,68c0,9.5,3.7,14.9,10.2,14.9c6.6,0,10.1-5.2,10.1-14.9c0-9.4-3.7-14.7-10.1-14.7
          C304.3,53.3,300.8,58.5,300.8,68z"/>
          <path fill="currentColor" d="M364.4,47.4h8.3v41.6h-8.3v-5.6c-2.7,4.4-7.1,6.6-12.4,6.6c-8.5,0-13.8-5-13.8-14.8V47.4h8.3v26.1c0,6,2.5,9.6,8,9.6
          c6.1,0,9.8-5.5,9.8-11.3V47.4z"/>
          <path fill="currentColor" d="M416.4,76.9c0,7.9-7.1,13-17.2,13s-17.2-4.7-18.7-14.6h8.3c0.9,5.2,4.8,8.1,10.6,8.1c5.6,0,8.6-2.5,8.6-6
          c0-10.4-26.2-1.6-26.2-18.7c0-6.5,5.1-12.5,15.6-12.5c9.3,0,16.1,4.3,17.5,14.7h-8.3c-0.9-5.9-4.2-8-9.5-8c-4.6,0-7.3,2.3-7.3,5.4
          C389.8,68.9,416.4,60,416.4,76.9z"/>
          <path fill="currentColor" d="M440.6,35.9h9.1L472,70.5l3.4,6.2l-0.2-40.9h8.7v53h-9.1l-22.2-34.5l-3.4-6.5l0.2,41h-8.7V35.9z"/>
          <path fill="currentColor" d="M493,68.2c0-14.1,7.6-21.9,19.4-21.9c12.1,0,19.4,8.3,19.4,21.9c0,14-7.6,21.8-19.4,21.8C500.3,89.9,493,81.7,493,68.2z
          M523.3,68.2c0-9.5-3.9-14.9-10.9-14.9s-10.9,5.2-10.9,14.9c0,9.4,3.9,14.7,10.9,14.7C519.5,82.9,523.3,77.8,523.3,68.2z"/>
          <path fill="currentColor" d="M541.4,53.8h-5.6v-6.5h5.6v-9.6h8.3v9.6h9v6.5h-9v22.2c0,4.8,1.3,7,7.2,7h1.6v6.1c-0.9,0.5-2.9,0.8-5.2,0.8
          c-8.1,0-11.9-4.4-11.9-13.4V53.8z"/>
          <path fill="currentColor" d="M583.1,89.9c-12.2,0-19.7-8.2-19.7-21.8c0-14.1,7.5-21.9,19.3-21.9c12,0,19.3,8.1,19.3,21.5v2h-30.1
          c0.5,8.5,4.4,13.3,11.2,13.3c5.3,0,9-2.5,10.5-7.6h8.7C600,85,592.8,89.9,583.1,89.9z M572.1,64h21.2c-1-7-4.7-10.8-10.6-10.8
          C576.7,53.2,573.1,57,572.1,64z"/>
        </g>
      </svg>
    </div>
  );
};

// User Avatar Component
const UserAvatar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const initials = "SB"; // SBrev30 initials
  
  return (
    <div className={`${isCollapsed ? 'w-6 h-6' : 'w-8 h-8'} bg-white-200 rounded-lg flex items-center justify-center border-2 border-gray-300 hover:border-[#e8ddc1] transition-colors duration-150`}>
      <span className={`text-gray-700 font-semibold ${isCollapsed ? 'text-xs' : 'text-sm'}`}>{initials}</span>
    </div>
  );
};

// Enhanced Tooltip Component for collapsed state
const Tooltip = ({ content, children, position = 'right' }: { 
  content: string; 
  children: React.ReactNode;
  position?: 'right' | 'left' | 'top' | 'bottom';
}) => {
  const positionClasses = {
    right: 'left-16 top-1/2 transform -translate-y-1/2',
    left: 'right-16 top-1/2 transform -translate-y-1/2',
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2'
  };

  return (
    <div className="relative group">
      {children}
      <div className={`absolute ${positionClasses[position]} px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100] whitespace-nowrap`}>
        {content}
        {/* Arrow for tooltip */}
        {position === 'right' && (
          <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
        )}
      </div>
    </div>
  );
};

// Enhanced Dropdown Menu for collapsed state
const CollapsedDropdownMenu = ({ 
  item, 
  onItemClick, 
  activeView 
}: { 
  item: any; 
  onItemClick: (view: string) => void;
  activeView: string;
}) => (
  <div className="absolute left-16 top-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-[100] w-48">
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
                  ? 'bg-[#e8ddc1] text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-[#e8ddc1] hover:text-gray-900'
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
          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-[#e8ddc1] hover:text-gray-900 transition-colors duration-150"
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
    icon: LayoutDashboard,
  },
  {
    id: 'write',
    label: 'Write',
    icon: Edit3,
    hasDropdown: true,
    subItems: [
      { id: 'projects', label: 'Projects' }
    ]
  },
  {
    id: 'canvas',
    label: 'Canvas',
    icon: Layers,
    isNew: true
  },
  {
    id: 'planning',
    label: 'Planning',
    icon: Search,
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
    icon: Folder,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    hasDropdown: true,
    subItems: [
      { id: 'history', label: 'History' },
      { id: 'integrations', label: 'Integrations' }
    ]
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle,
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } flex flex-col flex-shrink-0`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <Tooltip content="Nimbus Note" position={isCollapsed ? 'right' : 'bottom'}>
              <div>
                <NimbusLogo isCollapsed={isCollapsed} />
              </div>
            </Tooltip>
          </div>
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
                        className={`w-full flex items-center justify-center px-3 py-2.5 rounded-lg transition-colors duration-150 relative ${
                          isActive 
                            ? 'bg-[#e8ddc1] text-gray-900' 
                            : 'text-gray-600 hover:bg-[#e8ddc1] hover:text-gray-900'
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
                          ? 'bg-[#e8ddc1] text-gray-900' 
                          : 'text-gray-600 hover:bg-[#e8ddc1] hover:text-gray-900'
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
                                  ? 'bg-[#e8ddc1] text-gray-900 font-medium'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-[#e8ddc1]'
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
            <div className={`flex items-center p-3 rounded-lg bg-gray-50 hover:bg-[#e8ddc1] transition-colors duration-150 ${
              isCollapsed ? 'justify-center' : 'space-x-3'
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
                    <button className="p-1 hover:bg-[#e8ddc1] rounded transition-colors duration-150">
                      <User className="w-4 h-4 text-gray-400" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Sign Out">
                    <button className="p-1 hover:bg-[#e8ddc1] rounded transition-colors duration-150">
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
                  className="w-full flex justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-[#e8ddc1] rounded-lg transition-colors duration-150 border border-gray-200 hover:shadow-sm"
                >
                  <PanelLeftClose className="w-4 h-4 rotate-180" />
                </button>
              </Tooltip>
            ) : (
              <button 
                onClick={() => setIsCollapsed(true)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-[#e8ddc1] rounded-lg transition-colors duration-150 border border-gray-200 hover:shadow-sm"
              >
                <PanelLeftClose className="w-4 h-4" />
                <span className="font-medium">Collapse</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Sidebar = EnhancedNimbusSidebar;
