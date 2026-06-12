'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBalance } from '@/lib/stacks';
import { ASSET_IDS } from '@/lib/constants';
import type { CollateralBalance } from '@/types';

export function useCollateral(address: string | null) {
  const [stxBalance, setStxBalance] = useState<CollateralBalance>({ amount: 0, locked: 0, available: 0 });
  const [sbtcBalance, setSbtcBalance] = useState<CollateralBalance>({ amount: 0, locked: 0, available: 0 });
  const [loading, setLoading] = useState(false);

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [stx, sbtc] = await Promise.allSettled([
        getBalance(address, ASSET_IDS.STX),
        getBalance(address, ASSET_IDS.SBTC),
      ]);

      if (stx.status === 'fulfilled') {
        const b = stx.value as Record<string, number>;
        setStxBalance({ amount: b['amount'], locked: b['locked'], available: b['amount'] - b['locked'] });
      }
      if (sbtc.status === 'fulfilled') {
        const b = sbtc.value as Record<string, number>;
        setSbtcBalance({ amount: b['amount'], locked: b['locked'], available: b['amount'] - b['locked'] });
      }
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 30_000);
    return () => clearInterval(interval);
  }, [fetchBalances]);

  return { stxBalance, sbtcBalance, loading, refetch: fetchBalances };
}
