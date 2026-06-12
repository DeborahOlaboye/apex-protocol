'use client';

import { useState, useEffect } from 'react';
import { getCumulativeRate } from '@/lib/stacks';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { FUNDING_INTERVAL_BLOCKS } from '@/lib/constants';

interface FundingRateCardProps {
  marketId: number;
}

export function FundingRateCard({ marketId }: FundingRateCardProps) {
  const [cumulative, setCumulative] = useState<number | null>(null);

  useEffect(() => {
    getCumulativeRate(marketId)
      .then((v) => setCumulative(v as number))
      .catch(() => setCumulative(null));
  }, [marketId]);

  const rateBps = cumulative !== null ? cumulative : null;
  const ratePercent = rateBps !== null ? (rateBps / 100).toFixed(4) : '—';
  const isPositive = rateBps !== null && rateBps >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funding Rate</CardTitle>
        <span className="text-[10px] text-[var(--text-muted)]">~{FUNDING_INTERVAL_BLOCKS} blocks / 8h</span>
      </CardHeader>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)]">Cumulative Rate</span>
          <span className={`font-semibold font-mono ${rateBps === null ? 'text-[var(--text-muted)]' : isPositive ? 'text-orange-400' : 'text-blue-400'}`}>
            {rateBps !== null ? `${isPositive ? '+' : ''}${ratePercent}%` : '—'}
          </span>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
          {isPositive
            ? 'Longs pay shorts. Market is above index price.'
            : 'Shorts pay longs. Market is below index price.'}
        </p>
      </div>
    </Card>
  );
}
