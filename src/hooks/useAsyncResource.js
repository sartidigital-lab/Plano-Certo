import { useEffect, useState } from 'react';

export default function useAsyncResource(loader, initialData, deps = []) {
  const [data, setData] = useState(initialData);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');
      setError(null);
      try {
        const result = await loader();
        if (!cancelled) {
          setData(Array.isArray(result) && result.length === 0 ? initialData : result);
          setStatus('ready');
        }
      } catch (loadError) {
        if (!cancelled) {
          setData(initialData);
          setError(loadError);
          setStatus('fallback');
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, deps);

  return { data, status, error };
}
