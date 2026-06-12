'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMarket, getLatestPrice } from '@/lib/stacks';
import { MARKETS } from '@/lib/constants';
import type { Market, PriceData } from '@/types';

export function useMarket(marketId: number) {
  const [market, setMarket] = useState<Market | null>(null);
  const [price, setPrice] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMarket = useCallback(async () => {
    const base = MARKETS[marketId as keyof typeof MARKETS];
    if (!base) return;

    try {
      const [marketData, priceData] = await Promise.allSettled([
        getMarket(marketId),
        getLatestPrice(base.assetId),
      ]);

      const m = marketData.status === 'fulfilled' ? (marketData.value as Record<string, unknown>) : null;
      const p = priceData.status === 'fulfilled' ? (priceData.value as Record<string, unknown>) : null;

      setMarket({
        ...base,
        isActive: (m?.['is-active'] as boolean) ?? true,
        maxLeverage: (m?.['max-leverage'] as number) ?? 20,
        maintenanceMarginRate: (m?.['maintenance-margin-rate'] as number) ?? 500,
        openInterestLong: (m?.['open-interest-long'] as number) ?? 0,
        openInterestShort: (m?.['open-interest-short'] as number) ?? 0,
        price: p ? (p['price'] as number) : undefined,
      });

      if (p) {
        setPrice({ price: p['price'] as number, timestamp: p['timestamp'] as number });
      }
    } catch (_) {
      setMarket({ ...base });
    } finally {
      setLoading(false);
    }
  }, [marketId]);

  useEffect(() => {
    fetchMarket();
    const interval = setInterval(fetchMarket, 30_000);
    return () => clearInterval(interval);
  }, [fetchMarket]);

  return { market, price, loading, refetch: fetchMarket };
}
