import { useState, useEffect } from 'react';
import type { OptimizationStatsData } from '../types';
import { URLS } from '../config';

interface UseOptimizationStatsResult {
  data: OptimizationStatsData | null;
  isLoading: boolean;
  error: string | null;
}

export function useOptimizationStats(): UseOptimizationStatsResult {
  const [data, setData] = useState<OptimizationStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(URLS.optimizationStats);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result: OptimizationStatsData = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load optimization stats');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, isLoading, error };
}
