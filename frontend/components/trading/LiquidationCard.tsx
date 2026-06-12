'use client';

import { useState } from 'react';
import { openContractCall } from '@stacks/connect';
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
