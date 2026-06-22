export default function PortfolioLoading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 space-y-6">
      <div className="space-y-1">
        <div className="h-3 w-16 rounded bg-[var(--border)] animate-pulse" />
        <div className="h-5 w-64 rounded bg-[var(--border)] animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 h-16 animate-pulse" />
        ))}
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] h-64 animate-pulse" />
        <div className="w-full lg:w-[320px] rounded-xl border border-[var(--border)] bg-[var(--surface)] h-64 animate-pulse" />
      </div>
    </div>
  );
}
