"use client";

import { useCallback, useEffect, useState } from "react";

interface ApiResource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  setData: (data: T | null) => void;
  reload: () => Promise<void>;
}

/**
 * Fetch a JSON resource once (and on demand) with consistent loading/error
 * handling. Keeps the fetch boilerplate out of page components.
 */
export function useApiResource<T>(
  url: string,
  errorMessage = "Failed to load data"
): ApiResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(url);
      if (!res.ok) throw new Error(errorMessage);
      setData((await res.json()) as T);
    } catch (err) {
      setError(err instanceof Error ? err.message : errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url, errorMessage]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, setData, reload };
}
