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

export function useAllMarkets() {
  const [markets, setMarkets] = useState<Market[]>(Object.values(MARKETS));
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const ids = Object.keys(MARKETS).map(Number);
    const results = await Promise.allSettled(
      ids.map(async (id) => {
        const base = MARKETS[id as keyof typeof MARKETS];
        try {
          const [m, p] = await Promise.allSettled([getMarket(id), getLatestPrice(base.assetId)]);
          const market = m.status === 'fulfilled' ? (m.value as Record<string, unknown>) : null;
          const priceData = p.status === 'fulfilled' ? (p.value as Record<string, unknown>) : null;
          return {
            ...base,
            isActive: (market?.['is-active'] as boolean) ?? true,
            openInterestLong: (market?.['open-interest-long'] as number) ?? 0,
            openInterestShort: (market?.['open-interest-short'] as number) ?? 0,
            price: priceData ? (priceData['price'] as number) : undefined,
          } as Market;
        } catch (_) {
          return { ...base } as Market;
        }
      }),
    );

    setMarkets(results.filter((r) => r.status === 'fulfilled').map((r) => (r as PromiseFulfilledResult<Market>).value));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { markets, loading, refetch: fetchAll };
}
