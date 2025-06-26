import { useState, useEffect, useCallback, useRef } from 'react';

interface ViewDataOptions<T> {
  cacheKey: string;
  loader: () => Promise<T>;
  dependencies?: any[];
  cacheTimeout?: number; // Cache expiry in milliseconds
  enableSessionCache?: boolean;
  enableMemoryCache?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

interface ViewDataState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  cacheHit: boolean;
}

/**
 * Enhanced hook for loading and caching view-specific data
 * Builds on your useLocalStorage pattern but adds intelligent caching
 */
export function useViewData<T>(options: ViewDataOptions<T>) {
  const {
    cacheKey,
    loader,
    dependencies = [],
    cacheTimeout = 5 * 60 * 1000, // 5 minutes default
    enableSessionCache = true,
    enableMemoryCache = true,
    retryCount = 2,
    retryDelay = 1000
  } = options;

  const [state, setState] = useState<ViewDataState<T>>({
    data: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
    cacheHit: false
  });

  // Memory cache for ultra-fast access within same session
  const memoryCacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const retryCountRef = useRef(0);
  const loadingRef = useRef(false);

  // Check if cached data is still valid
  const isCacheValid = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < cacheTimeout;
  }, [cacheTimeout]);

  // Get data from memory cache
  const getFromMemoryCache = useCallback((): T | null => {
    if (!enableMemoryCache) return null;
    
    const cached = memoryCacheRef.current.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    
    // Clean up expired cache
    if (cached) {
      memoryCacheRef.current.delete(cacheKey);
    }
    
    return null;
  }, [cacheKey, enableMemoryCache, isCacheValid]);

  // Get data from session cache
  const getFromSessionCache = useCallback((): T | null => {
    if (!enableSessionCache) return null;
    
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (isCacheValid(timestamp)) {
          return data;
        } else {
          // Clean up expired cache
          sessionStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.warn(`Failed to read session cache for ${cacheKey}:`, error);
      sessionStorage.removeItem(cacheKey);
    }
    
    return null;
  }, [cacheKey, enableSessionCache, isCacheValid]);

  // Store data in caches
  const storeInCaches = useCallback((data: T) => {
    const timestamp = Date.now();
    
    // Memory cache
    if (enableMemoryCache) {
      memoryCacheRef.current.set(cacheKey, { data, timestamp });
    }
    
    // Session cache
    if (enableSessionCache) {
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ data, timestamp }));
      } catch (error) {
        console.warn(`Failed to store in session cache for ${cacheKey}:`, error);
      }
    }
  }, [cacheKey, enableMemoryCache, enableSessionCache]);

  // Load data with caching strategy
  const loadData = useCallback(async (forceRefresh = false) => {
    // Prevent concurrent loads
    if (loadingRef.current) return;
    
    // Check caches first (unless force refresh)
    if (!forceRefresh) {
      // Try memory cache first (fastest)
      const memoryData = getFromMemoryCache();
      if (memoryData) {
        setState(prev => ({
          ...prev,
          data: memoryData,
          cacheHit: true,
          error: null,
          lastUpdated: new Date()
        }));
        return;
      }
      
      // Try session cache second
      const sessionData = getFromSessionCache();
      if (sessionData) {
        setState(prev => ({
          ...prev,
          data: sessionData,
          cacheHit: true,
          error: null,
          lastUpdated: new Date()
        }));
        
        // Also store in memory cache for next time
        storeInCaches(sessionData);
        return;
      }
    }

    // No valid cache found, load fresh data
    loadingRef.current = true;
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      cacheHit: false 
    }));

    try {
      const result = await loader();
      
      setState(prev => ({
        ...prev,
        data: result,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        cacheHit: false
      }));
      
      // Store in caches
      storeInCaches(result);
      retryCountRef.current = 0; // Reset retry count on success
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Data loading failed');
      console.error(`Data loading failed for ${cacheKey}:`, error);

      // Retry logic
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        loadingRef.current = false; // Allow retry
        
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: new Error(`Loading failed, retrying... (${retryCountRef.current}/${retryCount})`)
        }));

        // Delay before retry with exponential backoff
        setTimeout(() => {
          loadData(forceRefresh);
        }, retryDelay * retryCountRef.current);
      } else {
        setState(prev => ({
          ...prev,
          data: null,
          isLoading: false,
          error,
          cacheHit: false
        }));
        retryCountRef.current = 0;
      }
    } finally {
      if (retryCountRef.current === 0) {
        loadingRef.current = false;
      }
    }
  }, [
    getFromMemoryCache, 
    getFromSessionCache, 
    storeInCaches, 
    loader, 
    cacheKey, 
    retryCount, 
    retryDelay
  ]);

  // Auto-load on mount and dependency changes
  useEffect(() => {
    loadData();
  }, [loadData, ...dependencies]);

  // Manual refresh function
  const refresh = useCallback(() => {
    return loadData(true);
  }, [loadData]);

  // Clear all caches for this key
  const clearCache = useCallback(() => {
    memoryCacheRef.current.delete(cacheKey);
    
    if (enableSessionCache) {
      try {
        sessionStorage.removeItem(cacheKey);
      } catch (error) {
        console.warn(`Failed to clear session cache for ${cacheKey}:`, error);
      }
    }
  }, [cacheKey, enableSessionCache]);

  // Preload function for warming cache
  const preload = useCallback(() => {
    if (!state.data && !state.isLoading) {
      loadData();
    }
  }, [state.data, state.isLoading, loadData]);

  return { 
    ...state, 
    refresh, 
    clearCache, 
    preload,
    isStale: state.lastUpdated ? Date.now() - state.lastUpdated.getTime() > cacheTimeout : false
  };
}
