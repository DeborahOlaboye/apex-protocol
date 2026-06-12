'use client';

import { useState, useEffect, useCallback } from 'react';
import { MARKETS } from '@/lib/constants';
import type { Market } from '@/types';

export function useMarket(marketId: number) {
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMarket = useCallback(async () => {
    const base = MARKETS[marketId as keyof typeof MARKETS];
    if (base) setMarket({ ...base });
    setLoading(false);
  }, [marketId]);

  useEffect(() => { fetchMarket(); }, [fetchMarket]);

  return { market, price: null, loading, refetch: fetchMarket };
}
