import { useState, useEffect, useCallback, useRef } from 'react';
import { useCloudStorage } from './useCloudStorage';

interface AutoSaveState {
  lastSaved: Date | null;
  isSaving: boolean;
  saveError: string | null;
  cloudSyncStatus: 'synced' | 'syncing' | 'error' | 'offline';
}

interface AutoSaveOptions {
  localKey: string;
  delay?: number;
  enableCloud?: boolean;
  onSaveSuccess?: (data: any) => void;
  onSaveError?: (error: Error) => void;
}

/**
 * Unified auto-save hook that handles both local storage and Supabase cloud storage
 * Prevents race conditions between local and cloud saves
 * Provides proper error handling and state management
 */
export function useUnifiedAutoSave<T>(
  data: T,
  userId: string | null,
  options: AutoSaveOptions
) {
  const { saveToCloud, loadFromCloud, syncStatus, isOnline } = useCloudStorage(userId);
  const [state, setState] = useState<AutoSaveState>({
    lastSaved: null,
    isSaving: false,
    saveError: null,
    cloudSyncStatus: syncStatus
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const lastDataRef = useRef<T>(data);

  // Update cloud sync status when it changes
  useEffect(() => {
    setState(prev => ({ ...prev, cloudSyncStatus: syncStatus }));
  }, [syncStatus]);

  // Queue saves to prevent race conditions
  const queueSave = useCallback(async (dataToSave: T) => {
    // Prevent saving identical data
    if (JSON.stringify(dataToSave) === JSON.stringify(lastDataRef.current)) {
      return;
    }
    
    lastDataRef.current = dataToSave;

    saveQueueRef.current = saveQueueRef.current.then(async () => {
      setState(prev => ({ ...prev, isSaving: true, saveError: null }));

      try {
        // Step 1: Save locally first (faster, more reliable)
        const dataWithTimestamp = {
          ...dataToSave,
          lastModified: new Date().getTime()
        };
        
        localStorage.setItem(options.localKey, JSON.stringify(dataWithTimestamp));
        
        // Step 2: Attempt cloud save if online and enabled
        if (options.enableCloud && isOnline && userId && userId !== 'anonymous') {
          setState(prev => ({ ...prev, cloudSyncStatus: 'syncing' }));
          const cloudSuccess = await saveToCloud(dataWithTimestamp);
          
          setState(prev => ({ 
            ...prev, 
            cloudSyncStatus: cloudSuccess ? 'synced' : 'error' 
          }));
          
          if (!cloudSuccess) {
            console.warn('Cloud save failed, but local save succeeded');
          }
        }

        const now = new Date();
        setState(prev => ({
          ...prev,
          lastSaved: now,
          isSaving: false,
          saveError: null
        }));

        options.onSaveSuccess?.(dataToSave);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Save failed';
        console.error('Save failed:', error);
        
        setState(prev => ({
          ...prev,
          isSaving: false,
          saveError: errorMessage,
          cloudSyncStatus: 'error'
        }));

        options.onSaveError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    });

    return saveQueueRef.current;
  }, [options.localKey, options.enableCloud, isOnline, saveToCloud, userId, options.onSaveSuccess, options.onSaveError]);

  // Auto-save effect with debouncing
  useEffect(() => {
    if (!data) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      queueSave(data);
    }, options.delay || 2000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, queueSave, options.delay]);

  // Manual save function
  const forceSave = useCallback(() => {
    if (data) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return queueSave(data);
    }
    return Promise.resolve();
  }, [data, queueSave]);

  // Load data with cloud sync
  const loadData = useCallback(async (): Promise<T | null> => {
    try {
      setState(prev => ({ ...prev, isSaving: true, saveError: null }));

      // Load local data first
      const localData = localStorage.getItem(options.localKey);
      const parsedLocal = localData ? JSON.parse(localData) : null;

      // If cloud is enabled and online, attempt sync
      if (options.enableCloud && isOnline && userId && userId !== 'anonymous') {
        try {
          const cloudData = await loadFromCloud();
          
          if (cloudData && parsedLocal) {
            // Conflict resolution: use newer data based on lastModified timestamp
            const localTimestamp = parsedLocal.lastModified || 0;
            const cloudTimestamp = cloudData.lastModified || 0;
            
            if (cloudTimestamp > localTimestamp) {
              console.log('Using cloud data (newer)');
              localStorage.setItem(options.localKey, JSON.stringify(cloudData));
              lastDataRef.current = cloudData;
              setState(prev => ({ ...prev, cloudSyncStatus: 'synced' }));
              return cloudData;
            } else {
              console.log('Using local data (newer)');
              setState(prev => ({ ...prev, cloudSyncStatus: 'synced' }));
              return parsedLocal;
            }
          } else if (cloudData) {
            // Only cloud data exists
            localStorage.setItem(options.localKey, JSON.stringify(cloudData));
            lastDataRef.current = cloudData;
            setState(prev => ({ ...prev, cloudSyncStatus: 'synced' }));
            return cloudData;
          } else if (parsedLocal) {
            // Only local data exists, sync it to cloud
            await saveToCloud(parsedLocal);
            setState(prev => ({ ...prev, cloudSyncStatus: 'synced' }));
            return parsedLocal;
          }
        } catch (cloudError) {
          console.warn('Cloud sync failed during load, using local data:', cloudError);
          setState(prev => ({ ...prev, cloudSyncStatus: 'error' }));
        }
      }

      // Fallback to local data only
      if (parsedLocal) {
        lastDataRef.current = parsedLocal;
      }
      return parsedLocal;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Load failed';
      console.error('Load failed:', error);
      setState(prev => ({ 
        ...prev, 
        saveError: errorMessage,
        cloudSyncStatus: 'error'
      }));
      return null;
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [options.localKey, options.enableCloud, isOnline, loadFromCloud, userId, saveToCloud]);

  // Clear error function
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, saveError: null }));
  }, []);

  // Retry failed save
  const retrySave = useCallback(() => {
    if (data && state.saveError) {
      clearError();
      return forceSave();
    }
    return Promise.resolve();
  }, [data, state.saveError, clearError, forceSave]);

  return {
    ...state,
    forceSave,
    loadData,
    clearError,
    retrySave,
    isOnline
  };
}