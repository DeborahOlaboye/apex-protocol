'use client';

import { useState, useMemo } from 'react';
import { openContractCall } from '@stacks/connect';
import { DEPLOYER, ASSET_IDS, NETWORK } from '@/lib/constants';
import { buildOpenPosition, buildClosePosition, buildAddMargin } from '@/lib/stacks';
import { useWallet } from '@/context/WalletContext';
import { usePosition } from '@/hooks/usePosition';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { formatPrice, formatCurrency, formatPercent, macroToMicro, formatPnl } from '@/lib/utils';
import type { Market } from '@/types';

interface OrderPanelProps {
  market: Market;
}

type Side = 'long' | 'short';
type Tab = 'open' | 'close' | 'add-margin';

export function OrderPanel({ market }: OrderPanelProps) {
  const { connected, address, connect } = useWallet();
  const { position, loading: posLoading, refetch } = usePosition(address, market.id);

  const [tab, setTab] = useState<Tab>('open');
  const [side, setSide] = useState<Side>('long');
  const [size, setSize] = useState('');
  const [margin, setMargin] = useState('');
  const [leverage, setLeverage] = useState(5);
  const [collateral, setCollateral] = useState<'STX' | 'SBTC'>('STX');
  const [addMarginAmt, setAddMarginAmt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);

  const sizeNum = parseFloat(size) || 0;
  const marginNum = parseFloat(margin) || 0;
  const notional = sizeNum * (market.price ?? 0);
  const effectiveLeverage = marginNum > 0 ? notional / marginNum : 0;
  const requiredMargin = notional / leverage;

  const marginError = useMemo(() => {
    if (!marginNum || !sizeNum) return undefined;
    const maxLev = market.maxLeverage ?? 20;
    if (effectiveLeverage > maxLev) return `Max leverage is ${maxLev}×`;
    return undefined;
  }, [marginNum, sizeNum, effectiveLeverage, market.maxLeverage]);

  async function handleOpen() {
    if (!connected || !address) { connect(); return; }
    if (!sizeNum || !marginNum || marginError) return;
    setSubmitting(true);
    try {
      const tx = buildOpenPosition(
        market.id,
        side === 'long',
        sizeNum,
        macroToMicro(marginNum),
        collateral === 'STX' ? ASSET_IDS.STX : ASSET_IDS.SBTC,
      );
      openContractCall({
        contractAddress: DEPLOYER,
        contractName: tx.contractName,
        functionName: tx.functionName,
        functionArgs: tx.functionArgs,
        network: NETWORK,
        onFinish: (data) => { setTxId(data.txId); refetch(); setSize(''); setMargin(''); setSubmitting(false); },
        onCancel: () => setSubmitting(false),
      });
    } catch {
      setSubmitting(false);
    }
  }

  async function handleClose() {
    if (!connected || !address) { connect(); return; }
    setSubmitting(true);
    try {
      const tx = buildClosePosition(market.id);
      openContractCall({
        contractAddress: DEPLOYER,
        contractName: tx.contractName,
        functionName: tx.functionName,
        functionArgs: tx.functionArgs,
        network: NETWORK,
        onFinish: (data) => { setTxId(data.txId); refetch(); setSubmitting(false); },
        onCancel: () => setSubmitting(false),
      });
    } catch {
      setSubmitting(false);
    }
  }

  async function handleAddMargin() {
    if (!connected || !address) { connect(); return; }
    const amt = parseFloat(addMarginAmt);
    if (!amt) return;
    setSubmitting(true);
    try {
      const tx = buildAddMargin(market.id, macroToMicro(amt));
      openContractCall({
        contractAddress: DEPLOYER,
        contractName: tx.contractName,
        functionName: tx.functionName,
        functionArgs: tx.functionArgs,
        network: NETWORK,
        onFinish: (data) => { setTxId(data.txId); refetch(); setAddMarginAmt(''); setSubmitting(false); },
        onCancel: () => setSubmitting(false),
      });
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex rounded-lg bg-[var(--surface-elevated)] p-1 gap-1">
        {(['open', 'close', 'add-margin'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
              tab === t
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {t === 'add-margin' ? 'Add Margin' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Current position summary */}
      {position && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-3 space-y-2 text-xs">
          <p className="text-[var(--text-muted)] font-semibold uppercase tracking-wider">Open Position</p>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Side" value={position.isLong ? 'Long' : 'Short'} valueClass={position.isLong ? 'text-green-400' : 'text-red-400'} />
            <Stat label="Size" value={`${position.size}`} />
            <Stat label="Entry Price" value={`$${formatPrice(position.entryPrice)}`} />
            <Stat label="Margin" value={formatCurrency(position.margin)} />
            {position.unrealizedPnl !== undefined && (
              <Stat label="Unrealised PnL" value={formatPnl(position.unrealizedPnl)} valueClass={position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'} />
            )}
            {position.marginRatio !== undefined && (
              <Stat label="Margin Ratio" value={formatPercent(position.marginRatio)} />
            )}
          </div>
        </div>
      )}

      {/* Open form */}
      {tab === 'open' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button variant={side === 'long' ? 'long' : 'secondary'} size="sm" onClick={() => setSide('long')} className="w-full">Long</Button>
            <Button variant={side === 'short' ? 'short' : 'secondary'} size="sm" onClick={() => setSide('short')} className="w-full">Short</Button>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-[var(--text-secondary)]">Collateral</p>
            <div className="flex gap-2">
              {(['STX', 'SBTC'] as const).map((asset) => (
                <button key={asset} onClick={() => setCollateral(asset)}
                  className={`flex-1 rounded-md py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${collateral === asset ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'}`}>
                  {asset}
                </button>
              ))}
            </div>
          </div>

          <Input label="Size (units)" type="number" placeholder="0" min="0" value={size}
            onChange={(e) => setSize(e.target.value)} />

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Leverage</span>
              <span className="font-semibold text-[var(--text-primary)]">{leverage}×</span>
            </div>
            <input type="range" min={1} max={market.maxLeverage ?? 20} value={leverage}
              onChange={(e) => {
                const lev = Number(e.target.value);
                setLeverage(lev);
                if (sizeNum > 0 && market.price) setMargin(((sizeNum * market.price) / lev).toFixed(4));
              }}
              className="w-full accent-blue-500 cursor-pointer" />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
              <span>1×</span><span>5×</span><span>10×</span><span>20×</span>
            </div>
          </div>

          <Input label="Margin" type="number" placeholder="0.0000" min="0" suffix={collateral}
            value={margin} onChange={(e) => setMargin(e.target.value)} error={marginError} />

          {sizeNum > 0 && market.price && (
            <div className="rounded-lg bg-[var(--surface-elevated)] p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Notional Value</span>
                <span className="text-[var(--text-primary)]">${formatPrice(notional)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Required Margin ({leverage}×)</span>
                <span className="text-[var(--text-primary)]">{requiredMargin.toFixed(4)} {collateral}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Effective Leverage</span>
                <span className={effectiveLeverage > (market.maxLeverage ?? 20) ? 'text-red-400' : 'text-[var(--text-primary)]'}>
                  {effectiveLeverage.toFixed(1)}×
                </span>
              </div>
            </div>
          )}

          <Button variant={side === 'long' ? 'long' : 'short'} size="lg" className="w-full"
            disabled={submitting || !!marginError || !sizeNum || !marginNum} onClick={handleOpen}>
            {!connected ? 'Connect Wallet' : submitting ? 'Opening…' : `Open ${side === 'long' ? 'Long' : 'Short'}`}
          </Button>
        </div>
      )}

      {/* Close form */}
      {tab === 'close' && (
        <div className="space-y-3">
          {!position && !posLoading && (
            <p className="text-center text-xs text-[var(--text-muted)] py-6">No open position on this market.</p>
          )}
          {position && (
            <>
              <div className="rounded-lg bg-[var(--surface-elevated)] p-3 text-xs">
                <p className="text-[var(--text-muted)]">Closing your {position.isLong ? 'Long' : 'Short'} position will settle all P&L and unlock your margin.</p>
              </div>
              <Button variant="danger" size="lg" className="w-full" disabled={submitting} onClick={handleClose}>
                {submitting ? 'Closing…' : 'Close Position'}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Add margin form */}
      {tab === 'add-margin' && (
        <div className="space-y-3">
          {!position && !posLoading && (
            <p className="text-center text-xs text-[var(--text-muted)] py-6">No open position to add margin to.</p>
          )}
          {position && (
            <>
              <Input label="Amount to add" type="number" placeholder="0.0000" min="0" suffix={collateral}
                value={addMarginAmt} onChange={(e) => setAddMarginAmt(e.target.value)} />
              <Button variant="primary" size="lg" className="w-full"
                disabled={submitting || !parseFloat(addMarginAmt)} onClick={handleAddMargin}>
                {submitting ? 'Adding…' : 'Add Margin'}
              </Button>
            </>
          )}
        </div>
      )}
