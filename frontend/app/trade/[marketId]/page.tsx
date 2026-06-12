'use client';

import { use } from 'react';
import Link from 'next/link';
import { useMarket } from '@/hooks/useMarket';
import { MarketHeader } from '@/components/trading/MarketHeader';
import { OrderPanel } from '@/components/trading/OrderPanel';
import { FundingRateCard } from '@/components/trading/FundingRateCard';
import { LiquidationCard } from '@/components/trading/LiquidationCard';
import { MARKETS } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react';

interface Params { marketId: string }

export default function TradePage({ params }: { params: Promise<Params> }) {
  const { marketId } = use(params);
  const id = parseInt(marketId, 10);
  const { market, loading } = useMarket(id);

  const marketIds = Object.keys(MARKETS).map(Number);

  if (!marketIds.includes(id)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-[var(--text-secondary)]">Market not found.</p>
        <Link href="/" className="text-sm text-blue-400 underline">Back to Markets</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Market tabs (switch between markets) */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2">
        <Link href="/" className="mr-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
          <ArrowLeft size={14} />
        </Link>
        {marketIds.map((mid) => {
          const m = MARKETS[mid as keyof typeof MARKETS];
          return (
            <Link
              key={mid}
              href={`/trade/${mid}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                mid === id
                  ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {m.name}
            </Link>
          );
        })}
      </div>

      {/* Market stats bar */}
      <MarketHeader market={market} loading={loading} />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chart placeholder */}
        <div className="flex-1 border-r border-[var(--border)] flex flex-col items-center justify-center bg-[var(--surface)] text-[var(--text-muted)] gap-3 min-h-[400px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-elevated)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--text-muted)]">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm">TradingView chart integration</p>
          <p className="text-xs text-[var(--text-muted)]">Connect a TradingView widget or Pyth price feed chart here</p>
        </div>

        {/* Right panel */}
        <div className="w-[320px] shrink-0 flex flex-col gap-3 overflow-y-auto p-3 bg-[var(--background)]">
          {market && <OrderPanel market={market} />}
          <FundingRateCard marketId={id} />
          <LiquidationCard marketId={id} />
        </div>
      </div>
    </div>
  );
}
