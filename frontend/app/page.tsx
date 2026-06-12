'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function MarketsPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 space-y-10">
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          Live on Stacks Mainnet
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)]">Perpetual Futures on Bitcoin</h1>
        <p className="max-w-xl mx-auto text-[var(--text-secondary)] text-sm">Non-custodial leveraged trading with sBTC and STX collateral.</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/trade/1"><Button size="lg">Start Trading</Button></Link>
          <Link href="/portfolio"><Button variant="secondary" size="lg">Manage Portfolio</Button></Link>
        </div>
      </div>
    </div>
  );
}
