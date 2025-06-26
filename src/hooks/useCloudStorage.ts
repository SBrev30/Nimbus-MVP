import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

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
  
  if (!supabaseUrl || !supabaseKey) {
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

export const useCloudStorage = (userId: string) => {
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
    if (!isOnline || !userId) {
      return false;
    }

    try {
      setSyncStatus('syncing');
      
      const { error } = await supabase
        .from('canvas_data')
        .upsert({
          user_id: userId,
          canvas_data: data,
          last_modified: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

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
    if (!isOnline || !userId) {
      return null;
    }

    try {
      setSyncStatus('syncing');
      
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
    if (!isOnline || !userId) {
      return false;
    }

    try {
      setSyncStatus('syncing');
      
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
