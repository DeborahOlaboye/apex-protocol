'use client';

import { useState } from 'react';
import Link from 'next/link';
import { openContractCall } from '@stacks/connect';
import { DEPLOYER, MARKETS } from '@/lib/constants';
import { network, buildClosePosition } from '@/lib/stacks';
import { useWallet } from '@/context/WalletContext';
import { usePosition } from '@/hooks/usePosition';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatCurrency, formatPercent, formatPnl, microToMacro } from '@/lib/utils';

function PositionRow({ marketId, address }: { marketId: number; address: string }) {
  const { position, loading, refetch } = usePosition(address, marketId);
  const market = MARKETS[marketId as keyof typeof MARKETS];
  const [closing, setClosing] = useState(false);

  if (loading) {
    return (
      <tr className="border-b border-[var(--border-subtle)] animate-pulse">
        {Array.from({ length: 7 }).map((_, i) => (
          <td key={i} className="px-4 py-3"><div className="h-4 w-16 rounded bg-[var(--border)]" /></td>
        ))}
      </tr>
    );
  }

  if (!position) return null;
