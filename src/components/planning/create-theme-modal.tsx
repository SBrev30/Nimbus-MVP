import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { CreateThemeData, Theme } from '../../services/theme-service';

interface CreateThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateThemeData) => Promise<Theme | null>;
  projectId: string;
  isLoading?: boolean;
  initialData?: Partial<CreateThemeData>;
  isEditing?: boolean;
}

const themeTypes = [
  { value: 'major' as const, label: 'Major Theme', description: 'Central theme driving the story' },
  { value: 'minor' as const, label: 'Minor Theme', description: 'Supporting theme that adds depth' },
  { value: 'motif' as const, label: 'Motif', description: 'Recurring symbolic element' }
];

export function CreateThemeModal({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  isLoading = false,
  initialData,
  isEditing = false
}: CreateThemeModalProps) {
  const [formData, setFormData] = useState<CreateThemeData>({
    title: '',
    theme_type: 'major',
    description: '',
    development_notes: '',
    project_id: projectId
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        theme_type: initialData.theme_type || 'major',
        description: initialData.description || '',
        development_notes: initialData.development_notes || '',
        project_id: projectId
      });
    } else {
      // Reset to default values when creating new theme
      setFormData({
        title: '',
        theme_type: 'major',
        description: '',
        development_notes: '',
        project_id: projectId
      });
    }
    setErrors({});
  }, [initialData, projectId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.theme_type) {
      newErrors.theme_type = 'Theme type is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      // Submit form
      const result = await onSubmit({
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        development_notes: formData.development_notes?.trim() || ''
      });
      
      if (result) {
        // Reset form and close modal
        resetForm();
        onClose();
      }
    } catch (error) {
      // Handle submission error
      console.error('Error submitting theme:', error);
      setErrors({ submit: 'Failed to save theme. Please try again.' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      theme_type: 'major',
      description: '',
      development_notes: '',
      project_id: projectId
    });
    setErrors({});
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Theme' : 'Create New Theme'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Theme Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, title: e.target.value }));
                if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter theme title..."
              disabled={isLoading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label htmlFor="theme_type" className="block text-sm font-medium text-gray-700 mb-2">
              Theme Type *
            </label>
            <div className="grid grid-cols-1 gap-3">
              {themeTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.theme_type === type.value
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="theme_type"
                    value={type.value}
                    checked={formData.theme_type === type.value}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      theme_type: e.target.value as 'major' | 'minor' | 'motif'
                    }))}
                    className="mt-1 text-purple-600"
                    disabled={isLoading}
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.theme_type && (
              <p className="mt-1 text-sm text-red-600">{errors.theme_type}</p>
            )}
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Describe this theme and its significance..."
              disabled={isLoading}
            />
          </div>

          {/* Development Notes */}
          <div>
            <label htmlFor="development_notes" className="block text-sm font-medium text-gray-700 mb-2">
              Development Notes
            </label>
            <textarea
              id="development_notes"
              value={formData.development_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, development_notes: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Notes on how this theme develops throughout your story..."
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isEditing ? 'Save Changes' : 'Create Theme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
