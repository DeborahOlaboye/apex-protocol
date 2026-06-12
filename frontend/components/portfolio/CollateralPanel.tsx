'use client';

import { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import { DEPLOYER, ASSET_IDS, NETWORK } from '@/lib/constants';
import { buildDepositStx, buildDepositSbtc, buildWithdraw } from '@/lib/stacks';
import { useWallet } from '@/context/WalletContext';
import { useCollateral } from '@/hooks/useCollateral';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { macroToMicro, microToMacro } from '@/lib/utils';

export function CollateralPanel() {
  const { connected, address, connect } = useWallet();
  const { stxBalance, sbtcBalance, loading, refetch } = useCollateral(address);

  const [asset, setAsset] = useState<'STX' | 'SBTC'>('STX');
  const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);

  const balance = asset === 'STX' ? stxBalance : sbtcBalance;

  function handleSubmit() {
    if (!connected) { connect(); return; }
    const amt = parseFloat(amount);
    if (!amt) return;
    const micro = macroToMicro(amt);
    setSubmitting(true);
    setTxId(null);

    let tx;
    if (action === 'deposit') {
      tx = asset === 'STX' ? buildDepositStx(micro) : buildDepositSbtc(micro);
    } else {
      tx = buildWithdraw(asset === 'STX' ? ASSET_IDS.STX : ASSET_IDS.SBTC, micro);
    }

    openContractCall({
      contractAddress: DEPLOYER,
      contractName: tx.contractName,
      functionName: tx.functionName,
      functionArgs: tx.functionArgs,
      network: NETWORK,
      onFinish: (data) => { setTxId(data.txId); refetch(); setAmount(''); setSubmitting(false); },
      onCancel: () => setSubmitting(false),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collateral</CardTitle>
      </CardHeader>

      {/* Balances */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {[
          { label: 'STX', bal: stxBalance },
          { label: 'sBTC', bal: sbtcBalance },
        ].map(({ label, bal }) => (
          <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
            <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
            {loading ? (
              <div className="h-4 w-20 rounded bg-[var(--border)] animate-pulse" />
            ) : (
              <>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {microToMacro(bal.amount).toFixed(4)}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">
                  {microToMacro(bal.locked).toFixed(4)} locked
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Action tabs */}
      <div className="flex rounded-lg bg-[var(--surface-elevated)] p-1 gap-1 mb-4">
        {(['deposit', 'withdraw'] as const).map((a) => (
          <button key={a} onClick={() => setAction(a)}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
              action === a
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}>
            {a}
          </button>
        ))}
      </div>

      {/* Asset selector */}
      <div className="flex gap-2 mb-3">
        {(['STX', 'SBTC'] as const).map((a) => (
          <button key={a} onClick={() => setAsset(a)}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
              asset === a
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
            }`}>
            {a}
          </button>
        ))}
      </div>
