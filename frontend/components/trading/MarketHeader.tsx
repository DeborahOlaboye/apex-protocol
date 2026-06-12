'use client';

import { Badge } from '@/components/ui/Badge';
import type { Market } from '@/types';

interface MarketHeaderProps { market: Market | null; loading?: boolean; }

export function MarketHeader({ market, loading }: MarketHeaderProps) {
  if (loading || !market) {
    return <div className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3 animate-pulse h-12" />;
  }
  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3">
      <div className="flex items-center gap-2">
        <span className="text-base font-bold text-[var(--text-primary)]">{market.name}</span>
        <Badge variant="default">Perpetual</Badge>
        <Badge variant={market.isActive !== false ? 'success' : 'danger'}>
          {market.isActive !== false ? 'Active' : 'Paused'}
        </Badge>
      </div>
    </div>
  );
}
