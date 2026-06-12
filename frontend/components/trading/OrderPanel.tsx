'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Market } from '@/types';

type Tab = 'open' | 'close' | 'add-margin';
type Side = 'long' | 'short';

export function OrderPanel({ market }: { market: Market }) {
  const [tab, setTab] = useState<Tab>('open');
  const [side, setSide] = useState<Side>('long');
  const [collateral, setCollateral] = useState<'STX' | 'SBTC'>('STX');
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex rounded-lg bg-[var(--surface-elevated)] p-1 gap-1">
        {(['open', 'close', 'add-margin'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold cursor-pointer ${tab === t ? 'bg-[var(--surface)] text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
            {t === 'add-margin' ? 'Add Margin' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'open' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button variant={side === 'long' ? 'long' : 'secondary'} size="sm" onClick={() => setSide('long')} className="w-full">Long</Button>
            <Button variant={side === 'short' ? 'short' : 'secondary'} size="sm" onClick={() => setSide('short')} className="w-full">Short</Button>
          </div>
          <div className="flex gap-2">
            {(['STX', 'SBTC'] as const).map((a) => (
              <button key={a} onClick={() => setCollateral(a)}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold border cursor-pointer ${collateral === a ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{a}</button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
