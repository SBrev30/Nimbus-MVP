import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CanvasState, CanvasNode, CanvasEdge } from '../components/canvas/types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface UseSupabaseCanvasOptions {
 projectId: string;
 autoSave?: boolean;
 autoSaveDelay?: number;
}

interface UseSupabaseCanvasReturn {
 canvasState: CanvasState | null;
 isLoading: boolean;
 isSaving: boolean;
 lastSaved: Date | null;
 error: string | null;
 saveCanvas: (canvasData: Partial<CanvasState>) => Promise<boolean>;
 loadCanvas: (canvasId?: string) => Promise<CanvasState | null>;
 createCanvas: (name: string, initialData?: Partial<CanvasState>) => Promise<string | null>;
 deleteCanvas: (canvasId: string) => Promise<boolean>;
 listCanvases: () => Promise<CanvasState[]>;
 syncStatus: 'synced' | 'syncing' | 'error' | 'offline';
 isOnline: boolean;
}

export const useSupabaseCanvas = (
 options: UseSupabaseCanvasOptions
): UseSupabaseCanvasReturn => {
 const { projectId, autoSave = true, autoSaveDelay = 2000 } = options;
 
 const [canvasState, setCanvasState] = useState<CanvasState | null>(null);
 const [isLoading, setIsLoading] = useState(false);
 const [isSaving, setIsSaving] = useState(false);
 const [lastSaved, setLastSaved] = useState<Date | null>(null);
 const [error, setError] = useState<string | null>(null);
 const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('synced');
 const [isOnline, setIsOnline] = useState(navigator.onLine);
 const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

 // Monitor online status
 useEffect(() => {
   const handleOnline = () => {
     setIsOnline(true);
     setSyncStatus('synced');
   };
   
   const handleOffline = () => {
     setIsOnline(false);
     setSyncStatus('offline');
   };

   window.addEventListener('online', handleOnline);
   window.addEventListener('offline', handleOffline);

   return () => {
     window.removeEventListener('online', handleOnline);
     window.removeEventListener('offline', handleOffline);
   };
 }, []);

 // Auto-save functionality
 useEffect(() => {
   if (!autoSave || !canvasState || !isOnline) return;

   if (autoSaveTimeout) {
     clearTimeout(autoSaveTimeout);
   }

   const timeout = setTimeout(() => {
     saveCanvas(canvasState);
   }, autoSaveDelay);

   setAutoSaveTimeout(timeout);

   return () => {
     if (timeout) clearTimeout(timeout);
   };
 }, [canvasState, autoSave, autoSaveDelay, isOnline]);

 const getCurrentUser = async () => {
   const { data: { user }, error } = await supabase.auth.getUser();
   if (error) throw error;
   return user;
 };

 const saveCanvas = useCallback(async (canvasData: Partial<CanvasState>): Promise<boolean> => {
   if (!isOnline) {
     setSyncStatus('offline');
     return false;
   }

   setIsSaving(true);
   setSyncStatus('syncing');
   setError(null);

   try {
     const user = await getCurrentUser();
     if (!user) throw new Error('User not authenticated');

     const now = new Date().toISOString();
     const dataToSave = {
       ...canvasData,
       user_id: user.id,
       project_id: projectId,
       updated_at: now,
       version: (canvasData.version || 0) + 1
     };

     // Save to canvas_states table
     const { data, error: saveError } = await supabase
       .from('canvas_states')
       .upsert(dataToSave, {
         onConflict: 'id',
         ignoreDuplicates: false
       })
       .select()
       .single();

     if (saveError) throw saveError;

     // If nodes and edges are provided, save them separately for better querying
     if (canvasData.nodes || canvasData.edges) {
       // Delete existing nodes and edges for this canvas
       if (data.id) {
         await supabase.from('canvas_nodes').delete().eq('canvas_id', data.id);
         await supabase.from('canvas_edges').delete().eq('canvas_id', data.id);
       }

       // Insert new nodes
       if (canvasData.nodes && canvasData.nodes.length > 0) {
         const nodesToInsert = canvasData.nodes.map(node => ({
           canvas_id: data.id,
           node_type: node.type,
           position: node.position,
           node_data: node.data,
           created_at: now,
           updated_at: now
         }));

         const { error: nodesError } = await supabase
           .from('canvas_nodes')
           .insert(nodesToInsert);

         if (nodesError) throw nodesError;
       }

       // Insert new edges
       if (canvasData.edges && canvasData.edges.length > 0) {
         const edgesToInsert = canvasData.edges.map(edge => ({
           canvas_id: data.id,
           source_node_id: edge.source,
           target_node_id: edge.target,
           edge_data: {
             type: edge.type,
             label: edge.label,
             animated: edge.animated,
             style: edge.style,
             data: edge.data
           },
           created_at: now,
           updated_at: now
         }));

         const { error: edgesError } = await supabase
           .from('canvas_edges')
           .insert(edgesToInsert);

         if (edgesError) throw edgesError;
       }
     }

     setCanvasState({ ...dataToSave, id: data.id } as CanvasState);
     setLastSaved(new Date());
     setSyncStatus('synced');
     setIsSaving(false);
     return true;

   } catch (err) {
     console.error('Failed to save canvas:', err);
     setError(err instanceof Error ? err.message : 'Failed to save canvas');
     setSyncStatus('error');
     setIsSaving(false);
     return false;
   }
 }, [isOnline, projectId]);

 const loadCanvas = useCallback(async (canvasId?: string): Promise<CanvasState | null> => {
   if (!isOnline) {
     setSyncStatus('offline');
     return null;
   }

   setIsLoading(true);
   setError(null);

   try {
     const user = await getCurrentUser();
     if (!user) throw new Error('User not authenticated');

     let query = supabase
       .from('canvas_states')
       .select('*')
       .eq('user_id', user.id)
       .eq('project_id', projectId);

     if (canvasId) {
       query = query.eq('id', canvasId);
     } else {
       // Get the most recent canvas for this project
       query = query.order('updated_at', { ascending: false }).limit(1);
     }

     const { data, error: loadError } = await query.single();

     if (loadError) {
       if (loadError.code === 'PGRST116') {
         // No canvas found - this is normal for new projects
         setIsLoading(false);
         return null;
       }
       throw loadError;
     }

     // Load associated nodes and edges
     const [nodesResult, edgesResult] = await Promise.all([
       supabase.from('canvas_nodes').select('*').eq('canvas_id', data.id),
       supabase.from('canvas_edges').select('*').eq('canvas_id', data.id)
     ]);

     if (nodesResult.error) throw nodesResult.error;
     if (edgesResult.error) throw edgesResult.error;

     // Transform nodes back to canvas format
     const nodes: CanvasNode[] = nodesResult.data.map(node => ({
       id: node.id,
       type: node.node_type,
       position: node.position,
       data: node.node_data
     }));

     // Transform edges back to canvas format
     const edges: CanvasEdge[] = edgesResult.data.map(edge => ({
       id: edge.id,
       source: edge.source_node_id,
       target: edge.target_node_id,
       ...edge.edge_data
     }));

     const canvasState: CanvasState = {
       ...data,
       nodes,
       edges
     };

     setCanvasState(canvasState);
     setIsLoading(false);
     return canvasState;

   } catch (err) {
     console.error('Failed to load canvas:', err);
     setError(err instanceof Error ? err.message : 'Failed to load canvas');
     setIsLoading(false);
     return null;
   }
 }, [isOnline, projectId]);

 const createCanvas = useCallback(async (name: string, initialData?: Partial<CanvasState>): Promise<string | null> => {
   if (!isOnline) {
     setSyncStatus('offline');
     return null;
   }

   try {
     const user = await getCurrentUser();
     if (!user) throw new Error('User not authenticated');

     const now = new Date().toISOString();
     const canvasData: Partial<CanvasState> = {
       name,
       user_id: user.id,
       project_id: projectId,
       nodes: [],
       edges: [],
       viewport: { x: 0, y: 0, zoom: 1 },
       settings: {
         mode: 'exploratory',
         theme: 'light',
         grid_enabled: true,
         minimap_enabled: true
       },
       version: 1,
       created_at: now,
       updated_at: now,
       ...initialData
     };

     const success = await saveCanvas(canvasData);
     return success ? canvasState?.id || null : null;

   } catch (err) {
     console.error('Failed to create canvas:', err);
     setError(err instanceof Error ? err.message : 'Failed to create canvas');
     return null;
   }
 }, [isOnline, projectId, saveCanvas, canvasState]);

 const deleteCanvas = useCallback(async (canvasId: string): Promise<boolean> => {
   if (!isOnline) {
     setSyncStatus('offline');
     return false;
   }

   try {
     const user = await getCurrentUser();
     if (!user) throw new Error('User not authenticated');

     // Delete canvas and related data (CASCADE should handle nodes/edges)
     const { error } = await supabase
       .from('canvas_states')
       .delete()
       .eq('id', canvasId)
       .eq('user_id', user.id);

     if (error) throw error;

     if (canvasState?.id === canvasId) {
       setCanvasState(null);
     }

     return true;

   } catch (err) {
     console.error('Failed to delete canvas:', err);
     setError(err instanceof Error ? err.message : 'Failed to delete canvas');
     return false;
   }
 }, [isOnline, canvasState]);

 const listCanvases = useCallback(async (): Promise<CanvasState[]> => {
   if (!isOnline) return [];

   try {
     const user = await getCurrentUser();
     if (!user) throw new Error('User not authenticated');

     const { data, error } = await supabase
       .from('canvas_states')
       .select('id, name, created_at, updated_at, version')
       .eq('user_id', user.id)
       .eq('project_id', projectId)
       .order('updated_at', { ascending: false });

     if (error) throw error;

     return data as CanvasState[];

   } catch (err) {
     console.error('Failed to list canvases:', err);
     setError(err instanceof Error ? err.message : 'Failed to list canvases');
     return [];
   }
 }, [isOnline, projectId]);

 return {
   canvasState,
   isLoading,
   isSaving,
   lastSaved,
   error,
   saveCanvas,
   loadCanvas,
   createCanvas,
   deleteCanvas,
   listCanvases,
   syncStatus,
   isOnline
 };
};
