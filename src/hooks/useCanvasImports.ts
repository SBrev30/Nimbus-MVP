import { useState, useEffect } from 'react'
import { supabase, ImportedItem } from '../lib/supabase'

export interface ImportedCanvasNode {
  id: string
  type: 'imported'
  position: { x: number; y: number }
  data: {
    label: string
    content: string
    contentType: 'character' | 'plot' | 'research' | 'chapter'
    wordCount: number
    importedItemId: string
  }
}

export function useCanvasImports() {
  const [importedNodes, setImportedNodes] = useState<ImportedCanvasNode[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadCanvasItems = async () => {
    try {
      // Load canvas items with their imported content
      const { data: canvasItems, error } = await supabase
        .from('canvas_items')
        .select(`
          *,
          imported_items (*)
        `)

      if (error) throw error

      if (!canvasItems) {
        setImportedNodes([])
        return
      }

      // Transform to canvas nodes
      const nodes: ImportedCanvasNode[] = canvasItems
        .filter(item => item.imported_items) // Only items with valid imported content
        .map(item => ({
          id: `imported-${item.id}`,
          type: 'imported',
          position: { x: item.position_x, y: item.position_y },
          data: {
            label: item.imported_items.title,
            content: item.imported_items.content.substring(0, 200) + '...',
            contentType: item.imported_items.content_type,
            wordCount: item.imported_items.word_count,
            importedItemId: item.imported_items.id
          }
        }))

      setImportedNodes(nodes)
    } catch (error) {
      console.error('Error loading canvas items:', error)
      setImportedNodes([])
    } finally {
      setIsLoading(false)
    }
  }

  const addImportedItemToCanvas = async (item: ImportedItem, position: { x: number; y: number }) => {
    try {
      const { data, error } = await supabase
        .from('canvas_items')
        .insert({
          item_id: item.id,
          position_x: position.x,
          position_y: position.y
        })
        .select()
        .single()

      if (error) throw error

      // Add to local state
      const newNode: ImportedCanvasNode = {
        id: `imported-${data.id}`,
        type: 'imported',
        position,
        data: {
          label: item.title,
          content: item.content.substring(0, 200) + '...',
          contentType: item.content_type,
          wordCount: item.word_count,
          importedItemId: item.id
        }
      }

      setImportedNodes(prev => [...prev, newNode])
      return newNode
    } catch (error) {
      console.error('Error adding item to canvas:', error)
      throw error
    }
  }

  const updateNodePosition = async (nodeId: string, position: { x: number; y: number }) => {
    try {
      // Extract canvas item ID from node ID
      const canvasItemId = nodeId.replace('imported-', '')
      
      const { error } = await supabase
        .from('canvas_items')
        .update({
          position_x: position.x,
          position_y: position.y
        })
        .eq('id', canvasItemId)

      if (error) throw error

      // Update local state
      setImportedNodes(prev => prev.map(node => 
        node.id === nodeId 
          ? { ...node, position }
          : node
      ))
    } catch (error) {
      console.error('Error updating node position:', error)
    }
  }

  const removeNodeFromCanvas = async (nodeId: string) => {
    try {
      const canvasItemId = nodeId.replace('imported-', '')
      
      const { error } = await supabase
        .from('canvas_items')
        .delete()
        .eq('id', canvasItemId)

      if (error) throw error

      // Remove from local state
      setImportedNodes(prev => prev.filter(node => node.id !== nodeId))
    } catch (error) {
      console.error('Error removing node from canvas:', error)
    }
  }

  const getImportedItemDetails = async (importedItemId: string) => {
    try {
      const { data, error } = await supabase
        .from('imported_items')
        .select('*')
        .eq('id', importedItemId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching imported item details:', error)
      return null
    }
  }

  useEffect(() => {
    loadCanvasItems()
  }, [])

  return {
    importedNodes,
    isLoading,
    loadCanvasItems,
    addImportedItemToCanvas,
    updateNodePosition,
    removeNodeFromCanvas,
    getImportedItemDetails
  }
}

// Utility function to get content type styling
export const getContentTypeStyle = (contentType: string) => {
  const styles = {
    character: {
      borderColor: 'border-blue-500',
      backgroundColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      icon: '👤'
    },
    plot: {
      borderColor: 'border-green-500',
      backgroundColor: 'bg-green-50', 
      textColor: 'text-green-800',
      icon: '📖'
    },
    research: {
      borderColor: 'border-purple-500',
      backgroundColor: 'bg-purple-50',
      textColor: 'text-purple-800',
      icon: '🔍'
    },
    chapter: {
      borderColor: 'border-orange-500',
      backgroundColor: 'bg-orange-50',
      textColor: 'text-orange-800',
      icon: '📝'
    }
  }
  
  return styles[contentType as keyof typeof styles] || {
    borderColor: 'border-gray-500',
    backgroundColor: 'bg-gray-50',
    textColor: 'text-gray-800',
    icon: '📄'
  }
}
