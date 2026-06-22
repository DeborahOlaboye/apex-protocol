'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Spinner } from '@/components/ui/Spinner';

const Providers = dynamic(() => import('./Providers').then((m) => m.Providers), { ssr: false });
const Header = dynamic(() => import('./Header').then((m) => m.Header), { ssr: false });
const Ticker = dynamic(() => import('./Ticker').then((m) => m.Ticker), { ssr: false });

export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Providers>
        <Header />
        <Ticker />
        <main className="flex-1">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-24">
                <Spinner size="lg" />
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </Providers>
    </ErrorBoundary>
  );
}
