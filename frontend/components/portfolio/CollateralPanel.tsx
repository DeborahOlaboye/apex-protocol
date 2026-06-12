'use client';

import { useCollateral } from '@/hooks/useCollateral';
import { useWallet } from '@/context/WalletContext';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { microToMacro } from '@/lib/utils';

export function CollateralPanel() {
  const { address } = useWallet();
  const { stxBalance, sbtcBalance, loading } = useCollateral(address);
  return (
    <Card>
      <CardHeader><CardTitle>Collateral</CardTitle></CardHeader>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'STX', bal: stxBalance },
          { label: 'sBTC', bal: sbtcBalance },
        ].map(({ label, bal }) => (
          <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
            <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {loading ? '…' : microToMacro(bal.amount).toFixed(4)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
