'use client';

import Link from 'next/link';
import { useAllMarkets } from '@/hooks/useMarket';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatNumber, microToMacro } from '@/lib/utils';
import { TrendingUp, ArrowRight, Shield, Zap, DollarSign } from 'lucide-react';

export default function MarketsPage() {
  const { markets, loading } = useAllMarkets();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 space-y-10">
      {/* Hero */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          Live on Stacks Mainnet
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Perpetual Futures on Bitcoin
        </h1>
        <p className="max-w-xl mx-auto text-[var(--text-secondary)] text-sm leading-relaxed">
          Non-custodial leveraged trading with sBTC and STX collateral.
          Bitcoin-final settlement via the Stacks Nakamoto upgrade.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/trade/1">
            <Button size="lg">Start Trading</Button>
          </Link>
          <Link href="/portfolio">
            <Button variant="secondary" size="lg">Manage Portfolio</Button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Max Leverage', value: '20×', icon: Zap },
          { label: 'Collateral Assets', value: 'sBTC + STX', icon: DollarSign },
          { label: 'Liquidation Bonus', value: '5%', icon: Shield },
          { label: 'Funding Interval', value: '~8 hours', icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <Icon size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{label}</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{value}</p>
            </div>
          </Card>
        ))}
      </div>
