'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBalance } from '@/lib/stacks';
import { ASSET_IDS } from '@/lib/constants';
import type { CollateralBalance } from '@/types';

const ZERO: CollateralBalance = { amount: 0, locked: 0, available: 0 };

export function useCollateral(address: string | null) {
  const [stxBalance, setStxBalance] = useState<CollateralBalance>(ZERO);
  const [sbtcBalance, setSbtcBalance] = useState<CollateralBalance>(ZERO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const [stx, sbtc] = await Promise.allSettled([
        getBalance(address, ASSET_IDS.STX),
        getBalance(address, ASSET_IDS.SBTC),
      ]);

      if (stx.status === 'fulfilled') {
        const b = stx.value as Record<string, number>;
        setStxBalance({ amount: b['amount'] ?? 0, locked: b['locked'] ?? 0, available: (b['amount'] ?? 0) - (b['locked'] ?? 0) });
      }
      if (sbtc.status === 'fulfilled') {
        const b = sbtc.value as Record<string, number>;
        setSbtcBalance({ amount: b['amount'] ?? 0, locked: b['locked'] ?? 0, available: (b['amount'] ?? 0) - (b['locked'] ?? 0) });
      }
      if (stx.status === 'rejected' && sbtc.status === 'rejected') {
        setError('Failed to load balances. Check your connection.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 30_000);
    return () => clearInterval(interval);
  }, [fetchBalances]);

  return { stxBalance, sbtcBalance, loading, error, refetch: fetchBalances };
}
