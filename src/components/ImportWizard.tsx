import React, { useState } from 'react'
import { Upload, FileText, X, Check, Plus } from 'lucide-react'
import { processFile, validateFile, ProcessedFile } from '../utils/fileProcessor'
import { supabase, ImportedItem } from '../lib/supabase'

interface ImportWizardProps {
  onClose: () => void
  onImportComplete: (items: ImportedItem[]) => void
}

export function ImportWizard({ onClose, onImportComplete }: ImportWizardProps) {
  const [files, setFiles] = useState<File[]>([])
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<'upload' | 'categorize' | 'importing'>('upload')
  const [errors, setErrors] = useState<string[]>([])

  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: File[] = []
    const newErrors: string[] = []

    Array.from(selectedFiles).forEach(file => {
      const validation = validateFile(file)
      if (validation.valid) {
        newFiles.push(file)
      } else {
        newErrors.push(`${file.name}: ${validation.error}`)
      }
    })

    setFiles(prev => [...prev, ...newFiles])
    setErrors(newErrors)
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setProcessedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const processFiles = async () => {
    setIsProcessing(true)
    const processed: ProcessedFile[] = []

    for (const file of files) {
      try {
        const result = await processFile(file)
        processed.push(result)
      } catch (error) {
        setErrors(prev => [...prev, `Failed to process ${file.name}`])
      }
    }

    setProcessedFiles(processed)
    setIsProcessing(false)
    setCurrentStep('categorize')
  }

  const updateContentType = (index: number, newType: ProcessedFile['suggestedType']) => {
    setProcessedFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, suggestedType: newType } : file
    ))
  }

  const addTag = (index: number, tag: string) => {
    if (!tag.trim()) return
    
    setProcessedFiles(prev => prev.map((file, i) => {
      if (i === index) {
        const tags = (file as any).tags || []
        return { ...file, tags: [...tags, tag.trim()] }
      }
      return file
    }))
  }

  const removeTag = (fileIndex: number, tagIndex: number) => {
    setProcessedFiles(prev => prev.map((file, i) => {
      if (i === fileIndex) {
        const tags = ((file as any).tags || []).filter((_: any, tIndex: number) => tIndex !== tagIndex)
        return { ...file, tags }
      }
      return file
    }))
  }

  const importToDatabase = async () => {
    setCurrentStep('importing')
    const importedItems: ImportedItem[] = []

    for (const file of processedFiles) {
      try {
        // Insert into imported_items
        const { data: item, error: itemError } = await supabase
          .from('imported_items')
          .insert({
            title: file.title,
            content: file.content,
            content_type: file.suggestedType,
            word_count: file.wordCount
          })
          .select()
          .single()

        if (itemError) throw itemError

        // Insert tags if any
        const tags = (file as any).tags || []
        if (tags.length > 0) {
          const tagInserts = tags.map((tag: string) => ({
            item_id: item.id,
            tag_name: tag
          }))

          const { error: tagError } = await supabase
            .from('item_tags')
            .insert(tagInserts)

          if (tagError) throw tagError
        }

        importedItems.push(item)
      } catch (error) {
        console.error('Import error:', error)
        setErrors(prev => [...prev, `Failed to import ${file.title}`])
      }
    }

    onImportComplete(importedItems)
    onClose()
  }

  const contentTypes = [
    { value: 'character', label: 'Character', icon: '👤', description: 'Character profiles and descriptions' },
    { value: 'plot', label: 'Plot', icon: '📖', description: 'Story outlines and plot points' },
    { value: 'research', label: 'Research', icon: '🔍', description: 'Reference materials and notes' },
    { value: 'chapter', label: 'Chapter', icon: '📝', description: 'Manuscript content and scenes' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Import Content</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {currentStep === 'upload' && (
            <div className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
                <p className="text-gray-500 mb-4">Supports .docx and .txt files (max 10MB each)</p>
                <input
                  type="file"
                  multiple
                  accept=".docx,.txt"
                  onChange={(e) => handleFileSelection(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Choose Files
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Selected Files ({files.length})</h3>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">{file.name}</span>
                        <span className="text-sm text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Process Button */}
              {files.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={processFiles}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Process Files'}
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === 'categorize' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Review and Categorize</h3>
                <p className="text-gray-600">Verify the content type and add tags for each item</p>
              </div>

              {processedFiles.map((file, index) => (
                <div key={index} className="border rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">{file.title}</h4>
                      <p className="text-sm text-gray-600 mb-4">{file.wordCount} words</p>
                      
                      {/* Content Type Selection */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Content Type:</label>
                        <div className="grid grid-cols-2 gap-2">
                          {contentTypes.map((type) => (
                            <button
                              key={type.value}
                              onClick={() => updateContentType(index, type.value as any)}
                              className={`p-3 text-left rounded-lg border ${
                                file.suggestedType === type.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span>{type.icon}</span>
                                <span className="font-medium">{type.label}</span>
                              </div>
                              <span className="text-sm text-gray-600">{type.description}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Tags:</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {((file as any).tags || []).map((tag: string, tagIndex: number) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {tag}
                              <button onClick={() => removeTag(index, tagIndex)}>
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Add a tag..."
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addTag(index, e.currentTarget.value)
                              e.currentTarget.value = ''
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={importToDatabase}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Import to Library
                </button>
              </div>
            </div>
          )}

          {currentStep === 'importing' && (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Importing Content...</h3>
              <p className="text-gray-600">Please wait while we add your content to the library</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}