'use client';

import { useState, useCallback } from 'react';
import type { CollateralBalance } from '@/types';

export function useCollateral(address: string | null) {
  const [stxBalance, setStxBalance] = useState<CollateralBalance>({ amount: 0, locked: 0, available: 0 });
  const [sbtcBalance, setSbtcBalance] = useState<CollateralBalance>({ amount: 0, locked: 0, available: 0 });
  const [loading, setLoading] = useState(false);

  const fetchBalances = useCallback(async () => {
    if (!address) return;
  }, [address]);

  return { stxBalance, sbtcBalance, loading, refetch: fetchBalances };
}
