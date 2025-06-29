import React, { useState, useCallback } from 'react';
import { ArrowLeft, Plus, BookOpen, ChevronRight, ChevronDown, FileText } from 'lucide-react';

interface OutlinePageProps {
  onBack: () => void;
}

interface OutlineNode {
  id: string;
  projectId: string;
  parentId?: string;
  title: string;
  description: string;
  type: 'act' | 'chapter' | 'scene';
  orderIndex: number;
  wordCountTarget: number;
  wordCountCurrent: number;
  status: 'planned' | 'drafted' | 'revision' | 'complete';
  children?: OutlineNode[];
}

export function OutlinePage({ onBack }: OutlinePageProps) {
  // Start with empty data - no sample content
  const [outlineData, setOutlineData] = useState<OutlineNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const handleAddOutlineNode = useCallback(() => {
    // Handle adding a new outline node
    console.log('Add new outline node');
    // You would implement the actual creation logic here
  }, []);

  const toggleExpanded = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // Show empty state when no outline exists
  if (outlineData.length === 0) {
    return (
      <div className="h-screen bg-[#f2eee2] flex flex-col font-inter">
        {/* Header */}
        <div className="bg-white border-b border-[#C6C5C5] p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#889096]" />
            </button>
            
            <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">Story Outline</h1>
              <p className="text-[#889096] mt-1">
                Structure your narrative with acts, chapters, and scenes
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-[#e8ddc1] rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-gray-700" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Start Your Story Structure</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Create a detailed outline to organize your story's acts, chapters, and scenes. Build a roadmap that guides your writing journey.
            </p>
            <button
              onClick={handleAddOutlineNode}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff4e00] hover:bg-[#ff4e00]/80 rounded-lg transition-colors font-semibold text-gray-800"
            >
              <Plus className="w-5 h-5" />
              Create First Act
            </button>
            
            {/* Tips */}
            <div className="bg-[#e8ddc1] rounded-lg p-4 text-left mt-8">
              <h3 className="font-semibold text-gray-900 mb-3 text-center">💡 Story Structure Tips</h3>
              <ul className="space-y-2 text-sm text-gray-800">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  Start with three acts: Setup, Confrontation, Resolution
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  Break each act into chapters with clear goals
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  Add scenes within chapters for detailed planning
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                  Set word count targets to track progress
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show content when outline exists
  return (
    <div className="h-screen bg-[#F9FAFB] flex flex-col font-inter">
      {/* Header */}
      <div className="bg-white border-b border-[#C6C5C5] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#889096]" />
            </button>
            
            <div className="flex-1">
              <nav className="flex items-center space-x-2 text-sm text-[#889096] font-semibold mb-2">
                <button onClick={onBack} className="hover:text-gray-700 transition-colors">
                  Planning
                </button>
                <span className="text-[#889096]">›</span>
                <span className="text-gray-900">Outline</span>
              </nav>
              
              <h1 className="text-2xl font-semibold text-gray-900">Story Outline</h1>
              <p className="text-[#889096] mt-1">
                Hierarchical story structure with {outlineData.length} acts
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleAddOutlineNode}
            className="flex items-center gap-2 px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Node
          </button>
        </div>

        {/* Outline Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Total Word Count</div>
            <div className="text-lg font-semibold text-gray-900">
              {outlineData.reduce((sum, act) => sum + (act.wordCountCurrent || 0), 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Target Word Count</div>
            <div className="text-lg font-semibold text-gray-900">
              {outlineData.reduce((sum, act) => sum + (act.wordCountTarget || 0), 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Completion</div>
            <div className="text-lg font-semibold text-gray-900">
              {Math.round(
                (outlineData.reduce((sum, act) => sum + (act.wordCountCurrent || 0), 0) /
                 outlineData.reduce((sum, act) => sum + (act.wordCountTarget || 1), 0)) * 100
              )}%
            </div>
          </div>
        </div>
      </div>

      {/* Content - Outline Tree */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-2">
          {outlineData.map(node => (
            <OutlineNodeComponent
              key={node.id}
              node={node}
              isExpanded={expandedNodes.has(node.id)}
              onToggleExpanded={toggleExpanded}
              level={0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Component for rendering individual outline nodes
interface OutlineNodeComponentProps {
  node: OutlineNode;
  isExpanded: boolean;
  onToggleExpanded: (nodeId: string) => void;
  level: number;
}

const OutlineNodeComponent: React.FC<OutlineNodeComponentProps> = ({
  node,
  isExpanded,
  onToggleExpanded,
  level
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const indentStyle = { marginLeft: `${level * 1}rem` };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'revision': return 'bg-yellow-100 text-yellow-800';
      case 'drafted': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'act': return '📚';
      case 'chapter': return '📖';
      case 'scene': return '📝';
      default: return '📄';
    }
  };

  return (
    <div style={indentStyle}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {hasChildren && (
              <button
                onClick={() => onToggleExpanded(node.id)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                {isExpanded ? 
                  <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                }
              </button>
            )}
            
            <span className="text-lg">{getTypeIcon(node.type)}</span>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{node.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{node.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(node.status)}`}>
              {node.status}
            </span>
            
            <div className="text-right text-sm">
              <div className="font-medium text-gray-900">
                {node.wordCountCurrent?.toLocaleString() || 0} / {node.wordCountTarget?.toLocaleString() || 0}
              </div>
              <div className="text-gray-500">words</div>
            </div>
          </div>
        </div>
      </div>

      {/* Render children if expanded */}
      {isExpanded && hasChildren && (
        <div className="mt-2 space-y-2">
          {node.children!.map(childNode => (
            <OutlineNodeComponent
              key={childNode.id}
              node={childNode}
              isExpanded={false} // Children start collapsed
              onToggleExpanded={onToggleExpanded}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
