export default function RootLoading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 space-y-10">
      <div className="text-center py-8 space-y-4">
        <div className="mx-auto h-6 w-36 rounded-full bg-[var(--border)] animate-pulse" />
        <div className="mx-auto h-10 w-80 rounded-lg bg-[var(--border)] animate-pulse" />
        <div className="mx-auto h-4 w-64 rounded-lg bg-[var(--border)] animate-pulse" />
        <div className="flex justify-center gap-3 pt-2">
          <div className="h-11 w-32 rounded-lg bg-[var(--border)] animate-pulse" />
          <div className="h-11 w-40 rounded-lg bg-[var(--border)] animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 h-16 animate-pulse" />
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-5 py-3">
          <div className="h-4 w-20 rounded bg-[var(--border)] animate-pulse" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border-b border-[var(--border-subtle)] last:border-0 px-5 py-4 flex items-center gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-[var(--border)]" />
            <div className="space-y-1.5">
              <div className="h-4 w-20 rounded bg-[var(--border)]" />
              <div className="h-3 w-14 rounded bg-[var(--border)]" />
            </div>
            <div className="ml-auto h-4 w-24 rounded bg-[var(--border)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
