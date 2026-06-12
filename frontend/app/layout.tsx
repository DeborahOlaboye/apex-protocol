import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from '@/context/WalletContext';

export const metadata: Metadata = {
  title: 'Apex Protocol — Perpetual Futures on Bitcoin',
  description: 'Non-custodial perpetual futures on Stacks.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
