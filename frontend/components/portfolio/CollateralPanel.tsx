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
