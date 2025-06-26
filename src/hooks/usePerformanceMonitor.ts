import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentName: string;
}

interface PerformanceMonitorOptions {
  componentName: string;
  logToConsole?: boolean;
  trackMemory?: boolean;
  threshold?: number; // Warn if render time exceeds this (ms)
}

/**
 * Hook for monitoring component performance and identifying bottlenecks
 * Helps optimize your app by tracking render times and memory usage
 */
export function usePerformanceMonitor(options: PerformanceMonitorOptions) {
  const {
    componentName,
    logToConsole = process.env.NODE_ENV === 'development',
    trackMemory = false,
    threshold = 16 // 60fps = ~16ms per frame
  } = options;

  const renderStartRef = useRef<number>(0);
  const metricsRef = useRef<PerformanceMetrics[]>([]);

  // Start performance measurement
  const startMeasurement = useCallback(() => {
    renderStartRef.current = performance.now();
  }, []);

  // End performance measurement
  const endMeasurement = useCallback(() => {
    const renderTime = performance.now() - renderStartRef.current;
    
    const metrics: PerformanceMetrics = {
      renderTime,
      componentName
    };

    // Track memory if enabled and available
    if (trackMemory && 'memory' in performance) {
      metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }

    // Store metrics
    metricsRef.current.push(metrics);

    // Keep only last 10 measurements to prevent memory leaks
    if (metricsRef.current.length > 10) {
      metricsRef.current.shift();
    }

    // Log performance warnings
    if (logToConsole) {
      if (renderTime > threshold) {
        console.warn(
          `🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms (threshold: ${threshold}ms)`
        );
      } else {
        console.log(
          `⚡ ${componentName} rendered in ${renderTime.toFixed(2)}ms`
        );
      }

      if (metrics.memoryUsage) {
        const memoryMB = (metrics.memoryUsage / 1024 / 1024).toFixed(2);
        console.log(`🧠 Memory usage: ${memoryMB}MB`);
      }
    }

    return metrics;
  }, [componentName, threshold, logToConsole, trackMemory]);

  // Get performance statistics
  const getStats = useCallback(() => {
    if (metricsRef.current.length === 0) return null;

    const renderTimes = metricsRef.current.map(m => m.renderTime);
    const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    const maxRenderTime = Math.max(...renderTimes);
    const minRenderTime = Math.min(...renderTimes);

    return {
      componentName,
      measurementCount: metricsRef.current.length,
      avgRenderTime: Number(avgRenderTime.toFixed(2)),
      maxRenderTime: Number(maxRenderTime.toFixed(2)),
      minRenderTime: Number(minRenderTime.toFixed(2)),
      slowRenders: renderTimes.filter(time => time > threshold).length
    };
  }, [componentName, threshold]);

  // Auto-start measurement on each render
  useEffect(() => {
    startMeasurement();
    return () => {
      endMeasurement();
    };
  });

  // Log final stats on unmount
  useEffect(() => {
    return () => {
      if (logToConsole && metricsRef.current.length > 0) {
        const stats = getStats();
        if (stats) {
          console.group(`📊 Performance Stats for ${componentName}`);
          console.log(`Renders: ${stats.measurementCount}`);
          console.log(`Average: ${stats.avgRenderTime}ms`);
          console.log(`Max: ${stats.maxRenderTime}ms`);
          console.log(`Min: ${stats.minRenderTime}ms`);
          console.log(`Slow renders: ${stats.slowRenders}`);
          console.groupEnd();
        }
      }
    };
  }, [componentName, logToConsole, getStats]);

  return {
    startMeasurement,
    endMeasurement,
    getStats,
    getCurrentMetrics: () => metricsRef.current[metricsRef.current.length - 1]
  };
}
