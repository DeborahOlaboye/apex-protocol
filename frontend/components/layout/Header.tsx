'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500">
            <Zap size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight">APEX</span>
        </Link>
      </div>
    </header>
  );
}
