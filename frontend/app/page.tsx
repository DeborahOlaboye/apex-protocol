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

      {/* Markets table */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Markets
        </h2>
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Market</th>
                <th className="px-5 py-3 text-right">Price</th>
                <th className="px-5 py-3 text-right hidden sm:table-cell">Long OI</th>
                <th className="px-5 py-3 text-right hidden sm:table-cell">Short OI</th>
                <th className="px-5 py-3 text-right hidden md:table-cell">Max Leverage</th>
                <th className="px-5 py-3 text-right hidden md:table-cell">Status</th>
                <th className="px-5 py-3 text-right">Trade</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 2 }).map((_, i) => (
                    <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0 animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 w-20 rounded bg-[var(--border)]" /></td>
                      <td className="px-5 py-4 text-right"><div className="ml-auto h-4 w-24 rounded bg-[var(--border)]" /></td>
                      <td className="px-5 py-4 hidden sm:table-cell" />
                      <td className="px-5 py-4 hidden sm:table-cell" />
                      <td className="px-5 py-4 hidden md:table-cell" />
                      <td className="px-5 py-4 hidden md:table-cell" />
                      <td className="px-5 py-4" />
                    </tr>
                  ))
                : markets.map((m) => {
                    const longOI = microToMacro(m.openInterestLong ?? 0);
                    const shortOI = microToMacro(m.openInterestShort ?? 0);
                    const totalOI = longOI + shortOI;
                    const longPct = totalOI > 0 ? (longOI / totalOI) * 100 : 50;

                    return (
                      <tr
                        key={m.id}
                        className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-elevated)] transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-elevated)] text-xs font-bold text-[var(--text-secondary)]">
                              {m.baseAsset.slice(0, 1)}
                            </div>
                            <div>
                              <p className="font-semibold text-[var(--text-primary)]">{m.name}</p>
                              <p className="text-xs text-[var(--text-muted)]">Perpetual</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right font-mono">
                          <span className="font-semibold text-[var(--text-primary)]">
                            {m.price ? `$${formatPrice(m.price)}` : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right hidden sm:table-cell">
                          <div className="space-y-1">
                            <p className="text-green-400 font-mono text-xs">
                              {formatNumber(longOI, 2)} {m.quoteAsset}
                            </p>
                            <div className="ml-auto h-1 w-16 rounded-full bg-[var(--border)]">
                              <div className="h-full rounded-full bg-green-400" style={{ width: `${longPct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right hidden sm:table-cell">
                          <p className="text-red-400 font-mono text-xs">
                            {formatNumber(shortOI, 2)} {m.quoteAsset}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right hidden md:table-cell">
                          <span className="font-semibold text-[var(--text-primary)]">
                            {m.maxLeverage ?? 20}×
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right hidden md:table-cell">
                          <Badge variant={m.isActive !== false ? 'success' : 'danger'}>
                            {m.isActive !== false ? 'Active' : 'Paused'}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link href={`/trade/${m.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              Trade <ArrowRight size={12} />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
