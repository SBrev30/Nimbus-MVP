import React, { useState, useEffect } from 'react'
import { Search, Plus, Filter, FileText, Users, BookOpen, Microscope, Tag, Calendar, Trash2, Eye } from 'lucide-react'
import { supabase, ImportedItem, ItemTag } from '../lib/supabase'
import { ImportWizard } from './ImportWizard'

interface FilesItem extends ImportedItem {
  tags: ItemTag[]
}

export function Files() {
  const [items, setItems] = useState<FilesItem[]>([])
  const [filteredItems, setFilteredItems] = useState<FilesItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showImportWizard, setShowImportWizard] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<FilesItem | null>(null)

  const contentTypes = [
    { value: 'all', label: 'All Items', icon: FileText, count: 0 },
    { value: 'character', label: 'Characters', icon: Users, count: 0 },
    { value: 'plot', label: 'Plot', icon: BookOpen, count: 0 },
    { value: 'research', label: 'Research', icon: Microscope, count: 0 },
    { value: 'chapter', label: 'Chapters', icon: FileText, count: 0 }
  ]

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, searchQuery, selectedType])

  const loadItems = async () => {
    try {
      // Load items with their tags
      const { data: itemsData, error: itemsError } = await supabase
        .from('imported_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (itemsError) throw itemsError

      // Load tags for all items
      const { data: tagsData, error: tagsError } = await supabase
        .from('item_tags')
        .select('*')

      if (tagsError) throw tagsError

      // Combine items with their tags
      const itemsWithTags = itemsData.map(item => ({
        ...item,
        tags: tagsData.filter(tag => tag.item_id === item.id)
      }))

      setItems(itemsWithTags)
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = items

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.tag_name.toLowerCase().includes(query))
      )
    }

    // Filter by content type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.content_type === selectedType)
    }

    setFilteredItems(filtered)
  }

  const handleImportComplete = (newItems: ImportedItem[]) => {
    loadItems() // Reload all items
  }

  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from('imported_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      setItems(prev => prev.filter(item => item.id !== itemId))
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const addToCanvas = async (item: FilesItem) => {
    try {
      // Add item to canvas with default position
      const { error } = await supabase
        .from('canvas_items')
        .insert({
          item_id: item.id,
          position_x: Math.random() * 400 + 100,
          position_y: Math.random() * 300 + 100
        })

      if (error) throw error

      alert(`"${item.title}" added to canvas!`)
    } catch (error) {
      console.error('Error adding to canvas:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = contentTypes.find(t => t.value === type)
    const Icon = typeConfig?.icon || FileText
    return <Icon className="w-5 h-5" />
  }

  const getTypeColor = (type: string) => {
    const colors = {
      character: 'bg-blue-100 text-blue-800 border-blue-200',
      plot: 'bg-green-100 text-green-800 border-green-200',
      research: 'bg-purple-100 text-purple-800 border-purple-200',
      chapter: 'bg-orange-100 text-orange-800 border-orange-200'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText
  }

  // Update content type counts
  const typeCounts = contentTypes.map(type => ({
    ...type,
    count: type.value === 'all' ? items.length : items.filter(item => item.content_type === type.value).length
  }))

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading files...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-t-[17px] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Files</h1>
          <button
            onClick={() => setShowImportWizard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Import Content
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search titles, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Content Types */}
        <div className="w-64 border-r border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Content Types</h3>
          <div className="space-y-1">
            {typeCounts.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`w-full flex items-center justify-between p-3 text-left rounded-lg transition-colors ${
                    selectedType === type.value
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{type.label}</span>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    {type.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {items.length === 0 ? 'No content imported yet' : 'No items match your search'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {items.length === 0 
                    ? 'Import your first document to get started'
                    : 'Try adjusting your search or filters'
                  }
                </p>
                {items.length === 0 && (
                  <button
                    onClick={() => setShowImportWizard(true)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Import Content
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${getTypeColor(item.content_type)}`}>
                          {getTypeIcon(item.content_type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{item.word_count} words</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(item.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View content"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => addToCanvas(item)}
                          className="px-3 py-1.5 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          Add to Canvas
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">
                      {truncateContent(item.content)}
                    </p>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            <Tag className="w-3 h-3" />
                            {tag.tag_name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Wizard Modal */}
      {showImportWizard && (
        <ImportWizard
          onClose={() => setShowImportWizard(false)}
          onImportComplete={handleImportComplete}
        />
      )}

      {/* Content Viewer Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${getTypeColor(selectedItem.content_type)}`}>
                  {getTypeIcon(selectedItem.content_type)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedItem.title}</h2>
                  <p className="text-gray-600">{selectedItem.word_count} words</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedItem.content }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
