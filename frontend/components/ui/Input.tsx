import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  suffix?: string;
  error?: string;
}

export function Input({ label, suffix, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)]">{label}</label>
      )}
      <div className="relative flex items-center">
        <input
          className={cn(
            'w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-blue-500 transition-colors',
            suffix && 'pr-14',
            error && 'border-red-500',
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-xs font-medium text-[var(--text-muted)]">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
