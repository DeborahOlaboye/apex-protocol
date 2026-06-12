import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';

// ssr:false is forbidden in server components — moved to ClientShell
const ClientShell = dynamic(() => import('@/components/layout/ClientShell').then((m) => m.ClientShell));

export const metadata: Metadata = {
  title: 'Apex Protocol — Perpetual Futures on Bitcoin',
  description: 'Non-custodial perpetual futures trading on Stacks.',
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
