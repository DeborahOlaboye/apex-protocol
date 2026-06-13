import type { Metadata } from 'next';
import './globals.css';
import { ClientShell } from '@/components/layout/ClientShell';

export const metadata: Metadata = {
  title: 'Apex Protocol — Perpetual Futures on Bitcoin',
  description: 'Non-custodial perpetual futures trading on Stacks. Up to 20x leverage with sBTC and STX collateral.',
  other: {
    'talentapp:project_verification':
      'b978daab4134ae513a1b63e006147a7e7899de6f98510853b7adc0e16d11d6682f1e4d0475c7462ca73e3531ea4891a0c1eec8d75ca7e975f2f1339240e3672c',
  },
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
