import React, { useState, useCallback, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Globe, Users, Zap, DollarSign, Crown, MapPin, AlertCircle } from 'lucide-react';
import { CreateWorldElementData, worldBuildingService, ImageUsageStats } from '../../services/world-building-service';

interface WorldElementCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (elementData: CreateWorldElementData) => Promise<void>;
  projectId?: string;
}

const categoryOptions = [
  { value: 'location' as const, label: 'Location', icon: MapPin, description: 'Cities, landscapes, and memorable places' },
  { value: 'culture' as const, label: 'Culture', icon: Users, description: 'Societies, traditions, and belief systems' },
  { value: 'technology' as const, label: 'Technology', icon: Zap, description: 'Magic systems, tools, and innovations' },
  { value: 'economy' as const, label: 'Economy', icon: DollarSign, description: 'Trade, currency, and economic systems' },
  { value: 'hierarchy' as const, label: 'Hierarchy', icon: Crown, description: 'Power structures and social systems' }
];

export function WorldElementCreationModal({ 
  isOpen, 
  onClose, 
  onSave, 
  projectId 
}: WorldElementCreationModalProps) {
  const [formData, setFormData] = useState<CreateWorldElementData>({
    title: '',
    category: 'location',
    description: '',
    details: '',
    tags: [],
    image_urls: [],
    project_id: projectId
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([]);
  const [imageUsage, setImageUsage] = useState<ImageUsageStats | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);

  // Load image usage stats when modal opens
  useEffect(() => {
    if (isOpen) {
      loadImageUsage();
    }
  }, [isOpen]);

  const loadImageUsage = async () => {
    try {
      setLoadingUsage(true);
      const usage = await worldBuildingService.getUserImageUsage();
      setImageUsage(usage);
    } catch (error) {
      console.error('Error loading image usage:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleInputChange = useCallback((field: keyof CreateWorldElementData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  const handleRemoveTag = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || []
    }));
  }, []);

  const handleImageUpload = useCallback(async (files: FileList | null, index: number) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    try {
      // Update uploading state
      setUploadingImages(prev => {
        const newState = [...prev];
        newState[index] = true;
        return newState;
      });

      const imageUrl = await worldBuildingService.uploadImage(file);
      
      setFormData(prev => {
        const newImageUrls = [...(prev.image_urls || [])];
        newImageUrls[index] = imageUrl;
        return { ...prev, image_urls: newImageUrls };
      });

      // Refresh usage stats after successful upload
      await loadImageUsage();
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploadingImages(prev => {
        const newState = [...prev];
        newState[index] = false;
        return newState;
      });
    }
  }, []);

  const handleRemoveImage = useCallback(async (index: number) => {
    const imageUrl = formData.image_urls?.[index];
    if (imageUrl) {
      try {
        await worldBuildingService.deleteImage(imageUrl);
        // Refresh usage stats after deletion
        await loadImageUsage();
      } catch (error) {
        console.warn('Failed to delete image from storage:', error);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls?.filter((_, i) => i !== index) || []
    }));
  }, [formData.image_urls]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(formData);
      
      // Reset form
      setFormData({
        title: '',
        category: 'location',
        description: '',
        details: '',
        tags: [],
        image_urls: [],
        project_id: projectId
      });
      setTagInput('');
      await loadImageUsage(); // Refresh usage stats
    } catch (error) {
      console.error('Error creating world element:', error);
      setError(error instanceof Error ? error.message : 'Failed to create world element');
    } finally {
      setIsLoading(false);
    }
  }, [formData, onSave, projectId]);

  const handleClose = useCallback(() => {
    if (isLoading) return;
    
    // Reset form
    setFormData({
      title: '',
      category: 'location',
      description: '',
      details: '',
      tags: [],
      image_urls: [],
      project_id: projectId
    });
    setTagInput('');
    setError(null);
    setUploadingImages([]);
    setImageUsage(null);
    onClose();
  }, [isLoading, onClose, projectId]);

  if (!isOpen) return null;

  const remainingMB = imageUsage ? Math.round(imageUsage.remainingBytes / (1024 * 1024) * 10) / 10 : 0;
  const totalUsedMB = imageUsage ? Math.round(imageUsage.totalSizeBytes / (1024 * 1024) * 10) / 10 : 0;
  const usagePercentage = imageUsage ? Math.round((imageUsage.totalSizeBytes / (50 * 1024 * 1024)) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create World Element</h2>
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
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Image Usage Alert */}
          {imageUsage && (
            <div className={`rounded-lg p-3 ${
              usagePercentage >= 90 ? 'bg-red-50 border border-red-200' :
              usagePercentage >= 75 ? 'bg-yellow-50 border border-yellow-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-start gap-2">
                <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  usagePercentage >= 90 ? 'text-red-600' :
                  usagePercentage >= 75 ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-medium ${
                      usagePercentage >= 90 ? 'text-red-800' :
                      usagePercentage >= 75 ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      Image Storage Usage (Free Tier)
                    </p>
                    <span className={`text-xs ${
                      usagePercentage >= 90 ? 'text-red-600' :
                      usagePercentage >= 75 ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      {totalUsedMB}MB / 50MB ({usagePercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        usagePercentage >= 90 ? 'bg-red-500' :
                        usagePercentage >= 75 ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs ${
                    usagePercentage >= 90 ? 'text-red-700' :
                    usagePercentage >= 75 ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {remainingMB}MB remaining for all images across your world building elements
                  </p>
                </div>
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
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter element title..."
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoryOptions.map((category) => {
                const IconComponent = category.icon;
                return (
                  <label
                    key={category.value}
                    className={`cursor-pointer border rounded-lg p-3 transition-colors ${
                      formData.category === category.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={formData.category === category.value}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <IconComponent className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">{category.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of this element..."
              required
            />
          </div>

          {/* Details */}
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details
            </label>
            <textarea
              id="details"
              value={formData.details || ''}
              onChange={(e) => handleInputChange('details', e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Detailed information, history, rules, or characteristics..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image Gallery */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspiration Images (up to 6)
            </label>
            <p className="text-xs text-gray-500 mb-4">
              Upload PNG or JPEG images (max 10MB each). Total storage limit: 50MB for free tier.
            </p>
            
            {/* Warning if near limit */}
            {imageUsage && usagePercentage >= 95 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">
                  ⚠️ You're very close to your 50MB storage limit. Consider removing some existing images before uploading new ones.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, index) => {
                const hasImage = formData.image_urls?.[index];
                const isUploading = uploadingImages[index];
                const canUpload = !imageUsage || usagePercentage < 100;
                
                return (
                  <div
                    key={index}
                    className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                  >
                    {hasImage ? (
                      <>
                        <img
                          src={hasImage}
                          alt={`World element image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <label className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                        canUpload 
                          ? 'cursor-pointer hover:bg-gray-50' 
                          : 'cursor-not-allowed bg-gray-100 opacity-50'
                      }`}>
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-xs text-gray-500 text-center px-2">
                              {canUpload ? 'Click to upload' : 'Storage limit reached'}
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={(e) => handleImageUpload(e.target.files, index)}
                          className="hidden"
                          disabled={isUploading || !canUpload}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
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
              disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
              className="px-6 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Create Element
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
