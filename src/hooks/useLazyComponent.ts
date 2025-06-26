import { useState, useCallback, useRef } from 'react';

interface LazyComponentState<T> {
  component: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface LazyComponentOptions {
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * Hook for lazy loading components with error handling and retry logic
 * Builds on your existing lazy loading patterns but adds more control
 */
export function useLazyComponent<T>(options: LazyComponentOptions = {}) {
  const {
    retryCount = 3,
    retryDelay = 1000,
    timeout = 10000
  } = options;

  const [state, setState] = useState<LazyComponentState<T>>({
    component: null,
    isLoading: false,
    error: null,
  });

  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

// At the top of the file, include useEffect
import { useState, useCallback, useRef, useEffect } from 'react';

…
// inside your hook, replace the existing loadComponent definition (lines 36–93) with:

const loadComponent = useCallback(async (loader: () => Promise<T>) => {
  
  

  setState(prev => {
    if (prev.isLoading) return prev;         // Prevent concurrent loads
    return { ...prev, isLoading: true, error: null };
  });
 
  // Set timeout for loading
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutRef.current = setTimeout(() => {
      reject(new Error(`Component loading timed out after ${timeout}ms`));
    }, timeout);
  });

  try {
    // Race between loader and timeout
    const component = await Promise.race([loader(), timeoutPromise]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState(prev => ({ ...prev, component, isLoading: false }));
    retryCountRef.current = 0; // Reset retry count on success
  } catch (error) {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const err = error instanceof Error ? error : new Error('Component loading failed');
    console.error('Component loading failed:', err);

    // Retry logic
    if (retryCountRef.current < retryCount) {
      retryCountRef.current++;
      loadedRef.current = false; // Allow retry

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: new Error(`Loading failed, retrying... (${retryCountRef.current}/${retryCount})`)
      }));

      // Delay before retry
      setTimeout(() => {
        if (retryCountRef.current > 0) {     // Ensure retry is still desired
          loadComponent(loader);
        }
      }, retryDelay * retryCountRef.current); // Exponential backoff
    } else {
      setState(prev => ({ ...prev, error: err, isLoading: false }));
      loadedRef.current = false;             // Allow manual retry
      retryCountRef.current = 0;
    }
  }
}, [retryCount, retryDelay, timeout]);

// Add this effect to clean up any pending timeout on unmount
useEffect(() => {
  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
}, []);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState({ component: null, isLoading: false, error: null });
    retryCountRef.current = 0;
  }, []);

  const retry = useCallback((loader: () => Promise<T>) => {
    reset();
    return loadComponent(loader);
  }, [reset, loadComponent]);

  return { 
    ...state, 
    loadComponent, 
    reset, 
    retry,
    isLoaded: state.component !== null && !state.isLoading,
    canRetry: retryCountRef.current < retryCount
  };
}
