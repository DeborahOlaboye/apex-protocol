import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'long' | 'short' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
        {
          'bg-blue-500 hover:bg-blue-600 text-white': variant === 'primary',
          'bg-[var(--surface-elevated)] hover:bg-[var(--border)] text-[var(--text-primary)] border border-[var(--border)]': variant === 'secondary',
          'hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]': variant === 'ghost',
          'bg-green-500 hover:bg-green-600 text-white': variant === 'long',
          'bg-red-500 hover:bg-red-600 text-white': variant === 'short',
          'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20': variant === 'danger',
          'text-xs px-3 py-1.5': size === 'sm',
          'text-sm px-4 py-2': size === 'md',
          'text-base px-6 py-3': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
