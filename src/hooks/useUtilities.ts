import React, { useState, useEffect, useCallback } from 'react';

export interface WindowDimensions {
  width: number;
  height: number;
}

export function useWindowDimensions(): WindowDimensions {
  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 810,
  });

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useClickOutside<T extends HTMLElement>(
  callback: () => void
): React.RefObject<T> {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return ref;
}

export function useKeyboard(
  keyMap: Record<string, () => void>,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const modifier = event.ctrlKey || event.metaKey ? 'ctrl+' : '';
      const fullKey = modifier + key;

      if (keyMap[fullKey] || keyMap[key]) {
        event.preventDefault();
        (keyMap[fullKey] || keyMap[key])();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, deps);
}

export function useWordCount(text: string): {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  readingTime: number;
} {
  return React.useMemo(() => {
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words per minute

    return {
      words,
      characters,
      charactersNoSpaces,
      readingTime,
    };
  }, [text]);
}

export function useUndo<T>(initialState: T) {
  const [states, setStates] = useState<T[]>([initialState]);
  const [index, setIndex] = useState(0);

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setStates(prevStates => {
      const currentState = prevStates[index];
      const nextState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(currentState)
        : newState;
      
      const newStates = prevStates.slice(0, index + 1);
      newStates.push(nextState);
      
      // Limit history to 50 states
      if (newStates.length > 50) {
        newStates.shift();
        setIndex(newStates.length - 1);
        return newStates;
      }
      
      setIndex(newStates.length - 1);
      return newStates;
    });
  }, [index]);

  const undo = useCallback(() => {
    if (index > 0) {
      setIndex(index - 1);
    }
  }, [index]);

  const redo = useCallback(() => {
    if (index < states.length - 1) {
      setIndex(index + 1);
    }
  }, [index, states.length]);

  const canUndo = index > 0;
  const canRedo = index < states.length - 1;

  return {
    state: states[index],
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
  }: {
    threshold?: number;
    root?: Element | null;
    rootMargin?: string;
    freezeOnceVisible?: boolean;
  } = {}
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
  };

  useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, frozen]);

  return entry;
}