import type { Metadata } from 'next';
import './globals.css';
import { ClientShell } from '@/components/layout/ClientShell';

export const metadata: Metadata = {
  title: 'Apex Protocol — Perpetual Futures on Bitcoin',
  description: 'Non-custodial perpetual futures trading on Stacks. Up to 20x leverage with sBTC and STX collateral.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
