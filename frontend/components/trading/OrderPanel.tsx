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
