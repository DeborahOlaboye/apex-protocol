'use client';

import { MARKETS } from '@/lib/constants';

export function PositionsTable({ address }: { address: string }) {
  const marketIds = Object.keys(MARKETS).map(Number);
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="px-5 py-3 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Open Positions</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-[var(--text-muted)] uppercase border-b border-[var(--border)]">
            <th className="px-4 py-3 text-left">Market</th>
            <th className="px-4 py-3 text-left">Side</th>
            <th className="px-4 py-3 text-right">Size</th>
            <th className="px-4 py-3 text-right">Entry</th>
            <th className="px-4 py-3 text-right">Margin</th>
            <th className="px-4 py-3 text-right">Unrealised PnL</th>
            <th className="px-4 py-3 text-right">Health</th>
          </tr>
        </thead>
        <tbody>
          {marketIds.map((id) => <tr key={id}><td className="px-4 py-3 text-[var(--text-muted)] text-xs" colSpan={7}>Market {id} — no position</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
