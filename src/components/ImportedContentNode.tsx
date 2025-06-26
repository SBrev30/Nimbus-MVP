import React, { useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Eye, Trash2, FileText } from 'lucide-react'
import { getContentTypeStyle } from '../hooks/useCanvasImports'

interface ImportedContentNodeData {
  label: string
  content: string
  contentType: 'character' | 'plot' | 'research' | 'chapter'
  wordCount: number
  importedItemId: string
}

export function ImportedContentNode({ data, selected }: NodeProps<ImportedContentNodeData>) {
  const [showFullContent, setShowFullContent] = useState(false)
  const style = getContentTypeStyle(data.contentType)

  return (
    <>
      <div 
        className={`
          p-4 border-2 rounded-lg shadow-lg bg-white min-w-[220px] max-w-[320px]
          ${style.borderColor} ${style.backgroundColor}
          ${selected ? 'ring-2 ring-blue-400' : ''}
          transition-all duration-200 hover:shadow-xl
        `}
      >
        {/* Handles for connections */}
        <Handle type="target" position={Position.Top} className="w-3 h-3" />
        <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
        <Handle type="source" position={Position.Right} className="w-3 h-3" />
        <Handle type="target" position={Position.Left} className="w-3 h-3" />

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-lg">{style.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 truncate">
                {data.label}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>{data.wordCount} words</span>
                <span className={`px-2 py-1 rounded-full capitalize ${style.backgroundColor} ${style.textColor} font-medium`}>
                  {data.contentType}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="text-xs text-gray-700 mb-3">
          <div className="line-clamp-3">
            {/* Remove HTML tags for preview */}
            {data.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFullContent(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="View full content"
          >
            <Eye className="w-3 h-3" />
            View
          </button>
          
          <div className="text-xs text-gray-500">
            Imported Content
          </div>
        </div>
      </div>

      {/* Full Content Modal */}
      {showFullContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{style.icon}</span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{data.label}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{data.wordCount} words</span>
                    <span className={`px-2 py-1 rounded-full capitalize ${style.backgroundColor} ${style.textColor} font-medium`}>
                      {data.contentType}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowFullContent(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: data.content }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Export the node type for use in Canvas
export const importedContentNodeType = {
  imported: ImportedContentNode
}
