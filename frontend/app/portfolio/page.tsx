'use client';

import { useWallet } from '@/context/WalletContext';
import { useCollateral } from '@/hooks/useCollateral';
import { CollateralPanel } from '@/components/portfolio/CollateralPanel';
import { PositionsTable } from '@/components/portfolio/PositionsTable';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { microToMacro, truncateAddress } from '@/lib/utils';
import { Wallet } from 'lucide-react';

export default function PortfolioPage() {
  const { connected, address, connect } = useWallet();
  const { stxBalance, sbtcBalance, loading } = useCollateral(address);

  if (!connected || !address) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-32">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-elevated)]">
          <Wallet size={28} className="text-[var(--text-muted)]" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-semibold text-[var(--text-primary)]">Connect your wallet</p>
          <p className="text-sm text-[var(--text-secondary)]">Connect a Leather or Xverse wallet to manage your portfolio.</p>
        </div>
        <Button size="lg" onClick={connect}>Connect Wallet</Button>
      </div>
    );
  }

  const totalStx = microToMacro(stxBalance.amount);
  const totalSbtc = microToMacro(sbtcBalance.amount);
  const availStx = microToMacro(stxBalance.available);
  const availSbtc = microToMacro(sbtcBalance.available);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 space-y-6">
      {/* Account header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Account</p>
          <p className="font-mono text-sm text-[var(--text-primary)]">{address}</p>
        </div>
      </div>

      {/* Balance summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total STX', value: loading ? '…' : `${totalStx.toFixed(4)} STX` },
          { label: 'Available STX', value: loading ? '…' : `${availStx.toFixed(4)} STX` },
          { label: 'Total sBTC', value: loading ? '…' : `${totalSbtc.toFixed(8)} sBTC` },
          { label: 'Available sBTC', value: loading ? '…' : `${availSbtc.toFixed(8)} sBTC` },
        ].map(({ label, value }) => (
          <Card key={label}>
            <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
            <p className="text-sm font-semibold text-[var(--text-primary)] font-mono">{value}</p>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Positions table */}
        <div className="flex-1">
          <PositionsTable address={address} />
        </div>

        {/* Collateral panel */}
        <div className="w-full lg:w-[320px] shrink-0">
          <CollateralPanel />
        </div>
      </div>
    </div>
  );
}
