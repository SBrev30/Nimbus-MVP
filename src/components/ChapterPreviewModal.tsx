import React from 'react';
import { X } from 'lucide-react';
import { Chapter } from '../services/chapterService';

interface ChapterPreviewModalProps {
  chapter: Chapter;
  onClose: () => void;
}

export function ChapterPreviewModal({ chapter, onClose }: ChapterPreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{chapter.title}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
              <span>Chapter {chapter.orderIndex}</span>
              <span>•</span>
              <span>{chapter.wordCount} words</span>
              <span>•</span>
              <span className="capitalize">{chapter.status}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Summary */}
          {chapter.summary && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-700">{chapter.summary}</p>
            </div>
          )}
          
          {/* Chapter Content */}
          <div className="prose max-w-none">
            {chapter.content ? (
              <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
            ) : (
              <p className="text-gray-500 italic">No content available for this chapter.</p>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          // Replace the existing "Edit Chapter" button onClick handler:
<button
  onClick={() => {
    onClose();
    // Change this line to properly call onEditChapter
    onEditChapter?.(chapter.id, chapter.title);
  }}
  className="px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-gray-900 rounded-lg transition-colors font-medium"
>
  Edit Chapter
</button>
        </div>
      </div>
    </div>
  );
}
