'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
        ⚠
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Something went wrong</h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-sm">
          An unexpected error occurred. This may be a temporary issue — try refreshing.
        </p>
        {error.digest && (
          <p className="text-xs text-[var(--text-muted)] font-mono">ref: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 cursor-pointer"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]"
        >
          Go to Markets
        </Link>
      </div>
    </div>
  );
}
