import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface CloudStorageData {
  project_id?: string;
  canvas_data: any;
  metadata?: any;
}

export function useCloudStorage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const saveToCloud = useCallback(async (key: string, data: CloudStorageData) => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }

      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Saving to cloud with user_id:', user.id, 'storage_key:', key);

      // Prepare data with user_id - matching the new table structure
      const cloudData = {
        user_id: user.id,
        storage_key: key,
        project_id: data.project_id || null,
        canvas_data: data.canvas_data,
        metadata: data.metadata || {},
        updated_at: new Date().toISOString()
      };

      // Try to update existing record first
      const { data: existingData, error: selectError } = await supabase
        .from('canvas_data')
        .select('id')
        .eq('user_id', user.id)
        .eq('storage_key', key)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw selectError;
      }

      let result;
      if (existingData) {
        // Update existing record
        console.log('Updating existing canvas data record:', existingData.id);
        result = await supabase
          .from('canvas_data')
          .update(cloudData)
          .eq('id', existingData.id)
          .select();
      } else {
        // Insert new record
        console.log('Inserting new canvas data record');
        result = await supabase
          .from('canvas_data')
          .insert(cloudData)
          .select();
      }

      if (result.error) {
        console.error('Supabase operation error:', result.error);
        throw result.error;
      }

      setLastSyncTime(new Date());
      console.log('✅ Cloud save successful for key:', key);
      return result.data?.[0] || null;

    } catch (error) {
      console.error('Cloud save error:', error);
      setSyncError(error instanceof Error ? error.message : 'Unknown cloud save error');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const loadFromCloud = useCallback(async (key: string) => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('Loading from cloud for user_id:', user.id, 'storage_key:', key);

      const { data, error } = await supabase
        .from('canvas_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('storage_key', key)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found - this is okay
          console.log('No cloud data found for key:', key);
          return null;
        }
        throw error;
      }

      console.log('✅ Cloud load successful for key:', key);
      return data;

    } catch (error) {
      console.error('Cloud load error:', error);
      setSyncError(error instanceof Error ? error.message : 'Unknown cloud load error');
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const deleteFromCloud = useCallback(async (key: string) => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('Deleting from cloud for user_id:', user.id, 'storage_key:', key);

      const { error } = await supabase
        .from('canvas_data')
        .delete()
        .eq('user_id', user.id)
        .eq('storage_key', key);

      if (error) {
        throw error;
      }

      console.log('✅ Cloud delete successful for key:', key);
      return true;

    } catch (error) {
      console.error('Cloud delete error:', error);
      setSyncError(error instanceof Error ? error.message : 'Unknown cloud delete error');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setSyncError(null);
  }, []);

  return {
    saveToCloud,
    loadFromCloud,
    deleteFromCloud,
    isSyncing,
    lastSyncTime,
    syncError,
    clearError
  };
}
