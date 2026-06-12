'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Position } from '@/types';

export function usePosition(address: string | null, marketId: number) {
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPosition = useCallback(async () => {
    if (!address) { setPosition(null); return; }
  }, [address, marketId]);

  useEffect(() => {
    fetchPosition();
    const interval = setInterval(fetchPosition, 15_000);
    return () => clearInterval(interval);
  }, [fetchPosition]);

  return { position, loading, refetch: fetchPosition };
}
