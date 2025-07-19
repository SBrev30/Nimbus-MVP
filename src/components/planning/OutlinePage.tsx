import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus, BookOpen, ChevronRight, ChevronDown, MoreVertical, Trash2 } from 'lucide-react';
import { outlineService, type OutlineNode, type CreateOutlineNodeData } from '../../services/outlineService';
import { CreateOutlineNodeModal } from './CreateOutlineNodeModal';

interface OutlinePageProps {
  onBack: () => void;
}

export function OutlinePage({ onBack }: OutlinePageProps) {
  const [outlineData, setOutlineData] = useState<OutlineNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedParentNode, setSelectedParentNode] = useState<{
    id: string;
    title: string;
    type: 'act' | 'chapter' | 'scene';
  } | undefined>();
  const [stats, setStats] = useState({
    totalNodes: 0,
    totalWordCount: 0,
    targetWordCount: 0,
    completion: 0
  });

  // Get current project ID - in a real app, this would come from context/props
  // For now, we'll use the existing project from your database
  const currentProjectId = "90994f56-c3b1-4ae7-87bd-5020cc2f29f2";

  // Load outline data
  const loadOutlineData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nodes, statistics] = await Promise.all([
        outlineService.getOutlineNodes(currentProjectId),
        outlineService.getOutlineStats(currentProjectId)
      ]);
      
      setOutlineData(nodes);
      setStats(statistics);
    } catch (error) {
      console.error('Error loading outline data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentProjectId]);

  useEffect(() => {
    loadOutlineData();
  }, [loadOutlineData]);

  const handleCreateNode = useCallback(async (data: CreateOutlineNodeData) => {
    const newNode = await outlineService.createOutlineNode(data);
    if (newNode) {
      await loadOutlineData(); // Reload data to get the updated structure
      
      // Expand the parent node if creating a child
      if (data.parentId) {
        setExpandedNodes(prev => new Set([...prev, data.parentId!]));
      }
    }
  }, [loadOutlineData]);

  const handleAddRootNode = useCallback(() => {
    setSelectedParentNode(undefined);
    setIsCreateModalOpen(true);
  }, []);

  const handleAddChildNode = useCallback((parentNode: OutlineNode) => {
    setSelectedParentNode({
      id: parentNode.id,
      title: parentNode.title,
      type: parentNode.type
    });
    setIsCreateModalOpen(true);
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

  const handleDeleteNode = useCallback(async (nodeId: string) => {
    if (window.confirm('Are you sure you want to delete this node and all its children?')) {
      const success = await outlineService.deleteOutlineNode(nodeId);
      if (success) {
        await loadOutlineData();
      }
    }
  }, [loadOutlineData]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen bg-[#f2eee2] flex flex-col font-inter">
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
              <p className="text-[#889096] mt-1">Loading your story structure...</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#ff4e00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#889096]">Loading outline...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state when no outline exists
  if (outlineData.length === 0) {
    return (
      <>
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
                onClick={handleAddRootNode}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff4e00] hover:bg-[#ff4e00]/80 rounded-lg transition-colors font-semibold text-white"
              >
                <Plus className="w-5 h-5" />
                Create First Act
              </button>
              
              {/* Tips */}
              <div className="bg-[#e8ddc1] rounded-lg p-4 text-left mt-8">
                <h3 className="font-semibold text-gray-900 mb-3 text-center">Story Structure Tips</h3>
                <ul className="space-y-2 text-sm text-gray-800">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Start with three acts: Setup, Confrontation, Resolution
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Break each act into chapters with clear goals
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Add scenes within chapters for detailed planning
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Set word count targets to track progress
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Create Modal */}
        <CreateOutlineNodeModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateNode={handleCreateNode}
          projectId={currentProjectId}
          parentNode={selectedParentNode}
        />
      </>
    );
  }

  // Show content when outline exists
  return (
    <>
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
                  Hierarchical story structure with {stats.totalNodes} nodes
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleAddRootNode}
              className="flex items-center gap-2 px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 rounded-lg transition-colors font-semibold text-white"
            >
              <Plus className="w-4 h-4" />
              Add Act
            </button>
          </div>

          {/* Outline Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Total Word Count</div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.totalWordCount.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Target Word Count</div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.targetWordCount.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Completion</div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.completion}%
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
                onAddChild={handleAddChildNode}
                onDelete={handleDeleteNode}
                level={0}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <CreateOutlineNodeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateNode={handleCreateNode}
        projectId={currentProjectId}
        parentNode={selectedParentNode}
      />
    </>
  );
}

// Component for rendering individual outline nodes
interface OutlineNodeComponentProps {
  node: OutlineNode;
  isExpanded: boolean;
  onToggleExpanded: (nodeId: string) => void;
  onAddChild: (node: OutlineNode) => void;
  onDelete: (nodeId: string) => void;
  level: number;
}

const OutlineNodeComponent: React.FC<OutlineNodeComponentProps> = ({
  node,
  isExpanded,
  onToggleExpanded,
  onAddChild,
  onDelete,
  level
}) => {
  const [showActions, setShowActions] = useState(false);
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

  const canAddChild = (nodeType: string) => {
    return nodeType === 'act' || nodeType === 'chapter';
  };

  return (
    <div style={indentStyle}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors group">
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

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  {canAddChild(node.type) && (
                    <button
                      onClick={() => {
                        onAddChild(node);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Plus className="w-3 h-3" />
                      Add {node.type === 'act' ? 'Chapter' : 'Scene'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDelete(node.id);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              )}
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
              isExpanded={expandedNodes.has(childNode.id)}
              onToggleExpanded={onToggleExpanded}
              onAddChild={onAddChild}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
