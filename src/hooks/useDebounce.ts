import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delayMs: number = 500): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

export default useDebounce;
