'use client';

import { use } from 'react';
import Link from 'next/link';
import { MARKETS } from '@/lib/constants';

interface Params { marketId: string }

export default function TradePage({ params }: { params: Promise<Params> }) {
  const { marketId } = use(params);
  const id = parseInt(marketId, 10);
  if (!Object.keys(MARKETS).map(Number).includes(id)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-[var(--text-secondary)]">Market not found.</p>
        <Link href="/" className="text-sm text-blue-400 underline">Back to Markets</Link>
      </div>
    );
  }
  return <div className="flex-1 p-4"><h1 className="text-lg font-bold">Trade — Market {id}</h1></div>;
}
