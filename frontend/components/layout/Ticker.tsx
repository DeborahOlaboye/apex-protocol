'use client';

import Link from 'next/link';
import { useAllMarkets } from '@/hooks/useMarket';
import { formatPrice } from '@/lib/utils';

export function Ticker() {
  const { markets } = useAllMarkets();

  return (
    <div className="border-b border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-1.5">
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 overflow-x-auto">
        {markets.map((m) => (
          <Link
            key={m.id}
            href={`/trade/${m.id}`}
            className="flex shrink-0 items-center gap-3 text-sm hover:opacity-80 transition-opacity"
          >
            <span className="font-semibold text-[var(--text-primary)]">{m.name}</span>
            <span className="font-mono text-[var(--text-secondary)]">
              {m.price ? `$${formatPrice(m.price)}` : '—'}
            </span>
          </Link>
        ))}
        <div className="ml-auto shrink-0 flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          Live
        </div>
      </div>
    </div>
  );
}
