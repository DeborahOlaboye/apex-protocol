'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import type { Market } from '@/types';

type Tab = 'open' | 'close' | 'add-margin';

export function OrderPanel({ market }: { market: Market }) {
  const [tab, setTab] = useState<Tab>('open');
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
      {tab === 'open' && <p className="text-xs text-[var(--text-muted)]">Open a position</p>}
      {tab === 'close' && <p className="text-xs text-[var(--text-muted)]">Close position</p>}
      {tab === 'add-margin' && <p className="text-xs text-[var(--text-muted)]">Add margin</p>}
    </Card>
  );
}
