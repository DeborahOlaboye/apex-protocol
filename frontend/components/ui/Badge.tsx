import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        {
          'bg-[var(--surface-elevated)] text-[var(--text-secondary)]': variant === 'default',
          'bg-green-500/10 text-green-400': variant === 'success',
          'bg-red-500/10 text-red-400': variant === 'danger',
          'bg-orange-500/10 text-orange-400': variant === 'warning',
          'bg-blue-500/10 text-blue-400': variant === 'info',
        },
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
