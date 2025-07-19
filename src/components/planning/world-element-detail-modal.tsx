import React, { useState, useCallback } from 'react';
import { X, Edit3, Trash2, ChevronLeft, ChevronRight, MapPin, Users, Zap, DollarSign, Crown } from 'lucide-react';
import { WorldElement } from '../../services/world-building-service';

interface WorldElementDetailModalProps {
  element: WorldElement | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (element: WorldElement) => void;
  onDelete?: (elementId: string) => void;
}

const categoryIcons = {
  location: MapPin,
  culture: Users,
  technology: Zap,
  economy: DollarSign,
  hierarchy: Crown
};

const categoryColors = {
  location: 'bg-green-100 text-green-800',
  culture: 'bg-blue-100 text-blue-800',
  technology: 'bg-purple-100 text-purple-800',
  economy: 'bg-yellow-100 text-yellow-800',
  hierarchy: 'bg-red-100 text-red-800'
};

export function WorldElementDetailModal({
  element,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: WorldElementDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

  const handlePreviousImage = useCallback(() => {
    if (!element?.image_urls?.length) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? element.image_urls.length - 1 : prev - 1
    );
  }, [element?.image_urls?.length]);

  const handleNextImage = useCallback(() => {
    if (!element?.image_urls?.length) return;
    setCurrentImageIndex(prev => 
      prev === element.image_urls.length - 1 ? 0 : prev + 1
    );
  }, [element?.image_urls?.length]);

  const handleDelete = useCallback(() => {
    if (!element || !onDelete) return;
    
    if (isDeleteConfirming) {
      onDelete(element.id);
      setIsDeleteConfirming(false);
      onClose();
    } else {
      setIsDeleteConfirming(true);
    }
  }, [element, onDelete, isDeleteConfirming, onClose]);

  const handleClose = useCallback(() => {
    setCurrentImageIndex(0);
    setIsDeleteConfirming(false);
    onClose();
  }, [onClose]);

  if (!isOpen || !element) return null;

  const CategoryIcon = categoryIcons[element.category];
  const categoryColor = categoryColors[element.category];
  const hasImages = element.image_urls && element.image_urls.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CategoryIcon className="w-6 h-6 text-gray-600" />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColor}`}>
                {element.category.charAt(0).toUpperCase() + element.category.slice(1)}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{element.title}</h2>
          </div>
          
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(element)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit element"
              >
                <Edit3 className="w-5 h-5 text-gray-600" />
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={handleDelete}
                className={`p-2 rounded-lg transition-colors ${
                  isDeleteConfirming 
                    ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title={isDeleteConfirming ? 'Click again to confirm deletion' : 'Delete element'}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{element.description}</p>
              </div>

              {/* Details */}
              {element.details && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {element.details}
                    </p>
                  </div>
                </div>
              )}

              {/* Image Gallery */}
              {hasImages && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Inspiration Images ({element.image_urls.length})
                  </h3>
                  
                  {/* Main Image Display */}
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img
                      src={element.image_urls[currentImageIndex]}
                      alt={`${element.title} - Image ${currentImageIndex + 1}`}
                      className="w-full h-64 sm:h-80 object-cover"
                    />
                    
                    {/* Image Navigation */}
                    {element.image_urls.length > 1 && (
                      <>
                        <button
                          onClick={handlePreviousImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-50 text-white text-sm rounded">
                          {currentImageIndex + 1} / {element.image_urls.length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail Strip */}
                  {element.image_urls.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {element.image_urls.map((imageUrl, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            index === currentImageIndex 
                              ? 'border-blue-500' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={imageUrl}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tags */}
              {element.tags && element.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {element.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Connections */}
              {element.connections && Object.keys(element.connections).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Connections</h3>
                  <div className="text-sm text-gray-600">
                    {/* You can expand this to show actual connections to other elements */}
                    <p>Connected to {Object.keys(element.connections).length} elements</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Information</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Created</dt>
                    <dd className="text-gray-900">
                      {new Date(element.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Last Updated</dt>
                    <dd className="text-gray-900">
                      {new Date(element.updated_at).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Category</dt>
                    <dd className="text-gray-900 capitalize">{element.category}</dd>
                  </div>
                  {element.project_id && (
                    <div>
                      <dt className="text-gray-500">Project</dt>
                      <dd className="text-gray-900">Linked to project</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* Delete Confirmation */}
          {isDeleteConfirming && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 mb-3">
                Are you sure you want to delete this world element? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Delete Permanently
                </button>
                <button
                  onClick={() => setIsDeleteConfirming(false)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
