'use client';

import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatNumber, microToMacro } from '@/lib/utils';
import type { Market } from '@/types';

interface MarketHeaderProps {
  market: Market | null;
  loading?: boolean;
}

export function MarketHeader({ market, loading }: MarketHeaderProps) {
  if (loading || !market) {
    return (
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3 animate-pulse">
        <div className="flex items-center gap-6">
          <div className="h-6 w-24 rounded bg-[var(--border)]" />
          <div className="h-5 w-32 rounded bg-[var(--border)]" />
        </div>
      </div>
    );
  }

  const longOI = microToMacro(market.openInterestLong ?? 0);
  const shortOI = microToMacro(market.openInterestShort ?? 0);

  const stats = [
    { label: 'Price', value: market.price ? `$${formatPrice(market.price)}` : '—', mono: true },
    { label: 'Long OI', value: `${formatNumber(longOI)} USD`, color: 'text-green-400' },
    { label: 'Short OI', value: `${formatNumber(shortOI)} USD`, color: 'text-red-400' },
    { label: 'Max Leverage', value: `${market.maxLeverage ?? 20}×` },
    { label: 'Maint. Margin', value: `${((market.maintenanceMarginRate ?? 500) / 100).toFixed(1)}%` },
  ];

  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[var(--text-primary)]">{market.name}</span>
          <Badge variant="default">Perpetual</Badge>
          <Badge variant={market.isActive !== false ? 'success' : 'danger'}>
            {market.isActive !== false ? 'Active' : 'Paused'}
          </Badge>
        </div>
        {stats.map(({ label, value, mono, color }) => (
          <div key={label} className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
            <span className={`text-sm font-semibold ${color ?? 'text-[var(--text-primary)]'} ${mono ? 'font-mono' : ''}`}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
