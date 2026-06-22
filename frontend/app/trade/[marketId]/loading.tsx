export default function TradeLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2 animate-pulse">
        <div className="h-7 w-20 rounded-md bg-[var(--border)]" />
        <div className="h-7 w-20 rounded-md bg-[var(--border)]" />
      </div>
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3 h-14 animate-pulse" />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-[var(--surface)] animate-pulse min-h-[400px]" />
        <div className="w-[320px] shrink-0 p-3 space-y-3 bg-[var(--background)]">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] h-80 animate-pulse" />
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] h-24 animate-pulse" />
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] h-36 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
