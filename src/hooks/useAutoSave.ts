import { useEffect, useRef } from 'react';

export function useAutoSave<T>(
  value: T,
  onSave: ((value: T) => void) | undefined,
  delay: number = 2000
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!onSave) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSave(valueRef.current);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onSave, delay]);
}