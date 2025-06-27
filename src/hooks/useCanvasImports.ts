import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function getContentTypeStyle(contentType: string) {
  switch (contentType) {
    case 'character':
      return {
        icon: '👤',
        backgroundColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300'
      };
    case 'plot':
      return {
        icon: '📖',
        backgroundColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300'
      };
    case 'research':
      return {
        icon: '🔍',
        backgroundColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        borderColor: 'border-purple-300'
      };
    case 'chapter':
      return {
        icon: '📝',
        backgroundColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        borderColor: 'border-orange-300'
      };
    default:
      return {
        icon: '📄',
        backgroundColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-300'
      };
  }
}

export function useCanvasImports() {
  const [importedNodes, setImportedNodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load imported items and canvas positions
  const refreshImports = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load imported items with their canvas positions
      const { data: canvasItems, error: canvasError } = await supabase
        .from('canvas_items')
        .select(`
          *,
          imported_items (
            id,
            title,
            content,
            content_type,
            word_count,
            created_at
          )
        `);

      if (canvasError) throw canvasError;

      // Transform to node format
      const nodes = (canvasItems || []).map(canvasItem => ({
        id: `imported-${canvasItem.item_id}`,
        type: 'imported',
        position: { 
          x: canvasItem.position_x, 
          y: canvasItem.position_y 
        },
        data: {
          label: canvasItem.imported_items.title,
          content: canvasItem.imported_items.content,
          contentType: canvasItem.imported_items.content_type,
          wordCount: canvasItem.imported_items.word_count,
          importedItemId: canvasItem.imported_items.id
        }
      }));

      setImportedNodes(nodes);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading canvas imports:', error);
      setError('Failed to load imported items');
      setIsLoading(false);
    }
  }, []);

  // Add item to canvas
  const addToCanvas = useCallback(async (
    itemId: string, 
    position: { x: number; y: number } = { x: 100, y: 100 }
  ) => {
    try {
      const { error } = await supabase
        .from('canvas_items')
        .insert({
          item_id: itemId,
          position_x: position.x,
          position_y: position.y
        });

      if (error) throw error;
      await refreshImports();
    } catch (error) {
      console.error('Error adding to canvas:', error);
      setError('Failed to add item to canvas');
    }
  }, [refreshImports]);

  // Remove item from canvas
  const removeFromCanvas = useCallback(async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('canvas_items')
        .delete()
        .eq('item_id', itemId);

      if (error) throw error;
      await refreshImports();
    } catch (error) {
      console.error('Error removing from canvas:', error);
      setError('Failed to remove item from canvas');
    }
  }, [refreshImports]);

  // Update node position
  const updateNodePosition = useCallback(async (
    itemId: string, 
    position: { x: number; y: number }
  ) => {
    try {
      const { error } = await supabase
        .from('canvas_items')
        .update({
          position_x: position.x,
          position_y: position.y
        })
        .eq('item_id', itemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating position:', error);
      setError('Failed to update position');
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    refreshImports();
  }, [refreshImports]);

  return {
    importedNodes,
    isLoading,
    error,
    refreshImports,
    addToCanvas,
    removeFromCanvas,
    updateNodePosition
  };
}