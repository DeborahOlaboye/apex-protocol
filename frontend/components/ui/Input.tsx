import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm',
        'text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-blue-500',
        className,
      )}
      {...props}
    />
  );
}
