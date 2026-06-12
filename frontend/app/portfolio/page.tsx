'use client';

import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/Button';
import { Wallet } from 'lucide-react';

export default function PortfolioPage() {
  const { connected, connect } = useWallet();
  if (!connected) {
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
  return <div className="p-8"><p>Portfolio loaded</p></div>;
}
