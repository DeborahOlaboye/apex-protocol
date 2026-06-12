'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPosition, getUnrealizedPnl, getMarginRatio, isLiquidatable } from '@/lib/stacks';
import type { Position } from '@/types';

export function usePosition(address: string | null, marketId: number) {
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPosition = useCallback(async () => {
    if (!address) { setPosition(null); return; }
    setLoading(true);
    try {
      const [posData, pnlData, ratioData] = await Promise.allSettled([
        getPosition(address, marketId),
        getUnrealizedPnl(address, marketId),
        getMarginRatio(address, marketId),
      ]);

      const pos = posData.status === 'fulfilled' ? (posData.value as Record<string, unknown>) : null;
      if (!pos) { setPosition(null); setLoading(false); return; }

      const pnl = pnlData.status === 'fulfilled' ? (pnlData.value as { value: number }) : null;
      const ratio = ratioData.status === 'fulfilled' ? (ratioData.value as { value: number }) : null;

      setPosition({
        marketId,
        size: pos['size'] as number,
        isLong: pos['is-long'] as boolean,
        entryPrice: pos['entry-price'] as number,
        margin: pos['margin'] as number,
        collateralAssetId: pos['collateral-asset-id'] as number,
        entryFundingRate: pos['entry-funding-rate'] as number,
        lastUpdated: pos['last-updated'] as number,
        unrealizedPnl: pnl?.value,
        marginRatio: ratio?.value,
      });
    } catch (_) {
      setPosition(null);
    } finally {
      setLoading(false);
    }
  }, [address, marketId]);

  useEffect(() => {
    fetchPosition();
    const interval = setInterval(fetchPosition, 15_000);
    return () => clearInterval(interval);
  }, [fetchPosition]);

  return { position, loading, refetch: fetchPosition };
}

export function useIsLiquidatable(address: string | null, marketId: number) {
  const [liquidatable, setLiquidatable] = useState(false);

  useEffect(() => {
    if (!address) return;
    isLiquidatable(address, marketId)
      .then((v) => setLiquidatable(v as boolean))
      .catch(() => setLiquidatable(false));
  }, [address, marketId]);

  return liquidatable;
}
