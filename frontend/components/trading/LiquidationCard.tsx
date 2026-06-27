'use client';

import { useState } from 'react';
import { DEPLOYER, NETWORK } from '@/lib/constants';
import { buildLiquidate, isLiquidatable } from '@/lib/stacks';
import { useWallet } from '@/context/WalletContext';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface LiquidationCardProps {
  marketId: number;
}

export function LiquidationCard({ marketId }: LiquidationCardProps) {
  const { connected, connect } = useWallet();
  const [targetAddress, setTargetAddress] = useState('');
  const [checking, setChecking] = useState(false);
  const [liquidatable, setLiquidatable] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);

  async function handleCheck() {
    if (!targetAddress) return;
    setChecking(true);
    setLiquidatable(null);
    try {
      const result = await isLiquidatable(targetAddress, marketId);
      setLiquidatable(result as boolean);
    } catch {
      setLiquidatable(false);
    } finally {
      setChecking(false);
    }
  }

  async function handleLiquidate() {
    if (!connected) { connect(); return; }
    if (!targetAddress || !liquidatable) return;
    setSubmitting(true);
    const { openContractCall } = await import('@stacks/connect');
    const tx = buildLiquidate(targetAddress, marketId);
    openContractCall({
      contractAddress: DEPLOYER,
      contractName: tx.contractName,
      functionName: tx.functionName,
      functionArgs: tx.functionArgs,
      network: NETWORK,
      onFinish: (data) => { setTxId(data.txId); setLiquidatable(null); setSubmitting(false); },
      onCancel: () => setSubmitting(false),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liquidation Bot</CardTitle>
        <Badge variant="warning">+5% Bonus</Badge>
      </CardHeader>
      <div className="space-y-3">
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Check if a position is undercollateralised and liquidate it to earn a 5% bonus.
        </p>
        <Input label="Trader address" placeholder="SP..." value={targetAddress}
          onChange={(e) => setTargetAddress(e.target.value)} />
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onClick={handleCheck}
            disabled={checking || !targetAddress}>
            {checking ? 'Checking…' : 'Check'}
          </Button>
          <Button variant={liquidatable ? 'danger' : 'secondary'} size="sm" className="flex-1"
            disabled={!liquidatable || submitting} onClick={handleLiquidate}>
            {submitting ? 'Liquidating…' : 'Liquidate'}
          </Button>
        </div>
        {liquidatable !== null && (
          <p className={`text-xs font-semibold ${liquidatable ? 'text-red-400' : 'text-green-400'}`}>
            {liquidatable ? '⚠ Position is liquidatable' : '✓ Position is healthy'}
          </p>
        )}
        {txId && (
          <a href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`} target="_blank"
            rel="noopener noreferrer" className="text-xs text-green-400 underline break-all">
            Tx: {txId.slice(0, 20)}…
          </a>
        )}
      </div>
    </Card>
  );
}
