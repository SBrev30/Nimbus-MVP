// src/components/planning/CreateOutlineNodeModal.tsx
import React, { useState } from 'react';
import { X, BookOpen } from 'lucide-react';
import type { CreateOutlineNodeData } from '../../services/outlineService';

interface CreateOutlineNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNode: (data: CreateOutlineNodeData) => Promise<void>;
  projectId: string;
  parentNode?: {
    id: string;
    title: string;
    type: 'act' | 'chapter' | 'scene';
  };
}

const NODE_TYPE_INFO = {
  act: {
    title: 'Act',
    description: 'A major division of your story',
    icon: '📚',
    defaultWordCount: 25000,
    examples: ['Act I: Setup', 'Act II: Confrontation', 'Act III: Resolution']
  },
  chapter: {
    title: 'Chapter',
    description: 'A subdivision within an act',
    icon: '📖',
    defaultWordCount: 3000,
    examples: ['Chapter 1: The Beginning', 'Chapter 2: First Challenge', 'Chapter 3: Rising Action']
  },
  scene: {
    title: 'Scene',
    description: 'A specific event or sequence',
    icon: '📝',
    defaultWordCount: 1000,
    examples: ['Opening scene', 'Confrontation scene', 'Revelation scene']
  }
};

export function CreateOutlineNodeModal({ 
  isOpen, 
  onClose, 
  onCreateNode, 
  projectId,
  parentNode 
}: CreateOutlineNodeModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: (parentNode?.type === 'act' ? 'chapter' : parentNode?.type === 'chapter' ? 'scene' : 'act') as 'act' | 'chapter' | 'scene',
    wordCountTarget: NODE_TYPE_INFO[parentNode?.type === 'act' ? 'chapter' : parentNode?.type === 'chapter' ? 'scene' : 'act'].defaultWordCount
  });
  const [isCreating, setIsCreating] = useState(false);

  // Determine available node types based on parent
  const getAvailableTypes = () => {
    if (!parentNode) return ['act']; // Root level can only be acts
    if (parentNode.type === 'act') return ['chapter'];
    if (parentNode.type === 'chapter') return ['scene'];
    return ['scene']; // scenes can only have scenes as children
  };

  const availableTypes = getAvailableTypes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    setIsCreating(true);
    try {
      await onCreateNode({
        projectId,
        parentId: parentNode?.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        wordCountTarget: formData.wordCountTarget
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: availableTypes[0] as any,
        wordCountTarget: NODE_TYPE_INFO[availableTypes[0] as keyof typeof NODE_TYPE_INFO].defaultWordCount
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating node:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTypeChange = (type: 'act' | 'chapter' | 'scene') => {
    setFormData(prev => ({
      ...prev,
      type,
      wordCountTarget: NODE_TYPE_INFO[type].defaultWordCount
    }));
  };

  if (!isOpen) return null;

  const currentTypeInfo = NODE_TYPE_INFO[formData.type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ff4e00] rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Create New {currentTypeInfo.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {parentNode ? `Add to ${parentNode.title}` : 'Add to your story outline'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Node Type Selection */}
          {availableTypes.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Node Type
              </label>
              <div className="grid grid-cols-1 gap-2">
                {availableTypes.map((type) => {
                  const typeInfo = NODE_TYPE_INFO[type as keyof typeof NODE_TYPE_INFO];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeChange(type as any)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        formData.type === type
                          ? 'border-[#ff4e00] bg-[#ff4e00]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{typeInfo.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{typeInfo.title}</div>
                          <div className="text-sm text-gray-600">{typeInfo.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={currentTypeInfo.examples[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
              required
            />
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Example titles:</p>
              <div className="flex flex-wrap gap-2">
                {currentTypeInfo.examples.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, title: example }))}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={`Describe what happens in this ${formData.type.toLowerCase()}...`}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent resize-none"
            />
          </div>

          {/* Word Count Target */}
          <div>
            <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700 mb-2">
              Target Word Count
            </label>
            <input
              type="number"
              id="wordCount"
              value={formData.wordCountTarget}
              onChange={(e) => setFormData(prev => ({ ...prev, wordCountTarget: parseInt(e.target.value) || 0 }))}
              min="0"
              step="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Typical {formData.type} length: {currentTypeInfo.defaultWordCount.toLocaleString()} words
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || isCreating}
              className="flex-1 px-4 py-2 bg-[#ff4e00] text-white rounded-lg hover:bg-[#ff4e00]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : `Create ${currentTypeInfo.title}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
