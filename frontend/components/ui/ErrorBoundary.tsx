'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-4 max-w-sm">
              <p className="text-sm font-semibold text-red-400">Something went wrong</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {this.state.error?.message ?? 'An unexpected error occurred.'}
              </p>
            </div>
            <button
              className="text-xs text-blue-400 underline cursor-pointer"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
