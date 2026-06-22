import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="space-y-2">
        <p className="text-7xl font-black text-[var(--border)]">404</p>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Page not found</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          This page doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
      >
        Back to Markets
      </Link>
    </div>
  );
}
