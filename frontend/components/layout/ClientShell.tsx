'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const Providers = dynamic(() => import('./Providers').then((m) => m.Providers), { ssr: false });
const Header = dynamic(() => import('./Header').then((m) => m.Header), { ssr: false });
const Ticker = dynamic(() => import('./Ticker').then((m) => m.Ticker), { ssr: false });

export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <Header />
      <Ticker />
      <main className="flex-1">{children}</main>
    </Providers>
  );
}
