export default function Loading() {
  return (
    <main
      aria-live="polite"
      aria-busy="true"
      className="mx-auto w-full max-w-4xl px-5 py-20 sm:px-8"
    >
      <div className="animate-pulse rounded-3xl border border-border bg-surface p-8 shadow-sm sm:p-12">
        <div className="h-3 w-28 rounded-full bg-blue-200" />
        <div className="mt-6 h-10 max-w-xl rounded-xl bg-slate-200" />
        <div className="mt-8 h-5 max-w-2xl rounded-lg bg-slate-100" />
        <p className="mt-8 font-semibold text-muted">Loading course…</p>
      </div>
    </main>
  );
}
