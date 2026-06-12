'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, truncateAddress } from '@/lib/utils';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/Button';
import { Zap } from 'lucide-react';

const NAV = [
  { label: 'Markets', href: '/' },
  { label: 'Trade', href: '/trade/1' },
  { label: 'Portfolio', href: '/portfolio' },
];

export function Header() {
  const pathname = usePathname();
  const { connected, address, connect, disconnect } = useWallet();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500">
            <Zap size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
            APEX
          </span>
          <span className="hidden text-xs text-[var(--text-muted)] sm:inline">PROTOCOL</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV.map(({ label, href }) => {
            const active =
              href === '/' ? pathname === '/' : pathname.startsWith(href.split('/').slice(0, 2).join('/'));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Wallet */}
        <div className="flex items-center gap-2">
          {connected && address ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-[var(--text-muted)] sm:inline">
                {truncateAddress(address)}
              </span>
              <Button variant="secondary" size="sm" onClick={disconnect}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={connect}>
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
