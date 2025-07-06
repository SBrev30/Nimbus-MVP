import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Check if Supabase credentials are available
const hasSupabaseCredentials = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

// Create a mock Supabase client when credentials are missing
const createMockSupabase = () => ({
  from: () => ({
    upsert: () => Promise.resolve({ error: null }),
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } })
      })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: null })
    })
  })
});

// Create Supabase client
const createSupabaseClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!hasSupabaseCredentials()) {
    console.log('Supabase credentials not found, using local storage only');
    return createMockSupabase();
  }
  
  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.log('Supabase not available, using local storage only');
    return createMockSupabase();
  }
};

// Initialize the client
const supabase = createSupabaseClient();

export const useCloudStorage = (userId: string | null) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

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

  const saveToCloud = useCallback(async (data: any): Promise<boolean> => {
    if (!isOnline || !userId || !hasSupabaseCredentials() || userId === 'anonymous') {
      setSyncStatus('offline');
      return false;
    }

    try {
      setSyncStatus('syncing');
      
      // Check if the user_id is a valid UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        console.error('Invalid UUID format for user_id:', userId);
        setSyncStatus('error');
        return false;
      }
      
      // First check if record exists
      const { data: existingData, error: checkError } = await supabase
        .from('canvas_data')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking existing data:', checkError);
        setSyncStatus('error');
        return false;
      }
      
      let error;
      
      if (existingData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('canvas_data')
          .update({
            canvas_data: data,
            last_modified: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
          
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('canvas_data')
          .insert({
            user_id: userId,
            canvas_data: data,
            last_modified: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        error = insertError;
      }

      if (error) {
        console.error('Cloud save error:', error);
        setSyncStatus('error');
        return false;
      }

      setSyncStatus('synced');
      setLastSyncTime(new Date());
      return true;
    } catch (error) {
      console.error('Cloud save failed:', error);
      setSyncStatus('error');
      return false;
    }
  }, [isOnline, userId]);

  const loadFromCloud = useCallback(async (): Promise<any | null> => {
    if (!isOnline || !userId || !hasSupabaseCredentials() || userId === 'anonymous') {
      setSyncStatus('offline');
      return null;
    }

    try {
      setSyncStatus('syncing');
      
      // Check if the user_id is a valid UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        console.error('Invalid UUID format for user_id:', userId);
        setSyncStatus('error');
        return null;
      }
      
      const { data, error } = await supabase
        .from('canvas_data')
        .select('canvas_data')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found - this is normal for new users
          setSyncStatus('synced');
          return null;
        }
        console.error('Cloud load error:', error);
        setSyncStatus('error');
        return null;
      }

      setSyncStatus('synced');
      setLastSyncTime(new Date());
      return data?.canvas_data || null;
    } catch (error) {
      console.error('Cloud load failed:', error);
      setSyncStatus('error');
      return null;
    }
  }, [isOnline, userId]);

  const deleteFromCloud = useCallback(async (): Promise<boolean> => {
    if (!isOnline || !userId || !hasSupabaseCredentials() || userId === 'anonymous') {
      setSyncStatus('offline');
      return false;
    }

    try {
      setSyncStatus('syncing');
      
      // Check if the user_id is a valid UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        console.error('Invalid UUID format for user_id:', userId);
        setSyncStatus('error');
        return false;
      }
      
      const { error } = await supabase
        .from('canvas_data')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Cloud delete error:', error);
        setSyncStatus('error');
        return false;
      }

      setSyncStatus('synced');
      setLastSyncTime(new Date());
      return true;
    } catch (error) {
      console.error('Cloud delete failed:', error);
      setSyncStatus('error');
      return false;
    }
  }, [isOnline, userId]);

  return {
    saveToCloud,
    loadFromCloud,
    deleteFromCloud,
    isOnline,
    syncStatus,
    lastSyncTime
  };
};
