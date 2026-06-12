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

  async function handleClose() {
    setClosing(true);
    try {
      const tx = buildClosePosition(marketId);
      await openContractCall({
        contractAddress: DEPLOYER,
        contractName: tx.contractName,
        functionName: tx.functionName,
        functionArgs: tx.functionArgs,
        network,
        onFinish: () => refetch(),
        onCancel: () => {},
      });
    } finally {
      setClosing(false);
    }
  }

  const pnl = position.unrealizedPnl ?? 0;
  const ratio = position.marginRatio;
  const isHealthy = ratio === undefined || ratio > 500;

  return (
    <tr className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-elevated)] transition-colors text-sm">
      <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
        <Link href={`/trade/${marketId}`} className="hover:text-blue-400 transition-colors">
          {market?.name ?? `Market ${marketId}`}
        </Link>
      </td>
      <td className="px-4 py-3">
        <Badge variant={position.isLong ? 'success' : 'danger'}>
          {position.isLong ? 'Long' : 'Short'}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right font-mono text-[var(--text-primary)]">{position.size}</td>
      <td className="px-4 py-3 text-right font-mono text-[var(--text-secondary)]">
        ${formatPrice(position.entryPrice)}
      </td>
      <td className="px-4 py-3 text-right font-mono text-[var(--text-secondary)]">
        {formatCurrency(position.margin)}
      </td>
      <td className={`px-4 py-3 text-right font-mono font-semibold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {formatPnl(pnl)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {ratio !== undefined && (
            <Badge variant={isHealthy ? 'success' : 'danger'}>
              {formatPercent(ratio)}
            </Badge>
          )}
          <Button variant="danger" size="sm" disabled={closing} onClick={handleClose}>
            {closing ? '…' : 'Close'}
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function PositionsTable({ address }: { address: string }) {
  const marketIds = Object.keys(MARKETS).map(Number);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="px-5 py-3 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Open Positions</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
            <th className="px-4 py-3 text-left">Market</th>
            <th className="px-4 py-3 text-left">Side</th>
            <th className="px-4 py-3 text-right">Size</th>
            <th className="px-4 py-3 text-right">Entry</th>
            <th className="px-4 py-3 text-right">Margin</th>
            <th className="px-4 py-3 text-right">Unrealised PnL</th>
            <th className="px-4 py-3 text-right">Health</th>
          </tr>
        </thead>
        <tbody>
          {marketIds.map((id) => (
            <PositionRow key={id} marketId={id} address={address} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
