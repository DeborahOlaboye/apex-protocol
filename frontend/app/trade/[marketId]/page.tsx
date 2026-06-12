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
